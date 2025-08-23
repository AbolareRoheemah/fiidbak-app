// SPDX-License-Identifier: MIT
// Compatible with OpenZeppelin Contracts ^5.4.0
pragma solidity ^0.8.27;

import {AccessControlUpgradeable} from "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import {ERC1155Upgradeable} from "@openzeppelin/contracts-upgradeable/token/ERC1155/ERC1155Upgradeable.sol";
import {ERC1155BurnableUpgradeable} from "@openzeppelin/contracts-upgradeable/token/ERC1155/extensions/ERC1155BurnableUpgradeable.sol";
import {Initializable} from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

contract BadgeNFT is Initializable, ERC1155Upgradeable, AccessControlUpgradeable, ERC1155BurnableUpgradeable {
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
    mapping(address => uint256) public userHighestTier;

    event BadgeMinted(address indexed user, uint256 indexed tierId, string ipfsCid);
    event BadgeDeleted(address indexed user, uint256 indexed tierId);
    event URISet(string newUri);

    function initialize(address defaultAdmin, address minter, string memory baseUri) public initializer {
        __ERC1155_init(baseUri);
        __AccessControl_init();
        __ERC1155Burnable_init();

        _grantRole(DEFAULT_ADMIN_ROLE, defaultAdmin);
        _grantRole(MINTER_ROLE, minter);
    }

    function setURI(string memory newuri) public onlyRole(URI_SETTER_ROLE) {
        _setURI(newuri);

        emit URISet(newuri);
    }

    function uri(uint256 tier_id) public view override returns (string memory) {
        string memory tokenURI = _tokenURIs[tier_id];
        if (bytes(tokenURI).length > 0) {
            return tokenURI;
        }
        return super.uri(tier_id);
    }

    function mintBadge(address user, uint256 tier_id, string memory ipfs_cid)
        public
        onlyRole(MINTER_ROLE)
    {
        require(user != address(0), "invalid user address");
        require(tier_id != 0, "invalid token id");
        require(balanceOf(user, tier_id) == 0, "user already owns this badge");

        _mint(user, tier_id, 1, bytes(ipfs_cid));
        _tokenURIs[tier_id] = string(abi.encodePacked("https://ipfs.io/ipfs/", ipfs_cid));
        if (tier_id > userHighestTier[user]) {
            userHighestTier[user] = tier_id;
            if (tier_id >= 2 && !hasRole(VOTER_ROLE, user)) {
                _grantRole(VOTER_ROLE, user);
            }
        }

        emit BadgeMinted(user, tier_id, ipfs_cid);
    }

    function mintBatch(address to, uint256[] memory ids, uint256[] memory amounts, bytes memory data)
        public
        onlyRole(MINTER_ROLE)
    {
        _mintBatch(to, ids, amounts, data);
    }

    function deleteBadge(address user, uint256 tier_id) public onlyRole(DEFAULT_ADMIN_ROLE) {
        require(user != address(0), "invalid user address");
        require(tier_id > 0, "invalid badge ID");
        require(balanceOf(user, tier_id) > 0, "user doesnt own this badge");

        _burn(user, tier_id, 1);

        if (tier_id == userHighestTier[user]) {
            userHighestTier[user] = tier_id - 1;
            if (userHighestTier[user] < 2) {
                _revokeRole(VOTER_ROLE, user);
            }
        }
        delete _tokenURIs[tier_id];

        emit BadgeDeleted(user, tier_id);
    }

    function getUserTier(address user) public view returns (uint) {
        return userHighestTier[user];
    }

   function getUserBadges(address user) public view returns (uint256[] memory) {
        uint256 badgeCount = 0;
        uint256 highestTier = userHighestTier[user];
        for (uint256 i = 1; i <= highestTier; i++) {
            if (balanceOf(user, i) > 0) {
                badgeCount++;
            }
        }

        uint256[] memory badges = new uint256[](badgeCount);
        uint256 index = 0;
        for (uint256 i = 1; i <= highestTier; i++) {
            if (balanceOf(user, i) > 0) {
                badges[index] = i;
                index++;
            }
        }
        return badges;
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