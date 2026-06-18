require('@nomicfoundation/hardhat-toolbox');
require('dotenv').config();

const AMOY_RPC_URL = process.env.AMOY_RPC_URL || 'https://rpc-amoy.polygon.technology';
const PRIVATE_KEY = process.env.PRIVATE_KEY || '';
const POLYGONSCAN_API_KEY = process.env.POLYGONSCAN_API_KEY || '';

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
    solidity: {
        version: '0.8.24',
        settings: {
            optimizer: {
                enabled: true,
                runs: 200
            }
        }
    },
    networks: {
        amoy: {
            url: AMOY_RPC_URL,
            chainId: 80002,
            accounts: PRIVATE_KEY ? [PRIVATE_KEY] : []
        }
    },
    etherscan: {
        apiKey: {
            polygonAmoy: POLYGONSCAN_API_KEY
        }
    }
};
