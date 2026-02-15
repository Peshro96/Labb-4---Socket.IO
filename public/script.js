// kommer lägga till socket.io senare
console.log('Applikation startad');

// hämta element från html
const rollBtn = document.getElementById('rollBtn');
const sendBtn = document.getElementById('sendBtn');
const playerNameInput = document.getElementById('playerName');
const messageInput = document.getElementById('messageInput');

// när man klickar på kasta tärning
rollBtn.addEventListener('click', function() {
    const playerName = playerNameInput.value;
    
    if (!playerName) {
        alert('Du måste skriva ditt namn först!');
        return;
    }
    
    // här ska tärningskast och socket logik komma
    console.log('Kastar tärning för:', playerName);
});

// när man skickar meddelande
sendBtn.addEventListener('click', function() {
    const message = messageInput.value;
    
    if (!message) {
        return;
    }
    
    // här kommer socket logik för meddelanden
    console.log('Skickar meddelande:', message);
    messageInput.value = '';
});

// man kan också trycka enter för att skicka meddelande
messageInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        sendBtn.click();
    }
});
