import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import { connectDB } from "./src/lib/db.js";
import authRoutes from "./src/routes/auth.route.js";
import messageRoutes from "./src/routes/message.route.js";
import cors from "cors";
import { app, server } from "./src/lib/socket.js";

dotenv.config();

const port = process.env.PORT;

app.use(express.json());
app.use(cookieParser());
app.use(cors({ origin: "http://localhost:5173", credentials: true }));

app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);

server.listen(port, () => {
  console.log("server is runing on port 5001");
  connectDB();
});
