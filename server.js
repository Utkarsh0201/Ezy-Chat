require("dotenv").config();
const path = require("path");
const express = require("express");
const bp = require("body-parser");
const http = require("http");
const app = express();
app.use(bp.json());
app.use(bp.urlencoded({ extended: true }));
const server = http.createServer(app);
const nodemailer = require("nodemailer");
const socket = require("socket.io");
const io = socket(server);

const users = {};

const socketToRoom = {};
const socketToName = {};

io.on("connection", (socket) => {
  socket.on("join room", (roomID, username) => {
    if (users[roomID]) {
      const length = users[roomID].length;
      if (length === 4) {
        socket.emit("room full");
        return;
      }
      users[roomID].push(socket.id);
    } else {
      users[roomID] = [socket.id];
    }
    socketToRoom[socket.id] = roomID;
    socketToName[socket.id] = username;

    const usersInThisRoom = users[roomID].filter((id) => id !== socket.id);

    let allusernames = [];

    for (let i = 0; i < usersInThisRoom.length; i++) {
      allusernames.push(socketToName[usersInThisRoom[i]]);
    }

    socket.emit("all users", usersInThisRoom, allusernames);
  });

  socket.on("sending signal", (payload) => {
    io.to(payload.userToSignal).emit("user joined", {
      signal: payload.signal,
      callerID: payload.callerID,
      username: socketToName[payload.callerID],
    });
  });

  socket.on("returning signal", (payload) => {
    io.to(payload.callerID).emit("receiving returned signal", {
      signal: payload.signal,
      id: socket.id,
    });
  });

  socket.on("disconnect", () => {
    const roomID = socketToRoom[socket.id];
    const name = socketToName[socket.id];
    let room = users[roomID];

    if (socketToRoom[socket.id]) {
      delete socketToRoom[socket.id];
    }
    if (socketToName[socket.id]) {
      delete socketToName[socket.id];
    }

    if (room) {
      room = room.filter((id) => id !== socket.id);
      users[roomID] = room;

      if (room.length === 0) {
        delete users[roomID];
      }
    }

    socket.broadcast.emit("user-left", socket.id, name);
  });

  socket.on("sending message", (payload) => {
    socket.broadcast.emit("new message", {
      by: payload.by,
      content: payload.content,
      id: socket.id,
    });
  });
});

app.post("/getpeople", (req, res) => {
  const roomID = req.body.roomID;
  let uinR = users[roomID];
  let leng = 0;

  if (uinR) {
    leng = uinR.length;
  }

  res.send({
    number: leng,
  });
});

app.post("/sendemail", (req, res) => {
  const email = req.body.email;
  const url = req.body.url;
  var transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL,
      pass: process.env.PASS,
    },
  });

  var mailOptions = {
    from: process.env.EMAIL,
    to: email,
    subject: "No Reply : Invitation to join an Ezy Meet",
    text: `You have been invited to join an ongoing Ezy Meet. Please Join the Meet at ${url}.`,
  };

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
    } else {
    }
  });

  res.send("Email Sent");
});

if (process.env.PROD) {
  app.use(express.static(path.join(__dirname, "./client/build")));
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "./client/build/index.html"));
  });
}

const port = process.env.PORT || 3030;
server.listen(port, () => console.log(`server is running on port ${port}`));
