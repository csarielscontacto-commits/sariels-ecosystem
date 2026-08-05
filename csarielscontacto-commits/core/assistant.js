// core/assistant.js - Asistente Flotante Comunitario
window.SarielAI = document.createElement('div');
SarielAI.id = 'sariel-floating';
SarielAI.style.cssText = `
    position: fixed;
    bottom: 20px;
    left: 20px;
    z-index: 100000;
    font-family: 'Space Grotesk', sans-serif;
`;

// El botón flotante
const btn = document.createElement('button');
btn.id = 'ia-btn';
btn.style.cssText = `
    background: linear-gradient(135deg, var(--gold-cosmic, #f7d44a), #b8923a);
    border: none;
    border-radius: 50%;
    width: 60px;
    height: 60px;
    font-size: 1.8rem;
    box-shadow: 0 4px 20px rgba(247,212,74,0.3);
    cursor: pointer;
    color: #0a0c10;
    transition: transform 0.2s;
`;
btn.textContent = '🧠';
SarielAI.appendChild(btn);

// La ventana del chat
const chatWindow = document.createElement('div');
chatWindow.id = 'ia-chat';
chatWindow.style.cssText = `
    position: absolute;
    bottom: 80px;
    left: 0;
    width: 300px;
    background: rgba(11, 61, 46, 0.95);
    backdrop-filter: blur(15px);
    border: 1px solid var(--gold-dim);
    border-radius: var(--radius);
    padding: 15px;
    display: none;
    box-shadow: 0 10px 40px rgba(0,0,0,0.6);
    color: var(--text-primary);
`;
chatWindow.innerHTML = `
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px; border-bottom:1px solid var(--gold-dim); padding-bottom:8px;">
        <span style="font-family:'Orbitron'; color:var(--gold-cosmic); font-weight:bold;">🧠 Sariel</span>
        <button onclick="document.getElementById('ia-chat').style.display='none'" style="background:none;border:none;color:var(--text-muted);cursor:pointer;font-size:1.2rem;">✕</button>
    </div>
    <div id="ia-chat-content">
        <p>Hola soy Sariel, el asistente del barrio. ¿En qué te ayudo?</p>
        <br>
        <p style="font-size:0.8rem; color:var(--gold-cosmic); cursor:pointer;" onclick="window.location.href='#store'">🏪 - ¿Ver tiendas?</p>
        <p style="font-size:0.8rem; color:var(--gold-cosmic); cursor:pointer;" onclick="window.location.href='#store'">💰 - ¿Saldo?</p>
        <p style="font-size:0.8rem; color:var(--gold-cosmic); cursor:pointer;" onclick="window.location.href='#services'">🔧 - ¿Ayuda comunitaria?</p>
    </div>
`;
SarielAI.appendChild(chatWindow);

document.body.appendChild(SarielAI);

// Lógica para abrir/cerrar
document.getElementById('ia-btn').onclick = () => {
    const chat = document.getElementById('ia-chat');
    chat.style.display = chat.style.display === 'none' ? 'block' : 'none';
};