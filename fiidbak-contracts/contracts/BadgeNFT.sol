// SPDX-License-Identifier: MIT
// Compatible with OpenZeppelin Contracts ^5.4.0
pragma solidity ^0.8.27;

import {AccessControlUpgradeable} from "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import {ERC1155Upgradeable} from "@openzeppelin/contracts-upgradeable/token/ERC1155/ERC1155Upgradeable.sol";
import {ERC1155BurnableUpgradeable} from "@openzeppelin/contracts-upgradeable/token/ERC1155/extensions/ERC1155BurnableUpgradeable.sol";
import {Initializable} from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

contract MyToken is Initializable, ERC1155Upgradeable, AccessControlUpgradeable, ERC1155BurnableUpgradeable {
    bytes32 public constant URI_SETTER_ROLE = keccak256("URI_SETTER_ROLE");
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant VOTER_ROLE = keccak256("VOTER_ROLE");
    uint256 public constant SEEDLING = 1;
    uint256 public constant WOODEN = 2;
    uint256 public constant BRONZE = 3;
    uint256 public constant SILVER = 4;
    uint256 public constant GOLD = 5;

    // struct User {
    //     address user_address;
    //     uint8 user_tier;
    //     uint256 reviews_given;
    //     uint256 approved_reviews;
    // }

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    mapping(uint256 => string) private _tokenURIs;
    mapping (address => uint) userTier;

    function initialize(address defaultAdmin, address minter) public initializer {
        __ERC1155_init("");
        __AccessControl_init();
        __ERC1155Burnable_init();

        _grantRole(DEFAULT_ADMIN_ROLE, defaultAdmin);
        _grantRole(MINTER_ROLE, minter);
    }

    function setURI(string memory newuri) public onlyRole(URI_SETTER_ROLE) {
        _setURI(newuri);
    }

    function uri(uint256 tier_id) public view override returns (string memory) {
        string memory tokenURI = _tokenURIs[tier_id];
        if (bytes(tokenURI).length > 0) {
            return tokenURI;
        }
        return super.uri(tier_id);
    }

    function mintBadge(address user, uint256 tier_id, bytes memory ipfs_cid)
        public
        onlyRole(MINTER_ROLE)
    {
        require(user != address(0), "invalid user address");
        require(tier_id != 0, "invalid token id");
        require(balanceOf(user, tier_id) == 0, "user already owns this badge");

        _mint(user, tier_id, 1, ipfs_cid);
        _tokenURIs[tier_id] = string(abi.encodePacked("https://ipfs.io/ipfs/", ipfs_cid));
        userTier[user] = tier_id;

        if (tier_id == 2) {
            _grantRole(VOTER_ROLE, user);
        }
    }

    function mintBatch(address to, uint256[] memory ids, uint256[] memory amounts, bytes memory data)
        public
        onlyRole(MINTER_ROLE)
    {
        _mintBatch(to, ids, amounts, data);
    }

    function getUserTier(address user) public view returns (uint) {
        return userTier[user];
    }

    // The following functions are overrides required by Solidity.
    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC1155Upgradeable, AccessControlUpgradeable)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

    // Disable transfers (soulbound)
    function safeTransferFrom(address from, address to, uint256 id, uint256 amount, bytes memory data) public override {
        require(from == address(0), "Badges are soulbound");
        super.safeTransferFrom(from, to, id, amount, data);
    }

    function safeBatchTransferFrom(address from, address to, uint256[] memory ids, uint256[] memory amounts, bytes memory data) public override {
        require(from == address(0), "Badges are soulbound");
        super.safeBatchTransferFrom(from, to, ids, amounts, data);
    }
}