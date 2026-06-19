// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {ERC721URIStorage} from "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import {ERC2981} from "@openzeppelin/contracts/token/common/ERC2981.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract SarielNFT is ERC721URIStorage, ERC2981, Ownable {
    uint256 public constant TOKS_REQUIRED = 12;
    address public constant ADMIN_WALLET = 0x8F742964244AE588dF7C5B2b27Ded374fDdAd69b;

    IERC20 public immutable sarielTOK;
    uint256 private _nextTokenId;

    mapping(address => bool) public hasMinted;

    event NFTClaimed(address indexed wallet, uint256 tokenId);

    constructor(address sarielTOKAddress)
        ERC721("Sariel Cookie NFT", "SCNFT")
        Ownable(ADMIN_WALLET)
    {
        require(sarielTOKAddress != address(0), "SarielTOK invalido");

        sarielTOK = IERC20(sarielTOKAddress);
        _setDefaultRoyalty(ADMIN_WALLET, 1000);
    }

    function claimNFT() external returns (uint256) {
        require(!hasMinted[msg.sender], "Wallet already minted");
        require(sarielTOK.balanceOf(msg.sender) >= TOKS_REQUIRED, "Need at least 12 STOK");

        bool transferred = sarielTOK.transferFrom(msg.sender, address(this), TOKS_REQUIRED);
        require(transferred, "STOK transfer failed");

        hasMinted[msg.sender] = true;
        _nextTokenId += 1;

        uint256 tokenId = _nextTokenId;
        _safeMint(msg.sender, tokenId);

        emit NFTClaimed(msg.sender, tokenId);
        return tokenId;
    }

    function totalMinted() external view returns (uint256) {
        return _nextTokenId;
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721URIStorage, ERC2981)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
