// script/Deploy.s.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {Script, console} from "forge-std/Script.sol";
import {ProductNFT} from "../src/ProductNFT.sol";
import {BadgeNFT} from "../src/BadgeNFT.sol";
import {FeedbackManager} from "../src/FeedbackManager.sol";
import {UserVerification} from "../src/UserVerification.sol";

contract DeployScript is Script {
    function setUp() public {}

    function run() public {
        // When using --account flag with cast wallet, msg.sender is automatically set
        // Otherwise, it will use PRIVATE_KEY from .env if available
        address deployer = msg.sender;

        console.log("=== Starting Deployment ===");
        console.log("Deploying contracts with account:", deployer);
        console.log("Account balance:", deployer.balance);
        console.log("");

        vm.startBroadcast();

        // 1. Deploy UserVerification (no dependencies)
        console.log("1. Deploying UserVerification...");
        UserVerification userVerification = new UserVerification();
        console.log("   UserVerification deployed at:", address(userVerification));
        console.log("");

        // 2. Deploy ProductNFT
        console.log("2. Deploying ProductNFT...");
        ProductNFT productNFT = new ProductNFT();
        console.log("   ProductNFT deployed at:", address(productNFT));
        console.log("");

        // 3. Deploy BadgeNFT with deployer as initial admin and minter
        console.log("3. Deploying BadgeNFT...");
        BadgeNFT badgeNFT = new BadgeNFT(deployer, deployer, "https://ipfs.io/ipfs/");
        console.log("   BadgeNFT deployed at:", address(badgeNFT));
        console.log("");

        // 4. Deploy FeedbackManager
        console.log("4. Deploying FeedbackManager...");
        FeedbackManager feedbackManager = new FeedbackManager(
            deployer,
            address(badgeNFT),
            address(productNFT)
        );
        console.log("   FeedbackManager deployed at:", address(feedbackManager));
        console.log("");

        // 5. Configure ProductNFT
        console.log("5. Configuring ProductNFT...");
        productNFT.setFeedbackManager(address(feedbackManager));
        console.log("   - FeedbackManager set");
        console.log("");

        // 6. Configure BadgeNFT
        console.log("6. Configuring BadgeNFT...");
        badgeNFT.grantMinter(address(feedbackManager));
        console.log("   - MINTER_ROLE granted to FeedbackManager");
        console.log("");

        vm.stopBroadcast();

        // Log deployment summary
        console.log("=== Deployment Summary ===");
        console.log("UserVerification:  ", address(userVerification));
        console.log("ProductNFT:        ", address(productNFT));
        console.log("BadgeNFT:          ", address(badgeNFT));
        console.log("FeedbackManager:   ", address(feedbackManager));
        console.log("");
        console.log("=== Frontend .env Configuration ===");
        console.log("Copy these to your frontend .env.local file:");
        console.log("");
        console.log("NEXT_PUBLIC_USER_VERIFICATION_ADDRESS=%s", address(userVerification));
        console.log("NEXT_PUBLIC_PRODUCT_NFT_ADDRESS=%s", address(productNFT));
        console.log("NEXT_PUBLIC_BADGE_NFT_ADDRESS=%s", address(badgeNFT));
        console.log("NEXT_PUBLIC_FEEDBACK_MANAGER_ADDRESS=%s", address(feedbackManager));
        console.log("");
        console.log("=== Important Note ===");
        console.log("UserVerification is deployed but NOT linked to contracts.");
        console.log("This is intentional - verification is enforced on the frontend only.");
        console.log("Users can bypass by calling contracts directly, but 99%% won't.");
        console.log("");
        console.log("=== Deployment Complete! ===");
    }
}