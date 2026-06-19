const { expect } = require('chai');
const { ethers } = require('hardhat');

describe('Sariel loyalty contracts', function () {
    async function deployContracts() {
        const [deployer, admin, user, other] = await ethers.getSigners();

        const tokFactory = await ethers.getContractFactory('SarielTOK');
        const tok = await tokFactory.deploy(admin.address);
        await tok.waitForDeployment();

        const nftFactory = await ethers.getContractFactory('SarielNFT');
        const nft = await nftFactory.deploy(await tok.getAddress());
        await nft.waitForDeployment();

        return { deployer, admin, user, other, tok, nft };
    }

    it('claimFromQR acuña 1 STOK y evita reuso de código', async function () {
        const { user, other, tok } = await deployContracts();

        await expect(tok.connect(user).claimFromQR('SarielTO#001'))
            .to.emit(tok, 'CodeClaimed')
            .withArgs('SarielTO#001', user.address);

        expect(await tok.balanceOf(user.address)).to.equal(1n);
        expect(await tok.usedCodes('SarielTO#001')).to.equal(true);
        expect(await tok.codeClaimedBy('SarielTO#001')).to.equal(user.address);

        await expect(tok.connect(other).claimFromQR('SarielTO#001')).to.be.revertedWith('Code already used');
    });

    it('claimNFT consume 12 STOK con firma del usuario y mintea solo una vez', async function () {
        const { admin, user, tok, nft } = await deployContracts();

        await tok.connect(admin).mint(user.address, 12);
        await tok.connect(user).approve(await nft.getAddress(), 12);

        await expect(nft.connect(user).claimNFT())
            .to.emit(nft, 'NFTClaimed')
            .withArgs(user.address, 1);

        expect(await nft.balanceOf(user.address)).to.equal(1n);
        expect(await nft.hasMinted(user.address)).to.equal(true);
        expect(await tok.balanceOf(user.address)).to.equal(0n);
        expect(await tok.balanceOf(await nft.getAddress())).to.equal(12n);

        await expect(nft.connect(user).claimNFT()).to.be.revertedWith('Wallet already minted');
    });

    it('mantiene royalty ERC2981 al 10%', async function () {
        const { nft } = await deployContracts();
        const [receiver, amount] = await nft.royaltyInfo(1, 10000n);
        expect(receiver).to.equal('0x8F742964244AE588dF7C5B2b27Ded374fDdAd69b');
        expect(amount).to.equal(1000n);
    });
});
