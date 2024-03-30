import express from "express";
import ChatRoute from './Routes/ChatRoute.js';
import MessageRoute from './Routes/MessageRoute.js';
import AuthRoute from './Routes/AuthRoute.js';
import UserRoute from './Routes/UserRoute.js';
import cors from "cors";
import mongoose from "mongoose";
import bodyParser from "body-parser";
import http from "http"; // Import the 'http' module for creating an HTTP server
import { Server } from "socket.io"; // Import the 'Server' class from 'socket.io'
import path from "path";
const app = express();
const PORT = process.env.PORT || 5000;

app.use(bodyParser.json({ limit: "30mb", extended: true }));
app.use(bodyParser.urlencoded({ limit: "30mb", extended: true }));
app.use(cors());

// Create an HTTP server instance using the Express app
const server = http.createServer(app);
// Initialize Socket.IO with the HTTP server
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

mongoose.connect('mongodb+srv://nithinappari:75nlIXu4s977F7U6@cluster0.7ljelcs.mongodb.net/?retryWrites=true&w=majority')
  .then(() => console.log('connection is successful'))
  .catch((err) => console.error('connection failed', err));

app.use('/chat', ChatRoute);
app.use('/auth', AuthRoute);
app.use('/message', MessageRoute);
app.use('/user', UserRoute);

const __dirname1 = path.resolve();

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname1, "/client/build")));

  app.get("*", (req, res) =>
    res.sendFile(path.resolve(__dirname1, "client", "build", "index.html"))
  );
} else {
  app.use(express.static(path.join(__dirname1, "/client/build")));

  app.get("*", (req, res) =>
    res.sendFile(path.resolve(__dirname1, "client", "build", "index.html"))
  );
}

// --------------------------deployment------------------------------

// Error Handling middlewares
// app.use(notFound);
// app.use(errorHandler);

// Define Socket.IO logic within the same file
let activeUsers = [];

io.on("connection", (socket) => {
  socket.on("new-user-add", (newUserId) => {
    if (!activeUsers.some((user) => user.userId === newUserId)) {
      activeUsers.push({ userId: newUserId, socketId: socket.id });
      console.log("New User Connected", activeUsers);
    }
    io.emit("get-users", activeUsers);
  });

  socket.on("disconnect", () => {
    activeUsers = activeUsers.filter((user) => user.socketId !== socket.id);
    console.log("User Disconnected", activeUsers);
    io.emit("get-users", activeUsers);
  });

  socket.on("send-message", (data) => {
    const { receiverId } = data;
    const user = activeUsers.find((user) => user.userId === receiverId);
    console.log("Sending from socket to :", receiverId)
    console.log("Data: ", data)
    if (user) {
      io.to(user.socketId).emit("recieve-message", data);
    }
  });

  socket.on("display", (data) => {
    if (data.typing == true)
      io.emit("display", { typing: true, user: data.user });
    else io.emit("display", { typing: false });
  });
});

// Start the server
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
