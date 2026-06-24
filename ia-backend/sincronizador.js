const { ethers } = require('ethers');

const RPC_URL = 'https://rpc-amoy.polygon.technology/';
const CONTRACT_ADDRESS = '0x0000000000000000000000000000000000000000';

const CONTRACT_ABI = [
    'function balanceOf(address owner) view returns (uint256)',
    'function ownerOf(uint256 tokenId) view returns (address)',
    'event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)'
];

class SincronizadorWeb3 {
    constructor() {
        this.provider = new ethers.JsonRpcProvider(RPC_URL);
        this.contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, this.provider);
        console.log('✅ Sincronizador Web3 iniciado');
    }
    
    async obtenerTOKs(direccionWallet) {
        try {
            const balance = await this.contract.balanceOf(direccionWallet);
            return Number(balance);
        } catch (error) {
            console.warn('Error obteniendo TOKs:', error.message);
            return 0;
        }
    }
    
    async verificarNFT(direccionWallet, tokenId) {
        try {
            const owner = await this.contract.ownerOf(tokenId);
            return owner.toLowerCase() === direccionWallet.toLowerCase();
        } catch (error) {
            return false;
        }
    }
    
    escucharEventos() {
        console.log('👂 Escuchando eventos de Transfer...');
        this.contract.on('Transfer', (from, to, tokenId, event) => {
            console.log(`🔄 NFT Transfer: ${tokenId} de ${from} a ${to}`);
        });
        return () => {
            this.contract.removeAllListeners();
            console.log('👂 Escucha detenida');
        };
    }
}

module.exports = SincronizadorWeb3;
