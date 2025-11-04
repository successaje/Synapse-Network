const hre = require("hardhat");

// Already deployed contract addresses
const DEPLOYED_CONTRACTS = {
  AgentRegistry: "0xC310b43748E5303F1372Ab2C9075629E0Bb4FE54",
  ServiceAgreement: "0xF673F508104876c72C8724728f81d50E01649b40",
  Verifier: "0x7CC324d15E5fF17c43188fB63b462B9a79dA68f6",
};

const EXPLORER_URL = "https://shannon-explorer.somnia.network";

async function main() {
  console.log("Deploying remaining Synapse Network contracts...");
  console.log("Explorer:", EXPLORER_URL);
  console.log("\n");
  
  // Verify we have a signer
  const [deployer] = await hre.ethers.getSigners();
  if (!deployer) {
    throw new Error("No deployer account found! Make sure PRIVATE_KEY is set in your .env file.");
  }
  
  console.log("Deploying with account:", deployer.address);
  
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  const balanceFormatted = hre.ethers.formatEther(balance);
  console.log("Account balance:", balanceFormatted, "STT");
  
  // Estimate minimum required balance for remaining contracts
  const minRequired = hre.ethers.parseEther("0.3");
  if (balance < minRequired) {
    console.warn("⚠️  WARNING: Account balance may be insufficient!");
    console.warn(`   Current: ${balanceFormatted} STT`);
    console.warn(`   Recommended: At least 0.3 STT for remaining deployments`);
    console.warn("   Get testnet tokens from: https://faucet.testnet.somnia.network");
  }

  // Use already deployed contracts or get existing instances
  console.log("\n📋 Using already deployed contracts:");
  const agentRegistryAddress = DEPLOYED_CONTRACTS.AgentRegistry;
  const serviceAgreementAddress = DEPLOYED_CONTRACTS.ServiceAgreement;
  const verifierAddress = DEPLOYED_CONTRACTS.Verifier;
  
  console.log("✅ AgentRegistry:", agentRegistryAddress);
  console.log("   Explorer:", `${EXPLORER_URL}/address/${agentRegistryAddress}`);
  console.log("✅ ServiceAgreement:", serviceAgreementAddress);
  console.log("   Explorer:", `${EXPLORER_URL}/address/${serviceAgreementAddress}`);
  console.log("✅ Verifier:", verifierAddress);
  console.log("   Explorer:", `${EXPLORER_URL}/address/${verifierAddress}`);
  
  // Verify existing contracts are accessible
  try {
    const agentRegistry = await hre.ethers.getContractAt("AgentRegistry", agentRegistryAddress);
    const serviceAgreement = await hre.ethers.getContractAt("ServiceAgreement", serviceAgreementAddress);
    const verifier = await hre.ethers.getContractAt("contracts/Verifier.sol:Verifier", verifierAddress);
    
    // Verify contracts are accessible
    await agentRegistry.getAddress();
    await serviceAgreement.getAddress();
    await verifier.getAddress();
    console.log("\n✅ All existing contracts verified and accessible\n");
  } catch (error) {
    console.error("❌ Error verifying existing contracts:", error.message);
    throw error;
  }

  // Deploy remaining contracts
  console.log("\n🚀 Deploying remaining contracts...\n");
  
  // Deploy EscrowVault
  console.log("Deploying EscrowVault...");
  const EscrowVault = await hre.ethers.getContractFactory("EscrowVault");
  const escrowVault = await EscrowVault.deploy(
    agentRegistryAddress,
    serviceAgreementAddress,
    verifierAddress
  );
  await escrowVault.waitForDeployment();
  const escrowVaultAddress = await escrowVault.getAddress();
  const escrowVaultTx = escrowVault.deploymentTransaction();
  console.log("✅ EscrowVault deployed to:", escrowVaultAddress);
  console.log("   Explorer:", `${EXPLORER_URL}/address/${escrowVaultAddress}`);
  if (escrowVaultTx) {
    console.log("   Transaction:", `${EXPLORER_URL}/tx/${escrowVaultTx.hash}`);
  }

  // Deploy SynapseExchange
  console.log("\nDeploying SynapseExchange...");
  const SynapseExchange = await hre.ethers.getContractFactory("SynapseExchange");
  const synapseExchange = await SynapseExchange.deploy(agentRegistryAddress);
  await synapseExchange.waitForDeployment();
  const synapseExchangeAddress = await synapseExchange.getAddress();
  const synapseExchangeTx = synapseExchange.deploymentTransaction();
  console.log("✅ SynapseExchange deployed to:", synapseExchangeAddress);
  console.log("   Explorer:", `${EXPLORER_URL}/address/${synapseExchangeAddress}`);
  if (synapseExchangeTx) {
    console.log("   Transaction:", `${EXPLORER_URL}/tx/${synapseExchangeTx.hash}`);
  }

  // Deploy IntentRouter
  console.log("\nDeploying IntentRouter...");
  const IntentRouter = await hre.ethers.getContractFactory("IntentRouter");
  const intentRouter = await IntentRouter.deploy(agentRegistryAddress);
  await intentRouter.waitForDeployment();
  const intentRouterAddress = await intentRouter.getAddress();
  const intentRouterTx = intentRouter.deploymentTransaction();
  console.log("✅ IntentRouter deployed to:", intentRouterAddress);
  console.log("   Explorer:", `${EXPLORER_URL}/address/${intentRouterAddress}`);
  if (intentRouterTx) {
    console.log("   Transaction:", `${EXPLORER_URL}/tx/${intentRouterTx.hash}`);
  }

  // Set up cross-references
  console.log("\n📝 Setting up cross-references...");
  
  // Get contract instances
  const agentRegistry = await hre.ethers.getContractAt("AgentRegistry", agentRegistryAddress);
  const serviceAgreement = await hre.ethers.getContractAt("ServiceAgreement", serviceAgreementAddress);
  
  // Check if cross-references are already set
  const currentEscrowVault = await agentRegistry.escrowVault();
  const currentServiceAgreement = await agentRegistry.serviceAgreement();
  const serviceAgreementEscrowVault = await serviceAgreement.escrowVault();
  
  if (currentEscrowVault.toLowerCase() !== escrowVaultAddress.toLowerCase()) {
    console.log("Setting EscrowVault in AgentRegistry...");
    const tx1 = await agentRegistry.setEscrowVault(escrowVaultAddress);
    await tx1.wait();
    console.log("✅ Transaction:", `${EXPLORER_URL}/tx/${tx1.hash}`);
  } else {
    console.log("✅ EscrowVault already set in AgentRegistry");
  }
  
  if (currentServiceAgreement.toLowerCase() !== serviceAgreementAddress.toLowerCase()) {
    console.log("Setting ServiceAgreement in AgentRegistry...");
    const tx2 = await agentRegistry.setServiceAgreement(serviceAgreementAddress);
    await tx2.wait();
    console.log("✅ Transaction:", `${EXPLORER_URL}/tx/${tx2.hash}`);
  } else {
    console.log("✅ ServiceAgreement already set in AgentRegistry");
  }
  
  if (serviceAgreementEscrowVault.toLowerCase() !== escrowVaultAddress.toLowerCase()) {
    console.log("Setting EscrowVault in ServiceAgreement...");
    const tx3 = await serviceAgreement.setEscrowVault(escrowVaultAddress);
    await tx3.wait();
    console.log("✅ Transaction:", `${EXPLORER_URL}/tx/${tx3.hash}`);
  } else {
    console.log("✅ EscrowVault already set in ServiceAgreement");
  }
  
  console.log("\n" + "=".repeat(60));
  console.log("✅ All contracts deployed and configured!");
  console.log("=".repeat(60));
  console.log("\n📋 Contract Addresses:");
  console.log("AgentRegistry:", agentRegistryAddress);
  console.log("   Explorer:", `${EXPLORER_URL}/address/${agentRegistryAddress}`);
  console.log("\nServiceAgreement:", serviceAgreementAddress);
  console.log("   Explorer:", `${EXPLORER_URL}/address/${serviceAgreementAddress}`);
  console.log("\nVerifier:", verifierAddress);
  console.log("   Explorer:", `${EXPLORER_URL}/address/${verifierAddress}`);
  console.log("\nEscrowVault:", escrowVaultAddress);
  console.log("   Explorer:", `${EXPLORER_URL}/address/${escrowVaultAddress}`);
  console.log("\nSynapseExchange:", synapseExchangeAddress);
  console.log("   Explorer:", `${EXPLORER_URL}/address/${synapseExchangeAddress}`);
  console.log("\nIntentRouter:", intentRouterAddress);
  console.log("   Explorer:", `${EXPLORER_URL}/address/${intentRouterAddress}`);
  
  console.log("\n" + "=".repeat(60));
  console.log("📝 Update your .env file with:");
  console.log("=".repeat(60));
  console.log(`NEXT_PUBLIC_AGENT_REGISTRY=${agentRegistryAddress}`);
  console.log(`NEXT_PUBLIC_SERVICE_AGREEMENT=${serviceAgreementAddress}`);
  console.log(`NEXT_PUBLIC_ESCROW_VAULT=${escrowVaultAddress}`);
  console.log(`NEXT_PUBLIC_VERIFIER=${verifierAddress}`);
  console.log(`NEXT_PUBLIC_SYNAPSE_EXCHANGE=${synapseExchangeAddress}`);
  console.log(`NEXT_PUBLIC_INTENT_ROUTER=${intentRouterAddress}`);
  console.log("\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

