// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {Script, console} from "forge-std/Script.sol";
import {UserVerification} from "../src/UserVerification.sol";

/**
 * @title DeployVerificationOnly
 * @notice Deploys only the UserVerification contract
 * @dev Use this if you already have ProductNFT and FeedbackManager deployed
 *      and want to add frontend-only verification without redeploying anything
 */
contract DeployVerificationOnlyScript is Script {
    function setUp() public {}

    function run() public {
        address deployer = msg.sender;

        console.log("=== Deploying UserVerification Only ===");
        console.log("Deployer:", deployer);
        console.log("Balance:", deployer.balance);
        console.log("");

        vm.startBroadcast();

        // Deploy UserVerification
        console.log("Deploying UserVerification...");
        UserVerification userVerification = new UserVerification();
        console.log("UserVerification deployed at:", address(userVerification));
        console.log("");

        vm.stopBroadcast();

        console.log("=== Deployment Complete! ===");
        console.log("");
        console.log("Contract Address:");
        console.log("UserVerification: ", address(userVerification));
        console.log("");
        console.log("=== Frontend .env Configuration ===");
        console.log("Add this to your frontend .env.local:");
        console.log("");
        console.log("NEXT_PUBLIC_USER_VERIFICATION_ADDRESS=%s", address(userVerification));
        console.log("");
        console.log("=== Important Notes ===");
        console.log("- Your existing ProductNFT and FeedbackManager remain unchanged");
        console.log("- Verification is enforced ONLY on the frontend");
        console.log("- Users can bypass if they call contracts directly");
        console.log("- This is fine for 99%% of users who use the UI");
        console.log("");
        console.log("Next steps:");
        console.log("1. Add the address to frontend .env.local");
        console.log("2. Restart your frontend: npm run dev");
        console.log("3. Test the verification flow");
    }
}
