// Elementi del DOM
const gameArea = document.getElementById('gameArea');
const player = document.getElementById('player');
const scoreElement = document.getElementById('score');
const coinsElement = document.getElementById('coins');
const timeElement = document.getElementById('time');
const startBtn = document.getElementById('startBtn');
const resetBtn = document.getElementById('resetBtn');
const helpBtn = document.getElementById('helpBtn');
const messageElement = document.getElementById('message');
const instructionsModal = document.getElementById('instructionsModal');
const closeModal = document.getElementById('closeModal');
const startFromModal = document.getElementById('startFromModal');
const helpBtnModal = document.getElementById('helpBtn');

// Variabili di gioco
let score = 0;
let coinsCollected = 0;
let totalCoins = 10;
let timeLeft = 60;
let gameActive = false;
let gameTimer;
let coins = [];
let playerPosition = { x: 100, y: 100 };
let keysPressed = {};

// Dimensioni dell'area di gioco
const gameAreaWidth = gameArea.offsetWidth;
const gameAreaHeight = gameArea.offsetHeight;

// Inizializzazione del gioco
function initGame() {
    // Posiziona il personaggio
    player.style.left = `${playerPosition.x}px`;
    player.style.top = `${playerPosition.y}px`;
    
    // Crea gli elementi del viso di Mario
    createMarioFace();
    
    // Resetta le variabili di gioco
    score = 0;
    coinsCollected = 0;
    timeLeft = 60;
    updateUI();
    
    // Rimuove le monetine precedenti
    coins.forEach(coin => {
        if (coin.element && coin.element.parentNode) {
            coin.element.parentNode.removeChild(coin.element);
        }
    });
    
    coins = [];
    
    // Crea le monetine
    createCoins();
    
    // Nascondi il messaggio
    hideMessage();
    
    // Ferma il timer se già attivo
    if (gameTimer) clearInterval(gameTimer);
    
    // Aggiorna lo stato del gioco
    gameActive = false;
    startBtn.innerHTML = '<i class="fas fa-play"></i> Inizia Gioco';
}

// Crea gli elementi del viso di Mario
function createMarioFace() {
    // Rimuovi elementi esistenti
    const existingEyes = player.querySelectorAll('.eye, .mustache');
    existingEyes.forEach(el => el.remove());
    
    // Crea occhi
    const leftEye = document.createElement('div');
    leftEye.className = 'eye left';
    player.appendChild(leftEye);
    
    const rightEye = document.createElement('div');
    rightEye.className = 'eye right';
    player.appendChild(rightEye);
    
    // Crea baffi
    const leftMustache = document.createElement('div');
    leftMustache.className = 'mustache left';
    player.appendChild(leftMustache);
    
    const rightMustache = document.createElement('div');
    rightMustache.className = 'mustache right';
    player.appendChild(rightMustache);
}

// Crea le monetine in posizioni casuali
function createCoins() {
    for (let i = 0; i < totalCoins; i++) {
        // Crea elemento moneta
        const coin = document.createElement('div');
        coin.className = 'coin';
        coin.id = `coin${i}`;
        
        // Posiziona la moneta in una posizione casuale
        const maxX = gameAreaWidth - 40;
        const maxY = gameAreaHeight - 40;
        
        // Assicuriamoci che le monetine non siano troppo vicine al personaggio all'inizio
        let coinX, coinY;
        let tooCloseToPlayer;
        
        do {
            coinX = Math.floor(Math.random() * maxX);
            coinY = Math.floor(Math.random() * maxY);
            
            // Controlla se la moneta è troppo vicina al personaggio (meno di 100px)
            const distance = Math.sqrt(
                Math.pow(coinX - playerPosition.x, 2) + 
                Math.pow(coinY - playerPosition.y, 2)
            );
            
            tooCloseToPlayer = distance < 100;
        } while (tooCloseToPlayer);
        
        coin.style.left = `${coinX}px`;
        coin.style.top = `${coinY}px`;
        
        // Aggiungi la moneta all'area di gioco
        gameArea.appendChild(coin);
        
        // Salva i dati della moneta
        coins.push({
            id: i,
            element: coin,
            x: coinX,
            y: coinY,
            collected: false
        });
    }
}

// Aggiorna l'interfaccia utente
function updateUI() {
    scoreElement.textContent = score;
    coinsElement.textContent = coinsCollected;
    timeElement.textContent = timeLeft;
}

// Mostra un messaggio
function showMessage(text, type = 'info') {
    messageElement.textContent = text;
    messageElement.style.display = 'block';
    
    // Imposta il colore in base al tipo di messaggio
    if (type === 'success') {
        messageElement.style.backgroundColor = '#E8F5E9';
        messageElement.style.color = '#2E7D32';
        messageElement.style.borderLeftColor = '#2E7D32';
    } else if (type === 'error') {
        messageElement.style.backgroundColor = '#FFEBEE';
        messageElement.style.color = '#C62828';
        messageElement.style.borderLeftColor = '#C62828';
    } else {
        messageElement.style.backgroundColor = '#E3F2FD';
        messageElement.style.color = '#1565C0';
        messageElement.style.borderLeftColor = '#1565C0';
    }
    
    // Nascondi il messaggio dopo 3 secondi
    if (type !== 'error') {
        setTimeout(hideMessage, 3000);
    }
}

// Nascondi il messaggio
function hideMessage() {
    messageElement.style.display = 'none';
}

