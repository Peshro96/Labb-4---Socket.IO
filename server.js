const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const path = require('path');

const PORT = 3000;

// servera statiska filer från public mappen
app.use(express.static('public'));

// startsida
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// socket.io - hantera anslutningar
io.on('connection', (socket) => {
    console.log('En användare anslöt:', socket.id);

    // när någon discar
    socket.on('disconnect', () => {
        console.log('Användare disconnectade:', socket.id);
    });

    // ta emot tärningskast
    socket.on('diceRoll', (data) => {
        console.log('Tärningskast från', data.playerName, ':', data.roll);
        // skicka till alla anslutna
        io.emit('newRoll', data);
    });

    // ta emot kommentarer
    socket.on('sendMessage', (message) => {
        console.log('Meddelande:', message);
        // skicka till alla
        io.emit('newMessage', message);
    });
});

http.listen(PORT, () => {
    console.log('Servern körs på port ' + PORT);
});
