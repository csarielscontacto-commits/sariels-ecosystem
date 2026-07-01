(function (global) {
    const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';
    const DEFAULT_ADMIN_WALLET = '0x8F742964244AE588dF7C5B2b27Ded374fDdAd69b';
    const DEFAULT_TOK_ABI = [
        'function claimFromQR(string code) external',
        'function balanceOf(address account) view returns (uint256)',
        'function symbol() view returns (string)',
        'function allowance(address owner, address spender) view returns (uint256)',
        'function approve(address spender, uint256 amount) external returns (bool)'
    ];
    const DEFAULT_NFT_ABI = [
        'function claimNFT() external returns (uint256)',
        'function hasMinted(address wallet) view returns (bool)',
        'function balanceOf(address owner) view returns (uint256)'
    ];
    const DEFAULT_REWARD_ABI = [
        'function owner() view returns (address)',
        'function mintReward(address to) external returns (uint256)',
        'function totalMinted() view returns (uint256)'
    ];

    function normalizeAddress(value) {
        return typeof value === 'string' ? value.trim().toLowerCase() : '';
    }

    function isRuntimeAddress(value) {
        return !!(global.ethers && global.ethers.utils && global.ethers.utils.isAddress(value));
    }

    function isConfiguredAddress(value) {
        return isRuntimeAddress(value) && normalizeAddress(value) !== ZERO_ADDRESS;
    }

    function buildConfig(overrides) {
        const source = Object.assign({}, global.CONFIG && global.CONFIG.WEB3_REWARDS ? global.CONFIG.WEB3_REWARDS : {}, overrides || {});
        const chain = source.CHAIN || {};

        return {
            adminWallet: normalizeAddress(source.ADMIN_WALLET || DEFAULT_ADMIN_WALLET),
            strictAdminOnly: source.STRICT_ADMIN_ONLY !== false,
            autoSwitch: source.AUTO_SWITCH !== false,
            walletConnectProjectId: source.WALLETCONNECT_PROJECT_ID || '',
            qrCodesUrl: source.QR_CODES_URL || '',
            nftClaimCost: Number(source.TOKS_UMBRAL_CANJE || 12),
            chain: {
                id: Number(chain.ID || 80002),
                hexId: chain.HEX_ID || '0x13882',
                name: chain.NAME || 'Polygon Amoy',
                rpcUrl: chain.RPC_URL || 'https://rpc-amoy.polygon.technology',
                explorer: chain.EXPLORER || 'https://amoy.polygonscan.com'
            },
            addresses: {
                stok: source.STOK_CONTRACT_ADDRESS || ZERO_ADDRESS,
                snft: source.SNFT_CONTRACT_ADDRESS || ZERO_ADDRESS,
                rewardNft: source.REWARD_NFT_ADDRESS || ZERO_ADDRESS
            },
            abis: {
                tok: source.TOK_ABI || (global.CONTRACT_ABIS && global.CONTRACT_ABIS.SarielTOK) || DEFAULT_TOK_ABI,
                nft: source.SNFT_ABI || (global.CONTRACT_ABIS && global.CONTRACT_ABIS.SarielNFT) || DEFAULT_NFT_ABI,
                reward: source.REWARD_NFT_ABI || DEFAULT_REWARD_ABI
            }
        };
    }

    class PolygonWalletIntegration {
        constructor(options) {
            this.config = buildConfig(options && options.config);
            this.listeners = new Set();
            this.rpcProvider = null;
            this.provider = null;
            this.web3Provider = null;
            this.signer = null;
            this.web3Modal = null;
            this.providerListeners = null;
            this.state = {
                ready: false,
                busyKey: '',
                walletAddress: '',
                chainId: null,
                isAdmin: false,
                balances: {
                    stok: '0',
                    snft: '0'
                },
                tokenSymbol: 'S-TOK',
                hasMinted: false,
                contracts: {
                    stok: false,
                    snft: false,
                    rewardNft: false
                },
                rewardOwner: '',
                rewardOwnerMatchesAdmin: null,
                totalMinted: '0',
                lastSignedMessage: '',
                lastSignature: '',
                lastTransactionHash: '',
                lastError: ''
            };
        }

        subscribe(listener) {
            this.listeners.add(listener);
            return () => this.listeners.delete(listener);
        }

        emit(eventName, payload) {
            const snapshot = this.getState();
            this.listeners.forEach((listener) => listener({
                eventName,
                payload: payload || {},
                state: snapshot
            }));
        }

        getState() {
            return JSON.parse(JSON.stringify(this.state));
        }

        assertLibraries() {
            if (!global.ethers || !global.ethers.providers || !global.ethers.Contract) {
                throw new Error('Ethers no está cargado para la integración Polygon.');
            }
            if (!global.Web3Modal || !global.Web3Modal.default) {
                throw new Error('Web3Modal no está cargado para la integración Polygon.');
            }
            if (!global.WalletConnectProvider || !global.WalletConnectProvider.default) {
                throw new Error('WalletConnectProvider no está cargado para la integración Polygon.');
            }
        }

        async init() {
            if (this.web3Modal) return this;
            this.assertLibraries();

            this.web3Modal = new global.Web3Modal.default({
                cacheProvider: false,
                providerOptions: {
                    walletconnect: {
                        package: global.WalletConnectProvider.default,
                        options: {
                            projectId: this.config.walletConnectProjectId,
                            rpc: { [this.config.chain.id]: this.config.chain.rpcUrl },
                            chainId: this.config.chain.id,
                            qrcode: true,
                            showQrModal: true
                        }
                    }
                },
                theme: 'dark'
            });

            this.state.ready = true;
            return this;
        }

        getRpcProvider() {
            if (!this.rpcProvider) {
                this.rpcProvider = new global.ethers.providers.JsonRpcProvider(this.config.chain.rpcUrl, this.config.chain.id);
            }
            return this.rpcProvider;
        }

        getContract(address, abi, requireSigner) {
            if (!isConfiguredAddress(address)) return null;
            const transport = requireSigner ? this.signer : (this.signer || this.getRpcProvider());
            if (!transport) return null;
            return new global.ethers.Contract(address, abi, transport);
        }

        getStokContract(requireSigner) {
            return this.getContract(this.config.addresses.stok, this.config.abis.tok, requireSigner);
        }

        getSnftContract(requireSigner) {
            return this.getContract(this.config.addresses.snft, this.config.abis.nft, requireSigner);
        }

        getRewardContract(requireSigner) {
            return this.getContract(this.config.addresses.rewardNft, this.config.abis.reward, requireSigner);
        }

        async connect() {
            await this.init();

            this.provider = await this.web3Modal.connect();
            this.web3Provider = new global.ethers.providers.Web3Provider(this.provider, 'any');
            this.signer = this.web3Provider.getSigner();
            this.bindProviderEvents();

            const address = await this.signer.getAddress();
            const network = await this.web3Provider.getNetwork();
            this.state.walletAddress = normalizeAddress(address);
            this.state.chainId = Number(network.chainId);

            if (this.config.autoSwitch) {
                await this.ensurePolygonNetwork();
            }

            return this.refreshState();
        }

        async disconnect() {
            this.unbindProviderEvents();

            if (this.provider && typeof this.provider.disconnect === 'function') {
                try {
                    await this.provider.disconnect();
                } catch (_) {}
            }

            this.provider = null;
            this.web3Provider = null;
            this.signer = null;
            this.state.walletAddress = '';
            this.state.chainId = null;
            this.state.isAdmin = false;
            this.state.balances = { stok: '0', snft: '0' };
            this.state.hasMinted = false;
            this.state.lastSignature = '';
            this.state.lastSignedMessage = '';
            this.state.lastTransactionHash = '';
            this.state.lastError = '';
            this.emit('disconnect');
            return this.getState();
        }

        async ensurePolygonNetwork() {
            if (!this.provider || !this.provider.request || !this.web3Provider) return false;
            if (this.state.chainId === this.config.chain.id) return true;

            try {
                await this.provider.request({
                    method: 'wallet_switchEthereumChain',
                    params: [{ chainId: this.config.chain.hexId }]
                });
            } catch (error) {
                if (error && error.code === 4902) {
                    await this.provider.request({
                        method: 'wallet_addEthereumChain',
                        params: [{
                            chainId: this.config.chain.hexId,
                            chainName: this.config.chain.name,
                            nativeCurrency: { name: 'MATIC', symbol: 'MATIC', decimals: 18 },
                            rpcUrls: [this.config.chain.rpcUrl],
                            blockExplorerUrls: [this.config.chain.explorer]
                        }]
                    });
                } else {
                    throw error;
                }
            }

            const network = await this.web3Provider.getNetwork();
            this.state.chainId = Number(network.chainId);
            this.emit('network', { chainId: this.state.chainId });
            return this.state.chainId === this.config.chain.id;
        }

        async ensureWallet(actionLabel) {
            if (!this.signer || !this.web3Provider || !this.state.walletAddress) {
                throw new Error(`${actionLabel} requiere conectar una wallet.`);
            }
        }

        async ensureActionNetwork() {
            if (this.config.autoSwitch) {
                const switched = await this.ensurePolygonNetwork();
                if (switched) return;
            }

            if (this.state.chainId !== this.config.chain.id) {
                throw new Error(`La wallet debe estar conectada a ${this.config.chain.name}.`);
            }
        }

        assertAdminWallet() {
            if (normalizeAddress(this.state.walletAddress) !== this.config.adminWallet) {
                throw new Error(`Función admin-only: solo ${this.config.adminWallet} está autorizada.`);
            }
        }

        async refreshState() {
            try {
                const activeProvider = this.web3Provider || this.getRpcProvider();
                const network = await activeProvider.getNetwork();
                const walletAddress = normalizeAddress(this.state.walletAddress);
                const nextState = {
                    chainId: Number(network.chainId),
                    isAdmin: walletAddress === this.config.adminWallet,
                    balances: { stok: '0', snft: '0' },
                    tokenSymbol: 'S-TOK',
                    hasMinted: false,
                    contracts: {
                        stok: isConfiguredAddress(this.config.addresses.stok),
                        snft: isConfiguredAddress(this.config.addresses.snft),
                        rewardNft: isConfiguredAddress(this.config.addresses.rewardNft)
                    },
                    rewardOwner: '',
                    rewardOwnerMatchesAdmin: null,
                    totalMinted: '0',
                    lastError: ''
                };

                const asyncTasks = [];
                const stokContract = this.getStokContract(false);
                const snftContract = this.getSnftContract(false);
                const rewardContract = this.getRewardContract(false);

                if (walletAddress && stokContract) {
                    asyncTasks.push(Promise.all([
                        stokContract.balanceOf(walletAddress),
                        typeof stokContract.symbol === 'function' ? stokContract.symbol() : Promise.resolve('S-TOK')
                    ]).then(([balance, symbol]) => {
                        nextState.balances.stok = balance.toString();
                        nextState.tokenSymbol = symbol || 'S-TOK';
                    }));
                }

                if (walletAddress && snftContract) {
                    asyncTasks.push(Promise.all([
                        snftContract.balanceOf(walletAddress),
                        snftContract.hasMinted(walletAddress)
                    ]).then(([balance, hasMinted]) => {
                        nextState.balances.snft = balance.toString();
                        nextState.hasMinted = !!hasMinted;
                    }));
                }

                if (rewardContract) {
                    asyncTasks.push(Promise.all([
                        rewardContract.owner(),
                        rewardContract.totalMinted()
                    ]).then(([owner, totalMinted]) => {
                        nextState.rewardOwner = normalizeAddress(owner);
                        nextState.rewardOwnerMatchesAdmin = nextState.rewardOwner === this.config.adminWallet;
                        nextState.totalMinted = totalMinted.toString();
                    }));
                }

                await Promise.all(asyncTasks);
                Object.assign(this.state, nextState);
                this.emit('state');
                return this.getState();
            } catch (error) {
                this.state.lastError = error && error.message ? error.message : String(error);
                this.emit('error', { message: this.state.lastError });
                throw error;
            }
        }

        async signMessage(message) {
            return this.withBusy('sign-message', async () => {
                await this.ensureWallet('Firmar mensaje');
                await this.ensureActionNetwork();

                const text = typeof message === 'string' && message.trim()
                    ? message.trim()
                    : `Sariel Wallet challenge ${new Date().toISOString()}`;
                const signature = await this.signer.signMessage(text);

                this.state.lastSignedMessage = text;
                this.state.lastSignature = signature;
                this.emit('signed', { message: text, signature });
                return { message: text, signature };
            });
        }

        async claimTokFromQr(code) {
            return this.withBusy('claim-tok', async () => {
                await this.ensureWallet('Reclamar S-TOK');
                await this.ensureActionNetwork();

                const cleanedCode = typeof code === 'string' ? code.trim() : '';
                if (!cleanedCode) {
                    throw new Error('El código QR es obligatorio para reclamar S-TOK.');
                }

                const contract = this.getStokContract(true);
                if (!contract) {
                    throw new Error('Configura CONFIG.WEB3_REWARDS.STOK_CONTRACT_ADDRESS para reclamar S-TOK.');
                }

                const tx = await contract.claimFromQR(cleanedCode);
                const receipt = await tx.wait();
                this.state.lastTransactionHash = receipt.transactionHash;
                await this.refreshState();
                return receipt;
            });
        }

        async claimNft() {
            return this.withBusy('claim-nft', async () => {
                await this.ensureWallet('Canjear NFT');
                await this.ensureActionNetwork();

                const tokContract = this.getStokContract(true);
                const nftContract = this.getSnftContract(true);

                if (!tokContract || !nftContract) {
                    throw new Error('Configura STOK_CONTRACT_ADDRESS y SNFT_CONTRACT_ADDRESS para canjear el NFT.');
                }

                const cost = global.ethers.BigNumber.from(String(this.config.nftClaimCost));
                const allowance = await tokContract.allowance(this.state.walletAddress, this.config.addresses.snft);

                if (allowance.lt(cost)) {
                    const approveTx = await tokContract.approve(this.config.addresses.snft, cost);
                    await approveTx.wait();
                }

                const tx = await nftContract.claimNFT();
                const receipt = await tx.wait();
                this.state.lastTransactionHash = receipt.transactionHash;
                await this.refreshState();
                return receipt;
            });
        }

        async adminMintReward(to) {
            return this.withBusy('admin-mint-reward', async () => {
                await this.ensureWallet('Mint admin-only');
                await this.ensureActionNetwork();
                this.assertAdminWallet();

                const destination = typeof to === 'string' ? to.trim() : '';
                if (!isRuntimeAddress(destination)) {
                    throw new Error('La wallet destino no es válida para el mint admin-only.');
                }

                const contract = this.getRewardContract(true);
                if (!contract) {
                    throw new Error('Configura CONFIG.WEB3_REWARDS.REWARD_NFT_ADDRESS para el mint admin-only.');
                }

                const owner = normalizeAddress(await contract.owner());
                if (this.config.strictAdminOnly && owner !== this.config.adminWallet) {
                    throw new Error(`Blindaje admin-only inválido: el owner on-chain debe ser ${this.config.adminWallet}.`);
                }

                const tx = await contract.mintReward(destination);
                const receipt = await tx.wait();
                this.state.lastTransactionHash = receipt.transactionHash;
                await this.refreshState();
                return receipt;
            });
        }

        bindProviderEvents() {
            if (!this.provider || !this.provider.on || !this.web3Provider) return;
            this.unbindProviderEvents();

            this.providerListeners = {
                accountsChanged: async (accounts) => {
                    if (!accounts || !accounts.length) {
                        await this.disconnect();
                        return;
                    }

                    this.signer = this.web3Provider.getSigner();
                    this.state.walletAddress = normalizeAddress(accounts[0]);
                    await this.refreshState();
                },
                chainChanged: async (chainHex) => {
                    this.state.chainId = Number(chainHex);
                    await this.refreshState();
                },
                disconnect: async () => {
                    await this.disconnect();
                }
            };

            this.provider.on('accountsChanged', this.providerListeners.accountsChanged);
            this.provider.on('chainChanged', this.providerListeners.chainChanged);
            this.provider.on('disconnect', this.providerListeners.disconnect);
        }

        unbindProviderEvents() {
            if (!this.provider || !this.provider.removeListener || !this.providerListeners) {
                this.providerListeners = null;
                return;
            }

            this.provider.removeListener('accountsChanged', this.providerListeners.accountsChanged);
            this.provider.removeListener('chainChanged', this.providerListeners.chainChanged);
            this.provider.removeListener('disconnect', this.providerListeners.disconnect);
            this.providerListeners = null;
        }

        async withBusy(key, callback) {
            if (this.state.busyKey) {
                throw new Error('Hay otra operación de wallet en curso. Espera a que termine.');
            }

            this.state.busyKey = key;
            this.emit('busy', { busyKey: key });

            try {
                this.state.lastError = '';
                return await callback();
            } catch (error) {
                this.state.lastError = error && error.message ? error.message : String(error);
                this.emit('error', { message: this.state.lastError });
                throw error;
            } finally {
                this.state.busyKey = '';
                this.emit('idle', { busyKey: key });
            }
        }
    }

    global.SarielPolygon = {
        ZERO_ADDRESS,
        PolygonWalletIntegration,
        createIntegration(options) {
            return new PolygonWalletIntegration(options);
        }
    };
}(window));
