const { expect } = require('chai');
const { ethers } = require('hardhat');

describe('CookieRewardNFT', function () {
    it('configura royalty 10% y permite minteo solo autorizado', async function () {
        const [deployer, admin, user, outsider] = await ethers.getSigners();

        const factory = await ethers.getContractFactory('CookieRewardNFT');
        const contract = await factory.deploy(
            'Sariels Cookie Reward',
            'SCOOKIE',
            admin.address,
            'ipfs://base/'
        );
        await contract.waitForDeployment();

        const salePrice = ethers.parseEther('1');
        const [receiver, amount] = await contract.royaltyInfo(1, salePrice);
        expect(receiver).to.equal(admin.address);
        expect(amount).to.equal(ethers.parseEther('0.1'));

        await expect(contract.connect(outsider).mintReward(user.address)).to.be.revertedWith('No autorizado para mintear');

        const tx = await contract.connect(admin).mintReward(user.address);
        await tx.wait();

        expect(await contract.ownerOf(1)).to.equal(user.address);
        expect(await contract.totalMinted()).to.equal(1);
    });
});
