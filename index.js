// const express = require('express');
// const http = require('http');
// const socketIo = require('socket.io');

// const app = express();
// const server = http.createServer(app);
// const io = socketIo(server);

// app.use(express.static('public'));

// let adminSockets = [];

// io.on('connection', (socket) => {
//     console.log('A user connected');

//     socket.on('adminLogin', (inputAdminId) => {
//         const admin = { id: inputAdminId, socket: socket, available: true };
//         adminSockets.push(admin);
//         console.log(`Admin ${inputAdminId} logged in`);
//         socket.emit('adminLoginSuccess');
//     });

//     socket.on('login', () => {
//         console.log('User logged in');
//         socket.emit('loginSuccess');
//     });

//     socket.on('offer', (offer) => {
//         const availableAdmin = adminSockets.find(admin => admin.available);
//         if (availableAdmin) {
//             availableAdmin.available = false;
//             availableAdmin.socket.emit('offer', offer);
//             console.log('offer', offer);
//         } else {
//             socket.emit('adminNotAvailable');
//         }
//     });

//     socket.on('answer', (answer) => {
//         socket.broadcast.emit('answer', answer);
//         console.log('answer', answer);
//     });

//     socket.on('candidate', (candidate) => {
//         socket.broadcast.emit('candidate', candidate);
//         console.log('candidate', candidate);
//     });

//     socket.on('endCall', () => {
//         adminSockets.forEach(admin => {
//             if (admin.socket === socket) {
//                 admin.available = true;
//             }
//         });
//         socket.broadcast.emit('endCall');
//     });

//     socket.on('disconnect', () => {
//         console.log('User disconnected');
//         adminSockets = adminSockets.filter(admin => admin.socket !== socket);
//     });
// });

// const PORT = process.env.PORT || 3000;
// server.listen(PORT, () => {
//     console.log(`Server is running on port ${PORT}`);
// });


const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.static('public'));

// Define admin IDs
const adminIds = ['admin1', 'admin2'];
let adminSockets = [];

io.on('connection', (socket) => {
    console.log('A user connected');

    socket.on('adminLogin', (inputAdminId) => {
        if (adminIds.includes(inputAdminId)) {
            const admin = { id: inputAdminId, socket: socket, available: true };
            adminSockets.push(admin);
            console.log(`Admin ${inputAdminId} logged in`);
            socket.emit('adminLoginSuccess');
        } else {
            socket.emit('adminLoginFailure', 'Invalid admin ID');
        }
    });

    socket.on('login', () => {
        console.log('User logged in');
        socket.emit('loginSuccess');
    });

    socket.on('offer', (offer) => {
        const availableAdmin = adminSockets.find(admin => admin.available);
        if (availableAdmin) {
            availableAdmin.available = false;
            availableAdmin.socket.emit('offer', offer);
            console.log('Offer sent to admin:', availableAdmin.id);
        } else {
            socket.emit('adminNotAvailable');
        }
    });

    socket.on('answer', (answer) => {
        socket.broadcast.emit('answer', answer);
        console.log('answer', answer);
        socket.emit('callStarted');
    });

    socket.on('candidate', (candidate) => {
        socket.broadcast.emit('candidate', candidate);
        console.log('candidate', candidate);
    });

    socket.on('endCall', () => {
        adminSockets.forEach(admin => {
            if (admin.socket === socket) {
                admin.available = true;
            }
        });
        socket.broadcast.emit('endCall');
    });

    socket.on('disconnect', () => {
        console.log('User disconnected');
        adminSockets = adminSockets.filter(admin => admin.socket !== socket);
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
