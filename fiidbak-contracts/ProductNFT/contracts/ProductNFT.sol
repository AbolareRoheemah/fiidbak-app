// SPDX-License-Identifier: MIT
// Compatible with OpenZeppelin Contracts ^5.4.0
pragma solidity ^0.8.27;

import {ERC1155} from "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

contract MyToken is ERC1155, Ownable {
    uint256 private _nextTokenId;
    // product name, desc, and other info will be stored on IPFS
    struct Product {
        uint256 product_id;
        address product_owner;
        bytes ipfs_cid;
    }

    constructor(address initialOwner) ERC1155("") Ownable(initialOwner) {}

    event ProductMinted(address indexed product_owner, uint256 tokenId, uint256 amount);

    mapping (uint => Product) productbyId;
    mapping (address => Product[]) ownerProducts;
    mapping (address => mapping (uint => Product)) ownerProductByID;
    mapping(address => mapping(uint => bool)) ownerProductExists;

    function setURI(string memory newuri) public onlyOwner {
        _setURI(newuri);
    }

    function mintProduct(address product_owner, uint256 token_id, bytes memory ipfs_cid)
        public
    {
        require(product_owner != address(0), "invalid owner address");
        require(ipfs_cid.length != 0, "IPFS CID is required");
        require(!ownerProductExists[product_owner][token_id], "product with same ID exists");
        _mint(product_owner, token_id, 1, ipfs_cid);
    }

    function mintBatch(address to, uint256[] memory ids, uint256[] memory amounts, bytes memory data)
        public
        onlyOwner
    {
        _mintBatch(to, ids, amounts, data);
    }
}