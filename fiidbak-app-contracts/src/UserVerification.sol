// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol";

/**
 * @title UserVerification
 * @notice Contract for verifying wallet ownership through signature verification
 * @dev Users sign a message to prove they own their wallet address
 */
contract UserVerification {
    using ECDSA for bytes32;
    using MessageHashUtils for bytes32;

    /// @notice Mapping of verified addresses
    mapping(address => bool) public isVerified;

    /// @notice Mapping to track used nonces to prevent replay attacks
    mapping(bytes32 => bool) public usedNonces;

    /// @notice Emitted when a user successfully verifies their address
    event UserVerified(address indexed user, uint256 timestamp);

    /// @notice Error thrown when nonce has already been used
    error NonceAlreadyUsed();

    /// @notice Error thrown when user is already verified
    error AlreadyVerified();

    /// @notice Error thrown when signature is invalid
    error InvalidSignature();

    /**
     * @notice Verify wallet ownership through signature
     * @param nonce Unique value to prevent replay attacks
     * @param signature Signature of the verification message
     * @dev Message format: "I want to verify my wallet" + address + nonce
     */
    function verify(bytes32 nonce, bytes memory signature) external {
        if (usedNonces[nonce]) revert NonceAlreadyUsed();
        if (isVerified[msg.sender]) revert AlreadyVerified();

        // Construct the message that should have been signed
        bytes32 messageHash = keccak256(abi.encodePacked(
            "I want to verify my wallet",
            msg.sender,
            nonce
        ));

        // Convert to Ethereum signed message hash
        bytes32 ethSignedMessageHash = messageHash.toEthSignedMessageHash();

        // Recover the signer from the signature
        address signer = ethSignedMessageHash.recover(signature);

        // Verify the signer matches the sender
        if (signer != msg.sender) revert InvalidSignature();

        // Mark nonce as used
        usedNonces[nonce] = true;

        // Mark user as verified
        isVerified[msg.sender] = true;

        emit UserVerified(msg.sender, block.timestamp);
    }

    /**
     * @notice Check if an address is verified
     * @param user Address to check
     * @return bool True if verified, false otherwise
     */
    function checkVerified(address user) external view returns (bool) {
        return isVerified[user];
    }

    /**
     * @notice Check if a nonce has been used
     * @param nonce Nonce to check
     * @return bool True if used, false otherwise
     */
    function isNonceUsed(bytes32 nonce) external view returns (bool) {
        return usedNonces[nonce];
    }
}
