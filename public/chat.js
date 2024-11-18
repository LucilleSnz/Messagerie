const socket = io('http://localhost:3000');

// Récupérer le pseudo de la session
const username = sessionStorage.getItem('username');
if (!username) {
    window.location.href = 'login.html'; // Redirige vers la page de connexion si pas de pseudo
}

document.getElementById('welcome-message').innerText = `Connecté en tant que : ${username}`;

// DOM Elements
const chatWindow = document.getElementById('chat-window');
const messageForm = document.getElementById('message-form');
const messageInput = document.getElementById('message');

// Afficher un message
function displayMessage(data) {
    const messageElement = document.createElement('div');
    messageElement.classList.add('message', `user-${data.userId % 2 + 1}`);
    messageElement.innerHTML = `
        <span class="username">${data.username}</span>:
        <span class="text">${data.message}</span>
        <span class="time">${data.time}</span>
    `;
    chatWindow.appendChild(messageElement);
    chatWindow.scrollTop = chatWindow.scrollHeight; // Auto-scroll
}

// Envoyer un message
messageForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const message = messageInput.value.trim();
    if (!message) return;

    const data = {
        username,
        message,
        time: new Date().toLocaleTimeString(),
    };

    socket.emit('message', data); // Envoyer au serveur
    messageInput.value = '';
});

// Recevoir des messages en temps réel
socket.on('message', (data) => {
    displayMessage(data);
});

// Recevoir l'historique des messages lorsque l'utilisateur se connecte
socket.on('chatHistory', (messages) => {
    chatWindow.innerHTML = ''; // Effacer les anciens messages
    messages.forEach(displayMessage); // Afficher tous les messages historiques
});
