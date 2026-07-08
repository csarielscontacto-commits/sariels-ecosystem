const CHAIN_ID = Number(CONFIG?.WEB3_REWARDS?.CHAIN?.ID || 80002);
const CHAIN_HEX = CONFIG?.WEB3_REWARDS?.CHAIN?.HEX_ID || '0x13882';
const QR_CODES_URL = CONFIG?.WEB3_REWARDS?.QR_CODES_URL || 'https://raw.githubusercontent.com/csarielscontacto-commits/sariels-ecosystem/main/data/codigos-qr.json';
const STOK_ADDRESS = CONFIG?.WEB3_REWARDS?.STOK_CONTRACT_ADDRESS || '0x0000000000000000000000000000000000000000';
const SNFT_ADDRESS = CONFIG?.WEB3_REWARDS?.SNFT_CONTRACT_ADDRESS || '0x0000000000000000000000000000000000000000';

const state = {
  code: '',
  codeData: null,
  wallet: null,
  provider: null,
  web3Provider: null,
  signer: null,
  tokContract: null,
  nftContract: null,
  connectedChainId: null,
  claimUsed: false,
  web3Modal: null
};

const $ = (id) => document.getElementById(id);

function setStatus(text, type = '') {
  const el = $('statusBox');
  el.className = `status ${type}`.trim();
  el.textContent = text;
}

function launchConfetti() {
  const box = $('confetti');
  box.innerHTML = '';
  box.classList.remove('hidden');
  const colors = ['#667eea', '#764ba2', '#22c55e', '#f59e0b', '#ef4444'];

  for (let i = 0; i < 40; i += 1) {
    const item = document.createElement('span');
    item.style.left = `${Math.random() * 100}%`;
    item.style.background = colors[i % colors.length];
    item.style.animationDelay = `${Math.random() * 0.25}s`;
    box.appendChild(item);
  }

  setTimeout(() => box.classList.add('hidden'), 1500);
}

function renderCookies(balance) {
  const board = $('cookieBoard');
  board.innerHTML = '';
  const b = Number(balance || 0);

  for (let i = 1; i <= 12; i += 1) {
    const item = document.createElement('div');
    item.className = `cookie ${i <= b ? 'on' : ''}`;
    item.textContent = '🍪';
    board.appendChild(item);
  }
}

function setMeta(text) {
  $('metaBox').textContent = text;
}

function getCodeFromUrl() {
  const url = new URL(window.location.href);
  return (url.searchParams.get('code') || '').trim();
}

async function fetchCodes() {
  const response = await fetch(QR_CODES_URL, { cache: 'no-store' });
  if (!response.ok) throw new Error('No se pudo cargar base de códigos QR');
  return response.json();
}

async function validateCodeFromJson() {
  if (!state.code) throw new Error('Código QR no proporcionado');
  const list = await fetchCodes();
  const found = list.find((item) => item.codigo === state.code || item.code === state.code);
  if (!found) throw new Error('Código QR inválido');
  state.codeData = found;

  const status = found.estado || found.status || 'disponible';
  if (status !== 'disponible') {
    throw new Error('Código marcado como no disponible en catálogo');
  }
}

function buildWeb3Modal() {
  const projectId = CONFIG?.WEB3_REWARDS?.WALLETCONNECT_PROJECT_ID || '';
  state.web3Modal = new window.Web3Modal.default({
    cacheProvider: false,
    providerOptions: {
      walletconnect: {
        package: window.WalletConnectProvider.default,
        options: {
          projectId,
          rpc: { [CHAIN_ID]: CONFIG?.WEB3_REWARDS?.CHAIN?.RPC_URL || 'https://rpc-amoy.polygon.technology' },
          chainId: CHAIN_ID,
          qrcode: true,
          showQrModal: true
        }
      }
    }
  });
}

async function connectWallet() {
  const provider = await state.web3Modal.connect();
  const web3Provider = new ethers.providers.Web3Provider(provider, 'any');
  const signer = web3Provider.getSigner();
  const wallet = await signer.getAddress();
  const network = await web3Provider.getNetwork();

  state.provider = provider;
  state.web3Provider = web3Provider;
  state.signer = signer;
  state.wallet = wallet;
  state.connectedChainId = Number(network.chainId);
  state.tokContract = new ethers.Contract(STOK_ADDRESS, CONTRACT_ABIS.SarielTOK, signer);
  state.nftContract = new ethers.Contract(SNFT_ADDRESS, CONTRACT_ABIS.SarielNFT, signer);

  $('walletLabel').textContent = `${wallet.slice(0, 6)}...${wallet.slice(-4)}`;
  $('claimBtn').classList.remove('hidden');

  await refreshUI();
}

async function switchToAmoy() {
  if (!state.provider) return;

  try {
    await state.provider.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: CHAIN_HEX }]
    });
  } catch (error) {
    if (error?.code === 4902) {
      await state.provider.request({
        method: 'wallet_addEthereumChain',
        params: [{
          chainId: CHAIN_HEX,
          chainName: CONFIG?.WEB3_REWARDS?.CHAIN?.NAME || 'Polygon Amoy',
          rpcUrls: [CONFIG?.WEB3_REWARDS?.CHAIN?.RPC_URL || 'https://rpc-amoy.polygon.technology'],
          nativeCurrency: { name: 'POL', symbol: 'POL', decimals: 18 },
          blockExplorerUrls: [CONFIG?.WEB3_REWARDS?.CHAIN?.EXPLORER || 'https://amoy.polygonscan.com']
        }]
      });
    } else {
      throw error;
    }
  }

  const network = await state.web3Provider.getNetwork();
  state.connectedChainId = Number(network.chainId);
  await refreshUI();
}

