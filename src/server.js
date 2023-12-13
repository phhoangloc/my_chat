// server.js
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const next = require('next');

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

const server = express();
const httpServer = http.createServer(server);
const io = new Server(httpServer);
const port = process.env.port || 3000;

app.prepare().then(() => {
    server.get('*', (req, res) => {
        return handle(req, res);
    });

    io.on('connection', (socket) => {
        socket.emit("messageMe", { type: "note", msg: "welcome to my chat" })


        socket.on("enter", (data) => {
            socket.name = data.name
            socket.join(data.room)
            socket.emit("messageMe", { type: "note", ...data, msg: "welcome to " })
            socket.in(data.room).emit("messageYou", { type: "note", ...data, msg: " enter room " })
        })

        socket.on("leave", (data) => {
            socket.leave(data.room);
            socket.in(data.room).emit("messageYou", { type: "note", ...data, msg: " leave room " })
        })

        socket.on("onWebcam", (data) => {
            socket.emit("webMe", data)
            socket.in(data.room).emit("webYou", data)
        })

        socket.on("send msg", (data) => {
            socket.emit("messageMe", { type: "msg", sender: true, ...data })
            socket.in(data.room).emit("messageYou", { type: "msg", sender: false, ...data })
        })

        socket.on('disconnect', () => {
            socket.broadcast.emit("messageYou", { type: "note", name: socket.name, msg: " leave room " })
        });
    });

    httpServer.listen(port, () => {
        console.log('> Ready on http://localhost:3000');
    });
});
