
import { useState, useRef, useCallback, useEffect } from "react";
import toast from "react-hot-toast";
import { socket } from "../config/socket";

// Free public STUN server that helps browsers find a direct route to each other
const ICE_SERVERS = {
  iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
};

const useWebRTC = ({ roomId, user, onMeetingEnded }) =>
{
  //  local camera stream
  const [localStream, setLocalStream] = useState(null);

  // remote participants: { socketId, userId, name, isHost, audioEnabled, videoEnabled, stream }
  const [remoteUsers, setRemoteUsers] = useState([]);

  const [audioEnabled, setAudioEnabled] = useState(true);
  const [videoEnabled, setVideoEnabled] = useState(true);

  // Ref keeps the stream accessible to functions
  const localStreamRef = useRef(null);

  // One RTCPeerConnection per remote user: socketId -> connection
  const peersRef = useRef(new Map());

  // Initialize the local camera and microphone
  const initLocalStream = useCallback(async () => {
    try {
      if (navigator?.mediaDevices?.getUserMedia){
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        localStreamRef.current = stream;
        setLocalStream(stream);
        return stream;
      }
    }
    catch (error) {
      console.error("Could not access camera or microphone:", error);
      toast.error(
        "Camera or microphone access failed. Check your browser permissions."
      );
    }
    return null;
  }, []);

  // Update one remote user's fields (stream, audio, video...)
  const updateRemoteUser = (socketId, changes) => {
    setRemoteUsers((prev) =>
      prev.map((u) => (u.socketId === socketId ? { ...u, ...changes } : u))
    );
  };

  // Add a remote user to the list if they aren't there yet
  const addRemoteUser = (newUser) => {
    setRemoteUsers((prev) =>
      prev.some((u) => u.socketId === newUser.socketId)
        ? prev
        : [...prev, { ...newUser, stream: null }]
    );
  };

  // Create a WebRTC connection to one remote user
  const createPeer = (targetSocketId) => {
    const peer = new RTCPeerConnection(ICE_SERVERS);

    // ICE candidates that arrive before the remote description is set wait here
    peer.pendingCandidates = [];

    // Send our camera and microphone to them
    localStreamRef.current?.getTracks().forEach((track) => {
      peer.addTrack(track, localStreamRef.current);
    });

    // Send our network details to them through the server
    peer.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit("ice-candidate", {
          targetSocketId,
          senderSocketId: socket.id,
          candidate: event.candidate,
        });
      }
    };

    // Their video/audio arrived
    peer.ontrack = (event) => {
      updateRemoteUser(targetSocketId, { stream: event.streams[0] });
    };

    peersRef.current.set(targetSocketId, peer);
    return peer;
  };

  // Set the remote description, then add any ICE candidates that were waiting
  const setRemoteDescription = async (peer, sdp) => {
    await peer.setRemoteDescription(new RTCSessionDescription(sdp));

    for (const candidate of peer.pendingCandidates) {
      await peer.addIceCandidate(new RTCIceCandidate(candidate));
    }
    peer.pendingCandidates = [];
  };

  // Close the connection to one remote user
  const removePeer = (socketId) => {
    peersRef.current.get(socketId)?.close();
    peersRef.current.delete(socketId);
    setRemoteUsers((prev) => prev.filter((u) => u.socketId !== socketId));
  };

  // Join the room and handle all socket events
  useEffect(() => {
    if (!roomId || !user) return;

    // We just joined: call everyone who is already in the room
    const handleExistingUsers = async (existingUsers) => {
      for (const existingUser of existingUsers) {
        addRemoteUser(existingUser);

        const peer = createPeer(existingUser.socketId);
        const offer = await peer.createOffer();
        await peer.setLocalDescription(offer);

        socket.emit("offer", {
          targetSocketId: existingUser.socketId,
          callerSocketId: socket.id,
          sdp: offer,
        });
      }
    };

    // Someone new joined: show them; they will send us an offer
    const handleUserJoined = (newUser) => {
      addRemoteUser(newUser);
      toast(`${newUser.name} joined the meeting`);
    };

    // A newcomer is calling us: answer the call
    const handleOffer = async ({ callerSocketId, sdp, caller }) => {
      if (caller) addRemoteUser(caller);

      const peer = createPeer(callerSocketId);
      await setRemoteDescription(peer, sdp);

      const answer = await peer.createAnswer();
      await peer.setLocalDescription(answer);

      socket.emit("answer", {
        targetSocketId: callerSocketId,
        responderSocketId: socket.id,
        sdp: answer,
      });
    };

    // The person we called answered
    const handleAnswer = async ({ responderSocketId, sdp }) => {
      const peer = peersRef.current.get(responderSocketId);
      if (peer) await setRemoteDescription(peer, sdp);
    };

    // Network details from the other person
    const handleIceCandidate = async ({ senderSocketId, candidate }) => {
      const peer = peersRef.current.get(senderSocketId);
      if (!peer) return;

      if (peer.remoteDescription) {
        await peer.addIceCandidate(new RTCIceCandidate(candidate));
      } else {
        peer.pendingCandidates.push(candidate);
      }
    };

    const handleToggleAudio = ({ socketId, audioEnabled }) => {
      updateRemoteUser(socketId, { audioEnabled });
    };

    const handleToggleVideo = ({ socketId, videoEnabled }) => {
      updateRemoteUser(socketId, { videoEnabled });
    };

    const handleUserDisconnected = ({ socketId }) => {
      removePeer(socketId);
    };

    const handleMeetingEnded = ({ message }) => {
      onMeetingEnded?.(message);
    };

    const handleJoinError = ({ message }) => {
      toast.error(message);
      onMeetingEnded?.();
    };

    socket.on("existing-users", handleExistingUsers);
    socket.on("user-joined", handleUserJoined);
    socket.on("offer", handleOffer);
    socket.on("answer", handleAnswer);
    socket.on("ice-candidate", handleIceCandidate);
    socket.on("user-toggled-audio", handleToggleAudio);
    socket.on("user-toggled-video", handleToggleVideo);
    socket.on("user-disconnected", handleUserDisconnected);
    socket.on("meeting-ended", handleMeetingEnded);
    socket.on("join-error", handleJoinError);

    // Get the camera first so it is shared with everyone we connect to
    const start = async () => {
      await initLocalStream();

      socket.connect();
      socket.emit("join-room", {
        roomId,
        user: { id: user.id, name: user.name },
        audioEnabled: true,
        videoEnabled: true,
      });
    };

    start();

    // Leaving the page: stop listening, close connections, turn off the camera
    return () => {
      socket.off("existing-users", handleExistingUsers);
      socket.off("user-joined", handleUserJoined);
      socket.off("offer", handleOffer);
      socket.off("answer", handleAnswer);
      socket.off("ice-candidate", handleIceCandidate);
      socket.off("user-toggled-audio", handleToggleAudio);
      socket.off("user-toggled-video", handleToggleVideo);
      socket.off("user-disconnected", handleUserDisconnected);
      socket.off("meeting-ended", handleMeetingEnded);
      socket.off("join-error", handleJoinError);

      peersRef.current.forEach((peer) => peer.close());
      peersRef.current.clear();

      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((track) => track.stop());
      }

      socket.disconnect();
    };
  }, [roomId, user?.id]);

  // Toggle microphone
  const toggleAudio = () => {
    const newState = !audioEnabled;
    setAudioEnabled(newState);

    if (localStreamRef.current) {
        const audioTrack=localStreamRef.current.getAudioTracks()[0]
        if (audioTrack) {
            audioTrack.enabled = newState;
        }
    }

    socket.emit("toggle-audio", { roomId, audioEnabled: newState });

    toast(newState ? "Microphone unmuted" : "Microphone muted",{
        icon: newState ? "🔊" : "🔇",
    })
  }

  // Toggle camera
 const toggleVideo = () => {
    const newState = !videoEnabled;
    setVideoEnabled(newState);

    if (localStreamRef.current) {
        const videoTrack=localStreamRef.current.getVideoTracks()[0]
        if (videoTrack) {
            videoTrack.enabled = newState;
        }
    }

    socket.emit("toggle-video", { roomId, videoEnabled: newState });

    toast(newState ? "Camera turned on" : "Camera turned off",{
    icon: newState ? "📹" : "📷",
    })
  }

  // End the current meeting for everyone (host only; the server checks this)
  const endMeeting = useCallback(() => {
    socket.emit("end-meeting", { roomId });
  }, [roomId]);

  return {
    localStream,
    remoteUsers,
    audioEnabled,
    videoEnabled,
    toggleAudio,
    toggleVideo,
    endMeeting,
  };
}

export default useWebRTC;
