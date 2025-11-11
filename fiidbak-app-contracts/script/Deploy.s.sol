// script/Deploy.s.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {Script, console} from "forge-std/Script.sol";
import {ProductNFT} from "../src/ProductNFT.sol";
import {BadgeNFT} from "../src/BadgeNFT.sol";
import {FeedbackManager} from "../src/FeedbackManager.sol";

contract DeployScript is Script {
    function setUp() public {}

    function run() public {
        // When using --account flag with cast wallet, msg.sender is automatically set
        // Otherwise, it will use PRIVATE_KEY from .env if available
        address deployer = msg.sender;

        console.log("Deploying contracts with account:", deployer);
        console.log("Account balance:", deployer.balance);

        vm.startBroadcast();

        // Deploy ProductNFT
        ProductNFT productNFT = new ProductNFT();
        console.log("ProductNFT deployed at:", address(productNFT));

        // Note: We need to deploy BadgeNFT with FeedbackManager address, but FeedbackManager needs BadgeNFT address
        // Solution: Deploy a placeholder BadgeNFT, deploy FeedbackManager, then deploy final BadgeNFT
        // OR: Use deployer as temporary minter, then grant to FeedbackManager later

        // Deploy BadgeNFT with deployer as initial admin and minter
        BadgeNFT badgeNFT = new BadgeNFT(deployer, deployer, "https://ipfs.io/ipfs/");
        console.log("BadgeNFT deployed at:", address(badgeNFT));

        // Deploy FeedbackManager with constructor args: admin, badge contract, and product NFT contract addresses
        FeedbackManager feedbackManager = new FeedbackManager(deployer, address(badgeNFT), address(productNFT));
        console.log("FeedbackManager deployed at:", address(feedbackManager));

        // Set FeedbackManager in ProductNFT for cross-contract calls
        productNFT.setFeedbackManager(address(feedbackManager));
        console.log("FeedbackManager set in ProductNFT");

        // Grant MINTER_ROLE to FeedbackManager in BadgeNFT
        badgeNFT.grantMinter(address(feedbackManager));
        console.log("MINTER_ROLE granted to FeedbackManager");

        vm.stopBroadcast();

        // Log deployment addresses for verification
        console.log("\n=== Deployment Summary ===");
        console.log("ProductNFT:", address(productNFT));
        console.log("BadgeNFT:", address(badgeNFT));
        console.log("FeedbackManager:", address(feedbackManager));
    }
}