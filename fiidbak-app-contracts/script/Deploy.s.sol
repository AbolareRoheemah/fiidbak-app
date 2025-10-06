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
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);

        console.log("Deploying contracts with account:", deployer);
        console.log("Account balance:", deployer.balance);

        vm.startBroadcast(deployerPrivateKey);

        // Deploy ProductNFT
        ProductNFT productNFT = new ProductNFT();
        console.log("ProductNFT deployed at:", address(productNFT));

        // Deploy BadgeNFT  
        BadgeNFT badgeNFT = new BadgeNFT();
        console.log("BadgeNFT deployed at:", address(badgeNFT));

        // Deploy FeedbackManager with constructor args: admin and badge contract address
        FeedbackManager feedbackManager = new FeedbackManager(deployer, address(badgeNFT));
        console.log("FeedbackManager deployed at:", address(feedbackManager));

        vm.stopBroadcast();

        // Log deployment addresses for verification
        console.log("\n=== Deployment Summary ===");
        console.log("ProductNFT:", address(productNFT));
        console.log("BadgeNFT:", address(badgeNFT));
        console.log("FeedbackManager:", address(feedbackManager));
    }
}