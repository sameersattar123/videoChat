const express = require("express");
const app = express()
const server = require("http").createServer(app);
const cors = require("cors");
const dotenv = require('dotenv')
const path = require('path')

const io = require("socket.io")(server, {
    cors: {
        origin: "*", 
        methods: ["GET", "POST"]    
    } 
});

dotenv.config()
app.use(cors());
const basePath = '';

app.use(basePath + "/", express.static(path.resolve(__dirname + "/build")));

app.get("*", (request, response) => {
  response.sendFile(path.resolve(__dirname + "/build/index.html"));
});

const PORT = process.env.PORT;
app.get('/', (req, res) => {
        res.send('Hello World');
});

io.on("connection", (socket) => {
    socket.emit("me", socket.id);
    socket.on("disconnect", () => {
        socket.broadcast.emit("callEnded")
    });
    socket.on("callUser", ({ userToCall, signalData, from, name }) => {
        io.to(userToCall).emit("callUser", { signal: signalData, from, name });
    });
    socket.on("answerCall", (data) => {
        io.to(data.to).emit("callAccepted", data.signal)
    });
});
server.listen(PORT, () => console.log(`Server is running on port ${PORT}`));