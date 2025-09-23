//  SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {AccessControlUpgradeable} from "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import {Initializable} from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

contract FiidbakManager is Initializable, AccessControlUpgradeable {
    uint8 constant WOOD_VOTE_WEIGHT = 1;
    uint8 constant BRONZE_VOTE_WEIGHT = 2;
    uint8 constant SILVER_VOTE_WEIGHT = 3;
    uint8 constant GOLD_VOTE_WEIGHT = 5;

    bytes32 public constant VOTER_ROLE = keccak256("VOTER_ROLE");
    bytes32 public constant APPROVER_ROLE = keccak256("APPROVER_ROLE");

    struct Feedback {
        uint256 feedback_id;
        address feedback_by;
        uint256 product_id;
        bool approved;
        string feedback_hash;
        uint256 total_votes;
        uint256 positive_votes;
        uint256 negative_votes;
        uint256 timestamp;
    }

    struct Vote {
        address voter;
        bool is_positive;
        uint256 weight;
        uint256 timestamp;
    }

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    event FeedbackSubmitted(uint256 indexed feedback_id, address indexed user, uint256 indexed product_id, string feedback_hash);
    event FeedbackVoted(uint256 indexed feedback_id, address indexed voter, bool is_positive, uint256 weight);
    event FeedbackApproved(uint256 indexed feedback_id, address indexed approver);
    event BadgeContractSet(address indexed badgeContract);

    // State variables
    uint256 private _nextFeedbackId = 1;
    address public badgeContract;
    
    // Mappings
    mapping(uint256 => Feedback) public feedbacks;
    mapping(uint256 => Vote[]) public feedbackVotes;
    mapping(uint256 => mapping(address => bool)) public hasVoted;
    mapping(uint256 => uint256[]) public productFeedbacks;

    // Storage gap for upgradeability
    uint256[40] private __gap;

    function initialize(address defaultAdmin, address _badgeContract) public initializer {
        __AccessControl_init();

        _grantRole(DEFAULT_ADMIN_ROLE, defaultAdmin);
        _grantRole(APPROVER_ROLE, defaultAdmin);
        badgeContract = _badgeContract;
    }

    function setBadgeContract(address _badgeContract) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(_badgeContract != address(0), "Invalid badge contract address");
        badgeContract = _badgeContract;
        emit BadgeContractSet(_badgeContract);
    }

    function submitFeedback(uint256 product_id, string memory feedback_hash) external {
        require(product_id > 0, "Invalid product ID");
        require(bytes(feedback_hash).length > 0, "Feedback hash cannot be empty");
        require(msg.sender != address(0), "Invalid sender address");

        uint256 feedback_id = _nextFeedbackId++;
        
        Feedback memory newFeedback = Feedback({
            feedback_id: feedback_id,
            feedback_by: msg.sender,
            product_id: product_id,
            approved: false,
            feedback_hash: feedback_hash,
            total_votes: 0,
            positive_votes: 0,
            negative_votes: 0,
            timestamp: block.timestamp
        });

        feedbacks[feedback_id] = newFeedback;
        productFeedbacks[product_id].push(feedback_id);

        emit FeedbackSubmitted(feedback_id, msg.sender, product_id, feedback_hash);
    }

    function voteOnFeedback(uint256 feedback_id, bool is_positive) external {
        require(feedback_id > 0 && feedback_id < _nextFeedbackId, "Invalid feedback ID");
        require(!hasVoted[feedback_id][msg.sender], "Already voted on this feedback");
        require(msg.sender != feedbacks[feedback_id].feedback_by, "Cannot vote on own feedback");

        // Check if user has voting privileges (from badge contract)
        uint256 userTier = getUserTier(msg.sender);
        require(userTier >= 2, "Insufficient badge tier to vote");

        uint256 voteWeight = getVoteWeight(userTier);
        
        Vote memory newVote = Vote({
            voter: msg.sender,
            is_positive: is_positive,
            weight: voteWeight,
            timestamp: block.timestamp
        });

        feedbackVotes[feedback_id].push(newVote);
        hasVoted[feedback_id][msg.sender] = true;

        // Update feedback vote counts
        Feedback storage feedback = feedbacks[feedback_id];
        feedback.total_votes += voteWeight;
        
        if (is_positive) {
            feedback.positive_votes += voteWeight;
        } else {
            feedback.negative_votes += voteWeight;
        }

        emit FeedbackVoted(feedback_id, msg.sender, is_positive, voteWeight);
    }

    function approveFeedback(uint256 feedback_id) external onlyRole(APPROVER_ROLE) {
        require(feedback_id > 0 && feedback_id < _nextFeedbackId, "Invalid feedback ID");
        require(!feedbacks[feedback_id].approved, "Feedback already approved");

        feedbacks[feedback_id].approved = true;
        emit FeedbackApproved(feedback_id, msg.sender);
    }

    function getUserTier(address user) public view returns (uint256) {
        // This should call the BadgeNFT contract to get user's highest tier
        // For now, we'll implement a basic interface call
        if (badgeContract == address(0)) {
            return 0;
        }
        
        // This assumes BadgeNFT has a getUserTier function
        // You'll need to implement the proper interface call
        try IBadgeNFT(badgeContract).getUserTier(user) returns (uint256 tier) {
            return tier;
        } catch {
            return 0;
        }
    }

    function getVoteWeight(uint256 tier) public pure returns (uint256) {
        if (tier == 2) return WOOD_VOTE_WEIGHT;
        if (tier == 3) return BRONZE_VOTE_WEIGHT;
        if (tier == 4) return SILVER_VOTE_WEIGHT;
        if (tier == 5) return GOLD_VOTE_WEIGHT;
        return 0;
    }

    // View functions
    function getFeedback(uint256 feedback_id) external view returns (Feedback memory) {
        require(feedback_id > 0 && feedback_id < _nextFeedbackId, "Invalid feedback ID");
        return feedbacks[feedback_id];
    }

    function getFeedbackVotes(uint256 feedback_id) external view returns (Vote[] memory) {
        require(feedback_id > 0 && feedback_id < _nextFeedbackId, "Invalid feedback ID");
        return feedbackVotes[feedback_id];
    }

    function getProductFeedbacks(uint256 product_id) external view returns (uint256[] memory) {
        return productFeedbacks[product_id];
    }

    function getProductFeedbackCount(uint256 product_id) external view returns (uint256) {
        return productFeedbacks[product_id].length;
    }

    function getFeedbacksByRange(uint256 start_index, uint256 count) external view returns (Feedback[] memory) {
        require(start_index < _nextFeedbackId, "Invalid start index");
        
        uint256 end_index = start_index + count;
        if (end_index >= _nextFeedbackId) {
            end_index = _nextFeedbackId - 1;
        }
        
        uint256 actual_count = end_index - start_index;
        if (actual_count == 0) {
            return new Feedback[](0);
        }

        Feedback[] memory result = new Feedback[](actual_count);
        for (uint256 i = 0; i < actual_count; i++) {
            result[i] = feedbacks[start_index + i + 1]; // +1 because feedback IDs start from 1
        }
        
        return result;
    }

    function getTotalFeedbacks() external view returns (uint256) {
        return _nextFeedbackId - 1;
    }

    // Admin functions
    function grantApprover(address approver) external onlyRole(DEFAULT_ADMIN_ROLE) {
        _grantRole(APPROVER_ROLE, approver);
    }

    function revokeApprover(address approver) external onlyRole(DEFAULT_ADMIN_ROLE) {
        _revokeRole(APPROVER_ROLE, approver);
    }
}

// Interface for BadgeNFT contract
interface IBadgeNFT {
    function getUserTier(address user) external view returns (uint256);
}