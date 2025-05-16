const express = require('express');
const app = express();
const server = require('http').createServer(app);
const { Server } = require('socket.io');
const io = new Server(server);
const dotenv = require('dotenv');
const cors = require('cors');

dotenv.config();    

app.use(cors());
app.use(express.json());  

app.get('/', (req, res) => {
    res.send('Server is running');
});
io.on('connection', (socket) => {
    console.log('A user connected');
    
    socket.on('disconnect', () => {
        console.log('User disconnected');
    });

    socket.on('message', (msg) => {
        console.log('Message received: ' + msg);
        io.emit('message', msg);
    });
});
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});