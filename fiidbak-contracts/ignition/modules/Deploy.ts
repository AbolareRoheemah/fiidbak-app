import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("ProductNFTModule", (m) => {
  const productNFT = m.contract("ProductNFT");
  const badgeNFT = m.contract("BadgeNFT");
  const feedbackManager = m.contract("FeedbackManager");

  // m.call(productNFT, "incBy", [5n]);

  return { productNFT, badgeNFT, feedbackManager };
});
