// SPDX-License-Identifier: MIT
// Compatible with OpenZeppelin Contracts ^5.4.0
pragma solidity ^0.8.27;

import {ERC1155} from "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";
import {ERC1155Burnable} from "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Burnable.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

contract ProductNFT is ERC1155, Ownable, AccessControl, ERC1155Burnable {
    uint256 private _nextTokenId = 1;
    bytes32 public constant VERIFIER_ROLE = keccak256("VERIFIER_ROLE");
    bytes32 public constant CREATOR_ROLE = keccak256("CREATOR_ROLE");
    // product name, desc, and other info will be stored on IPFS
    struct Product {
        uint256 productId;
        address owner;
        string ipfsCid;
        uint256 createdAt;
        bool exists;
    }

    constructor() ERC1155("") Ownable(msg.sender) {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(VERIFIER_ROLE, msg.sender);
    }

    event ProductMinted(address indexed product_owner, uint256 tokenId, uint256 amount);
    event ProductDeleted(address indexed product_owner, uint256 tokenId, uint256 amount);
    event URISet(string newUri);
    event FeedbackManagerSet(address indexed feedbackManager);

    address public feedbackManager;
    mapping (uint256 => Product) public productsById;
    uint256[] private _allProductIds; // Track all product IDs for efficient iteration
    mapping(uint256 => string) private _tokenURIs;

    function setURI(string memory newuri) public onlyOwner {
        _setURI(newuri);
        emit URISet(newuri);
    }

    function setFeedbackManager(address _feedbackManager) external onlyOwner {
        require(_feedbackManager != address(0), "Invalid feedback manager address");
        feedbackManager = _feedbackManager;
        emit FeedbackManagerSet(_feedbackManager);
    }

    function uri(uint256 tokenId) public view override returns (string memory) {
        string memory tokenURI = _tokenURIs[tokenId];
        if (bytes(tokenURI).length > 0) {
            return tokenURI;
        }
        return super.uri(tokenId);
    }

    function mintProduct(address product_owner, uint256 amount, string memory ipfs_cid)
        public
    {
        require(product_owner != address(0), "invalid owner address");
        require(product_owner == msg.sender, "can only mint for yourself");
        require(bytes(ipfs_cid).length != 0, "IPFS CID is required");
        require(amount > 0, "Amount must be positive");

        uint256 tokenId = _nextTokenId++;

        Product memory newProduct = Product({
            productId: tokenId,
            owner: product_owner,
            ipfsCid: ipfs_cid,
            createdAt: block.timestamp,
            exists: true
        });

        productsById[tokenId] = newProduct;
        _allProductIds.push(tokenId);

        _mint(product_owner, tokenId, amount, "");
        _tokenURIs[tokenId] = string(abi.encodePacked("https://ipfs.io/ipfs/", ipfs_cid));
        _grantRole(CREATOR_ROLE, product_owner);

        emit ProductMinted(product_owner, tokenId, amount);
    }

    function deleteProduct(uint256 product_id) public onlyRole(CREATOR_ROLE) {
        require(msg.sender != address(0), "Invalid address");
        require(balanceOf(msg.sender, product_id) > 0, "You dont own this product");
        require(productsById[product_id].exists, "Product does not exist");

        uint256 amt = balanceOf(msg.sender, product_id);
        _burn(msg.sender, product_id, amt);
        productsById[product_id].exists = false;
        delete _tokenURIs[product_id];

        emit ProductDeleted(msg.sender, product_id, amt);
    }

    function deleteProductAdmin(address product_owner, uint256 product_id) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(product_owner != address(0), "Invalid address");
        require(balanceOf(product_owner, product_id) > 0, "Owner doesn't own the product");
        require(productsById[product_id].exists, "Product does not exist");

        uint256 amt = balanceOf(product_owner, product_id);
        _burn(product_owner, product_id, amt);
        productsById[product_id].exists = false;
        delete _tokenURIs[product_id];

        emit ProductDeleted(product_owner, product_id, amt);
    }

    function addVerifier(address verifier) external onlyRole(DEFAULT_ADMIN_ROLE) {
        _grantRole(VERIFIER_ROLE, verifier);
    }

    function removeVerifier(address verifier) external onlyRole(DEFAULT_ADMIN_ROLE) {
        _revokeRole(VERIFIER_ROLE, verifier);
    }

    function getProduct(uint256 product_id) external view returns (Product memory) {
        require(product_id > 0 && product_id < _nextTokenId, "invalid product ID");
        require(productsById[product_id].exists, "Product does not exist");
        return productsById[product_id];
    }

    function getProductWithFeedbackCount(uint256 product_id) external view returns (Product memory, uint256) {
        require(product_id > 0 && product_id < _nextTokenId, "invalid product ID");
        require(productsById[product_id].exists, "Product does not exist");

        uint256 feedbackCount = 0;
        if (feedbackManager != address(0)) {
            try IFeedbackManager(feedbackManager).getProductFeedbackCount(product_id) returns (uint256 count) {
                feedbackCount = count;
            } catch {}
        }

        return (productsById[product_id], feedbackCount);
    }

    function getAllProducts(uint256 product_count, uint256 start_index) external view returns (Product[] memory) {
        require(product_count > 0, "invalid count");

        // Handle empty product list
        if (_allProductIds.length == 0) {
            return new Product[](0);
        }

        require(start_index < _allProductIds.length, "start index out of bounds");

        uint256 availableProducts = _allProductIds.length - start_index;
        uint256 returnCount = availableProducts < product_count ? availableProducts : product_count;

        Product[] memory products = new Product[](returnCount);
        uint256 validCount = 0;

        for (uint256 i = 0; i < returnCount; i++) {
            uint256 productId = _allProductIds[start_index + i];
            if (productsById[productId].exists) {
                products[validCount] = productsById[productId];
                validCount++;
            }
        }

        // Resize array to only include valid products
        assembly {
            mstore(products, validCount)
        }

        return products;
    }

    function getOwnerProducts(address product_owner, uint256 product_count, uint256 start_index) external view returns (Product[] memory) {
        require(product_owner != address(0), "invalid product owner address");
        require(product_count > 0, "invalid count");

        // Handle empty product list
        if (_allProductIds.length == 0) {
            return new Product[](0);
        }

        require(start_index < _allProductIds.length, "start index out of bounds");

        uint256 availableProducts = _allProductIds.length - start_index;
        uint256 searchCount = availableProducts < product_count * 2 ? availableProducts : product_count * 2;

        Product[] memory products = new Product[](product_count);
        uint256 validCount = 0;

        for (uint256 i = 0; i < searchCount && validCount < product_count; i++) {
            uint256 productId = _allProductIds[start_index + i];
            if (productsById[productId].exists && balanceOf(product_owner, productId) > 0) {
                products[validCount] = productsById[productId];
                validCount++;
            }
        }

        // Resize array to only include valid products
        assembly {
            mstore(products, validCount)
        }

        return products;
    }

    function getTotalProducts() external view returns (uint256) {
        return _nextTokenId - 1;
    }

    function getTotalValidProducts() external view returns (uint256) {
        uint256 validCount = 0;
        for (uint256 i = 0; i < _allProductIds.length; i++) {
            if (productsById[_allProductIds[i]].exists) {
                validCount++;
            }
        }
        return validCount;
    }

    function productExists(uint256 product_id) external view returns (bool) {
        return productsById[product_id].exists;
    }

    function verifyProof(bytes calldata proof, address user) internal pure returns (bool) {
        // ECDSA recover for a signed message
        // Assumes `proof` is the signature, and `user` is the expected signer.
        // You must hash the message in the same way it was signed (e.g., using eth_sign or EIP-191).
        // For demonstration, let's assume the message is simply the user's address.
        bytes32 messageHash = keccak256(abi.encodePacked(user));
        bytes32 ethSignedMessageHash = keccak256(
            abi.encodePacked("\x19Ethereum Signed Message:\n32", messageHash)
        );

        // Signature must be 65 bytes (r,s,v)
        if (proof.length != 65) {
            return false;
        }
        bytes32 r;
        bytes32 s;
        uint8 v;
        // solhint-disable-next-line no-inline-assembly
        assembly {
            r := calldataload(proof.offset)
            s := calldataload(add(proof.offset, 32))
            v := byte(0, calldataload(add(proof.offset, 64)))
        }
        // EIP-2 still allows only lower s values, and v should be 27 or 28
        if (v < 27) v += 27;
        if (v != 27 && v != 28) {
            return false;
        }
        address recovered = ecrecover(ethSignedMessageHash, v, r, s);
        return (recovered == user);
    }

    function supportsInterface(bytes4 interfaceId) public view override(ERC1155, AccessControl) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}

interface IFeedbackManager {
    function getProductFeedbackCount(uint256 productId) external view returns (uint256);
}