import pool from './config/db.js';

// Everyone currently in each meeting room:
// roomId -> Map(socketId -> participant)
// Kept outside the connection handler so all sockets share the same rooms.
const rooms = new Map();

export function setupSocketIO(io){

    io.on('connection', (socket) => {
        // Which room and user this socket belongs to 
        let currentRoomId = null;
        let currentUser = null;

        // A user joins a meeting room
        socket.on('join-room', async ({ roomId, user, audioEnabled = true, videoEnabled = true }) => {
            try {
                // Verify the meeting from the database
                const meetings = await pool.query(
                    "SELECT * FROM study_sessions WHERE meeting_code = $1",
                    [roomId]
                );

                if (meetings.rows.length === 0) {
                    socket.emit('meeting-ended', { message: 'Meeting not found' });
                    return;
                }

                const meeting = meetings.rows[0];

                // In the study_sessions table an ended meeting has status 'completed'
                if (meeting.status === 'completed') {
                    socket.emit('meeting-ended', { message: 'Meeting has already ended' });
                    return;
                }

                currentRoomId = roomId;

                const isHost = meeting.host_user_id.toString() === user.id.toString();

                currentUser = {
                    socketId: socket.id,
                    userId: user.id,
                    name: user.name,
                    isHost,
                    audioEnabled,
                    videoEnabled,
                };

                // Create the room's participant list if this is the first person
                if (!rooms.has(roomId)) {
                    rooms.set(roomId, new Map());
                }
                const roomParticipants = rooms.get(roomId);

                socket.join(roomId);

                // People already in the room (before adding the newcomer)
                const existingUsers = Array.from(roomParticipants.values());

                // Add the newcomer to the room
                roomParticipants.set(socket.id, currentUser);

                // Save the participant in the database if not already saved
                const existingParticipant = await pool.query(
                    "SELECT 1 FROM session_participants WHERE session_id = $1 AND user_id = $2",
                    [meeting.id, user.id]
                );

                if (existingParticipant.rows.length === 0) {
                    await pool.query(
                        "INSERT INTO session_participants (session_id, user_id) VALUES ($1, $2)",
                        [meeting.id, user.id]
                    );
                }

                // Send the newcomer the list of people already here
                socket.emit('existing-users', existingUsers);

                // Tell everyone else in the room about the newcomer
                socket.to(roomId).emit('user-joined', currentUser);
            } catch (error) {
                console.log('Join room error:', error);
                socket.emit('join-error', { message: 'Could not join the meeting' });
            }
        });

        // ---------- WebRTC signaling ----------
        // The server only passes these messages between two users;
        // the video itself then flows directly between their browsers.

        // Offer: the caller asks the target to start a connection
        socket.on('offer', ({ targetSocketId,callerSocketId, sdp }) => {
            if (!currentUser) return; // must join a room first

            io.to(targetSocketId).emit('offer', {
                callerSocketId,
                sdp,
                caller: currentUser,
            });
        });

        // Answer: the target accepts the offer and replies with its own SDP
        socket.on('answer', ({ targetSocketId,responderSocketId ,sdp }) => {
            
            io.to(targetSocketId).emit('answer', {
                responderSocketId,
                sdp,
            });
        });

        // ICE candidate: network details that help the two browsers find a direct route
        socket.on('ice-candidate', ({ targetSocketId,senderSocketId, candidate }) => {
           

            io.to(targetSocketId).emit('ice-candidate', {
                senderSocketId,
                candidate,
            });
        });

        // ---------- Media toggles ----------
        // currentUser is the same object stored in the room's Map,
        // so updating it also updates what newcomers receive in 'existing-users'.

        socket.on('toggle-audio', ({ roomId, audioEnabled }) => {
            if(rooms.has(roomId)&& rooms.get(roomId).has(socket.id)){
                rooms.get(roomId).get(socket.id).audioEnabled = audioEnabled;
            }

            socket.to(roomId).emit('user-toggled-audio', {
                socketId: socket.id,
                audioEnabled,
            });
        });

        socket.on('toggle-video', ({ roomId, videoEnabled }) => {
           if(rooms.has(roomId)&& rooms.get(roomId).has(socket.id)){
                rooms.get(roomId).get(socket.id).videoEnabled = videoEnabled;
            }

            socket.to(roomId).emit('user-toggled-video', {
                socketId: socket.id,
                videoEnabled,
            });
        })

        // ---------- Chat ----------
        // Save the message in the database, then send it to everyone else in the room
        socket.on('send-message', async ({ roomId, message }) => {
            try {
                const meetings = await pool.query(
                    "SELECT id, status FROM study_sessions WHERE meeting_code = $1",
                    [roomId]
                );

                if (meetings.rows.length > 0 && meetings.rows[0].status !== 'completed') {
                    const meetingId = meetings.rows[0].id;
                    const senderId = message.senderId;

                    await pool.query(
                        "INSERT INTO session_messages (session_id, user_id, content) VALUES ($1, $2, $3)",
                        [meetingId, senderId, message.text]
                    );

                    // socket.to = everyone in the room except the sender
                    // (the sender's chat already shows their own message)
                    socket.to(roomId).emit('receive-message', {
                        ...message,
                        senderSocketId: socket.id,
                    });
                }
            } catch (error) {
                console.log('Send message error:', error);
            }
        });

        // ---------- End meeting (host only) ----------
        socket.on('end-meeting', async ({ roomId }) => {
            try {
                if (!currentUser || !currentUser.isHost) return; // only the host can end it

                // 'completed' is the ended status allowed by the study_sessions table
                await pool.query(
                    "UPDATE study_sessions SET status = 'completed', ended_at = NOW() WHERE meeting_code = $1",
                    [roomId]
                );

                // Everyone still in the meeting leaves now
                await pool.query(
                    `UPDATE session_participants SET left_at = NOW()
                     WHERE left_at IS NULL
                       AND session_id = (SELECT id FROM study_sessions WHERE meeting_code = $1)`,
                    [roomId]
                );

                rooms.delete(roomId);

                io.to(roomId).emit('meeting-ended', { message: 'The meeting has been ended by the host' });
            } catch (error) {
                console.log('End meeting error:', error);
            }
        });

        // ---------- Disconnect ----------
        // Runs automatically when the user closes the tab, leaves, or loses connection
        socket.on('disconnect', () => {
            if (currentRoomId && rooms.has(currentRoomId)) {
                const roomParticipants = rooms.get(currentRoomId);
                roomParticipants.delete(socket.id);

                if (roomParticipants.size === 0) {
                    // Last person left, so remove the empty room
                    rooms.delete(currentRoomId);
                } else {
                    // Tell the remaining people this user has left
                    socket.to(currentRoomId).emit('user-disconnected', {
                        socketId: socket.id,
                        userId: currentUser?.userId,
                    });
                }
            }
        });
    })

    
}
