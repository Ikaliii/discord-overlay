const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: "*"
    }
});

const PORT = process.env.PORT || 3000;

// 📁 fichiers overlay
app.use(express.static("public"));
app.use(express.json());

// 🔌 connexion overlay (Electron / navigateur)
io.on("connection", (socket) => {
    console.log("Overlay connecté :", socket.id);
});

// 💬 recevoir message du bot Discord
app.post("/send", (req, res) => {
    const { type, content, duration } = req.body;

    io.emit("overlay", {
        type: type || "text",
        content: content || "",
        duration: duration || 8000
    });

    res.json({ success: true });
});

// 🧹 clear écran
app.post("/clear", (req, res) => {
    io.emit("clear");
    res.json({ success: true });
});

// 🚀 start serveur (IMPORTANT RENDER)
server.listen(PORT, () => {
    console.log("Serveur OK sur port " + PORT);
});