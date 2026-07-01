(function (global) {
    const DEFAULT_VIEW = (global.CONFIG && global.CONFIG.WEB3_REWARDS && global.CONFIG.WEB3_REWARDS.WINDOW
        ? global.CONFIG.WEB3_REWARDS.WINDOW.DEFAULT_VIEW
        : 'connect') || 'connect';
    const OVERLAY_ID = (global.CONFIG && global.CONFIG.WEB3_REWARDS && global.CONFIG.WEB3_REWARDS.WINDOW
        ? global.CONFIG.WEB3_REWARDS.WINDOW.ID
        : 'sariel-wallet-overlay') || 'sariel-wallet-overlay';
    const TITLE = (global.CONFIG && global.CONFIG.WEB3_REWARDS && global.CONFIG.WEB3_REWARDS.WINDOW
        ? global.CONFIG.WEB3_REWARDS.WINDOW.TITLE
        : 'Sariel Wallet') || 'Sariel Wallet';
    const VIEW_IDS = ['connect', 'assets', 'admin'];

    function shortAddress(value) {
        if (!value || value.length < 10) return value || 'Sin conexión';
        return `${value.slice(0, 6)}...${value.slice(-4)}`;
    }

    function ensureStyles() {
        if (document.getElementById('sariel-wallet-overlay-styles')) return;

        const style = document.createElement('style');
        style.id = 'sariel-wallet-overlay-styles';
        style.textContent = `
            #${OVERLAY_ID}[hidden] { display: none !important; }
            #${OVERLAY_ID} {
                position: fixed;
                inset: 0;
                z-index: 9999;
                font-family: Inter, 'Segoe UI', Tahoma, sans-serif;
            }
            #${OVERLAY_ID} .sariel-wallet-backdrop {
                position: absolute;
                inset: 0;
                background: rgba(3, 10, 8, 0.72);
                backdrop-filter: blur(8px);
            }
            #${OVERLAY_ID} .sariel-wallet-window {
                position: relative;
                width: min(96vw, 520px);
                max-height: calc(100vh - 32px);
                margin: 16px auto;
                border: 1px solid rgba(40, 247, 154, 0.18);
                border-radius: 24px;
                overflow: hidden;
                color: #e8fff3;
                background: linear-gradient(180deg, rgba(8, 17, 13, 0.98), rgba(12, 24, 18, 0.98));
                box-shadow: 0 28px 80px rgba(0, 0, 0, 0.48);
                display: flex;
                flex-direction: column;
            }
            #${OVERLAY_ID} .sariel-wallet-header,
            #${OVERLAY_ID} .sariel-wallet-footer {
                padding: 18px 20px;
                border-bottom: 1px solid rgba(40, 247, 154, 0.12);
            }
            #${OVERLAY_ID} .sariel-wallet-footer {
                border-bottom: none;
                border-top: 1px solid rgba(40, 247, 154, 0.12);
                display: grid;
                gap: 8px;
            }
            #${OVERLAY_ID} .sariel-wallet-header {
                display: flex;
                justify-content: space-between;
                align-items: flex-start;
                gap: 12px;
            }
            #${OVERLAY_ID} .sariel-wallet-header h1 {
                font-size: 1.1rem;
                margin: 0 0 6px;
            }
            #${OVERLAY_ID} .sariel-wallet-subtitle,
            #${OVERLAY_ID} .sariel-wallet-muted {
                color: #9ccab5;
                font-size: 0.9rem;
                line-height: 1.45;
            }
            #${OVERLAY_ID} .sariel-wallet-close,
            #${OVERLAY_ID} .sariel-wallet-button {
                border: none;
                border-radius: 12px;
                padding: 11px 14px;
                font-weight: 700;
                cursor: pointer;
            }
            #${OVERLAY_ID} .sariel-wallet-close {
                width: 42px;
                background: rgba(255, 255, 255, 0.06);
                color: #d9fff0;
            }
            #${OVERLAY_ID} .sariel-wallet-button {
                background: linear-gradient(135deg, #28f79a, #18c77a);
                color: #042415;
            }
            #${OVERLAY_ID} .sariel-wallet-button.secondary {
                background: rgba(255, 255, 255, 0.06);
                color: #d1f7e2;
            }
            #${OVERLAY_ID} .sariel-wallet-button.ghost {
                background: transparent;
                color: #8ff3c7;
                border: 1px solid rgba(40, 247, 154, 0.22);
            }
            #${OVERLAY_ID} .sariel-wallet-button.danger {
                background: #341824;
                color: #ffb8cd;
            }
            #${OVERLAY_ID} .sariel-wallet-button:disabled {
                cursor: not-allowed;
                opacity: 0.45;
            }
            #${OVERLAY_ID} .sariel-wallet-body {
                overflow: auto;
                padding: 16px 20px 20px;
                display: grid;
                gap: 14px;
            }
            #${OVERLAY_ID} .sariel-wallet-nav {
                display: grid;
                grid-template-columns: repeat(3, 1fr);
                gap: 8px;
            }
            #${OVERLAY_ID} .sariel-wallet-nav button.active {
                outline: 1px solid rgba(40, 247, 154, 0.4);
                background: rgba(40, 247, 154, 0.12);
                color: #92ffd2;
            }
            #${OVERLAY_ID} .sariel-wallet-card {
                border: 1px solid rgba(40, 247, 154, 0.12);
                border-radius: 18px;
                padding: 16px;
                background: rgba(10, 20, 15, 0.84);
                display: grid;
                gap: 12px;
            }
            #${OVERLAY_ID} .sariel-wallet-card h2 {
                font-size: 0.98rem;
                margin: 0;
            }
            #${OVERLAY_ID} .sariel-wallet-grid {
                display: grid;
                grid-template-columns: repeat(2, minmax(0, 1fr));
                gap: 10px;
            }
            #${OVERLAY_ID} .sariel-wallet-kpi {
                border: 1px solid rgba(40, 247, 154, 0.12);
                border-radius: 14px;
                padding: 12px;
                background: rgba(21, 39, 30, 0.8);
            }
            #${OVERLAY_ID} .sariel-wallet-kpi strong {
                display: block;
                font-size: 1.4rem;
                margin-top: 6px;
                color: #8ff3c7;
            }
            #${OVERLAY_ID} .sariel-wallet-row {
                display: flex;
                flex-wrap: wrap;
                gap: 10px;
            }
            #${OVERLAY_ID} .sariel-wallet-badge {
                display: inline-flex;
                align-items: center;
                gap: 6px;
                border-radius: 999px;
                padding: 6px 10px;
                background: rgba(255, 255, 255, 0.06);
                color: #b3e4cc;
                font-size: 0.82rem;
                border: 1px solid rgba(40, 247, 154, 0.12);
            }
            #${OVERLAY_ID} .sariel-wallet-badge.ok {
                color: #8ff3c7;
                background: rgba(40, 247, 154, 0.12);
            }
            #${OVERLAY_ID} .sariel-wallet-field {
                display: grid;
                gap: 8px;
            }
            #${OVERLAY_ID} input,
            #${OVERLAY_ID} textarea {
                width: 100%;
                border-radius: 12px;
                border: 1px solid rgba(40, 247, 154, 0.18);
                background: rgba(4, 11, 8, 0.84);
                color: #eafff4;
                padding: 12px 14px;
                resize: vertical;
                min-height: 44px;
            }
            #${OVERLAY_ID} textarea {
                min-height: 92px;
            }
            #${OVERLAY_ID} .sariel-wallet-view[hidden] {
                display: none !important;
            }
            #${OVERLAY_ID} .sariel-wallet-status {
                border-radius: 12px;
                padding: 12px 14px;
                border: 1px solid rgba(40, 247, 154, 0.12);
                background: rgba(9, 20, 15, 0.9);
                color: #c9f7df;
                font-size: 0.9rem;
                line-height: 1.45;
                word-break: break-word;
            }
            #${OVERLAY_ID} .sariel-wallet-status.error {
                border-color: rgba(255, 111, 145, 0.24);
                color: #ffc2d0;
                background: rgba(45, 18, 26, 0.92);
            }
            #${OVERLAY_ID} .sariel-wallet-status.success {
                border-color: rgba(40, 247, 154, 0.24);
                color: #8ff3c7;
            }
            @media (max-width: 600px) {
                #${OVERLAY_ID} .sariel-wallet-window {
                    width: calc(100vw - 16px);
                    margin: 8px auto;
                    max-height: calc(100vh - 16px);
                }
                #${OVERLAY_ID} .sariel-wallet-grid {
                    grid-template-columns: 1fr;
                }
            }
        `;

        document.head.appendChild(style);
    }

    class WalletOverlayApp {
        constructor(options) {
            this.options = options || {};
            this.integration = this.options.integration || (
                global.SarielPolygon && global.SarielPolygon.createIntegration
                    ? global.SarielPolygon.createIntegration(this.options.polygon)
                    : null
            );
            this.windowState = {
                open: false,
                view: DEFAULT_VIEW,
                qrCode: '',
                signText: '',
                adminRecipient: '',
                notice: 'Wallet lista para iniciar.',
                noticeType: ''
            };
            this.root = null;
            this.unsubscribe = null;
        }

        mount(target) {
            if (this.root) return this;
            if (!this.integration) {
                throw new Error('La integración Polygon no está cargada.');
            }

            ensureStyles();
            this.root = document.createElement('div');
            this.root.id = OVERLAY_ID;
            this.root.hidden = true;
            this.root.innerHTML = `
                <div class="sariel-wallet-backdrop" data-action="close"></div>
                <section class="sariel-wallet-window" role="dialog" aria-modal="true" aria-label="${TITLE}">
                    <header class="sariel-wallet-header">
                        <div>
                            <h1>${TITLE}</h1>
                            <div class="sariel-wallet-subtitle">Overlay desacoplado de navegación, con estados de ventana e integración directa a Polygon.</div>
                        </div>
                        <button type="button" class="sariel-wallet-close" data-action="close">✕</button>
                    </header>
                    <div class="sariel-wallet-body">
                        <nav class="sariel-wallet-nav">
                            <button type="button" class="sariel-wallet-button secondary" data-view="connect">Conexión</button>
                            <button type="button" class="sariel-wallet-button secondary" data-view="assets">Assets</button>
                            <button type="button" class="sariel-wallet-button secondary" data-view="admin">Admin</button>
                        </nav>

                        <section class="sariel-wallet-view" data-panel="connect">
                            <div class="sariel-wallet-card">
                                <h2>Sesión Wallet</h2>
                                <div class="sariel-wallet-row">
                                    <button type="button" class="sariel-wallet-button" data-action="connect">Conectar wallet</button>
                                    <button type="button" class="sariel-wallet-button secondary" data-action="switch">Auto-Switch Polygon</button>
                                    <button type="button" class="sariel-wallet-button ghost" data-action="refresh">Actualizar</button>
                                    <button type="button" class="sariel-wallet-button danger" data-action="disconnect">Desconectar</button>
                                </div>
                                <div class="sariel-wallet-row">
                                    <span class="sariel-wallet-badge" data-bind="walletBadge">Sin conexión</span>
                                    <span class="sariel-wallet-badge" data-bind="networkBadge">Red pendiente</span>
                                    <span class="sariel-wallet-badge ok">Auto-Switch activo</span>
                                </div>
                                <div class="sariel-wallet-muted" data-bind="adminSummary"></div>
                            </div>
                            <div class="sariel-wallet-card">
                                <h2>Firma asíncrona</h2>
                                <div class="sariel-wallet-field">
                                    <label for="sariel-wallet-sign-text">Mensaje a firmar</label>
                                    <textarea id="sariel-wallet-sign-text" placeholder="Escribe un challenge o deja el campo vacío para usar uno automático."></textarea>
                                </div>
                                <div class="sariel-wallet-row">
                                    <button type="button" class="sariel-wallet-button" data-action="sign">Firmar desafío</button>
                                </div>
                                <div class="sariel-wallet-muted" data-bind="signatureSummary">Sin firma generada.</div>
                            </div>
                        </section>

                        <section class="sariel-wallet-view" data-panel="assets">
                            <div class="sariel-wallet-card">
                                <h2>S-TOK y NFTs</h2>
                                <div class="sariel-wallet-grid">
                                    <div class="sariel-wallet-kpi">S-TOK balance<strong data-bind="stokBalance">0</strong></div>
                                    <div class="sariel-wallet-kpi">NFT balance<strong data-bind="snftBalance">0</strong></div>
                                    <div class="sariel-wallet-kpi">NFT ya reclamado<strong data-bind="hasMinted">No</strong></div>
                                    <div class="sariel-wallet-kpi">Reward NFTs mintados<strong data-bind="rewardMinted">0</strong></div>
                                </div>
                            </div>
                            <div class="sariel-wallet-card">
                                <h2>Operaciones directas Polygon</h2>
                                <div class="sariel-wallet-field">
                                    <label for="sariel-wallet-qr-code">Código QR para reclamar S-TOK</label>
                                    <input id="sariel-wallet-qr-code" type="text" placeholder="SarielTO#001">
                                </div>
                                <div class="sariel-wallet-row">
                                    <button type="button" class="sariel-wallet-button" data-action="claimTok">Reclamar 1 S-TOK</button>
                                    <button type="button" class="sariel-wallet-button secondary" data-action="claimNft">Canjear 12 S-TOK y reclamar NFT</button>
                                </div>
                                <div class="sariel-wallet-muted" data-bind="contractsSummary"></div>
                            </div>
                        </section>

                        <section class="sariel-wallet-view" data-panel="admin">
                            <div class="sariel-wallet-card">
                                <h2>Blindaje admin-only</h2>
                                <div class="sariel-wallet-row">
                                    <span class="sariel-wallet-badge" data-bind="adminBadge">Admin no validado</span>
                                    <span class="sariel-wallet-badge" data-bind="ownerBadge">Owner reward pendiente</span>
                                </div>
                                <div class="sariel-wallet-field">
                                    <label for="sariel-wallet-admin-recipient">Wallet destino para mint admin-only</label>
                                    <input id="sariel-wallet-admin-recipient" type="text" placeholder="0x...">
                                </div>
                                <div class="sariel-wallet-row">
                                    <button type="button" class="sariel-wallet-button" data-action="adminMint">Mint reward admin-only</button>
                                </div>
                                <div class="sariel-wallet-muted">Solo la wallet 0x8F742964244AE588dF7C5B2b27Ded374fDdAd69b puede ejecutar funciones administrativas.</div>
                            </div>
                        </section>
                    </div>
                    <footer class="sariel-wallet-footer">
                        <div class="sariel-wallet-status" data-bind="statusBox">Wallet lista para iniciar.</div>
                        <div class="sariel-wallet-muted" data-bind="txSummary">Sin transacciones recientes.</div>
                    </footer>
                </section>
            `;

            (target || document.body).appendChild(this.root);
            this.bindEvents();
            this.unsubscribe = this.integration.subscribe(() => this.paint());
            this.paint();
            return this;
        }

        bindEvents() {
            this.root.addEventListener('click', (event) => {
                const action = event.target && event.target.getAttribute('data-action');
                const view = event.target && event.target.getAttribute('data-view');

                if (view) {
                    this.setView(view);
                    return;
                }

                if (action) {
                    this.handleAction(action);
                }
            });

            this.root.querySelector('#sariel-wallet-qr-code').addEventListener('input', (event) => {
                this.windowState.qrCode = event.target.value;
            });

            this.root.querySelector('#sariel-wallet-sign-text').addEventListener('input', (event) => {
                this.windowState.signText = event.target.value;
            });

            this.root.querySelector('#sariel-wallet-admin-recipient').addEventListener('input', (event) => {
                this.windowState.adminRecipient = event.target.value;
            });
        }

        open(view) {
            this.windowState.open = true;
            if (view && VIEW_IDS.indexOf(view) >= 0) {
                this.windowState.view = view;
            }
            this.root.hidden = false;
            this.paint();
            this.integration.refreshState().catch((error) => {
                this.setNotice(error && error.message ? error.message : String(error), 'error');
            });
            return this;
        }

        close() {
            this.windowState.open = false;
            if (this.root) {
                this.root.hidden = true;
            }
            return this;
        }

        setView(view) {
            if (VIEW_IDS.indexOf(view) < 0) return this;
            this.windowState.view = view;
            this.paint();
            return this;
        }

        async handleAction(action) {
            try {
                if (action === 'close') {
                    this.close();
                    return;
                }

                if (action === 'connect') {
                    await this.integration.connect();
                    this.windowState.view = 'assets';
                    this.setNotice('Wallet conectada y sincronizada contra Polygon.', 'success');
                } else if (action === 'disconnect') {
                    await this.integration.disconnect();
                    this.setNotice('Wallet desconectada.', 'success');
                } else if (action === 'switch') {
                    await this.integration.ensurePolygonNetwork();
                    this.setNotice('Auto-Switch completado sobre la red Polygon configurada.', 'success');
                } else if (action === 'refresh') {
                    await this.integration.refreshState();
                    this.setNotice('Estado de wallet actualizado.', 'success');
                } else if (action === 'sign') {
                    const result = await this.integration.signMessage(this.windowState.signText);
                    this.setNotice(`Firma asíncrona generada para: ${result.message}`, 'success');
                } else if (action === 'claimTok') {
                    const receipt = await this.integration.claimTokFromQr(this.windowState.qrCode);
                    this.setNotice(`S-TOK reclamado. Tx: ${receipt.transactionHash}`, 'success');
                } else if (action === 'claimNft') {
                    const receipt = await this.integration.claimNft();
                    this.setNotice(`NFT reclamado. Tx: ${receipt.transactionHash}`, 'success');
                } else if (action === 'adminMint') {
                    const receipt = await this.integration.adminMintReward(this.windowState.adminRecipient);
                    this.setNotice(`Mint admin-only completado. Tx: ${receipt.transactionHash}`, 'success');
                }
            } catch (error) {
                this.setNotice(error && error.message ? error.message : String(error), 'error');
            } finally {
                this.paint();
            }
        }

        setNotice(message, type) {
            this.windowState.notice = message;
            this.windowState.noticeType = type || '';
            this.paint();
        }

        paint() {
            if (!this.root) return;

            const state = this.integration.getState();
            const networkOk = state.chainId === this.integration.config.chain.id;
            const isBusy = !!state.busyKey;
            const adminReady = state.rewardOwnerMatchesAdmin === true;
            const contractsSummary = [
                `S-TOK: ${state.contracts.stok ? 'configurado' : 'pendiente'}`,
                `NFT: ${state.contracts.snft ? 'configurado' : 'pendiente'}`,
                `Reward: ${state.contracts.rewardNft ? 'configurado' : 'pendiente'}`
            ].join(' · ');

            this.root.querySelectorAll('[data-view]').forEach((button) => {
                button.classList.toggle('active', button.getAttribute('data-view') === this.windowState.view);
            });

            this.root.querySelectorAll('.sariel-wallet-view').forEach((panel) => {
                panel.hidden = panel.getAttribute('data-panel') !== this.windowState.view;
            });

            this.root.querySelector('[data-bind="walletBadge"]').textContent = state.walletAddress ? shortAddress(state.walletAddress) : 'Sin conexión';
            this.root.querySelector('[data-bind="walletBadge"]').className = `sariel-wallet-badge${state.walletAddress ? ' ok' : ''}`;
            this.root.querySelector('[data-bind="networkBadge"]').textContent = networkOk ? this.integration.config.chain.name : `Chain ${state.chainId || 'N/A'}`;
            this.root.querySelector('[data-bind="networkBadge"]').className = `sariel-wallet-badge${networkOk ? ' ok' : ''}`;
            this.root.querySelector('[data-bind="adminSummary"]').textContent =
                state.walletAddress
                    ? `Wallet activa: ${state.walletAddress}. Admin-only ${state.isAdmin ? 'habilitado' : 'bloqueado'}.`
                    : 'Conecta una wallet para activar la sesión y la firma asíncrona.';
            this.root.querySelector('[data-bind="signatureSummary"]').textContent =
                state.lastSignature
                    ? `Última firma: ${state.lastSignature.slice(0, 18)}…`
                    : 'Sin firma generada.';

            this.root.querySelector('[data-bind="stokBalance"]').textContent = state.balances.stok;
            this.root.querySelector('[data-bind="snftBalance"]').textContent = state.balances.snft;
            this.root.querySelector('[data-bind="hasMinted"]').textContent = state.hasMinted ? 'Sí' : 'No';
            this.root.querySelector('[data-bind="rewardMinted"]').textContent = state.totalMinted;
            this.root.querySelector('[data-bind="contractsSummary"]').textContent = contractsSummary;

            this.root.querySelector('[data-bind="adminBadge"]').textContent = state.isAdmin ? 'Admin autorizado' : 'Admin bloqueado';
            this.root.querySelector('[data-bind="adminBadge"]').className = `sariel-wallet-badge${state.isAdmin ? ' ok' : ''}`;
            this.root.querySelector('[data-bind="ownerBadge"]').textContent =
                state.rewardOwner
                    ? (adminReady ? 'Owner reward validado' : `Owner reward: ${shortAddress(state.rewardOwner)}`)
                    : 'Owner reward pendiente';
            this.root.querySelector('[data-bind="ownerBadge"]').className = `sariel-wallet-badge${adminReady ? ' ok' : ''}`;

            const status = this.root.querySelector('[data-bind="statusBox"]');
            status.textContent = isBusy
                ? `Operación en curso: ${state.busyKey}.`
                : this.windowState.notice;
            status.className = `sariel-wallet-status ${isBusy ? '' : this.windowState.noticeType}`.trim();

            this.root.querySelector('[data-bind="txSummary"]').textContent = state.lastTransactionHash
                ? `Última tx confirmada: ${state.lastTransactionHash}`
                : 'Sin transacciones recientes.';

            this.root.querySelector('#sariel-wallet-qr-code').value = this.windowState.qrCode;
            this.root.querySelector('#sariel-wallet-sign-text').value = this.windowState.signText;
            this.root.querySelector('#sariel-wallet-admin-recipient').value = this.windowState.adminRecipient;

            this.root.querySelectorAll('.sariel-wallet-button').forEach((button) => {
                const action = button.getAttribute('data-action');
                if (!action) return;
                button.disabled = isBusy
                    || (action === 'disconnect' && !state.walletAddress)
                    || (action === 'claimTok' && (!state.walletAddress || !networkOk))
                    || (action === 'claimNft' && (!state.walletAddress || !networkOk))
                    || (action === 'adminMint' && (!state.walletAddress || !networkOk || !state.isAdmin));
            });
        }
    }

    global.createSarielWalletApp = function createSarielWalletApp(options) {
        return new WalletOverlayApp(options);
    };

    global.SarielsWalletApp = global.SarielsWalletApp || global.createSarielWalletApp();
}(window));
