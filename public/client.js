// const socket = io();

// const adminLoginBtn = document.getElementById('adminLoginBtn');
// const userLoginBtn = document.getElementById('userLoginBtn');
// const startCallBtn = document.getElementById('startCall');
// const endCallBtn = document.getElementById('endCall');
// const localAudio = document.getElementById('localAudio');
// const remoteAudio = document.getElementById('remoteAudio');

// let localStream;
// let peerConnection;
// let isAdmin = false;

// const configuration = {
//     iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
// };

// adminLoginBtn.addEventListener('click', async () => {
//     const adminId = prompt('Enter admin ID:');
//     if (adminId) {
//         try {
//             localStream = await navigator.mediaDevices.getUserMedia({ audio: true });
//             localAudio.srcObject = localStream;
//             localAudio.muted = true;
//             socket.emit('adminLogin', adminId);
//             isAdmin = true;
//         } catch (error) {
//             console.error('Error accessing media devices.', error);
//         }
//     }
// });

// userLoginBtn.addEventListener('click', () => {
//     socket.emit('login');
// });

// startCallBtn.addEventListener('click', async () => {
//     if (!localStream) {
//         try {
//             localStream = await navigator.mediaDevices.getUserMedia({ audio: true });
//             localAudio.srcObject = localStream;
//             localAudio.muted = true;
//         } catch (error) {
//             console.error('Error accessing media devices.', error);
//             return;
//         }
//     }

//     peerConnection = new RTCPeerConnection(configuration);

//     peerConnection.onicecandidate = event => {
//         if (event.candidate) {
//             socket.emit('candidate', event.candidate);
//         }
//     };

//     peerConnection.ontrack = event => {
//         remoteAudio.srcObject = event.streams[0];
//     };

//     localStream.getTracks().forEach(track => {
//         peerConnection.addTrack(track, localStream);
//     });

//     const offer = await peerConnection.createOffer();
//     await peerConnection.setLocalDescription(offer);
//     socket.emit('offer', offer);
// });

// endCallBtn.addEventListener('click', () => {
//     if (peerConnection) {
//         peerConnection.close();
//         peerConnection = null;
//         localAudio.srcObject = null;
//         remoteAudio.srcObject = null;
//         socket.emit('endCall');
//     }
// });

// socket.on('offer', async (offer) => {
//     if (!isAdmin) {
//         return;
//     }

//     if (!peerConnection) {
//         peerConnection = new RTCPeerConnection(configuration);

//         peerConnection.onicecandidate = event => {
//             if (event.candidate) {
//                 socket.emit('candidate', event.candidate);
//             }
//         };

//         peerConnection.ontrack = event => {
//             remoteAudio.srcObject = event.streams[0];
//         };

//         localStream.getTracks().forEach(track => {
//             peerConnection.addTrack(track, localStream);
//         });

//         await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
//         const answer = await peerConnection.createAnswer();
//         await peerConnection.setLocalDescription(answer);
//         socket.emit('answer', answer);
//     }
// });

// socket.on('answer', async (answer) => {
//     if (peerConnection) {
//         await peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
//     }
// });

// socket.on('candidate', async (candidate) => {
//     if (peerConnection) {
//         try {
//             await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
//         } catch (e) {
//             console.error('Error adding received ice candidate', e);
//         }
//     }
// });

// socket.on('endCall', () => {
//     if (peerConnection) {
//         peerConnection.close();
//         peerConnection = null;
//         localAudio.srcObject = null;
//         remoteAudio.srcObject = null;
//     }
// });

// socket.on('adminLoginSuccess', () => {
//     alert('Admin logged in successfully');
//     endCallBtn.disabled = false; // Enables End Call button for the admin
// });

// socket.on('adminLoginFailure', (errorMessage) => {
//     alert(errorMessage);
// });

// socket.on('adminNotAvailable', () => {
//     alert('No available admin at the moment');
// });

// socket.on('loginSuccess', () => {
//     alert('User logged in successfully');
//     startCallBtn.disabled = false; // Enables Start Call button for the user
//     endCallBtn.disabled = false;   // Enables End Call button for the user
// });


const socket = io();

