// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";
import {ECDSA} from "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

contract FeedbackManager is AccessControl {
    uint8 public constant WOOD_VOTE_WEIGHT = 1;
    uint8 public constant BRONZE_VOTE_WEIGHT = 2;
    uint8 public constant SILVER_VOTE_WEIGHT = 3;
    uint8 public constant GOLD_VOTE_WEIGHT = 5;
    uint8 public constant THRESHOLD = 10;

    bytes32 public constant VOTER_ROLE = keccak256("VOTER_ROLE");
    bytes32 public constant APPROVER_ROLE = keccak256("APPROVER_ROLE");

    struct Feedback {
        uint256 feedbackId;
        address feedbackBy;
        uint256 productId;
        bool approved;
        string feedbackHash;
        uint256 totalVotes;
        uint256 positiveVotes;
        uint256 negativeVotes;
        uint256 timestamp;
    }

    struct Vote {
        address voter;
        bool isPositive;
        uint256 weight;
        uint256 timestamp;
    }

    event FeedbackSubmitted(uint256 indexed feedbackId, address indexed user, uint256 indexed productId, string feedbackHash);
    event FeedbackVoted(uint256 indexed feedbackId, address indexed voter, bool isPositive, uint256 weight);
    event FeedbackApproved(uint256 indexed feedbackId, address indexed approver);
    event BadgeContractSet(address indexed badgeContract);
    event ProductNFTContractSet(address indexed productNFTContract);

    uint256 private _nextFeedbackId = 1;
    address public badgeContract;
    address public productNFTContract;
    mapping(uint256 => Feedback) public feedbacks;
    mapping(uint256 => Vote[]) public feedbackVotes;
    mapping(uint256 => mapping(address => bool)) public hasVoted;
    mapping(uint256 => uint256[]) public productFeedbacks;
    mapping(address => uint256) public userApprovedFeedbackCount; // Tracks approved feedback for badge upgrades

    constructor(address defaultAdmin, address _badgeContract, address _productNFTContract) {
        require(defaultAdmin != address(0), "Invalid admin address");
        require(_badgeContract != address(0), "Invalid badge contract address");
        require(_productNFTContract != address(0), "Invalid product NFT contract address");
        _grantRole(DEFAULT_ADMIN_ROLE, defaultAdmin);
        _grantRole(APPROVER_ROLE, defaultAdmin);
        badgeContract = _badgeContract;
        productNFTContract = _productNFTContract;
        emit BadgeContractSet(_badgeContract);
        emit ProductNFTContractSet(_productNFTContract);
    }

    function setBadgeContract(address _badgeContract) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(_badgeContract != address(0), "Invalid badge contract address");
        badgeContract = _badgeContract;
        emit BadgeContractSet(_badgeContract);
    }

    function setProductNFTContract(address _productNFTContract) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(_productNFTContract != address(0), "Invalid product NFT contract address");
        productNFTContract = _productNFTContract;
        emit ProductNFTContractSet(_productNFTContract);
    }

    function submitFeedback(uint256 productId, string memory feedbackHash) external {
        require(productId > 0, "Invalid product ID");
        require(bytes(feedbackHash).length > 0, "Feedback hash cannot be empty");

        // Validate product exists
        if (productNFTContract != address(0)) {
            require(IProductNFT(productNFTContract).productExists(productId), "Product does not exist");
        }

        uint256 feedbackId = _nextFeedbackId++;
        Feedback memory newFeedback = Feedback({
            feedbackId: feedbackId,
            feedbackBy: msg.sender,
            productId: productId,
            approved: false,
            feedbackHash: feedbackHash,
            totalVotes: 0,
            positiveVotes: 0,
            negativeVotes: 0,
            timestamp: block.timestamp
        });

        feedbacks[feedbackId] = newFeedback;
        productFeedbacks[productId].push(feedbackId);
        emit FeedbackSubmitted(feedbackId, msg.sender, productId, feedbackHash);
    }

    function voteOnFeedback(uint256 feedbackId, bool isPositive) external {
        require(feedbackId > 0 && feedbackId < _nextFeedbackId, "Invalid feedback ID");
        require(!hasVoted[feedbackId][msg.sender], "Already voted");
        require(msg.sender != feedbacks[feedbackId].feedbackBy, "Cannot vote on own feedback");
        // require(verifyProof(verificationProof, msg.sender), "Invalid verification");

        uint256 userTier = getUserTier(msg.sender);
        require(userTier >= 2, "Insufficient badge tier to vote");

        uint256 voteWeight = getVoteWeight(userTier);
        Vote memory newVote = Vote({
            voter: msg.sender,
            isPositive: isPositive,
            weight: voteWeight,
            timestamp: block.timestamp
        });

        feedbackVotes[feedbackId].push(newVote);
        hasVoted[feedbackId][msg.sender] = true;
        Feedback storage feedback = feedbacks[feedbackId];
        feedback.totalVotes += voteWeight;
        if (isPositive) {
            feedback.positiveVotes += voteWeight;
        } else {
            feedback.negativeVotes += voteWeight;
        }

        emit FeedbackVoted(feedbackId, msg.sender, isPositive, voteWeight);

        // Auto-approve feedback if positiveVotes >= threshold
        if (!feedback.approved && feedback.positiveVotes >= THRESHOLD) {
            feedback.approved = true;
            userApprovedFeedbackCount[feedback.feedbackBy]++;
            emit FeedbackApproved(feedbackId, msg.sender);
        }
    }

    function approveFeedback(uint256 feedbackId) external onlyRole(APPROVER_ROLE) {
        require(feedbackId > 0 && feedbackId < _nextFeedbackId, "Invalid feedback ID");
        require(!feedbacks[feedbackId].approved, "Feedback already approved");

        Feedback storage feedback = feedbacks[feedbackId];
        feedback.approved = true;
        userApprovedFeedbackCount[feedback.feedbackBy]++;
        emit FeedbackApproved(feedbackId, msg.sender);
    }

    function getUserTier(address user) public view returns (uint256) {
        if (badgeContract == address(0)) return 0;
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

    function getEligibleBadges(address user) public view returns (uint256[] memory) {
        uint256 count = userApprovedFeedbackCount[user];
        uint256 currentTier = getUserTier(user);

        // Count how many badges the user is eligible for
        uint256 eligibleCount = 0;
        if (count >= 1 && currentTier < 1) eligibleCount++;
        if (count >= 5 && currentTier < 2) eligibleCount++;
        if (count >= 10 && currentTier < 3) eligibleCount++;
        if (count >= 15 && currentTier < 4) eligibleCount++;
        if (count >= 20 && currentTier < 5) eligibleCount++;

        // Build array of eligible badge tiers
        uint256[] memory eligibleBadges = new uint256[](eligibleCount);
        uint256 index = 0;
        if (count >= 1 && currentTier < 1) eligibleBadges[index++] = 1; // Seedling
        if (count >= 5 && currentTier < 2) eligibleBadges[index++] = 2; // Wooden
        if (count >= 10 && currentTier < 3) eligibleBadges[index++] = 3; // Bronze
        if (count >= 15 && currentTier < 4) eligibleBadges[index++] = 4; // Silver
        if (count >= 20 && currentTier < 5) eligibleBadges[index++] = 5; // Gold

        return eligibleBadges;
    }

    function claimBadge(uint256 tierId, string memory ipfsCid) external {
        require(tierId >= 1 && tierId <= 5, "Invalid tier ID");
        require(bytes(ipfsCid).length > 0, "IPFS CID cannot be empty");

        uint256 count = userApprovedFeedbackCount[msg.sender];
        uint256 currentTier = getUserTier(msg.sender);

        // Check if user is eligible for this specific tier
        bool isEligible = false;
        if (tierId == 1 && count >= 1 && currentTier < 1) isEligible = true;
        else if (tierId == 2 && count >= 5 && currentTier < 2) isEligible = true;
        else if (tierId == 3 && count >= 10 && currentTier < 3) isEligible = true;
        else if (tierId == 4 && count >= 15 && currentTier < 4) isEligible = true;
        else if (tierId == 5 && count >= 20 && currentTier < 5) isEligible = true;

        require(isEligible, "Not eligible for this badge");

        IBadgeNFT(badgeContract).mintBadge(msg.sender, tierId, ipfsCid);
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

    // View functions
    function getFeedback(uint256 feedbackId) external view returns (Feedback memory) {
        require(feedbackId > 0 && feedbackId < _nextFeedbackId, "Invalid feedback ID");
        return feedbacks[feedbackId];
    }

    function getFeedbackVotes(uint256 feedbackId) external view returns (Vote[] memory) {
        require(feedbackId > 0 && feedbackId < _nextFeedbackId, "Invalid feedback ID");
        return feedbackVotes[feedbackId];
    }

    function getProductFeedbacks(uint256 productId) external view returns (uint256[] memory) {
        return productFeedbacks[productId];
    }

    function getProductFeedbackCount(uint256 productId) external view returns (uint256) {
        return productFeedbacks[productId].length;
    }

    function getFeedbacksByRange(uint256 startIndex, uint256 count) external view returns (Feedback[] memory) {
        require(startIndex < _nextFeedbackId - 1, "Invalid start index");
        uint256 endIndex = startIndex + count;
        if (endIndex >= _nextFeedbackId) {
            endIndex = _nextFeedbackId - 1;
        }
        uint256 actualCount = endIndex > startIndex ? endIndex - startIndex : 0;
        Feedback[] memory result = new Feedback[](actualCount);
        for (uint256 i = 0; i < actualCount; i++) {
            result[i] = feedbacks[startIndex + i + 1];
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

interface IBadgeNFT {
    function getUserTier(address user) external view returns (uint256);
    function mintBadge(address user, uint256 tierId, string memory ipfsCid) external;
}

interface IProductNFT {
    function productExists(uint256 productId) external view returns (bool);
}