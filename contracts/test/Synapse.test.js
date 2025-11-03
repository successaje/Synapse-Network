const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Synapse Network", function () {
  let agentRegistry, serviceAgreement, escrowVault, verifier;
  let owner, requester, provider;
  const oneEther = ethers.parseEther("1");

  beforeEach(async function () {
    [owner, requester, provider] = await ethers.getSigners();

    // Deploy contracts
    const AgentRegistry = await ethers.getContractFactory("AgentRegistry");
    agentRegistry = await AgentRegistry.deploy();
    
    const ServiceAgreement = await ethers.getContractFactory("ServiceAgreement");
    serviceAgreement = await ServiceAgreement.deploy(await agentRegistry.getAddress());
    
    const Verifier = await ethers.getContractFactory("Verifier");
    verifier = await Verifier.deploy(await serviceAgreement.getAddress());
    
    const EscrowVault = await ethers.getContractFactory("EscrowVault");
    escrowVault = await EscrowVault.deploy(
      await agentRegistry.getAddress(),
      await serviceAgreement.getAddress(),
      await verifier.getAddress()
    );

    // Set up cross-references
    await agentRegistry.setEscrowVault(await escrowVault.getAddress());
    await agentRegistry.setServiceAgreement(await serviceAgreement.getAddress());
    await serviceAgreement.setEscrowVault(await escrowVault.getAddress());
  });

  describe("AgentRegistry", function () {
    it("Should register an agent", async function () {
      await agentRegistry.connect(requester).registerAgent(
        await requester.getAddress(),
        "ipfs://QmTest123"
      );
      
      const [metadata, reputation] = await agentRegistry.getAgent(await requester.getAddress());
      expect(metadata).to.equal("ipfs://QmTest123");
      expect(reputation).to.equal(0);
    });

    it("Should not allow duplicate registration", async function () {
      await agentRegistry.connect(requester).registerAgent(
        await requester.getAddress(),
        "ipfs://QmTest123"
      );
      
      await expect(
        agentRegistry.connect(requester).registerAgent(
          await requester.getAddress(),
          "ipfs://QmTest456"
        )
      ).to.be.revertedWith("Agent already registered");
    });
  });

  describe("ServiceAgreement", function () {
    beforeEach(async function () {
      await agentRegistry.connect(requester).registerAgent(
        await requester.getAddress(),
        "requester-metadata"
      );
      await agentRegistry.connect(provider).registerAgent(
        await provider.getAddress(),
        "provider-metadata"
      );
    });

    it("Should create an order", async function () {
      const deadline = Math.floor(Date.now() / 1000) + 3600; // 1 hour from now
      const spec = ethers.toUtf8Bytes("Need sentiment analysis for token ETH");
      
      const tx = await serviceAgreement.connect(requester).createOrder(
        oneEther,
        spec,
        deadline
      );
      
      const receipt = await tx.wait();
      expect(receipt).to.not.be.null;
      
      const order = await serviceAgreement.getOrder(0);
      expect(order.requester).to.equal(await requester.getAddress());
      expect(order.price).to.equal(oneEther);
      expect(order.status).to.equal(0); // Open
    });

    it("Should accept an order", async function () {
      const deadline = Math.floor(Date.now() / 1000) + 3600;
      const spec = ethers.toUtf8Bytes("Need sentiment analysis");
      
      await serviceAgreement.connect(requester).createOrder(oneEther, spec, deadline);
      await serviceAgreement.connect(provider).acceptOrder(0);
      
      const order = await serviceAgreement.getOrder(0);
      expect(order.provider).to.equal(await provider.getAddress());
      expect(order.status).to.equal(1); // Accepted
    });

    it("Should submit delivery", async function () {
      const deadline = Math.floor(Date.now() / 1000) + 3600;
      const spec = ethers.toUtf8Bytes("Need sentiment analysis");
      
      await serviceAgreement.connect(requester).createOrder(oneEther, spec, deadline);
      await serviceAgreement.connect(provider).acceptOrder(0);
      
      const deliverableHash = ethers.keccak256(ethers.toUtf8Bytes("result-ipfs-hash"));
      await serviceAgreement.connect(provider).submitDelivery(0, deliverableHash);
      
      const order = await serviceAgreement.getOrder(0);
      expect(order.deliverableHash).to.equal(deliverableHash);
      expect(order.status).to.equal(2); // Delivered
    });
  });

  describe("EscrowVault", function () {
    beforeEach(async function () {
      await agentRegistry.connect(requester).registerAgent(
        await requester.getAddress(),
        "requester-metadata"
      );
      await agentRegistry.connect(provider).registerAgent(
        await provider.getAddress(),
        "provider-metadata"
      );
    });

    it("Should deposit escrow", async function () {
      const deadline = Math.floor(Date.now() / 1000) + 3600;
      const spec = ethers.toUtf8Bytes("Need sentiment analysis");
      
      await serviceAgreement.connect(requester).createOrder(oneEther, spec, deadline);
      await serviceAgreement.connect(provider).acceptOrder(0);
      
      await escrowVault.connect(requester).depositEscrow(0, { value: oneEther });
      
      const escrow = await escrowVault.getEscrow(0);
      expect(escrow.deposited).to.be.true;
      expect(escrow.amount).to.equal(oneEther);
    });
  });
});

