<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Registro de Ventas | Sariel's Nexus</title>
    <meta name="theme-color" content="#05080f" />
    
    <!-- Open Graph -->
    <meta property="og:title" content="Sariel's Nexus - Registro de Ventas" />
    <meta property="og:description" content="Registro centralizado de ventas para vendedores" />
    <meta property="og:type" content="website" />
    
    <!-- Font Awesome -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.6.0/css/all.min.css" />
    
    <!-- Google Fonts -->
    <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Space+Grotesk:wght@300;400;600;700&display=swap" rel="stylesheet" />
    
    <style>
        /* ===== VARIABLES CÓSMICAS ===== */
        :root {
            --space-deep: #05080f;
            --space-mid: #0a1428;
            --space-light: #101f3a;
            --nebula-1: #6c2bd9;
            --nebula-2: #ff6b9d;
            --nebula-3: #00d4ff;
            --gold-cosmic: #f7d44a;
            --gold-dim: rgba(247,212,74,0.15);
            --plasma: #ff3366;
            --quantum: #00e5ff;
            --text-primary: #e8f0f8;
            --text-secondary: #8ba3c7;
            --text-muted: #4a6a8a;
            --border: rgba(0,212,255,0.08);
            --border-glow: rgba(0,212,255,0.25);
            --shadow-neon: 0 0 40px rgba(0,212,255,0.1);
            --shadow-glow: 0 0 60px rgba(108,43,217,0.15);
            --radius: 20px;
            --transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
            --success: #00b894;
            --warning: #f7d44a;
            --danger: #ff3366;
        }

        /* ===== RESET Y BASE ===== */
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        html {
            scroll-behavior: smooth;
        }

        body {
            background: var(--space-deep);
            color: var(--text-primary);
            font-family: 'Space Grotesk', 'Inter', system-ui, sans-serif;
            line-height: 1.6;
            min-height: 100vh;
            overflow-x: hidden;
            position: relative;
        }

        /* ===== FONDO ESTELAR CON CANVAS ===== */
        #stars-canvas {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: 0;
            pointer-events: none;
        }

        /* ===== NEBULOSAS ===== */
        .nebula {
            position: fixed;
            border-radius: 50%;
            filter: blur(120px);
            opacity: 0.12;
            pointer-events: none;
            z-index: 0;
            animation: nebula-drift 25s ease-in-out infinite alternate;
        }

        .nebula-1 { width: 700px; height: 700px; background: var(--nebula-1); top: -15%; right: -15%; }
        .nebula-2 { width: 600px; height: 600px; background: var(--nebula-2); bottom: -15%; left: -15%; animation-delay: -8s; }
        .nebula-3 { width: 500px; height: 500px; background: var(--nebula-3); top: 50%; left: 50%; transform: translate(-50%, -50%); animation-delay: -15s; opacity: 0.06; }

        @keyframes nebula-drift {
            0% { transform: translate(0, 0) scale(1); }
            100% { transform: translate(40px, -30px) scale(1.15); }
        }

        /* ===== SCROLLBAR ===== */
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: var(--space-deep); }
        ::-webkit-scrollbar-thumb { background: linear-gradient(var(--nebula-3), var(--nebula-1)); border-radius: 3px; }

        /* ===== LAYOUT ===== */
        .app { position: relative; z-index: 1; max-width: 1000px; margin: 0 auto; padding: 20px 24px 40px; }

        /* ===== HEADER ===== */
        .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 16px 0 20px;
            border-bottom: 1px solid var(--border);
            margin-bottom: 28px;
            flex-wrap: wrap;
            gap: 12px;
            backdrop-filter: blur(10px);
            position: relative;
        }

        .header::after {
            content: '';
            position: absolute;
            bottom: -1px;
            left: 0;
            right: 0;
            height: 1px;
            background: linear-gradient(90deg, transparent, var(--quantum), var(--nebula-2), var(--quantum), transparent);
            opacity: 0.3;
        }

        .logo {
            display: flex;
            align-items: center;
            gap: 14px;
            text-decoration: none;
        }

        .logo-icon {
            font-size: 2.4rem;
            filter: drop-shadow(0 0 20px rgba(0,212,255,0.3));
            animation: pulse-glow 3s ease-in-out infinite;
        }

        @keyframes pulse-glow {
            0%, 100% { filter: drop-shadow(0 0 20px rgba(0,212,255,0.3)); }
            50% { filter: drop-shadow(0 0 40px rgba(247,212,74,0.4)); }
        }

        .logo-text {
            font-family: 'Orbitron', monospace;
            font-size: 1.6rem;
            font-weight: 900;
            letter-spacing: 2px;
            background: linear-gradient(135deg, var(--text-primary), var(--quantum), var(--nebula-2));
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            text-shadow: 0 0 40px rgba(0,212,255,0.2);
        }

        .logo-badge {
            font-family: 'Orbitron', monospace;
            font-size: 0.5rem;
            background: linear-gradient(135deg, var(--nebula-1), var(--nebula-2));
            color: white;
            padding: 4px 14px;
            border-radius: 20px;
            font-weight: 700;
            letter-spacing: 1.5px;
            text-transform: uppercase;
            -webkit-text-fill-color: white;
            box-shadow: 0 0 30px rgba(108,43,217,0.3);
            animation: badge-pulse 2s ease-in-out infinite;
        }

        @keyframes badge-pulse {
            0%, 100% { box-shadow: 0 0 30px rgba(108,43,217,0.3); }
            50% { box-shadow: 0 0 60px rgba(255,107,157,0.4); }
        }

        .header-actions {
            display: flex;
            align-items: center;
            gap: 16px;
            flex-wrap: wrap;
        }

        .status-badge {
            display: flex;
            align-items: center;
            gap: 8px;
            background: rgba(0,212,255,0.06);
            border: 1px solid rgba(0,212,255,0.15);
            padding: 8px 18px;
            border-radius: 30px;
            font-size: 0.65rem;
            color: var(--quantum);
            font-family: 'Orbitron', monospace;
            letter-spacing: 1px;
            backdrop-filter: blur(10px);
            cursor: default;
        }

        .status-badge .status-dot {
            width: 8px;
            height: 8px;
            border-radius: 50%;
            animation: quantum-pulse 1.5s ease-in-out infinite;
        }

        .status-badge .status-dot.online { background: var(--success); box-shadow: 0 0 20px rgba(0,184,148,0.5); }
        .status-badge .status-dot.offline { background: var(--text-muted); box-shadow: 0 0 20px rgba(74,106,138,0.3); }

        @keyframes quantum-pulse {
            0%, 100% { opacity: 1; transform: scale(1); }
            50% { opacity: 0.5; transform: scale(0.7); }
        }

        /* ===== BOTONES ===== */
        .btn {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            padding: 10px 20px;
            border: 1px solid var(--border);
            border-radius: 30px;
            background: rgba(0,212,255,0.03);
            color: var(--text-primary);
            font-family: 'Orbitron', monospace;
            font-size: 0.7rem;
            font-weight: 600;
            letter-spacing: 0.5px;
            cursor: pointer;
            transition: var(--transition);
            text-decoration: none;
        }

        .btn:hover { transform: scale(1.03); border-color: var(--border-glow); }
        .btn:disabled { opacity: 0.4; cursor: not-allowed; transform: none !important; }

        .btn-primary {
            background: linear-gradient(135deg, var(--nebula-1), var(--nebula-2));
            border-color: transparent;
            color: white;
            -webkit-text-fill-color: white;
        }

        .btn-primary:hover:not(:disabled) {
            background: linear-gradient(135deg, var(--nebula-2), var(--nebula-1));
            box-shadow: 0 0 40px rgba(108,43,217,0.3);
        }

        .btn-success {
            background: linear-gradient(135deg, #00b894, #00897b);
            border-color: transparent;
            color: white;
            -webkit-text-fill-color: white;
        }

        .btn-success:hover:not(:disabled) {
            background: linear-gradient(135deg, #00897b, #00695c);
            box-shadow: 0 0 40px rgba(0,184,148,0.3);
        }

        .btn-danger {
            background: rgba(255,51,102,0.15);
            border-color: rgba(255,51,102,0.3);
            color: var(--danger);
        }

        .btn-danger:hover:not(:disabled) { background: rgba(255,51,102,0.25); }

        .btn-outline {
            border-color: var(--border);
            background: transparent;
        }

        .btn-outline:hover:not(:disabled) {
            background: rgba(0,212,255,0.05);
            border-color: var(--quantum);
        }

        .btn-sm { padding: 6px 14px; font-size: 0.6rem; }
        .btn-block { width: 100%; justify-content: center; }

        /* ===== CARD ===== */
        .card {
            background: rgba(10,20,40,0.6);
            border: 1px solid var(--border);
            border-radius: var(--radius);
            padding: 24px;
            transition: var(--transition);
            position: relative;
            overflow: hidden;
            backdrop-filter: blur(10px);
            margin-bottom: 20px;
        }

        .card::before {
            content: '';
            position: absolute;
            top: -2px;
            left: -2px;
            right: -2px;
            bottom: -2px;
            background: linear-gradient(135deg, var(--quantum), var(--nebula-1), var(--nebula-2), var(--quantum));
            background-size: 300% 300%;
            border-radius: var(--radius);
            z-index: -1;
            opacity: 0;
            animation: border-flow 4s ease-in-out infinite;
        }

        @keyframes border-flow {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
        }

        .card:hover::before { opacity: 0.3; }

        .card-header {
            display: flex;
            align-items: center;
            gap: 12px;
            margin-bottom: 16px;
            padding-bottom: 12px;
            border-bottom: 1px solid var(--border);
        }

        .card-header i {
            font-size: 1.5rem;
            color: var(--quantum);
        }

        .card-header h2 {
            font-family: 'Orbitron', monospace;
            font-size: 1rem;
            font-weight: 700;
            letter-spacing: 0.5px;
            background: linear-gradient(135deg, var(--text-primary), var(--quantum));
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }

        /* ===== FORMULARIO ===== */
        .form-group {
            margin-bottom: 16px;
        }

        .form-group label {
            display: block;
            font-size: 0.8rem;
            color: var(--text-secondary);
            margin-bottom: 4px;
            font-family: 'Orbitron', monospace;
            letter-spacing: 0.5px;
        }

        .form-control {
            width: 100%;
            padding: 12px 16px;
            background: rgba(0,0,0,0.3);
            border: 1px solid var(--border);
            border-radius: 10px;
            color: var(--text-primary);
            font-family: 'Space Grotesk', sans-serif;
            font-size: 0.95rem;
            transition: var(--transition);
            outline: none;
        }

        .form-control:focus {
            border-color: var(--quantum);
            box-shadow: 0 0 20px rgba(0,212,255,0.1);
        }

        .form-control::placeholder {
            color: var(--text-muted);
        }

        .form-control:disabled {
            opacity: 0.6;
        }

        select.form-control {
            appearance: none;
            cursor: pointer;
        }

        select.form-control option {
            background: var(--space-deep);
        }

        .form-row {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 16px;
        }

        @media (max-width: 480px) {
            .form-row {
                grid-template-columns: 1fr;
            }
        }

        /* ===== VENDEDOR ===== */
        .vendedor-info {
            display: flex;
            align-items: center;
            gap: 12px;
            flex-wrap: wrap;
            padding: 12px 16px;
            background: rgba(0,0,0,0.2);
            border-radius: 10px;
            margin-bottom: 16px;
            border: 1px solid var(--border);
        }

        .vendedor-info .label {
            font-size: 0.7rem;
            color: var(--text-muted);
            font-family: 'Orbitron', monospace;
            letter-spacing: 0.5px;
        }

        .vendedor-info .nombre {
            font-family: 'Orbitron', monospace;
            font-size: 1rem;
            font-weight: 700;
            color: var(--gold-cosmic);
        }

        /* ===== ESTADÍSTICAS ===== */
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 16px;
            margin-bottom: 16px;
        }

        @media (max-width: 768px) {
            .stats-grid {
                grid-template-columns: repeat(2, 1fr);
            }
        }

        @media (max-width: 480px) {
            .stats-grid {
                grid-template-columns: 1fr;
            }
        }

        .stat-item {
            background: rgba(0,0,0,0.2);
            padding: 14px 16px;
            border-radius: 10px;
            text-align: center;
            border: 1px solid var(--border);
            transition: var(--transition);
        }

        .stat-item:hover {
            border-color: var(--border-glow);
        }

        .stat-item .number {
            font-family: 'Orbitron', monospace;
            font-size: 1.5rem;
            font-weight: 700;
            color: var(--gold-cosmic);
        }

        .stat-item .label {
            font-size: 0.65rem;
            color: var(--text-muted);
            font-family: 'Orbitron', monospace;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-top: 2px;
        }

        /* ===== MENSAJES ===== */
        .message {
            padding: 12px 16px;
            border-radius: 10px;
            margin-bottom: 16px;
            display: none;
            font-size: 0.9rem;
            font-weight: 600;
        }

        .message.success {
            display: block;
            background: rgba(0,184,148,0.15);
            border: 1px solid rgba(0,184,148,0.3);
            color: var(--success);
        }

        .message.error {
            display: block;
            background: rgba(255,51,102,0.15);
            border: 1px solid rgba(255,51,102,0.3);
            color: var(--danger);
        }

        .message i {
            margin-right: 8px;
        }

        /* ===== HISTORIAL ===== */
        .historial-list {
            max-height: 300px;
            overflow-y: auto;
        }

        .historial-list::-webkit-scrollbar { width: 4px; }
        .historial-list::-webkit-scrollbar-thumb { background: var(--quantum); border-radius: 2px; }

        .venta-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 10px 14px;
            background: rgba(0,0,0,0.15);
            border-radius: 8px;
            margin-bottom: 6px;
            border-left: 3px solid var(--quantum);
            transition: var(--transition);
        }

        .venta-item:hover {
            background: rgba(0,0,0,0.25);
        }

        .venta-item .info .cliente {
            font-weight: 600;
            color: var(--text-primary);
        }

        .venta-item .info .detalle {
            font-size: 0.75rem;
            color: var(--text-muted);
        }

        .venta-item .monto {
            font-family: 'Orbitron', monospace;
            font-size: 1rem;
            font-weight: 700;
            color: var(--gold-cosmic);
        }

        .venta-item .metodo-badge {
            font-size: 0.55rem;
            padding: 2px 10px;
            border-radius: 20px;
            font-family: 'Orbitron', monospace;
            background: rgba(0,212,255,0.1);
            border: 1px solid rgba(0,212,255,0.2);
            color: var(--quantum);
        }

        .venta-empty {
            text-align: center;
            color: var(--text-muted);
            padding: 20px;
        }

        .venta-empty i {
            font-size: 2rem;
            opacity: 0.3;
            margin-bottom: 8px;
        }

        /* ===== FOOTER ===== */
        .footer {
            margin-top: 48px;
            padding-top: 28px;
            border-top: 1px solid var(--border);
            display: flex;
            justify-content: space-between;
            align-items: center;
            flex-wrap: wrap;
            gap: 16px;
            position: relative;
        }

        .footer::before {
            content: '';
            position: absolute;
            top: -1px;
            left: 0;
            right: 0;
            height: 1px;
            background: linear-gradient(90deg, transparent, var(--quantum), transparent);
            opacity: 0.2;
        }

        .footer-text {
            color: var(--text-muted);
            font-size: 0.78rem;
            letter-spacing: 0.5px;
            font-family: 'Orbitron', monospace;
        }

        .footer-links {
            display: flex;
            gap: 16px;
            flex-wrap: wrap;
        }

        .footer-links a {
            color: var(--text-muted);
            text-decoration: none;
            font-size: 0.75rem;
            transition: var(--transition);
            font-family: 'Orbitron', monospace;
            letter-spacing: 0.5px;
        }

        .footer-links a:hover { color: var(--quantum); }

        /* ===== ANIMACIONES ===== */
        @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(20px) scale(0.95); }
            to { opacity: 1; transform: translateY(0) scale(1); }
        }

        .card {
            animation: fadeInUp 0.5s ease-out forwards;
        }

        .card:nth-child(2) { animation-delay: 0.1s; }

        /* ===== RESPONSIVE ===== */
        @media (max-width: 768px) {
            .app { padding: 16px; }
            .header { flex-direction: column; align-items: flex-start; }
            .logo-text { font-size: 1.2rem; }
            .header-actions { width: 100%; justify-content: flex-start; }
            .stats-grid { grid-template-columns: repeat(2, 1fr); }
            .form-row { grid-template-columns: 1fr; }
        }

        @media (max-width: 480px) {
            .stats-grid { grid-template-columns: 1fr; }
            .btn { font-size: 0.6rem; padding: 8px 14px; }
            .stat-item .number { font-size: 1.2rem; }
        }
    </style>
