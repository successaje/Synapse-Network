const hre = require("hardhat");

async function main() {
  console.log("Deploying Synapse Network contracts...");

  // Deploy AgentRegistry first
  const AgentRegistry = await hre.ethers.getContractFactory("AgentRegistry");
  const agentRegistry = await AgentRegistry.deploy();
  await agentRegistry.waitForDeployment();
  const agentRegistryAddress = await agentRegistry.getAddress();
  console.log("AgentRegistry deployed to:", agentRegistryAddress);

  // Deploy ServiceAgreement
  const ServiceAgreement = await hre.ethers.getContractFactory("ServiceAgreement");
  const serviceAgreement = await ServiceAgreement.deploy(agentRegistryAddress);
  await serviceAgreement.waitForDeployment();
  const serviceAgreementAddress = await serviceAgreement.getAddress();
  console.log("ServiceAgreement deployed to:", serviceAgreementAddress);

  // Deploy Verifier
  const Verifier = await hre.ethers.getContractFactory("Verifier");
  const verifier = await Verifier.deploy(serviceAgreementAddress);
  await verifier.waitForDeployment();
  const verifierAddress = await verifier.getAddress();
  console.log("Verifier deployed to:", verifierAddress);

  // Deploy EscrowVault
  const EscrowVault = await hre.ethers.getContractFactory("EscrowVault");
  const escrowVault = await EscrowVault.deploy(
    agentRegistryAddress,
    serviceAgreementAddress,
    verifierAddress
  );
  await escrowVault.waitForDeployment();
  const escrowVaultAddress = await escrowVault.getAddress();
  console.log("EscrowVault deployed to:", escrowVaultAddress);

  // Set up cross-references
  console.log("Setting up cross-references...");
  
  await agentRegistry.setEscrowVault(escrowVaultAddress);
  await agentRegistry.setServiceAgreement(serviceAgreementAddress);
  
  await serviceAgreement.setEscrowVault(escrowVaultAddress);
  
  console.log("\n✅ All contracts deployed and configured!");
  console.log("\nContract addresses:");
  console.log("AgentRegistry:", agentRegistryAddress);
  console.log("ServiceAgreement:", serviceAgreementAddress);
  console.log("Verifier:", verifierAddress);
  console.log("EscrowVault:", escrowVaultAddress);
  
  console.log("\nSave these addresses for your frontend configuration!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

