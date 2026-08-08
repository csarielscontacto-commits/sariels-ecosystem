/**
 * ================================================================
 * 🧭 NAVEGACIÓN UNIFICADA - Csariel's Ecosystem
 * ================================================================
 * Sistema central de navegación para todas las features.
 * Genera header y footer consistentes en todo el ecosistema.
 * 
 * Hecho en Puebla, México 🇲🇽
 * Versión: 2.1.0
 * ================================================================
 */

// ================================================================
// 📋 ENLACES DE NAVEGACIÓN
// ================================================================

export const NAV_LINKS = {
    // Features principales
    inicio: { ruta: '../../index.html', icono: 'fa-home', label: 'Inicio' },
    red: { ruta: '../red/index.html', icono: 'fa-users', label: 'Mi Red' },
    live: { ruta: '../live/index.html', icono: 'fa-rss', label: 'Muro Live' },
    memes: { ruta: '../memes/index.html', icono: 'fa-mask', label: 'Memes' },
    trading: { ruta: '../trading/index.html', icono: 'fa-chart-line', label: 'Trading' },
    servicios: { ruta: '../servicios/index.html', icono: 'fa-tools', label: 'Servicios' },
    internet: { ruta: '../internet/index.html', icono: 'fa-satellite-dish', label: 'Internet' },
    tienda: { ruta: '../tienda/index.html', icono: 'fa-store', label: 'Tienda' },
    wallet: { ruta: '../wallet/index.html', icono: 'fa-wallet', label: 'Wallet' },
    
    // Administración y legales
    admin: { ruta: '../admin/index.html', icono: 'fa-cogs', label: 'Admin' },
    contrato: { ruta: '../contrato-creador/index.html', icono: 'fa-file-contract', label: 'Contrato' },
    derechos: { ruta: '../derechos-autor/index.html', icono: 'fa-copyright', label: 'Derechos' },
    legal: { ruta: '../legal-hub/index.html', icono: 'fa-gavel', label: 'Legal Hub' },
    privacidad: { ruta: '../../aviso-privacidad.html', icono: 'fa-shield-alt', label: 'Privacidad' },
    moderacion: { ruta: '../moderacion/index.html', icono: 'fa-shield-halved', label: 'Moderación' },
    talaverin: { ruta: '../talaverin/index.html', icono: 'fa-robot', label: 'Talaverín' },
    rewards: { ruta: '../rewards/index.html', icono: 'fa-gift', label: 'Recompensas' },
    takedown: { ruta: '../takedown/index.html', icono: 'fa-triangle-exclamation', label: 'Takedown' },
    terminos_servicios: { ruta: '../terminos-servicios/index.html', icono: 'fa-handshake', label: 'Términos Servicios' },
    faq: { ruta: '../faq-legal/index.html', icono: 'fa-question-circle', label: 'FAQ' },
    terminos: { ruta: '../../terminos-completos.html', icono: 'fa-file-contract', label: 'Términos' }
};

// ================================================================
// 🏷️ CLASES CSS POR TIPO DE BOTÓN
// ================================================================

const CLASES = {
    primary: 'btn-primary',
    outline: 'btn-outline',
    danger: 'btn-danger',
    gold: 'btn-gold',
    trading: 'btn-trading',
    internet: 'btn-internet',
    tienda: 'btn-tienda',
    wallet: 'btn-wallet',
    admin: 'btn-danger'
};

const ESTILOS = {
    memes: 'color:var(--danger);',
    trading: 'color:#00e5ff;',
    internet: 'color:#00d68f;',
    tienda: 'color:#a855f7;',
    wallet: 'color:#00d4ff;',
    admin: 'color:#ff6b6b;',
    servicios: 'color:var(--gold-cosmic);',
    terminos: 'color:var(--gold-cosmic);'
};

// ================================================================
// 🧩 GENERAR HEADER
// ================================================================

