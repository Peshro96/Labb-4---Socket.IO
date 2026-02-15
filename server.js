const express = require('express');
const app = express();
const http = require('http').createServer(app);
const path = require('path');

const PORT = 3000;

// servera statiska filer från public mappen
app.use(express.static('public'));

// startsida
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

http.listen(PORT, () => {
    console.log('Servern körs på port ' + PORT);
});
