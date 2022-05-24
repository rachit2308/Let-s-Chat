const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const authRoutes = require("./routes/auth");
const messageRoutes = require("./routes/messages");
const app = express();
const socket = require("socket.io");

const port = process.env.PORT || 3000;

require("dotenv").config();


app.use(cors());
app.use(express.json());

mongoose
  .connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("DB Connetion Successfull");
  })
  .catch((err) => {
    console.log(err.message);
  });

app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);

const server = app.listen(process.env.PORT, () =>
  console.log(`Server started on ${process.env.PORT || 3000}`)
);
const io = socket(server, {
  cors: {
    // origin: "http://localhost:3000",
    origin:`${process.env.PORT}`,
    credentials: true,
  },
});

global.onlineUsers = new Map();
io.on("connection", (socket) => {
  global.chatSocket = socket;
  socket.on("add-user", (userId) => {
    onlineUsers.set(userId, socket.id);
  });

  socket.on("send-msg", (data) => {
    const sendUserSocket = onlineUsers.get(data.to);
    if (sendUserSocket) {
      socket.to(sendUserSocket).emit("msg-recieve", data.msg);
    }
  });
});


if(process.env.NODE_ENV == "production"){
  app.use(express.static("public /build"));
  const path = require("path");
  app.get("*", (req,res) => {
    res.sendFile(path.resolve(__dirname,'client','build','index.html')
    );
  })
}




//app.listen(port,()=>{
//  console.log('listening to the port no at ${port}');
//})