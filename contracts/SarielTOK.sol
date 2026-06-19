// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

contract SarielTOK is ERC20, Ownable {
    mapping(string => bool) public usedCodes;
    mapping(string => address) public codeClaimedBy;

    event CodeClaimed(string indexed code, address indexed wallet);

    constructor(address adminWallet) ERC20("SarielTOK", "STOK") Ownable(adminWallet) {
        require(adminWallet != address(0), "Admin wallet invalida");
    }

    function decimals() public pure override returns (uint8) {
        return 0;
    }

    function mint(address to, uint256 amount) external onlyOwner {
        require(to != address(0), "Wallet invalida");
        require(amount > 0, "Amount invalido");
        _mint(to, amount);
    }

    function claimFromQR(string memory code) external {
        require(bytes(code).length > 0, "Invalid code");
        require(!usedCodes[code], "Code already used");

        usedCodes[code] = true;
        codeClaimedBy[code] = msg.sender;

        _mint(msg.sender, 1);
        emit CodeClaimed(code, msg.sender);
    }
}
