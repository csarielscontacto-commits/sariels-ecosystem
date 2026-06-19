const fs = require('fs');
const path = require('path');
const hre = require('hardhat');

const ADMIN_WALLET = process.env.ADMIN_WALLET || '0x8F742964244AE588dF7C5B2b27Ded374fDdAd69b';

async function main() {
    const [deployer] = await hre.ethers.getSigners();
    const network = await hre.ethers.provider.getNetwork();

    console.log(`Deploying with: ${deployer.address}`);
    console.log(`Admin wallet: ${ADMIN_WALLET}`);

    const tokFactory = await hre.ethers.getContractFactory('SarielTOK');
    const tokContract = await tokFactory.deploy(ADMIN_WALLET);
    await tokContract.waitForDeployment();
    const tokAddress = await tokContract.getAddress();

    console.log(`SarielTOK deployed to: ${tokAddress}`);

    const nftFactory = await hre.ethers.getContractFactory('SarielNFT');
    const nftContract = await nftFactory.deploy(tokAddress);
    await nftContract.waitForDeployment();
    const nftAddress = await nftContract.getAddress();

    console.log(`SarielNFT deployed to: ${nftAddress}`);

    const outputPath = path.join(__dirname, '..', 'data', 'deployed-contracts.json');
    const payload = {
        network: {
            name: network.name,
            chainId: Number(network.chainId)
        },
        admin_wallet: ADMIN_WALLET,
        deployed_at: new Date().toISOString(),
        contracts: {
            SarielTOK: tokAddress,
            SarielNFT: nftAddress
        }
    };

    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    fs.writeFileSync(outputPath, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');

    console.log(`Saved deployment data to: ${outputPath}`);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
