// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./ServiceAgreement.sol";

/**
 * @title Verifier
 * @dev Lightweight on-chain verification hooks for delivery verification
 */
contract Verifier {
    ServiceAgreement public serviceAgreement;

    struct Verification {
        uint256 orderId;
        bytes32 deliverableHash;
        bool verified;
        uint256 verifiedAt;
        address verifier;
        uint256 challengeDeadline;
    }

    mapping(uint256 => Verification) public verifications;
    mapping(bytes32 => bool) public verifiedHashes;

    // Challenge period (24 hours)
    uint256 public constant CHALLENGE_PERIOD = 24 hours;

    event DeliveryVerified(uint256 indexed orderId, bytes32 deliverableHash, address indexed verifier);
    event VerificationChallenged(uint256 indexed orderId, address indexed challenger);

    modifier onlyServiceAgreement() {
        require(msg.sender == address(serviceAgreement), "Only ServiceAgreement");
        _;
    }

    constructor(address _serviceAgreement) {
        serviceAgreement = ServiceAgreement(_serviceAgreement);
    }

    /**
     * @dev Verify delivery hash matches expectations
     * @param orderId The ID of the order
     * @param deliverableHash The hash submitted by the provider
     * @return bool True if verification passes
     */
    function verifyDelivery(uint256 orderId, bytes32 deliverableHash) 
        external 
        view 
        returns (bool) 
    {
        ServiceAgreement.Order memory order = serviceAgreement.getOrder(orderId);
        
        // Basic verification: check if hash matches submitted hash
        if (order.deliverableHash != deliverableHash) {
            return false;
        }

        // Check if there's an active challenge
        Verification memory verification = verifications[orderId];
        if (verification.verified) {
            // If challenged and challenge period not passed, return false
            if (verification.challengeDeadline > block.timestamp) {
                return false;
            }
        }

        return true;
    }

    /**
     * @dev Submit delivery for verification (called by provider)
     * @param orderId The ID of the order
     * @param deliverableHash The hash of the deliverable
     * @param ipfsHash Optional IPFS hash for additional verification
     */
    function submitForVerification(
        uint256 orderId,
        bytes32 deliverableHash,
        bytes32 ipfsHash
    ) external {
        ServiceAgreement.Order memory order = serviceAgreement.getOrder(orderId);
        
        require(order.provider == msg.sender, "Only provider can submit");
        require(order.status == ServiceAgreement.OrderStatus.Delivered, "Order not delivered");
        require(deliverableHash != bytes32(0), "Invalid hash");

        verifications[orderId] = Verification({
            orderId: orderId,
            deliverableHash: deliverableHash,
            verified: true,
            verifiedAt: block.timestamp,
            verifier: msg.sender,
            challengeDeadline: block.timestamp + CHALLENGE_PERIOD
        });

        verifiedHashes[deliverableHash] = true;

        emit DeliveryVerified(orderId, deliverableHash, msg.sender);
    }

    /**
     * @dev Challenge a verification (during challenge period)
     * @param orderId The ID of the order
     */
    function challengeVerification(uint256 orderId) external {
        Verification storage verification = verifications[orderId];
        
        require(verification.verified, "Not verified");
        require(block.timestamp < verification.challengeDeadline, "Challenge period expired");

        ServiceAgreement.Order memory order = serviceAgreement.getOrder(orderId);
        require(msg.sender == order.requester, "Only requester can challenge");

        // Mark as challenged (reverts verification)
        verification.verified = false;
        verification.challengeDeadline = block.timestamp;

        emit VerificationChallenged(orderId, msg.sender);
    }

    /**
     * @dev Get verification details
     */
    function getVerification(uint256 orderId) external view returns (Verification memory) {
        return verifications[orderId];
    }
}

