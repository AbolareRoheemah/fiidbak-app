//  SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {AccessControlUpgradeable} from "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import {Initializable} from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

contract FiidbakManager is Initializable, AccessControlUpgradeable {
    uint8 constant WOOD_VOTE_WEIGHT = 1;
    uint8 constant BRONZE_VOTE_WEIGHT = 1;
    uint8 constant SILVER_VOTE_WEIGHT = 1;
    uint8 constant GOLD_VOTE_WEIGHT = 1;

    struct Feedback {
        uint256 feedback_id;
        address feedback_by;
        uint256 product_id;
        bool approved;
        string feedback_hash;
    }

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    event FeedbackSubmitted(address user, uint256 product_id, string feedback_hash);

    function initialize(address defaultAdmin) public initializer {
        __AccessControl_init();

        _grantRole(DEFAULT_ADMIN_ROLE, defaultAdmin);
    }

    function submitFeedbak(uint256 product_id, string memory feedback_hash) external {
        
    }

    function voteOnFeedback(uint256 product_id) external {
        
    }

    function approveFeedback(uint256 feedback_id) external {
        
    }
}