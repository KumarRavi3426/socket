import { Server } from "socket.io"
import { configDotenv } from 'dotenv';

configDotenv();

// change required for production

const url = process.env.FRONTEND_URL || "http://localhost:5173";
const PORT = process.env.PORT || 9000;
const io = new Server(PORT, {
  cors: {
    origin: url
  }
});

// Array of Objects
let users = [];

// Doubt in this
const addUser = (userData, socketId) => {
  !users.some((user) => user.sub === userData.sub) &&
    users.push({ ...userData, socketId });
};

const getUser = (userId)=>{
    return users.find(user=> user.sub===userId)
}

const removeUser = (socketId) => {
  users = users.filter((user) => user.socketId !== socketId);
};


io.on("connection", (socket)=>{
    console.log("User connected")

    socket.on("addUsers", (userData)=>{
        addUser(userData, socket.id)
        io.emit("getUsers", users);
    })

    socket.on("sendMessage", data=>{
        const user = getUser(data.receiverId)
        if (user) {
          io.to(user.socketId).emit("getMessage", data);
        }
    })

    socket.on("disconnect", ()=>{
        console.log("user disconnected");
        removeUser(socket.id);
        io.emit("getUsers", users);
    })
})