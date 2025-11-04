const hre = require("hardhat");

// Deployed contract addresses with fully qualified names
const DEPLOYED_CONTRACTS = {
  AgentRegistry: {
    address: "0xC310b43748E5303F1372Ab2C9075629E0Bb4FE54",
    contractPath: "contracts/AgentRegistry.sol:AgentRegistry",
    constructorArgs: [],
  },
  ServiceAgreement: {
    address: "0xF673F508104876c72C8724728f81d50E01649b40",
    contractPath: "contracts/ServiceAgreement.sol:ServiceAgreement",
    constructorArgs: ["0xC310b43748E5303F1372Ab2C9075629E0Bb4FE54"], // AgentRegistry
  },
  Verifier: {
    address: "0x7CC324d15E5fF17c43188fB63b462B9a79dA68f6",
    contractPath: "contracts/Verifier.sol:Verifier",
    constructorArgs: ["0xF673F508104876c72C8724728f81d50E01649b40"], // ServiceAgreement
  },
  EscrowVault: {
    address: "0x7dc16d44789283279b28C940359011F2649897dA",
    contractPath: "contracts/EscrowVault.sol:EscrowVault",
    constructorArgs: [
      "0xC310b43748E5303F1372Ab2C9075629E0Bb4FE54", // AgentRegistry
      "0xF673F508104876c72C8724728f81d50E01649b40", // ServiceAgreement
      "0x7CC324d15E5fF17c43188fB63b462B9a79dA68f6", // Verifier
    ],
  },
  SynapseExchange: {
    address: "0xE2Ea85Cc94E40cdc1Abc058373785ee6b3809183",
    contractPath: "contracts/SynapseExchange.sol:SynapseExchange",
    constructorArgs: ["0xC310b43748E5303F1372Ab2C9075629E0Bb4FE54"], // AgentRegistry
  },
  IntentRouter: {
    address: "0xc4d732199B7d21207a74CFE6CEd4d17dD330C7Ea",
    contractPath: "contracts/IntentRouter.sol:IntentRouter",
    constructorArgs: ["0xC310b43748E5303F1372Ab2C9075629E0Bb4FE54"], // AgentRegistry
  },
};

const EXPLORER_URL = "https://shannon-explorer.somnia.network";

async function main() {
  console.log("Verifying contracts on Somnia Testnet...");
  console.log("Explorer:", EXPLORER_URL);
  console.log("API Endpoint: https://somnia.w3us.site/api");
  console.log("\n");

  const network = await hre.ethers.provider.getNetwork();
  console.log("Network:", network.name, "Chain ID:", network.chainId.toString());
  console.log("\n");

  for (const [contractName, contractInfo] of Object.entries(DEPLOYED_CONTRACTS)) {
    try {
      console.log(`Verifying ${contractName}...`);
      console.log(`  Address: ${contractInfo.address}`);
      console.log(`  Contract: ${contractInfo.contractPath}`);
      
      await hre.run("verify:verify", {
        address: contractInfo.address,
        constructorArguments: contractInfo.constructorArgs,
        contract: contractInfo.contractPath,
      });

      console.log(`✅ ${contractName} verified successfully!`);
      console.log(`   Explorer: ${EXPLORER_URL}/address/${contractInfo.address}`);
      console.log("\n");
    } catch (error) {
      if (error.message.includes("Already Verified") || error.message.includes("already verified")) {
        console.log(`✅ ${contractName} is already verified`);
        console.log(`   Explorer: ${EXPLORER_URL}/address/${contractInfo.address}`);
      } else if (error.message.includes("API token") || error.message.includes("API key")) {
        console.log(`⚠️  ${contractName} verification requires an API key`);
        console.log(`   Note: The explorer may not support programmatic verification yet.`);
        console.log(`   You may need to verify manually through the explorer UI.`);
        console.log(`   Explorer: ${EXPLORER_URL}/address/${contractInfo.address}`);
      } else {
        console.error(`❌ Error verifying ${contractName}:`, error.message);
        console.log(`   You may need to verify manually through the explorer UI.`);
        console.log(`   Explorer: ${EXPLORER_URL}/address/${contractInfo.address}`);
      }
      console.log("\n");
    }
  }

  console.log("=".repeat(60));
  console.log("Verification complete!");
  console.log("=".repeat(60));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

