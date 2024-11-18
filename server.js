const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const fs = require('fs');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Définir le chemin du fichier JSON pour stocker les messages
const messagesFilePath = path.join(__dirname, 'messages.json');

// Fonction pour charger les messages depuis le fichier JSON
const loadMessages = () => {
    if (fs.existsSync(messagesFilePath)) {
        try {
            const data = fs.readFileSync(messagesFilePath);
            return JSON.parse(data);
        } catch (err) {
            console.error('Erreur lors de la lecture des messages:', err);
            return []; // Retourne un tableau vide en cas d'erreur
        }
    }
    return []; // Si le fichier n'existe pas, renvoyer un tableau vide
};

// Fonction pour sauvegarder les messages dans le fichier JSON
const saveMessages = (messages) => {
    try {
        fs.writeFileSync(messagesFilePath, JSON.stringify(messages, null, 2));
        console.log('Messages sauvegardés avec succès.');
    } catch (err) {
        console.error('Erreur lors de la sauvegarde des messages:', err);
    }
};

// Servir les fichiers statiques (HTML, CSS, JS)
app.use(express.static(path.join(__dirname, 'public')));

// Gérer les messages via Socket.IO
io.on('connection', (socket) => {
    console.log('Un utilisateur est connecté.');

    // Charger l'historique des messages et l'envoyer à l'utilisateur
    const messages = loadMessages();
    socket.emit('chatHistory', messages); // Envoi de l'historique au client

    // Gérer un nouveau message
    socket.on('message', (data) => {
        const messages = loadMessages();
        messages.push(data); // Ajouter le nouveau message
        saveMessages(messages); // Sauvegarder les messages
        io.emit('message', data); // Diffuser à tous les utilisateurs
    });

    socket.on('disconnect', () => {
        console.log('Un utilisateur s\'est déconnecté.');
    });
});

// Gérer la route d'accueil

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// Démarrer le serveur
server.listen(3000, () => {
    console.log('Serveur démarré sur http://localhost:3000');
});
