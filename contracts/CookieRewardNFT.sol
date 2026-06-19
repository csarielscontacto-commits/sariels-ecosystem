// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ERC2981} from "@openzeppelin/contracts/token/common/ERC2981.sol";

contract CookieRewardNFT is ERC721, ERC2981, Ownable {
    uint256 private _nextTokenId;
    mapping(address => bool) public authorizedMinters;
    string private _baseTokenURI;

    event AuthorizedMinterUpdated(address indexed minter, bool enabled);
    event RewardMinted(address indexed minter, address indexed to, uint256 indexed tokenId);

    constructor(
        string memory name_,
        string memory symbol_,
        address adminWallet,
        string memory baseTokenURI_
    ) ERC721(name_, symbol_) Ownable(adminWallet) {
        require(adminWallet != address(0), "Admin wallet invalida");
        _baseTokenURI = baseTokenURI_;

        _setDefaultRoyalty(adminWallet, 1000); // 1000 bps = 10%
        authorizedMinters[adminWallet] = true;
        emit AuthorizedMinterUpdated(adminWallet, true);
    }

    modifier onlyAuthorizedMinter() {
        require(authorizedMinters[msg.sender], "No autorizado para mintear");
        _;
    }

    function setAuthorizedMinter(address minter, bool enabled) external onlyOwner {
        require(minter != address(0), "Minter invalido");
        authorizedMinters[minter] = enabled;
        emit AuthorizedMinterUpdated(minter, enabled);
    }

    function mintReward(address to) external onlyAuthorizedMinter returns (uint256) {
        require(to != address(0), "Destinatario invalido");

        _nextTokenId += 1;
        uint256 tokenId = _nextTokenId;
        _safeMint(to, tokenId);

        emit RewardMinted(msg.sender, to, tokenId);
        return tokenId;
    }

    function setBaseURI(string calldata newBaseTokenURI) external onlyOwner {
        _baseTokenURI = newBaseTokenURI;
    }

    function setDefaultRoyalty(address receiver, uint96 feeNumerator) external onlyOwner {
        require(receiver != address(0), "Receiver invalido");
        _setDefaultRoyalty(receiver, feeNumerator);
    }

    function totalMinted() external view returns (uint256) {
        return _nextTokenId;
    }

    function _baseURI() internal view override returns (string memory) {
        return _baseTokenURI;
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC2981)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