</head>
<body>
    <!-- ===== FONDO ESTELAR ===== -->
    <canvas id="stars-canvas"></canvas>
    <div class="nebula nebula-1"></div>
    <div class="nebula nebula-2"></div>
    <div class="nebula nebula-3"></div>

    <!-- ===== CONTENIDO ===== -->
    <div class="app">
        <!-- HEADER -->
        <header class="header">
            <a href="./index.html" class="logo">
                <span class="logo-icon">📝</span>
                <span class="logo-text">Sariel's</span>
                <span class="logo-badge">Ventas</span>
            </a>
            <div class="header-actions">
                <div class="status-badge">
                    <span class="status-dot online" id="syncDot"></span>
                    <span id="syncText">Sincronizado</span>
                </div>
                <a href="./dashboard-central.html" class="btn"><i class="fas fa-chart-line"></i> Dashboard</a>
                <a href="./mi-red.html" class="btn"><i class="fas fa-users"></i> Mi Red</a>
                <a href="./panel-web3.html" class="btn"><i class="fas fa-wallet"></i> Web3</a>
            </div>
        </header>

        <!-- ===== REGISTRO DE VENTAS ===== -->
        <section class="card">
            <div class="card-header">
                <i class="fas fa-plus-circle"></i>
                <h2>Registrar Venta</h2>
            </div>

            <!-- VENDEDOR -->
            <div class="vendedor-info">
                <span class="label">👤 Vendedor:</span>
                <span class="nombre" id="vendedorBadge">Cargando...</span>
                <button class="btn btn-sm btn-outline" onclick="cambiarVendedor()">
                    <i class="fas fa-exchange-alt"></i> Cambiar
                </button>
            </div>

            <!-- MENSAJES -->
            <div class="message success" id="successMessage">
                <i class="fas fa-check-circle"></i> Venta registrada correctamente
            </div>
            <div class="message error" id="errorMessage">
                <i class="fas fa-exclamation-circle"></i> <span id="errorText">Error</span>
            </div>

            <!-- FORMULARIO -->
            <form id="ventasForm">
                <div class="form-row">
                    <div class="form-group">
                        <label for="cliente">Cliente</label>
                        <input type="text" id="cliente" class="form-control" placeholder="Nombre del cliente" />
                    </div>
                    <div class="form-group">
                        <label for="metodo">Método de pago</label>
                        <select id="metodo" class="form-control" required>
                            <option value="">Seleccionar...</option>
                            <option value="Efectivo">💵 Efectivo</option>
                            <option value="Tarjeta">💳 Tarjeta</option>
                            <option value="Transferencia">🏦 Transferencia</option>
                            <option value="USDT">💚 USDT</option>
                            <option value="USDC">💙 USDC</option>
                            <option value="TOK">🪙 TOK</option>
                        </select>
                    </div>
                </div>

                <div class="form-row">
                    <div class="form-group">
                        <label for="cantidad">Cantidad</label>
                        <input type="number" id="cantidad" class="form-control" value="1" min="1" step="1" />
                    </div>
                    <div class="form-group">
                        <label for="precioTotal">Total</label>
                        <input type="text" id="precioTotal" class="form-control" value="$75.00 MXN" disabled />
                    </div>
                </div>

                <button type="submit" class="btn btn-success btn-block">
                    <i class="fas fa-save"></i> Registrar Venta
                </button>
            </form>
        </section>

        <!-- ===== ESTADÍSTICAS ===== -->
        <section class="card">
            <div class="card-header">
                <i class="fas fa-chart-bar"></i>
                <h2>Estadísticas del Vendedor</h2>
            </div>

            <div class="stats-grid">
                <div class="stat-item">
                    <div class="number" id="ventasHoyVendedor">0</div>
                    <div class="label">Ventas Hoy</div>
                </div>
                <div class="stat-item">
                    <div class="number" id="ingresoHoyVendedor">$0</div>
                    <div class="label">Ingreso Hoy</div>
                </div>
                <div class="stat-item">
                    <div class="number" id="totalVentasVendedor">0</div>
                    <div class="label">Total Ventas</div>
                </div>
                <div class="stat-item">
                    <div class="number" id="totalIngresoVendedor">$0</div>
                    <div class="label">Ingreso Total</div>
                </div>
            </div>
        </section>

        <!-- ===== HISTORIAL ===== -->
        <section class="card">
            <div class="card-header">
                <i class="fas fa-history"></i>
                <h2>Historial de Ventas</h2>
            </div>

            <div class="historial-list" id="historialList">
                <div class="venta-empty">
                    <i class="fas fa-inbox"></i>
                    <p>Sin ventas registradas todavía</p>
                </div>
            </div>
        </section>

        <!-- FOOTER -->
        <footer class="footer">
            <span class="footer-text">
                📝 Sariel's Digital Assets — Registro Centralizado de Ventas
            </span>
            <div class="footer-links">
                <a href="./dashboard-central.html">📊 Dashboard</a>
                <a href="./mi-red.html">👥 Mi Red</a>
                <a href="./panel-web3.html">🔗 Web3</a>
            </div>
        </footer>
    </div>

    <!-- ===== SCRIPTS ===== -->
    <script src="./config.js"></script>
    <script src="./base-datos-centralizada.js"></script>

    <script>
        // ===== SISTEMA ESTELAR =====
        document.addEventListener('DOMContentLoaded', () => {
            console.log('📝 Sariel\'s Digital Assets - Registro de Ventas');
            initStars();
        });

        // ===== ESTRELLAS Y METEORITOS =====
        function initStars() {
            const canvas = document.getElementById('stars-canvas');
            const ctx = canvas.getContext('2d');
            let width, height;
            let stars = [];
            let meteors = [];

            const STAR_COUNT = 300;
            const METEOR_COUNT = 3;

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
                        radius: Math.random() * 1.8 + 0.3,
                        speed: Math.random() * 0.02 + 0.005,
                        opacity: Math.random() * 0.8 + 0.2,
                        twinkleSpeed: Math.random() * 0.02 + 0.01,
                        twinklePhase: Math.random() * Math.PI * 2
                    });
                }
            }

            function createMeteor() {
                return {
                    x: Math.random() * width * 0.8,
                    y: Math.random() * height * 0.3,
                    speed: Math.random() * 3 + 4,
                    angle: Math.PI / 4 + (Math.random() - 0.5) * 0.3,
                    opacity: Math.random() * 0.6 + 0.4,
                    active: true,
                    trail: []
                };
            }

            function initMeteors() {
                meteors = [];
                for (let i = 0; i < METEOR_COUNT; i++) {
                    const meteor = createMeteor();
                    meteor.x = Math.random() * width;
                    meteor.y = Math.random() * height * 0.2;
                    meteors.push(meteor);
                }
            }

            function updateStars() {
                for (let star of stars) {
                    star.twinklePhase += star.twinkleSpeed;
                    star.y += star.speed;
                    if (star.y > height) {
                        star.y = 0;
                        star.x = Math.random() * width;
                    }
                }
            }

            function updateMeteors() {
                for (let meteor of meteors) {
                    if (!meteor.active) continue;
                    meteor.x += Math.cos(meteor.angle) * meteor.speed;
                    meteor.y += Math.sin(meteor.angle) * meteor.speed;
                    meteor.trail.push({ x: meteor.x, y: meteor.y });
                    if (meteor.trail.length > 20) meteor.trail.shift();
                    if (meteor.x > width + 100 || meteor.y > height + 100) {
                        meteor.active = false;
                        setTimeout(() => {
                            const newMeteor = createMeteor();
                            newMeteor.x = Math.random() * width * 0.3;
                            newMeteor.y = Math.random() * height * 0.2;
                            Object.assign(meteor, newMeteor);
                            meteor.active = true;
                        }, Math.random() * 3000 + 2000);
                    }
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
                    if (star.radius > 1.2) {
                        ctx.shadowColor = 'rgba(255, 255, 255, 0.05)';
                        ctx.shadowBlur = 10;
                        ctx.fill();
                        ctx.shadowBlur = 0;
                    }
                }

                for (let meteor of meteors) {
                    if (!meteor.active) continue;
                    for (let i = 0; i < meteor.trail.length; i++) {
                        const point = meteor.trail[i];
                        const alpha = (i / meteor.trail.length) * meteor.opacity * 0.6;
                        const radius = (i / meteor.trail.length) * 2;
                        ctx.beginPath();
                        ctx.arc(point.x, point.y, radius, 0, Math.PI * 2);
                        ctx.fillStyle = `rgba(100, 200, 255, ${alpha})`;
                        ctx.fill();
                    }
                    const gradient = ctx.createRadialGradient(meteor.x, meteor.y, 0, meteor.x, meteor.y, 15);
                    gradient.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
                    gradient.addColorStop(0.3, 'rgba(100, 200, 255, 0.6)');
                    gradient.addColorStop(1, 'rgba(100, 200, 255, 0)');
                    ctx.beginPath();
                    ctx.arc(meteor.x, meteor.y, 15, 0, Math.PI * 2);
                    ctx.fillStyle = gradient;
                    ctx.fill();
                    ctx.shadowColor = 'rgba(100, 200, 255, 0.3)';
                    ctx.shadowBlur = 30;
                    ctx.beginPath();
                    ctx.arc(meteor.x, meteor.y, 8, 0, Math.PI * 2);
                    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
                    ctx.fill();
                    ctx.shadowBlur = 0;
                }
            }

            function animate() {
                updateStars();
                updateMeteors();
                draw();
                requestAnimationFrame(animate);
            }

            resize();
            createStars();
            initMeteors();
            animate();

            window.addEventListener('resize', () => {
                resize();
                createStars();
            });
        }

        // =========================
        // LÓGICA DEL REGISTRO (desde base-datos-centralizada.js)
        // =========================

        let vendedorActual = null;

        // =========================
        // Vendedor (local, simple)
        // =========================
        function obtenerOCrearVendedor() {
            let vendedorId = localStorage.getItem('vendedorActual');

            if (!vendedorId) {
                const vendedores = JSON.parse(localStorage.getItem('vendedores')) || [];
                const numeroVendedor = vendedores.length + 1;
                vendedorId = 'vendedor_' + numeroVendedor;
                vendedores.push({
                    id: vendedorId,
                    nombre: 'Vendedor ' + numeroVendedor,
                    numero: numeroVendedor,
                    fechaRegistro: new Date().toISOString()
                });
                localStorage.setItem('vendedores', JSON.stringify(vendedores));
                localStorage.setItem('vendedorActual', vendedorId);
            }

            const vendedores = JSON.parse(localStorage.getItem('vendedores')) || [];
            return vendedores.find(v => v.id === vendedorId);
        }

        window.cambiarVendedor = function () {
            localStorage.removeItem('vendedorActual');
            vendedorActual = obtenerOCrearVendedor();
            document.getElementById('vendedorBadge').textContent = vendedorActual.nombre;
            actualizarEstadisticasVendedor();
            renderHistorial();
        };

        // =========================
        // Estadísticas del vendedor
        // =========================
        function actualizarEstadisticasVendedor() {
            if (!vendedorActual || !window.bd) return;
            const todas = window.bd.obtenerTodasLasVentas ? window.bd.obtenerTodasLasVentas() : [];
            const deHoy = window.bd.obtenerVentasDeHoy ? window.bd.obtenerVentasDeHoy() : [];

            const delVendedor = todas.filter(v => v.vendedorId === vendedorActual.id);
            const delVendedorHoy = deHoy.filter(v => v.vendedorId === vendedorActual.id);

            const ingresoHoy = delVendedorHoy.reduce((s, v) => s + (Number(v.monto) || 0), 0);
            const ingresoTotal = delVendedor.reduce((s, v) => s + (Number(v.monto) || 0), 0);

            document.getElementById('ventasHoyVendedor').textContent = delVendedorHoy.length;
            document.getElementById('ingresoHoyVendedor').textContent = '$' + ingresoHoy.toLocaleString();
            document.getElementById('totalVentasVendedor').textContent = delVendedor.length;
            document.getElementById('totalIngresoVendedor').textContent = '$' + ingresoTotal.toLocaleString();

            // Actualizar badge de sincronización
            actualizarBadgeSync();
        }

        // =========================
        // Estado de sincronización
        // =========================
        function actualizarBadgeSync() {
            const dot = document.getElementById('syncDot');
            const text = document.getElementById('syncText');
            if (!dot || !text || !window.bd) return;
            if (window.bd.estaRemotoActivo && window.bd.estaRemotoActivo()) {
                dot.className = 'status-dot online';
                text.textContent = 'Sincronizado';
            } else {
                dot.className = 'status-dot offline';
                text.textContent = 'Modo local';
            }
        }

        // =========================
        // Precio total según cantidad
        // =========================
        function actualizarPrecioTotal() {
            const precioUnitario = (window.CONFIG && window.CONFIG.PRECIO_UNITARIO) || 75;
            const cantidad = parseInt(document.getElementById('cantidad').value) || 1;
            const total = cantidad * precioUnitario;
            document.getElementById('precioTotal').value = `$${total.toLocaleString()} MXN`;
        }

        // =========================
        // Envío del formulario
        // =========================
        function manejarEnvio(e) {
            e.preventDefault();

            const precioUnitario = (window.CONFIG && window.CONFIG.PRECIO_UNITARIO) || 75;
            const cantidad = parseInt(document.getElementById('cantidad').value) || 1;
            const cliente = document.getElementById('cliente').value.trim();
            const metodo = document.getElementById('metodo').value;
            const total = cantidad * precioUnitario;

            const successMsg = document.getElementById('successMessage');
            const errorMsg = document.getElementById('errorMessage');
            const errorText = document.getElementById('errorText');
            successMsg.style.display = 'none';
            errorMsg.style.display = 'none';

            if (!metodo) {
                errorText.textContent = 'Selecciona un método de pago.';
                errorMsg.style.display = 'block';
                return;
            }

            const venta = {
                vendedorId: vendedorActual ? vendedorActual.id : null,
                vendedorNombre: vendedorActual ? vendedorActual.nombre : 'N/A',
                cantidad: cantidad,
                cliente: cliente || 'Anónimo',
                metodoPago: metodo,
                metodo: metodo,
                monto: total,
                fecha: new Date().toISOString(),
                fechaRegistro: new Date().toISOString()
            };

            if (typeof window.registrarVentaCentralizada === 'function') {
                window.registrarVentaCentralizada(venta);
            } else if (typeof window.bd?.registrarVenta === 'function') {
                window.bd.registrarVenta(venta);
            } else {
                let ventas = JSON.parse(localStorage.getItem('ventas')) || [];
                ventas.push(venta);
                localStorage.setItem('ventas', JSON.stringify(ventas));
            }

            successMsg.style.display = 'block';
            setTimeout(() => { successMsg.style.display = 'none'; }, 3000);

            document.getElementById('ventasForm').reset();
            document.getElementById('cantidad').value = 1;
            actualizarPrecioTotal();
            actualizarEstadisticasVendedor();
            renderHistorial();
        }

        // =========================
        // RENDER HISTORIAL
        // =========================
        function renderHistorial() {
            const container = document.getElementById('historialList');
            if (!container) return;

            const todas = window.bd?.obtenerTodasLasVentas ? window.bd.obtenerTodasLasVentas() : 
                          JSON.parse(localStorage.getItem('ventas') || '[]');
            
            const delVendedor = todas.filter(v => v.vendedorId === vendedorActual?.id);

            if (delVendedor.length === 0) {
                container.innerHTML = `
                    <div class="venta-empty">
                        <i class="fas fa-inbox"></i>
                        <p>Sin ventas registradas todavía</p>
                    </div>
                `;
                return;
            }

            const ultimas = delVendedor.slice(-20).reverse();

            container.innerHTML = ultimas.map(v => {
                const fecha = new Date(v.fecha || v.fechaRegistro);
                const hora = fecha.toLocaleTimeString();
                const metodo = v.metodoPago || v.metodo || 'Efectivo';
                const monto = v.monto || 0;
                const cliente = v.cliente || 'Anónimo';
                
                return `
                    <div class="venta-item">
                        <div class="info">
                            <div class="cliente">${cliente}</div>
                            <div class="detalle">${hora} · ${v.cantidad || 1} unidad(es) · <span class="metodo-badge">${metodo}</span></div>
                        </div>
                        <div class="monto">$${monto.toLocaleString()}</div>
                    </div>
                `;
            }).join('');
        }

        // =========================
        // INICIALIZACIÓN
        // =========================
        function iniciar() {
            vendedorActual = obtenerOCrearVendedor();
            document.getElementById('vendedorBadge').textContent = vendedorActual.nombre;

            actualizarPrecioTotal();
            actualizarEstadisticasVendedor();
            renderHistorial();

            document.getElementById('cantidad').addEventListener('input', actualizarPrecioTotal);
            document.getElementById('ventasForm').addEventListener('submit', manejarEnvio);

            window.addEventListener('sincronizacionCompleta', () => {
                actualizarBadgeSync();
                actualizarEstadisticasVendedor();
                renderHistorial();
            });
            window.addEventListener('ventaRegistrada', () => {
                actualizarEstadisticasVendedor();
                renderHistorial();
            });
        }

        // Esperar a que base-datos-centralizada.js cargue
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', iniciar);
        } else {
            // Esperar un momento para que bd esté disponible
            setTimeout(iniciar, 100);
        }
    </script>
</body>
</html>