const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const path = require('path');
const mongoose = require('mongoose');
require('dotenv').config();

// importera modellen
const DiceRoll = require('./models/DiceRoll');

const PORT = 3000;

// koppla upp till MongoDB
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('Ansluten till MongoDB'))
    .catch(err => console.error('Fel vid anslutning till MongoDB:', err));

// middleware för json
app.use(express.json());

// servera statiska filer från public mappen
app.use(express.static('public'));

// startsida
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// API endpoint för att hämta alla sparade tärningskast
app.get('/api/dice-rolls', async (req, res) => {
    try {
        // hämta alla kast, sorterade efter senaste först
        const rolls = await DiceRoll.find().sort({ timestamp: -1 });
        res.json(rolls);
    } catch (error) {
        console.error('Fel vid hämtning av tärningskast:', error);
        res.status(500).json({ error: 'Kunde inte hämta tärningskast' });
    }
});

// socket.io - hantera anslutningar
io.on('connection', (socket) => {
    console.log('En användare anslöt:', socket.id);
    
    // skicka antal uppkopplade till alla
    io.emit('userCount', io.engine.clientsCount);

    // när någon discar
    socket.on('disconnect', () => {
        console.log('Användare disconnectade:', socket.id);
        // uppdatera antal användare
        io.emit('userCount', io.engine.clientsCount);
    });

    // ta emot tärningskast
    socket.on('diceRoll', async (data) => {
        console.log('Tärningskast från', data.playerName, ':', data.roll);
        
        // spara i databasen
        try {
            const newRoll = new DiceRoll({
                playerName: data.playerName,
                roll: data.roll,
                total: data.total
            });
            await newRoll.save();
            console.log('Tärningskast sparat i databasen');
        } catch (error) {
            console.error('Fel vid sparande av tärningskast:', error);
        }
        
        // skicka till alla anslutna
        io.emit('newRoll', data);
    });

    // ta emot kommentarer
    socket.on('sendMessage', (message) => {
        console.log('Meddelande:', message);
        // lägg till tidsstämpel
        message.time = new Date().toLocaleTimeString('sv-SE');
        // skicka till alla
        io.emit('newMessage', message);
    });
});

http.listen(PORT, () => {
    console.log('Servern körs på port ' + PORT);
});