// Controlla collisioni con le monetine
function checkCoinCollision() {
    const playerRect = player.getBoundingClientRect();
    
    coins.forEach(coin => {
        if (!coin.collected) {
            const coinRect = coin.element.getBoundingClientRect();
            
            // Controlla se c'è una collisione
            if (
                playerRect.left < coinRect.right &&
                playerRect.right > coinRect.left &&
                playerRect.top < coinRect.bottom &&
                playerRect.bottom > coinRect.top
            ) {
                // Colleziona la moneta
                collectCoin(coin);
            }
        }
    });
}

// Colleziona una moneta
function collectCoin(coin) {
    coin.collected = true;
    coin.element.style.display = 'none';
    
    // Aggiorna il punteggio
    score += 10;
    coinsCollected++;
    
    // Aggiorna l'UI
    updateUI();
    
    // Mostra un effetto visivo
    showMessage(`+10 punti! Monete: ${coinsCollected}/${totalCoins}`, 'success');
    
    // Controlla se tutte le monetine sono state raccolte
    if (coinsCollected === totalCoins) {
        endGame(true);
    }
}

// Muovi il personaggio
function movePlayer(dx, dy) {
    if (!gameActive) return;
    
    // Calcola la nuova posizione
    let newX = playerPosition.x + dx;
    let newY = playerPosition.y + dy;
    
    // Limita il movimento ai bordi dell'area di gioco
    newX = Math.max(0, Math.min(newX, gameAreaWidth - player.offsetWidth));
    newY = Math.max(0, Math.min(newY, gameAreaHeight - player.offsetHeight));
    
    // Aggiorna la posizione
    playerPosition.x = newX;
    playerPosition.y = newY;
    
    // Applica la nuova posizione
    player.style.left = `${newX}px`;
    player.style.top = `${newY}px`;
    
    // Controlla le collisioni con le monetine
    checkCoinCollision();
}

// Gestione del timer di gioco
function startTimer() {
    gameTimer = setInterval(() => {
        timeLeft--;
        timeElement.textContent = timeLeft;
        
        if (timeLeft <= 0) {
            endGame(false);
        }
    }, 1000);
}

// Inizia il gioco
function startGame() {
    if (gameActive) return;
    
    gameActive = true;
    startBtn.innerHTML = '<i class="fas fa-pause"></i> Pausa';
    startTimer();
    showMessage('Il gioco è iniziato! Raccogli tutte le monetine!', 'success');
}

// Metti in pausa il gioco
function pauseGame() {
    gameActive = false;
    clearInterval(gameTimer);
    startBtn.innerHTML = '<i class="fas fa-play"></i> Riprendi';
    showMessage('Gioco in pausa', 'info');
}

// Termina il gioco
function endGame(isWin) {
    gameActive = false;
    clearInterval(gameTimer);
    
    if (isWin) {
        showMessage(`Complimenti! Hai vinto con ${score} punti!`, 'success');
    } else {
        showMessage(`Tempo scaduto! Hai raccolto ${coinsCollected} monete.`, 'error');
    }
    
    startBtn.innerHTML = '<i class="fas fa-play"></i> Nuova Partita';
}

// Gestione degli eventi tastiera
document.addEventListener('keydown', (e) => {
    // Salva il tasto premuto
    keysPressed[e.key.toLowerCase()] = true;
    
    // Gestione movimento con WASD o frecce
    let dx = 0, dy = 0;
    const speed = 10;
    
    if (keysPressed['w'] || keysPressed['arrowup']) dy -= speed;
    if (keysPressed['s'] || keysPressed['arrowdown']) dy += speed;
    if (keysPressed['a'] || keysPressed['arrowleft']) dx -= speed;
    if (keysPressed['d'] || keysPressed['arrowright']) dx += speed;
    
    if (dx !== 0 || dy !== 0) {
        movePlayer(dx, dy);
    }
    
    // Avvia il gioco con la barra spaziatrice se non è già attivo
    if (e.code === 'Space' && !gameActive) {
        startGame();
        e.preventDefault(); // Previene lo scroll della pagina
    }
});

document.addEventListener('keyup', (e) => {
    // Rimuove il tasto rilasciato
    keysPressed[e.key.toLowerCase()] = false;
});

// Gestione del click per muovere il personaggio
gameArea.addEventListener('click', (e) => {
    if (!gameActive) return;
    
    const rect = gameArea.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;
    
    // Calcola la differenza tra la posizione del click e quella del personaggio
    const dx = clickX - playerPosition.x - player.offsetWidth / 2;
    const dy = clickY - playerPosition.y - player.offsetHeight / 2;
    
    // Normalizza il movimento per una velocità costante
    const distance = Math.sqrt(dx * dx + dy * dy);
    const speed = 15;
    
    if (distance > speed) {
        const ratio = speed / distance;
        movePlayer(dx * ratio, dy * ratio);
    } else {
        movePlayer(dx, dy);
    }
});

// Gestione dei pulsanti
startBtn.addEventListener('click', () => {
    if (!gameActive) {
        startGame();
    } else {
        pauseGame();
    }
});

resetBtn.addEventListener('click', initGame);

helpBtn.addEventListener('click', () => {
    instructionsModal.style.display = 'flex';
});

closeModal.addEventListener('click', () => {
    instructionsModal.style.display = 'none';
});

startFromModal.addEventListener('click', () => {
    instructionsModal.style.display = 'none';
    startGame();
});

// Chiudi il modale cliccando fuori dal contenuto
window.addEventListener('click', (e) => {
    if (e.target === instructionsModal) {
        instructionsModal.style.display = 'none';
    }
});

// Inizializza il gioco quando la pagina è caricata
window.addEventListener('load', () => {
    initGame();
    showMessage('Clicca "Inizia Gioco" per cominciare! Usa WASD, frecce o clicca per muoverti.', 'info');
});
