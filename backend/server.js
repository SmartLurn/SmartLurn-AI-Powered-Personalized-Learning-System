import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import { setupSocketIO } from './socket.js';
import authRouter from './routes/authRoute.js';
import meetingRouter from './routes/meetingRoute.js';
import participantRouter from './routes/participantRoute.js';
import messageRouter from './routes/messageRoute.js';
import materialRouter from './routes/materialRoute.js';
import userRouter from './routes/userRoute.js';

dotenv.config();


const app=express();
// Frontend URLs allowed to call this server, comma-separated in .env
// e.g. ORIGINS=http://localhost:5173,https://myapp.vercel.app
// Spaces and trailing slashes are removed because browsers send the origin without them.
const allowedOrigins=(process.env.ORIGINS || "http://localhost:5173")
    .split(",")
    .map((origin)=>origin.trim().replace(/\/$/, ""))
app.use(cors({origin:allowedOrigins,
    credentials:true
}));
app.use(express.json());

const PORT=process.env.PORT || 5000;

app.use("/api/auth", authRouter);
app.use("/api/meetings/:meetingCode/participants", participantRouter);
app.use("/api/meetings/:meetingCode/messages", messageRouter);
app.use("/api/meetings", meetingRouter);
app.use("/api/materials", materialRouter);
app.use("/api/users", userRouter);

// Global error handler: catches any error thrown in a route or passed to next(err).
// It must have 4 arguments and come after all the routes.
app.use((err, req, res, next) => {
    console.log("Error:", err);

    // Request body was not valid JSON
    if (err.type === "entity.parse.failed") {
        return res.status(400).json({ message: "Invalid JSON in request body" });
    }

    return res.status(err.status || 500).json({
        message: err.status ? err.message : "Internal Server Error",
    });
});

// Express and Socket.IO share one HTTP server so they run on the same port
const server=http.createServer(app);

const io=new Server(server,{
    cors:{origin:allowedOrigins,
        credentials:true
    }
});

setupSocketIO(io);

server.listen(PORT,()=>{
    console.log(`Server is running on port ${PORT}`);
})