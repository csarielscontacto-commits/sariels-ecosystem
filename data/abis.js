const CONTRACT_ABIS = {
    SarielTOK: [
        'function claimFromQR(string code) external',
        'function balanceOf(address account) view returns (uint256)',
        'function symbol() view returns (string)',
        'function name() view returns (string)',
        'function usedCodes(string code) view returns (bool)',
        'function codeClaimedBy(string code) view returns (address)',
        'function allowance(address owner, address spender) view returns (uint256)',
        'function approve(address spender, uint256 amount) external returns (bool)',
        'event CodeClaimed(string indexed code, address indexed wallet)'
    ],
    SarielNFT: [
        'function claimNFT() external returns (uint256)',
        'function hasMinted(address wallet) view returns (bool)',
        'function balanceOf(address owner) view returns (uint256)'
    ]
};

if (typeof window !== 'undefined') {
    window.CONTRACT_ABIS = CONTRACT_ABIS;
}

if (typeof module !== 'undefined') {
    module.exports = CONTRACT_ABIS;
}