async function getClaimEventDate(contract, code) {
  try {
    const filter = contract.filters.CodeClaimed(code, null);
    const events = await contract.queryFilter(filter, 0, 'latest');
    if (!events.length) return null;
    const block = await state.web3Provider.getBlock(events[0].blockNumber);
    return new Date(block.timestamp * 1000).toISOString();
  } catch (_) {
    return null;
  }
}

async function refreshUI() {
  if (!state.web3Provider || !state.wallet || !state.tokContract || !state.nftContract) {
    renderCookies(0);
    return;
  }

  const chainOk = state.connectedChainId === CHAIN_ID;
  $('switchBtn').classList.toggle('hidden', chainOk);
  $('claimBtn').disabled = !chainOk;

  if (!chainOk) {
    setStatus('Conéctate a Polygon Amoy para reclamar.', 'error');
    return;
  }

  const used = await state.tokContract.usedCodes(state.code);
  state.claimUsed = used;

  if (used) {
    const claimedBy = await state.tokContract.codeClaimedBy(state.code);
    const claimedDate = await getClaimEventDate(state.tokContract, state.code);
    setStatus(`Este código ya fue reclamado por ${claimedBy}${claimedDate ? ` el ${new Date(claimedDate).toLocaleString('es-MX')}` : ''}.`, 'error');
    $('claimBtn').disabled = true;
  } else {
    setStatus('Código válido y disponible para reclamar.', 'ok');
  }

  const balance = await state.tokContract.balanceOf(state.wallet);
  const balanceNum = Number(balance.toString());
  $('balanceLabel').textContent = String(balanceNum);
  renderCookies(balanceNum);

  const hasMinted = await state.nftContract.hasMinted(state.wallet);
  const canClaimNft = balanceNum >= 12 && !hasMinted;
  $('nftBtn').classList.toggle('hidden', !canClaimNft);
  $('nftBtn').disabled = !canClaimNft;

  setMeta(`STOK: ${STOK_ADDRESS}\nSNFT: ${SNFT_ADDRESS}\nCódigo: ${state.code}`);
}

async function claimTOK() {
  if (!state.tokContract) return;
  $('claimBtn').disabled = true;

  try {
    const tx = await state.tokContract.claimFromQR(state.code);
    setStatus('Transacción enviada. Esperando confirmación...', 'ok');
    await tx.wait();
    launchConfetti();
    await refreshUI();
    setStatus('¡TOK reclamado exitosamente! +1 STOK', 'ok');
  } catch (error) {
    setStatus(error?.reason || error?.message || 'No se pudo reclamar el TOK', 'error');
  } finally {
    $('claimBtn').disabled = false;
  }
}

async function claimNFT() {
  if (!state.tokContract || !state.nftContract) return;
  $('nftBtn').disabled = true;

  try {
    const needed = ethers.BigNumber.from(12);
    const allowance = await state.tokContract.allowance(state.wallet, SNFT_ADDRESS);

    if (allowance.lt(needed)) {
      setStatus('Aprobando uso de 12 STOK para mint NFT...', 'ok');
      const approveTx = await state.tokContract.approve(SNFT_ADDRESS, needed);
      await approveTx.wait();
    }

    const tx = await state.nftContract.claimNFT();
    setStatus('Mint de NFT enviado. Esperando confirmación...', 'ok');
    await tx.wait();
    launchConfetti();
    await refreshUI();
    setStatus('¡NFT reclamado con éxito! 🎉', 'ok');
  } catch (error) {
    setStatus(error?.reason || error?.message || 'No se pudo reclamar el NFT', 'error');
  } finally {
    $('nftBtn').disabled = false;
  }
}

async function init() {
  state.code = getCodeFromUrl();
  $('codeLabel').textContent = state.code || 'Sin código';
  renderCookies(0);

  if (STOK_ADDRESS === '0x0000000000000000000000000000000000000000' || SNFT_ADDRESS === '0x0000000000000000000000000000000000000000') {
    setStatus('Configura direcciones STOK/SNFT en config.js.', 'error');
    $('connectBtn').disabled = true;
    return;
  }

  try {
    await validateCodeFromJson();
    setStatus('Código encontrado en catálogo. Conecta wallet para validar on-chain.', 'ok');
  } catch (error) {
    setStatus(error.message, 'error');
    $('connectBtn').disabled = true;
    $('claimBtn').classList.add('hidden');
    return;
  }

  buildWeb3Modal();

  $('connectBtn').addEventListener('click', async () => {
    try {
      await connectWallet();
    } catch (error) {
      setStatus(error?.message || 'No se pudo conectar wallet', 'error');
    }
  });

  $('switchBtn').addEventListener('click', async () => {
    try {
      await switchToAmoy();
    } catch (error) {
      setStatus(error?.message || 'No se pudo cambiar de red', 'error');
    }
  });

  $('claimBtn').addEventListener('click', claimTOK);
  $('nftBtn').addEventListener('click', claimNFT);
}

init();
