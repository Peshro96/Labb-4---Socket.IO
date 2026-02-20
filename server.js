const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const path = require('path');
require('dotenv').config();
const mongoose = require('mongoose');
const DiceRoll = require('./models/DiceRoll');

const PORT = process.env.PORT || 3000;

// koppla till mongodb
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('✅ Ansluten till MongoDB Atlas'))
    .catch(err => console.error('❌ MongoDB fel:', err.message));

// servera statiska filer
app.use(express.static('public'));
app.use(express.json());

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// räkna antal uppkopplade användare
let userCount = 0;

// socket.io - hantera anslutningar
io.on('connection', (socket) => {
    userCount++;
    console.log('En användare anslöt:', socket.id);
    io.emit('userCount', userCount);

    socket.on('disconnect', () => {
        userCount--;
        console.log('Användare disconnectade:', socket.id);
        io.emit('userCount', userCount);
    });

    // ta emot tärningskast och SPARA I DATABASEN
    socket.on('diceRoll', async (data) => {
        console.log(`🎲 ${data.playerName} kastade ${data.roll}`);
        
        // spara i mongodb
        try {
            const newRoll = new DiceRoll({
                playerName: data.playerName,
                roll: data.roll,
                total: data.total
            });
            await newRoll.save();
        } catch (err) {
            console.error('Databasfel:', err.message);
        }
        
        io.emit('newRoll', data);
    });

    socket.on('sendMessage', (message) => {
        console.log(`💬 ${message.playerName}: ${message.message}`);
        io.emit('newMessage', message);
    });
});

// API endpoint för att hämta alla tärningskast 
app.get('/api/rolls', async (req, res) => {
    try {
        // hämta senaste 100 kast
        const rolls = await DiceRoll.find()
            .sort({ timestamp: -1 })
            .limit(100);
        res.json(rolls);
    } catch (err) {
        console.error('API error:', err.message);
        res.status(500).json({ error: 'Kunde inte hämta tärningskast' });
    }
});

http.listen(PORT, () => {
    console.log(`Server körs på port ${PORT}`);
});

