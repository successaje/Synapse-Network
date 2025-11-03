// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title AgentRegistry
 * @dev Manages agent identities, metadata, on-chain public keys, and reputation
 */
contract AgentRegistry {
    struct Agent {
        address agentAddress;
        string metadata;
        uint256 reputation;
        bool registered;
        uint256 registeredAt;
    }

    mapping(address => Agent) public agents;
    address[] public agentList;
    
    event AgentRegistered(address indexed agentAddr, string metadata, uint256 timestamp);
    event ReputationUpdated(address indexed agentAddr, uint256 newReputation, uint256 timestamp);

    modifier onlyRegistered() {
        require(agents[msg.sender].registered, "Agent not registered");
        _;
    }

    /**
     * @dev Register a new agent
     * @param agentAddr The address of the agent
     * @param metadata IPFS hash or JSON string containing agent metadata
     */
    function registerAgent(address agentAddr, string calldata metadata) external {
        require(!agents[agentAddr].registered, "Agent already registered");
        require(bytes(metadata).length > 0, "Metadata cannot be empty");
        
        agents[agentAddr] = Agent({
            agentAddress: agentAddr,
            metadata: metadata,
            reputation: 0,
            registered: true,
            registeredAt: block.timestamp
        });
        
        agentList.push(agentAddr);
        
        emit AgentRegistered(agentAddr, metadata, block.timestamp);
    }

    /**
     * @dev Get agent information
     * @param agentAddr The address of the agent
     * @return metadata The agent's metadata
     * @return reputation The agent's reputation score
     */
    function getAgent(address agentAddr) external view returns (string memory metadata, uint256 reputation) {
        require(agents[agentAddr].registered, "Agent not registered");
        return (agents[agentAddr].metadata, agents[agentAddr].reputation);
    }

    /**
     * @dev Update agent reputation (only callable by authorized contracts)
     * @param agentAddr The address of the agent
     * @param reputationDelta The change in reputation (can be positive or negative)
     */
    function updateReputation(address agentAddr, int256 reputationDelta) external {
        // Only allow EscrowVault or ServiceAgreement to update reputation
        require(
            msg.sender == escrowVault || msg.sender == serviceAgreement,
            "Unauthorized reputation update"
        );
        require(agents[agentAddr].registered, "Agent not registered");
        
        uint256 currentRep = agents[agentAddr].reputation;
        if (reputationDelta > 0) {
            agents[agentAddr].reputation = currentRep + uint256(reputationDelta);
        } else if (reputationDelta < 0 && currentRep >= uint256(-reputationDelta)) {
            agents[agentAddr].reputation = currentRep - uint256(-reputationDelta);
        }
        
        emit ReputationUpdated(agentAddr, agents[agentAddr].reputation, block.timestamp);
    }

    /**
     * @dev Get total number of registered agents
     */
    function getAgentCount() external view returns (uint256) {
        return agentList.length;
    }

    /**
     * @dev Check if an address is a registered agent
     */
    function isRegistered(address agentAddr) external view returns (bool) {
        return agents[agentAddr].registered;
    }

    // Contract references (set during deployment)
    address public escrowVault;
    address public serviceAgreement;

    function setEscrowVault(address _escrowVault) external {
        require(escrowVault == address(0), "EscrowVault already set");
        escrowVault = _escrowVault;
    }

    function setServiceAgreement(address _serviceAgreement) external {
        require(serviceAgreement == address(0), "ServiceAgreement already set");
        serviceAgreement = _serviceAgreement;
    }
}

