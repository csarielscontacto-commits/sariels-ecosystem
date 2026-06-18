const hre = require('hardhat');

const ADMIN_WALLET = process.env.ADMIN_WALLET || '0x8F742964244AE588dF7C5B2b27Ded374fDdAd69b';

async function main() {
    const [deployer] = await hre.ethers.getSigners();
    console.log(`Deploying with: ${deployer.address}`);

    const factory = await hre.ethers.getContractFactory('CookieRewardNFT');
    const contract = await factory.deploy(
        'Sariels Cookie Reward',
        'SCOOKIE',
        ADMIN_WALLET,
        'ipfs://REEMPLAZAR_BASE_URI/'
    );

    await contract.waitForDeployment();
    const address = await contract.getAddress();

    console.log(`CookieRewardNFT deployed to: ${address}`);
    console.log(`Admin/royalty/minter: ${ADMIN_WALLET}`);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