const adminLoginBtn = document.getElementById('adminLoginBtn');
const userLoginBtn = document.getElementById('userLoginBtn');
const startCallBtn = document.getElementById('startCall');
const endCallBtn = document.getElementById('endCall');
const localAudio = document.getElementById('localAudio');
const remoteAudio = document.getElementById('remoteAudio');
const callTimer = document.getElementById('callTimer');

let localStream;
let peerConnection;
let isAdmin = false;
let callStartTime;
let callInterval;

const configuration = {
    iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
};

function startTimer() {
    callStartTime = Date.now();
    callTimer.style.display = 'block'; // Show the timer
    callInterval = setInterval(() => {
        const elapsedTime = Date.now() - callStartTime;
        const minutes = Math.floor(elapsedTime / 60000);
        const seconds = Math.floor((elapsedTime % 60000) / 1000);
        callTimer.textContent = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    }, 1000);
}

function stopTimer() {
    clearInterval(callInterval);
    callTimer.textContent = '00:00';
    callTimer.style.display = 'none'; // Hide the timer
}

adminLoginBtn.addEventListener('click', async () => {
    const adminId = prompt('Enter admin ID:');
    if (adminId) {
        try {
            localStream = await navigator.mediaDevices.getUserMedia({ audio: true });
            localAudio.srcObject = localStream;
            localAudio.muted = true;
            socket.emit('adminLogin', adminId);
            isAdmin = true;
        } catch (error) {
            console.error('Error accessing media devices.', error);
        }
    }
});

userLoginBtn.addEventListener('click', () => {
    socket.emit('login');
});

startCallBtn.addEventListener('click', async () => {
    if (!localStream) {
        try {
            localStream = await navigator.mediaDevices.getUserMedia({ audio: true });
            localAudio.srcObject = localStream;
            localAudio.muted = true;
        } catch (error) {
            console.error('Error accessing media devices.', error);
            return;
        }
    }

    peerConnection = new RTCPeerConnection(configuration);

    peerConnection.onicecandidate = event => {
        if (event.candidate) {
            socket.emit('candidate', event.candidate);
        }
    };

    peerConnection.ontrack = event => {
        remoteAudio.srcObject = event.streams[0];
    };

    localStream.getTracks().forEach(track => {
        peerConnection.addTrack(track, localStream);
    });

    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);
    socket.emit('offer', offer);
});

endCallBtn.addEventListener('click', () => {
    if (peerConnection) {
        peerConnection.close();
        peerConnection = null;
        localAudio.srcObject = null;
        remoteAudio.srcObject = null;
        socket.emit('endCall');
    }
});

socket.on('offer', async (offer) => {
    if (!isAdmin) {
        return;
    }

    if (!peerConnection) {
        peerConnection = new RTCPeerConnection(configuration);

        peerConnection.onicecandidate = event => {
            if (event.candidate) {
                socket.emit('candidate', event.candidate);
            }
        };

        peerConnection.ontrack = event => {
            remoteAudio.srcObject = event.streams[0];
        };

        localStream.getTracks().forEach(track => {
            peerConnection.addTrack(track, localStream);
        });

        await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
        const answer = await peerConnection.createAnswer();
        await peerConnection.setLocalDescription(answer);
        socket.emit('answer', answer);
    }
});

socket.on('answer', async (answer) => {
    if (peerConnection) {
        await peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
        socket.emit('callStarted');
    }
});

socket.on('candidate', async (candidate) => {
    if (peerConnection) {
        try {
            await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
        } catch (e) {
            console.error('Error adding received ice candidate', e);
        }
    }
});

socket.on('endCall', () => {
    if (peerConnection) {
        peerConnection.close();
        peerConnection = null;
        localAudio.srcObject = null;
        remoteAudio.srcObject = null;
    }
    stopTimer();
});

socket.on('adminLoginSuccess', () => {
    alert('Admin logged in successfully');
    endCallBtn.disabled = false; // Enables End Call button for the admin
});

socket.on('adminLoginFailure', (errorMessage) => {
    alert(errorMessage);
});

socket.on('adminNotAvailable', () => {
    alert('No available admin at the moment');
});

socket.on('loginSuccess', () => {
    alert('User logged in successfully');
    startCallBtn.disabled = false; // Enables Start Call button for the user
    endCallBtn.disabled = false;   // Enables End Call button for the user
});

socket.on('callStarted', () => {
    startTimer();
});
