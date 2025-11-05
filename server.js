// server.js
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const http = require("http"); 
const { Server } = require("socket.io"); 

const app = express();
const server = http.createServer(app); 
const ChatMessage = require("./models/ChatMessage");

const io = new Server(server, {
  cors: { origin: "*" }, 
});

// ------------------- Socket.IO Logic -------------------
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

   socket.on("joinRoom", async (roomId) => {
    socket.join(roomId);
    console.log(`📡 User joined room: ${roomId}`);

    const oldMessages = await ChatMessage.find({ roomId }).sort({ time: 1 });
    socket.emit("chatHistory", oldMessages);
  });

  socket.on("sendMessage", async (data) => {
    const { roomId, sender, text } = data;

    const msg = new ChatMessage({ roomId, sender, text });
    await msg.save();

    io.to(roomId).emit("receiveMessage", msg);
  });


  socket.on("disconnect", () => {
    console.log(" User disconnected:", socket.id);
  });
});

// Middleware
app.use(cors());
app.use(express.json());

mongoose
  .connect("mongodb://localhost:27017/gigconnect",{
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error(" MongoDB connection error:", err));

// Routes
const gigRoutes = require("./routes/gig");
const authRoutes = require("./routes/auth");
const applicationRoutes = require("./routes/applicationRoutes");
app.use("/api/applications", applicationRoutes);
app.use("/api/gigs", gigRoutes);
app.use("/api/auth", authRoutes);


app.get("/", (req, res) => res.send("Server is running successfully 🚀"));

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