export function generarHeader(titulo = 'Ecosistema', badge = '') {
    const badgeText = badge || titulo || 'Ecosistema';
    
    return `
    <header class="header">
        <a href="#" class="logo" onclick="event.preventDefault()">
            <span class="logo-icon"><span class="hex">◈</span></span>
            <span class="logo-text">Csariel's</span>
            <span class="logo-badge">${badgeText}</span>
        </a>
        <div class="header-actions">
            <a href="../../index.html" class="btn btn-primary btn-sm">
                <i class="fas fa-home"></i> Inicio
            </a>
            <a href="../red/index.html" class="btn btn-primary btn-sm">
                <i class="fas fa-users"></i> Mi Red
            </a>
            <a href="../live/index.html" class="btn btn-outline btn-sm">
                <i class="fas fa-rss"></i> Muro Live
            </a>
            <a href="../memes/index.html" class="btn btn-danger btn-sm" style="color:var(--danger);">
                <i class="fas fa-mask"></i> Memes
            </a>
            <a href="../trading/index.html" class="btn btn-trading btn-sm" style="color:#00e5ff;">
                <i class="fas fa-chart-line"></i> Trading
            </a>
            <a href="../servicios/index.html" class="btn btn-gold btn-sm" style="color:var(--gold-cosmic);">
                <i class="fas fa-tools"></i> Servicios
            </a>
            <a href="../internet/index.html" class="btn btn-internet btn-sm" style="color:#00d68f;">
                <i class="fas fa-satellite-dish"></i> Internet
            </a>
            <a href="../tienda/index.html" class="btn btn-tienda btn-sm" style="color:#a855f7;">
                <i class="fas fa-store"></i> Tienda
            </a>
            <a href="../wallet/index.html" class="btn btn-wallet btn-sm" style="color:#00d4ff;">
                <i class="fas fa-wallet"></i> Wallet
            </a>
            <a href="../../terminos-completos.html" class="btn btn-outline btn-sm">
                <i class="fas fa-file-contract"></i> Términos
            </a>
        </div>
    </header>
    `;
}

// ================================================================
// 🧩 GENERAR FOOTER
// ================================================================

export function generarFooter() {
    return `
    <footer class="footer">
        <span class="footer-text">
            <span class="brand">◈ Csariel's</span> — Red Social Integral · eSIM · Web3
        </span>
        <div class="footer-links">
            <a href="../../index.html">🏠 Inicio</a>
            <a href="../red/index.html">👥 Mi Red</a>
            <a href="../live/index.html">📱 Muro Live</a>
            <a href="../memes/index.html" style="color:var(--danger);">😂 Memes</a>
            <a href="../trading/index.html" style="color:#00e5ff;">📈 Trading</a>
            <a href="../servicios/index.html" style="color:var(--gold-cosmic);">🛠️ Servicios</a>
            <a href="../internet/index.html" style="color:#00d68f;">🌐 Internet</a>
            <a href="../tienda/index.html" style="color:#a855f7;">🏰 Tienda</a>
            <a href="../wallet/index.html" style="color:#00d4ff;">◈ Wallet</a>
            <a href="../admin/index.html" style="color:#ff6b6b;">⚙️ Admin</a>
            <a href="../../terminos-completos.html" style="color:var(--gold-cosmic);">📜 Términos</a>
            <span class="footer-hex">◈</span>
        </div>
    </footer>
    `;
}

// ================================================================
// 🧩 GENERAR HTML COMPLETO (Header + Contenido + Footer)
// ================================================================

