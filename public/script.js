// koppla upp till socket.io server
const socket = io();

// håll koll på total summa
let totalScore = 0;

// när vi kopplar upp
socket.on('connect', () => {
    console.log('Ansluten till servern!');
});

// när vi disconnectar
socket.on('disconnect', () => {
    console.log('Tappade anslutningen!');
});

// ta emot antal användare
socket.on('userCount', (count) => {
    document.getElementById('userCounter').innerHTML = 'Uppkopplade: ' + count;
});

// hämta element
const rollBtn = document.getElementById('rollBtn');
const resetBtn = document.getElementById('resetBtn');
const sendBtn = document.getElementById('sendBtn');
const playerNameInput = document.getElementById('playerName');
const messageInput = document.getElementById('messageInput');

// kasta tärning knappen
rollBtn.addEventListener('click', function() {
    const playerName = playerNameInput.value.trim();
    
    if (!playerName) {
        alert('Du måste skriva ditt namn först!');
        return;
    }
    
    // slumpa tärning 1-6
    const roll = Math.floor(Math.random() * 6 + 1);
    totalScore += roll;
    
    // visa mitt resultat
    document.getElementById('myResult').innerHTML = 
        'Du kastade: ' + roll + ' | Total: ' + totalScore;
    
    // skicka till server
    socket.emit('diceRoll', {
        playerName: playerName,
        roll: roll,
        total: totalScore
    });
});

// nollställ poäng knappen
resetBtn.addEventListener('click', function() {
    totalScore = 0;
    document.getElementById('myResult').innerHTML = 'Poäng nollställda!';
    console.log('Poäng nollställda');
});

// ta emot nya kast från andra
socket.on('newRoll', (data) => {
    const resultDiv = document.getElementById('allResults');
    const newRoll = document.createElement('div');
    newRoll.className = 'result-item';
    newRoll.innerHTML = '<strong>' + data.playerName + '</strong>: Kastade ' + data.roll + ' (Total: ' + data.total + ')';
    resultDiv.appendChild(newRoll);
    
    // scrolla ner automatiskt
    resultDiv.scrollTop = resultDiv.scrollHeight;
});

// skicka kommentar
sendBtn.addEventListener('click', function() {
    const playerName = playerNameInput.value.trim();
    const message = messageInput.value.trim();
    
    if (!playerName || !message) {
        alert('Fyll i namn och meddelande!');
        return;
    }
    
    // skicka till server
    socket.emit('sendMessage', {
        playerName: playerName,
        message: message
    });
    
    // töm input
    messageInput.value = '';
});

// ta emot nya kommentarer
socket.on('newMessage', (data) => {
    const chatDiv = document.getElementById('chatMessages');
    const newMsg = document.createElement('div');
    newMsg.className = 'chat-item';
    newMsg.innerHTML = '<span class="time">' + data.time + '</span> <strong>' + data.playerName + ':</strong> ' + data.message;
    chatDiv.appendChild(newMsg);
    
    // scrolla ner
    chatDiv.scrollTop = chatDiv.scrollHeight;
});

// man kan också trycka enter för att skicka meddelande
messageInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        sendBtn.click();
    }
});
