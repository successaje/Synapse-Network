// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./AgentRegistry.sol";

/**
 * @title ServiceAgreement
 * @dev OrderBook for RFS (Request For Service) - manages orders and negotiations
 */
contract ServiceAgreement {
    AgentRegistry public agentRegistry;

    enum OrderStatus {
        Open,           // 0 - Order created, waiting for provider
        Accepted,       // 1 - Provider accepted, escrow deposited
        Delivered,      // 2 - Deliverable submitted
        Finalized,      // 3 - Order completed, escrow released
        Cancelled,      // 4 - Order cancelled/refunded
        Disputed        // 5 - Order disputed
    }

    struct Order {
        address requester;
        address provider;
        uint256 price;
        bytes32 deliverableHash;
        uint256 deadline;
        OrderStatus status;
        bytes spec; // Service specification (IPFS hash or JSON)
        uint256 createdAt;
        uint256 acceptedAt;
        uint256 deliveredAt;
    }

    mapping(uint256 => Order) public orders;
    uint256 public orderCounter;
    
    // Events
    event OrderCreated(uint256 indexed orderId, address indexed requester, uint256 price, bytes32 specHash, uint256 deadline);
    event OrderAccepted(uint256 indexed orderId, address indexed provider);
    event DeliverySubmitted(uint256 indexed orderId, address indexed provider, bytes32 deliverableHash);
    event OrderFinalized(uint256 indexed orderId);
    event OrderCancelled(uint256 indexed orderId);
    event OrderDisputed(uint256 indexed orderId);

    modifier onlyRegistered() {
        require(agentRegistry.isRegistered(msg.sender), "Agent not registered");
        _;
    }

    modifier validOrder(uint256 orderId) {
        require(orderId < orderCounter, "Invalid order ID");
        _;
    }

    constructor(address _agentRegistry) {
        agentRegistry = AgentRegistry(_agentRegistry);
    }

    /**
     * @dev Create a new order (RFS)
     * @param price Price in STT (or smallest unit)
     * @param spec Service specification (IPFS hash or JSON)
     * @param deadline Timestamp when order expires
     * @return orderId The ID of the created order
     */
    function createOrder(
        uint256 price,
        bytes calldata spec,
        uint256 deadline
    ) external onlyRegistered returns (uint256 orderId) {
        require(price > 0, "Price must be greater than 0");
        require(deadline > block.timestamp, "Deadline must be in the future");
        require(spec.length > 0, "Spec cannot be empty");

        orderId = orderCounter++;
        
        orders[orderId] = Order({
            requester: msg.sender,
            provider: address(0),
            price: price,
            deliverableHash: bytes32(0),
            deadline: deadline,
            status: OrderStatus.Open,
            spec: spec,
            createdAt: block.timestamp,
            acceptedAt: 0,
            deliveredAt: 0
        });

        emit OrderCreated(orderId, msg.sender, price, keccak256(spec), deadline);
        return orderId;
    }

    /**
     * @dev Provider accepts an order
     * @param orderId The ID of the order to accept
     */
    function acceptOrder(uint256 orderId) external onlyRegistered validOrder(orderId) {
        Order storage order = orders[orderId];
        
        require(order.status == OrderStatus.Open, "Order not open");
        require(order.requester != msg.sender, "Cannot accept own order");
        require(block.timestamp < order.deadline, "Order expired");

        order.provider = msg.sender;
        order.status = OrderStatus.Accepted;
        order.acceptedAt = block.timestamp;

        emit OrderAccepted(orderId, msg.sender);
    }

    /**
     * @dev Provider submits delivery with hash proof
     * @param orderId The ID of the order
     * @param deliverableHash Hash of the deliverable (IPFS hash or computation result)
     */
    function submitDelivery(uint256 orderId, bytes32 deliverableHash) 
        external 
        onlyRegistered 
        validOrder(orderId) 
    {
        Order storage order = orders[orderId];
        
        require(order.status == OrderStatus.Accepted, "Order not accepted");
        require(order.provider == msg.sender, "Only provider can submit");
        require(deliverableHash != bytes32(0), "Invalid hash");

        order.deliverableHash = deliverableHash;
        order.status = OrderStatus.Delivered;
        order.deliveredAt = block.timestamp;

        emit DeliverySubmitted(orderId, msg.sender, deliverableHash);
    }

    /**
     * @dev Finalize order and trigger escrow release
     * @param orderId The ID of the order
     */
    function finalizeOrder(uint256 orderId) external validOrder(orderId) {
        Order storage order = orders[orderId];
        
        require(order.status == OrderStatus.Delivered, "Order not delivered");
        require(msg.sender == order.requester, "Only requester can finalize");

        order.status = OrderStatus.Finalized;

        // Trigger escrow release
        _releaseEscrow(orderId);

        emit OrderFinalized(orderId);
    }

    /**
     * @dev Cancel order and trigger refund
     * @param orderId The ID of the order
     */
    function cancelOrder(uint256 orderId) external validOrder(orderId) {
        Order storage order = orders[orderId];
        
        require(
            msg.sender == order.requester || 
            (order.status == OrderStatus.Open && block.timestamp >= order.deadline),
            "Cannot cancel"
        );

        OrderStatus previousStatus = order.status;
        order.status = OrderStatus.Cancelled;

        // Trigger refund if escrow was deposited
        if (previousStatus == OrderStatus.Accepted) {
            _refundEscrow(orderId);
        }

        emit OrderCancelled(orderId);
    }

    /**
     * @dev Get order details
     */
    function getOrder(uint256 orderId) external view returns (Order memory) {
        require(orderId < orderCounter, "Invalid order ID");
        return orders[orderId];
    }

    /**
     * @dev Get total number of orders
     */
    function getOrderCount() external view returns (uint256) {
        return orderCounter;
    }

    // EscrowVault reference
    address public escrowVault;

    function setEscrowVault(address _escrowVault) external {
        require(escrowVault == address(0), "EscrowVault already set");
        escrowVault = _escrowVault;
    }

    function _releaseEscrow(uint256 orderId) internal {
        (bool success, ) = escrowVault.call(
            abi.encodeWithSignature("releaseEscrow(uint256)", orderId)
        );
        require(success, "Escrow release failed");
    }

    function _refundEscrow(uint256 orderId) internal {
        (bool success, ) = escrowVault.call(
            abi.encodeWithSignature("refundEscrow(uint256)", orderId)
        );
        require(success, "Escrow refund failed");
    }
}

