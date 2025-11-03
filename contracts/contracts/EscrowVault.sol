// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./AgentRegistry.sol";
import "./ServiceAgreement.sol";

/**
 * @title EscrowVault
 * @dev Manages escrow deposits and releases for orders
 */
contract EscrowVault {
    AgentRegistry public agentRegistry;
    ServiceAgreement public serviceAgreement;
    Verifier public verifier;

    struct Escrow {
        uint256 orderId;
        address requester;
        address provider;
        uint256 amount;
        bool deposited;
        bool released;
        bool refunded;
        uint256 depositedAt;
    }

    mapping(uint256 => Escrow) public escrows;

    event EscrowDeposited(uint256 indexed orderId, address indexed requester, uint256 amount);
    event EscrowReleased(uint256 indexed orderId, address indexed provider, uint256 amount);
    event EscrowRefunded(uint256 indexed orderId, address indexed requester, uint256 amount);

    constructor(address _agentRegistry, address _serviceAgreement, address _verifier) {
        agentRegistry = AgentRegistry(_agentRegistry);
        serviceAgreement = ServiceAgreement(_serviceAgreement);
        verifier = Verifier(_verifier);
    }

    /**
     * @dev Deposit escrow for an order
     * @param orderId The ID of the order
     */
    function depositEscrow(uint256 orderId) external payable {
        ServiceAgreement.Order memory order = serviceAgreement.getOrder(orderId);
        
        require(order.status == ServiceAgreement.OrderStatus.Accepted, "Order not accepted");
        require(msg.value == order.price, "Incorrect amount");
        require(!escrows[orderId].deposited, "Escrow already deposited");
        require(msg.sender == order.requester, "Only requester can deposit");

        escrows[orderId] = Escrow({
            orderId: orderId,
            requester: order.requester,
            provider: order.provider,
            amount: msg.value,
            deposited: true,
            released: false,
            refunded: false,
            depositedAt: block.timestamp
        });

        emit EscrowDeposited(orderId, msg.sender, msg.value);
    }

    /**
     * @dev Release escrow to provider after successful delivery
     * @param orderId The ID of the order
     */
    function releaseEscrow(uint256 orderId) external {
        require(
            msg.sender == address(serviceAgreement) || 
            msg.sender == address(verifier),
            "Unauthorized"
        );
        Escrow storage escrow = escrows[orderId];
        
        require(escrow.deposited, "Escrow not deposited");
        require(!escrow.released, "Already released");
        require(!escrow.refunded, "Already refunded");

        ServiceAgreement.Order memory order = serviceAgreement.getOrder(orderId);
        require(order.status == ServiceAgreement.OrderStatus.Delivered, "Order not delivered");

        // Verify delivery (lightweight check)
        require(
            verifier.verifyDelivery(orderId, order.deliverableHash),
            "Verification failed"
        );

        escrow.released = true;

        // Transfer to provider
        (bool success, ) = escrow.provider.call{value: escrow.amount}("");
        require(success, "Transfer failed");

        // Update reputation
        agentRegistry.updateReputation(escrow.provider, 10);
        agentRegistry.updateReputation(escrow.requester, 5);

        emit EscrowReleased(orderId, escrow.provider, escrow.amount);
    }

    /**
     * @dev Refund escrow to requester (on timeout or cancellation)
     * @param orderId The ID of the order
     */
    function refundEscrow(uint256 orderId) external {
        require(
            msg.sender == address(serviceAgreement),
            "Unauthorized"
        );
        Escrow storage escrow = escrows[orderId];
        
        require(escrow.deposited, "Escrow not deposited");
        require(!escrow.released, "Already released");
        require(!escrow.refunded, "Already refunded");

        ServiceAgreement.Order memory order = serviceAgreement.getOrder(orderId);
        require(
            order.status == ServiceAgreement.OrderStatus.Cancelled ||
            (order.status == ServiceAgreement.OrderStatus.Accepted && block.timestamp > order.deadline),
            "Cannot refund"
        );

        escrow.refunded = true;

        // Refund to requester
        (bool success, ) = escrow.requester.call{value: escrow.amount}("");
        require(success, "Transfer failed");

        // Update reputation (negative for provider if timeout)
        if (block.timestamp > order.deadline && order.provider != address(0)) {
            agentRegistry.updateReputation(order.provider, -5);
        }

        emit EscrowRefunded(orderId, escrow.requester, escrow.amount);
    }

    /**
     * @dev Get escrow details
     */
    function getEscrow(uint256 orderId) external view returns (Escrow memory) {
        return escrows[orderId];
    }

    /**
     * @dev Emergency withdraw (only for stuck funds, should have time lock)
     */
    function emergencyWithdraw() external {
        // This would typically have a timelock and admin controls
        // Simplified for MVP
        require(msg.sender == address(serviceAgreement), "Unauthorized");
    }
}

// Forward declaration
interface Verifier {
    function verifyDelivery(uint256 orderId, bytes32 deliverableHash) external view returns (bool);
}

