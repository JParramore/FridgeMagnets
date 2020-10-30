let express = require('express');

let app = express();
let server = app.listen(3000);

app.use(express.static('public'));

let socket = require('socket.io');
let io = socket(server);

io.sockets.on('connection', newConnection);

let fridge = {};

function newConnection(socket) {
    console.log("new conncetion: " + socket.id);

    io.to(socket.id).emit('build', fridge);

    socket.on('move', function (data) {
        socket.broadcast.emit('move', data);
        fridge[data.id].x = data.x
        fridge[data.id].y = data.y;
    })

    socket.on('new', function (data) {

        // too many magnets, kill it
        if (Object.keys(fridge).length > 500) {
            fridge = {};
            io.emit('build', fridge);
        }

        // add new magnet for peoples
        socket.broadcast.emit('new', data);
        fridge[data.id] = {
            char: data.char,
            x: data.x,
            y: data.y
        };
    })

    // drop everyones magnets
    socket.on('drop', function () {
        fridge = {};
        io.emit('build', fridge);
    })


}

console.log("socket server running");

