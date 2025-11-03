// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./AgentRegistry.sol";

/**
 * @title IntentRouter
 * @dev Routes agent intents through decentralized matchmaking
 */
contract IntentRouter {
    AgentRegistry public agentRegistry;

    enum IntentType {
        BuyData,
        SellData,
        ExecuteCompute,
        RequestPrediction,
        ExecuteTrade,
        QueryOracle
    }

    enum IntentStatus {
        Active,
        Matched,
        Executing,
        Completed,
        Cancelled
    }

    struct Intent {
        uint256 intentId;
        address agent;
        IntentType intentType;
        IntentStatus status;
        bytes intentData;       // Structured intent data (JSON-like)
        bytes32 requirements;   // Hash of requirements/conditions
        uint256 maxPrice;       // Maximum price willing to pay
        uint256 minReputation;  // Minimum reputation requirement for match
        uint256 deadline;
        address matchedAgent;   // Agent matched with this intent
        uint256 createdAt;
        uint256 matchedAt;
    }

    mapping(uint256 => Intent) public intents;
    mapping(address => uint256[]) public agentIntents;
    mapping(IntentType => uint256[]) public intentsByType;
    
    uint256 public intentCounter;

    event IntentPosted(
        uint256 indexed intentId,
        address indexed agent,
        IntentType intentType,
        bytes intentData
    );
    
    event IntentMatched(
        uint256 indexed intentId,
        address indexed agent,
        address indexed matchedAgent
    );
    
    event IntentCompleted(uint256 indexed intentId);

    modifier onlyRegistered() {
        require(agentRegistry.isRegistered(msg.sender), "Agent not registered");
        _;
    }

    constructor(address _agentRegistry) {
        agentRegistry = AgentRegistry(_agentRegistry);
    }

    /**
     * @dev Post an intent to the router
     */
    function postIntent(
        IntentType intentType,
        bytes calldata intentData,
        bytes32 requirements,
        uint256 maxPrice,
        uint256 minReputation,
        uint256 deadline
    ) external onlyRegistered returns (uint256 intentId) {
        require(deadline > block.timestamp, "Deadline must be in future");

        intentId = intentCounter++;
        
        intents[intentId] = Intent({
            intentId: intentId,
            agent: msg.sender,
            intentType: intentType,
            status: IntentStatus.Active,
            intentData: intentData,
            requirements: requirements,
            maxPrice: maxPrice,
            minReputation: minReputation,
            deadline: deadline,
            matchedAgent: address(0),
            createdAt: block.timestamp,
            matchedAt: 0
        });

        agentIntents[msg.sender].push(intentId);
        intentsByType[intentType].push(intentId);

        emit IntentPosted(intentId, msg.sender, intentType, intentData);

        return intentId;
    }

    /**
     * @dev Match an intent with a counterparty
     */
    function matchIntent(
        uint256 intentId,
        address counterparty
    ) external onlyRegistered {
        Intent storage intent = intents[intentId];
        
        require(intent.status == IntentStatus.Active, "Intent not active");
        require(block.timestamp < intent.deadline, "Intent expired");
        require(msg.sender == counterparty, "Only counterparty can match");
        require(
            agentRegistry.isRegistered(counterparty),
            "Counterparty not registered"
        );

        // Check reputation requirement
        (, uint256 reputation) = agentRegistry.getAgent(counterparty);
        require(reputation >= intent.minReputation, "Reputation too low");

        intent.status = IntentStatus.Matched;
        intent.matchedAgent = counterparty;
        intent.matchedAt = block.timestamp;

        emit IntentMatched(intentId, intent.agent, counterparty);
    }

    /**
     * @dev Mark intent as executing
     */
    function markExecuting(uint256 intentId) external {
        Intent storage intent = intents[intentId];
        
        require(
            msg.sender == intent.agent || msg.sender == intent.matchedAgent,
            "Not authorized"
        );
        require(intent.status == IntentStatus.Matched, "Must be matched first");
        
        intent.status = IntentStatus.Executing;
    }

    /**
     * @dev Complete an intent
     */
    function completeIntent(uint256 intentId) external {
        Intent storage intent = intents[intentId];
        
        require(
            msg.sender == intent.agent || msg.sender == intent.matchedAgent,
            "Not authorized"
        );
        require(
            intent.status == IntentStatus.Executing ||
            intent.status == IntentStatus.Matched,
            "Invalid status"
        );
        
        intent.status = IntentStatus.Completed;
        emit IntentCompleted(intentId);
    }

    /**
     * @dev Cancel an intent
     */
    function cancelIntent(uint256 intentId) external {
        Intent storage intent = intents[intentId];
        
        require(msg.sender == intent.agent, "Only agent can cancel");
        require(intent.status == IntentStatus.Active, "Must be active");
        
        intent.status = IntentStatus.Cancelled;
    }

    /**
     * @dev Search intents by type and filters
     */
    function searchIntents(
        IntentType intentType,
        uint256 maxPrice,
        bool activeOnly
    ) external view returns (uint256[] memory) {
        uint256[] memory typeIntents = intentsByType[intentType];
        uint256 count = 0;
        
        // Count matching intents
        for (uint256 i = 0; i < typeIntents.length; i++) {
            Intent memory intent = intents[typeIntents[i]];
            if (intent.maxPrice <= maxPrice) {
                if (!activeOnly || intent.status == IntentStatus.Active) {
                    count++;
                }
            }
        }

        // Build result array
        uint256[] memory results = new uint256[](count);
        uint256 index = 0;
        
        for (uint256 i = 0; i < typeIntents.length; i++) {
            Intent memory intent = intents[typeIntents[i]];
            if (intent.maxPrice <= maxPrice) {
                if (!activeOnly || intent.status == IntentStatus.Active) {
                    results[index++] = typeIntents[i];
                }
            }
        }

        return results;
    }

    /**
     * @dev Get intent details
     */
    function getIntent(uint256 intentId) external view returns (Intent memory) {
        return intents[intentId];
    }

    /**
     * @dev Get all intents for an agent
     */
    function getAgentIntents(address agent) external view returns (uint256[] memory) {
        return agentIntents[agent];
    }
}