export function generarPagina(contenido, titulo, badge) {
    return `
    <!DOCTYPE html>
    <html lang="es">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${titulo} | Csariel's</title>
        <meta name="theme-color" content="#0F2D1A" />
        
        <!-- 🔒 CSP -->
        <meta http-equiv="Content-Security-Policy" content="
            default-src 'self';
            script-src 'self' https://cdnjs.cloudflare.com https://cdn.jsdelivr.net https://unpkg.com https://*.supabase.co https://*.polygon.technology;
            style-src 'self' https://cdnjs.cloudflare.com https://fonts.googleapis.com 'unsafe-inline';
            font-src 'self' https://fonts.gstatic.com https://cdnjs.cloudflare.com;
            img-src 'self' data: https://*;
            connect-src 'self' https://*.supabase.co wss://*.supabase.co https://*.polygon.technology;
            frame-src 'self';
            media-src 'self';
            object-src 'none';
            base-uri 'self';
            form-action 'self';
        ">
        
        <!-- ===== RECURSOS ===== -->
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.6.0/css/all.min.css" />
        <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Space+Grotesk:wght@300;400;600;700&display=swap" rel="stylesheet" />
        
        <style>
            /* ================================================================
               PLANTILLA BASE DE CSARIEL'S
               ================================================================ */
            :root {
                --space-deep: #05080f;
                --space-mid: #0a1428;
                --verde-bosque: #0F2D1A;
                --verde-bosque-light: #1a4a2a;
                --gold-cosmic: #D4AF37;
                --gold-dim: rgba(212,175,55,0.15);
                --gold-glow: rgba(212,175,55,0.25);
                --text-primary: #e8f0f8;
                --text-secondary: #8ba3c7;
                --text-muted: #4a6a8a;
                --border: rgba(212,175,55,0.08);
                --border-glow: rgba(212,175,55,0.25);
                --radius: 16px;
                --transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                --success: #00b894;
                --danger: #ff3366;
                --warning: #D4AF37;
                --quantum: #00e5ff;
            }

            * { margin: 0; padding: 0; box-sizing: border-box; }
            html { scroll-behavior: smooth; }

            body {
                background: var(--space-deep);
                color: var(--text-primary);
                font-family: 'Space Grotesk', 'Inter', system-ui, sans-serif;
                min-height: 100vh;
                overflow-x: hidden;
            }

            #stars-canvas {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                z-index: 0;
                pointer-events: none;
            }

            .nebula {
                position: fixed;
                border-radius: 50%;
                filter: blur(120px);
                opacity: 0.10;
                pointer-events: none;
                z-index: 0;
                animation: nebula-drift 25s ease-in-out infinite alternate;
            }
            .nebula-1 { width: 700px; height: 700px; background: var(--verde-bosque); top: -15%; right: -15%; }
            .nebula-2 { width: 600px; height: 600px; background: var(--gold-cosmic); bottom: -15%; left: -15%; animation-delay: -8s; opacity: 0.05; }
            .nebula-3 { width: 500px; height: 500px; background: var(--quantum); top: 50%; left: 50%; transform: translate(-50%, -50%); animation-delay: -15s; opacity: 0.04; }

            @keyframes nebula-drift {
                0% { transform: translate(0, 0) scale(1); }
                100% { transform: translate(40px, -30px) scale(1.15); }
            }

            ::-webkit-scrollbar { width: 5px; }
            ::-webkit-scrollbar-track { background: var(--space-deep); }
            ::-webkit-scrollbar-thumb { background: linear-gradient(var(--gold-cosmic), var(--verde-bosque)); border-radius: 3px; }

            .app {
                position: relative;
                z-index: 1;
                max-width: 1200px;
                margin: 0 auto;
                padding: 16px 20px 30px;
            }

            /* ===== HEADER ===== */
            .header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 12px 0 16px;
                border-bottom: 2px solid var(--gold-dim);
                margin-bottom: 16px;
                flex-wrap: wrap;
                gap: 10px;
                backdrop-filter: blur(10px);
                position: relative;
            }
            .header::after {
                content: '';
                position: absolute;
                bottom: -2px;
                left: 0;
                right: 0;
                height: 1px;
                background: linear-gradient(90deg, transparent, var(--gold-cosmic), var(--verde-bosque), var(--gold-cosmic), transparent);
                opacity: 0.4;
            }

            .logo {
                display: flex;
                align-items: center;
                gap: 12px;
                text-decoration: none;
            }
            .logo-icon { font-size: 2rem; filter: drop-shadow(0 0 20px rgba(212,175,55,0.2)); animation: pulse-glow 3s ease-in-out infinite; }
            .logo-icon .hex {
                display: inline-block;
                background: var(--verde-bosque);
                color: var(--gold-cosmic);
                padding: 3px 10px;
                border-radius: 6px;
                font-size: 1rem;
                font-weight: 900;
                border: 2px solid var(--gold-cosmic);
                font-family: 'Orbitron', monospace;
            }
            @keyframes pulse-glow { 0%, 100% { filter: drop-shadow(0 0 20px rgba(212,175,55,0.2)); } 50% { filter: drop-shadow(0 0 40px rgba(212,175,55,0.4)); } }

            .logo-text {
                font-family: 'Orbitron', monospace;
                font-size: 1.3rem;
                font-weight: 900;
                letter-spacing: 2px;
                background: linear-gradient(135deg, var(--gold-cosmic), var(--verde-bosque-light));
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
            }
            .logo-badge {
                font-family: 'Orbitron', monospace;
                font-size: 0.45rem;
                background: linear-gradient(135deg, var(--verde-bosque), var(--gold-cosmic));
                color: white;
                padding: 3px 12px;
                border-radius: 20px;
                font-weight: 700;
                letter-spacing: 1.5px;
                text-transform: uppercase;
                -webkit-text-fill-color: white;
                border: 1px solid rgba(212,175,55,0.2);
                animation: badge-pulse 2s ease-in-out infinite;
            }
            @keyframes badge-pulse { 0%, 100% { box-shadow: 0 0 30px rgba(15,45,26,0.3); } 50% { box-shadow: 0 0 60px rgba(212,175,55,0.2); } }

            .header-actions {
                display: flex;
                align-items: center;
                gap: 10px;
                flex-wrap: wrap;
            }

            .btn {
                display: inline-flex;
                align-items: center;
                gap: 6px;
                padding: 7px 16px;
                border: 1px solid var(--border);
                border-radius: 30px;
                background: rgba(212,175,55,0.03);
                color: var(--text-primary);
                font-family: 'Orbitron', monospace;
                font-size: 0.6rem;
                font-weight: 600;
                cursor: pointer;
                transition: var(--transition);
                text-decoration: none;
            }
            .btn:hover { transform: scale(1.02); border-color: var(--border-glow); }
            .btn:disabled { opacity: 0.4; cursor: not-allowed; transform: none !important; }

            .btn-primary {
                background: linear-gradient(135deg, var(--verde-bosque), var(--verde-bosque-light));
                border-color: var(--gold-cosmic);
                color: var(--gold-cosmic);
                -webkit-text-fill-color: var(--gold-cosmic);
            }
            .btn-primary:hover:not(:disabled) {
                background: linear-gradient(135deg, var(--verde-bosque-light), var(--verde-bosque));
                box-shadow: 0 0 40px rgba(15,45,26,0.5);
            }
            .btn-gold {
                background: linear-gradient(135deg, var(--gold-cosmic), #b8923a);
                border-color: transparent;
                color: #0a0c10;
                -webkit-text-fill-color: #0a0c10;
            }
            .btn-gold:hover:not(:disabled) { box-shadow: 0 0 40px rgba(212,175,55,0.3); }
            .btn-outline { border-color: var(--border); background: transparent; }
            .btn-outline:hover:not(:disabled) { background: rgba(212,175,55,0.05); border-color: var(--gold-cosmic); }
            .btn-sm { padding: 4px 12px; font-size: 0.55rem; }
            .btn-danger {
                background: rgba(255,51,102,0.15);
                border-color: rgba(255,51,102,0.3);
                color: var(--danger);
            }
            .btn-danger:hover:not(:disabled) { background: rgba(255,51,102,0.25); }
            .btn-trading {
                background: linear-gradient(135deg, var(--quantum), #0099ff);
                border-color: transparent;
                color: #0a0c10;
                -webkit-text-fill-color: #0a0c10;
                box-shadow: 0 0 20px rgba(0, 229, 255, 0.2);
                animation: pulse-trading 2s ease-in-out infinite;
            }
            .btn-trading:hover {
                box-shadow: 0 0 40px rgba(0, 229, 255, 0.4);
                transform: scale(1.03);
            }
            @keyframes pulse-trading {
                0%, 100% { box-shadow: 0 0 20px rgba(0, 229, 255, 0.2); }
                50% { box-shadow: 0 0 40px rgba(0, 229, 255, 0.4); }
            }
            .btn-internet {
                background: linear-gradient(135deg, var(--gold-cosmic), #00d68f);
                border-color: transparent;
                color: #0a0c10;
                -webkit-text-fill-color: #0a0c10;
                box-shadow: 0 0 20px rgba(0, 214, 143, 0.2);
                animation: pulse-internet 2s ease-in-out infinite;
            }
            .btn-internet:hover {
                box-shadow: 0 0 40px rgba(0, 214, 143, 0.4);
                transform: scale(1.03);
            }
            @keyframes pulse-internet {
                0%, 100% { box-shadow: 0 0 20px rgba(0, 214, 143, 0.2); }
                50% { box-shadow: 0 0 40px rgba(0, 214, 143, 0.4); }
            }
            .btn-tienda {
                background: linear-gradient(135deg, #a855f7, #7c3aed);
                border-color: transparent;
                color: #fff;
                -webkit-text-fill-color: #fff;
                box-shadow: 0 0 20px rgba(168,85,247,0.2);
                animation: pulse-tienda 2s ease-in-out infinite;
            }
            .btn-tienda:hover {
                box-shadow: 0 0 40px rgba(168,85,247,0.4);
                transform: scale(1.03);
            }
            @keyframes pulse-tienda {
                0%, 100% { box-shadow: 0 0 20px rgba(168,85,247,0.2); }
                50% { box-shadow: 0 0 40px rgba(168,85,247,0.4); }
            }
            .btn-wallet {
                background: linear-gradient(135deg, #00d4ff, #0099ff);
                border-color: transparent;
                color: #0a0c10;
                -webkit-text-fill-color: #0a0c10;
                box-shadow: 0 0 20px rgba(0,212,255,0.2);
                animation: pulse-wallet 2s ease-in-out infinite;
            }
            .btn-wallet:hover {
                box-shadow: 0 0 40px rgba(0,212,255,0.4);
                transform: scale(1.03);
            }
            @keyframes pulse-wallet {
                0%, 100% { box-shadow: 0 0 20px rgba(0,212,255,0.2); }
                50% { box-shadow: 0 0 40px rgba(0,212,255,0.4); }
            }

            /* ===== FOOTER ===== */
            .footer {
                margin-top: 24px;
                padding-top: 14px;
                border-top: 1px solid var(--gold-dim);
                display: flex;
                justify-content: space-between;
                align-items: center;
                flex-wrap: wrap;
                gap: 10px;
                position: relative;
            }
            .footer::before {
                content: '';
                position: absolute;
                top: -1px;
                left: 0;
                right: 0;
                height: 1px;
                background: linear-gradient(90deg, transparent, var(--gold-cosmic), transparent);
                opacity: 0.2;
            }
            .footer-text {
                color: var(--text-muted);
                font-size: 0.5rem;
                letter-spacing: 0.5px;
                font-family: 'Orbitron', monospace;
            }
            .footer-text .brand { color: var(--gold-cosmic); }
            .footer-links { display: flex; gap: 8px; flex-wrap: wrap; }
            .footer-links a {
                color: var(--text-muted);
                text-decoration: none;
                font-size: 0.5rem;
                transition: var(--transition);
                font-family: 'Orbitron', monospace;
                letter-spacing: 0.5px;
            }
            .footer-links a:hover { color: var(--gold-cosmic); }
            .footer-hex {
                display: inline-block;
                background: var(--verde-bosque);
                color: var(--gold-cosmic);
                padding: 2px 8px;
                border-radius: 4px;
                font-size: 0.45rem;
                font-weight: 700;
                border: 1px solid var(--gold-cosmic);
                font-family: 'Orbitron', monospace;
            }

            @media (max-width: 768px) {
                .header { flex-direction: column; align-items: flex-start; }
                .header-actions { width: 100%; justify-content: flex-start; flex-wrap: wrap; }
            }
            @media (max-width: 480px) {
                .btn { font-size: 0.45rem; padding: 4px 8px; }
            }

            /* ===== ANIMACIONES ===== */
            @keyframes fadeIn {
                from { opacity: 0; transform: translateY(10px); }
                to { opacity: 1; transform: translateY(0); }
            }
        </style>
    </head>
    <body>
        <canvas id="stars-canvas"></canvas>
        <div class="nebula nebula-1"></div>
        <div class="nebula nebula-2"></div>
        <div class="nebula nebula-3"></div>
        
        <div class="app">
            ${contenido}
            <footer class="footer">
                <span class="footer-text">
                    <span class="brand">◈ Csariel's</span> — ${titulo}
                </span>
                <div class="footer-links">
                    <a href="../../index.html">🏠 Inicio</a>
                    <a href="../red/index.html">👥 Mi Red</a>
                    <a href="../live/index.html">📱 Muro Live</a>
                    <a href="../memes/index.html" style="color:var(--danger);">😂 Memes</a>
                    <a href="../trading/index.html" style="color:#00e5ff;">📈 Trading</a>
                    <a href="../servicios/index.html" style="color:var(--gold-cosmic);">🛠️ Servicios</a>
                    <a href="../internet/index.html" style="color:#00d68f;">🌐 Internet</a>
                    <a href="../tienda/index.html" style="color:#a855f7;">🏰 Tienda</a>
                    <a href="../wallet/index.html" style="color:#00d4ff;">◈ Wallet</a>
                    <a href="../admin/index.html" style="color:#ff6b6b;">⚙️ Admin</a>
                    <a href="../../terminos-completos.html" style="color:var(--gold-cosmic);">📜 Términos</a>
                    <span class="footer-hex">◈</span>
                </div>
            </footer>
        </div>
        
        <script>
            function initStars() {
                const canvas = document.getElementById('stars-canvas');
                if (!canvas) return;
                const ctx = canvas.getContext('2d');
                let width, height;
                let stars = [];
                const STAR_COUNT = 200;

                function resize() {
                    width = window.innerWidth;
                    height = window.innerHeight;
                    canvas.width = width;
                    canvas.height = height;
                }
                function createStars() {
                    stars = [];
                    for (let i = 0; i < STAR_COUNT; i++) {
                        stars.push({
                            x: Math.random() * width,
                            y: Math.random() * height,
                            radius: Math.random() * 1.5 + 0.3,
                            speed: Math.random() * 0.015 + 0.005,
                            opacity: Math.random() * 0.7 + 0.3,
                            twinkleSpeed: Math.random() * 0.02 + 0.01,
                            twinklePhase: Math.random() * Math.PI * 2
                        });
                    }
                }
                function draw() {
                    ctx.clearRect(0, 0, width, height);
                    for (let star of stars) {
                        const opacity = star.opacity * (0.6 + 0.4 * Math.sin(star.twinklePhase));
                        ctx.beginPath();
                        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
                        ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
                        ctx.fill();
                        star.twinklePhase += star.twinkleSpeed;
                        star.y += star.speed;
                        if (star.y > height) {
                            star.y = 0;
                            star.x = Math.random() * width;
                        }
                    }
                    requestAnimationFrame(draw);
                }
                resize();
                createStars();
                draw();
                window.addEventListener('resize', () => { resize(); createStars(); });
            }
            
            document.addEventListener('DOMContentLoaded', function() {
                initStars();
                console.log('🌟 Csariel\'s Ecosystem - ${titulo}');
            });
        </script>
    </body>
    </html>
    `;
}

// ================================================================
// 🚀 EXPORTAR POR DEFECTO
// ================================================================

export default {
    NAV_LINKS,
    generarHeader,
    generarFooter,
    generarPagina
};

console.log('🧭 Navegación unificada cargada');
console.log(`📋 ${Object.keys(NAV_LINKS).length} enlaces disponibles`);