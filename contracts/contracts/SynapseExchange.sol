// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./AgentRegistry.sol";

/**
 * @title SynapseExchange
 * @dev Facilitates negotiation, task payment, and trust scoring between agents
 */
contract SynapseExchange {
    AgentRegistry public agentRegistry;

    enum InteractionType {
        DataPurchase,
        ComputeTask,
        PredictionRequest,
        TradeExecution,
        OracleQuery
    }

    enum InteractionStatus {
        Pending,
        Negotiating,
        Agreed,
        Executing,
        Completed,
        Cancelled,
        Disputed
    }

    struct Interaction {
        uint256 interactionId;
        address initiator;      // Agent that started the interaction
        address counterparty;   // Agent being interacted with
        InteractionType interactionType;
        InteractionStatus status;
        uint256 proposedPrice;
        uint256 agreedPrice;
        bytes specification;    // Task/data specification
        bytes32 deliverableHash;
        uint256 deadline;
        uint256 createdAt;
        uint256 agreedAt;
        uint256 completedAt;
        uint256 trustScore;     // Post-interaction trust rating
    }

    mapping(uint256 => Interaction) public interactions;
    mapping(address => uint256[]) public agentInteractions; // Agent address -> interaction IDs
    mapping(address => mapping(address => uint256)) public trustScores; // From -> To -> Score
    
    uint256 public interactionCounter;

    event InteractionInitiated(
        uint256 indexed interactionId,
        address indexed initiator,
        address indexed counterparty,
        InteractionType interactionType,
        uint256 proposedPrice
    );
    
    event NegotiationUpdated(
        uint256 indexed interactionId,
        uint256 newPrice,
        address proposer
    );
    
    event InteractionAgreed(
        uint256 indexed interactionId,
        address indexed initiator,
        address indexed counterparty,
        uint256 agreedPrice
    );
    
    event InteractionCompleted(
        uint256 indexed interactionId,
        bytes32 deliverableHash,
        uint256 trustScore
    );

    modifier onlyRegistered() {
        require(agentRegistry.isRegistered(msg.sender), "Agent not registered");
        _;
    }

    constructor(address _agentRegistry) {
        agentRegistry = AgentRegistry(_agentRegistry);
    }

    /**
     * @dev Initiate an interaction with another agent
     */
    function initiateInteraction(
        address counterparty,
        InteractionType interactionType,
        uint256 proposedPrice,
        bytes calldata specification,
        uint256 deadline
    ) external onlyRegistered returns (uint256 interactionId) {
        require(agentRegistry.isRegistered(counterparty), "Counterparty not registered");
        require(msg.sender != counterparty, "Cannot interact with self");
        require(deadline > block.timestamp, "Deadline must be in future");

        interactionId = interactionCounter++;
        
        interactions[interactionId] = Interaction({
            interactionId: interactionId,
            initiator: msg.sender,
            counterparty: counterparty,
            interactionType: interactionType,
            status: InteractionStatus.Pending,
            proposedPrice: proposedPrice,
            agreedPrice: 0,
            specification: specification,
            deliverableHash: bytes32(0),
            deadline: deadline,
            createdAt: block.timestamp,
            agreedAt: 0,
            completedAt: 0,
            trustScore: 0
        });

        agentInteractions[msg.sender].push(interactionId);
        agentInteractions[counterparty].push(interactionId);

        emit InteractionInitiated(
            interactionId,
            msg.sender,
            counterparty,
            interactionType,
            proposedPrice
        );

        return interactionId;
    }

    /**
     * @dev Counterparty proposes a counter-offer
     */
    function proposeCounterOffer(
        uint256 interactionId,
        uint256 counterPrice
    ) external onlyRegistered {
        Interaction storage interaction = interactions[interactionId];
        
        require(
            msg.sender == interaction.counterparty,
            "Only counterparty can propose"
        );
        require(
            interaction.status == InteractionStatus.Pending ||
            interaction.status == InteractionStatus.Negotiating,
            "Invalid status"
        );

        interaction.status = InteractionStatus.Negotiating;
        interaction.proposedPrice = counterPrice;

        emit NegotiationUpdated(interactionId, counterPrice, msg.sender);
    }

    /**
     * @dev Accept the proposed terms
     */
    function acceptInteraction(uint256 interactionId) external onlyRegistered {
        Interaction storage interaction = interactions[interactionId];
        
        require(
            msg.sender == interaction.initiator || msg.sender == interaction.counterparty,
            "Not a party to interaction"
        );
        require(
            interaction.status == InteractionStatus.Pending ||
            interaction.status == InteractionStatus.Negotiating,
            "Invalid status"
        );

        interaction.status = InteractionStatus.Agreed;
        interaction.agreedPrice = interaction.proposedPrice;
        interaction.agreedAt = block.timestamp;

        emit InteractionAgreed(
            interactionId,
            interaction.initiator,
            interaction.counterparty,
            interaction.agreedPrice
        );
    }

    /**
     * @dev Submit completion with deliverable hash
     */
    function completeInteraction(
        uint256 interactionId,
        bytes32 deliverableHash,
        uint256 trustScore
    ) external onlyRegistered {
        Interaction storage interaction = interactions[interactionId];
        
        require(
            msg.sender == interaction.counterparty,
            "Only counterparty can complete"
        );
        require(
            interaction.status == InteractionStatus.Agreed,
            "Must be agreed first"
        );
        require(trustScore <= 100, "Trust score out of range");

        interaction.status = InteractionStatus.Completed;
        interaction.deliverableHash = deliverableHash;
        interaction.trustScore = trustScore;
        interaction.completedAt = block.timestamp;

        // Update trust score mapping
        trustScores[interaction.initiator][interaction.counterparty] = trustScore;

        // Update reputation based on completion
        if (trustScore >= 80) {
            agentRegistry.updateReputation(interaction.counterparty, 10);
        } else if (trustScore >= 60) {
            agentRegistry.updateReputation(interaction.counterparty, 5);
        }

        emit InteractionCompleted(interactionId, deliverableHash, trustScore);
    }

    /**
     * @dev Get interaction details
     */
    function getInteraction(uint256 interactionId) external view returns (Interaction memory) {
        return interactions[interactionId];
    }

    /**
     * @dev Get all interactions for an agent
     */
    function getAgentInteractions(address agent) external view returns (uint256[] memory) {
        return agentInteractions[agent];
    }

    /**
     * @dev Get trust score between two agents
     */
    function getTrustScore(address from, address to) external view returns (uint256) {
        return trustScores[from][to];
    }
}

