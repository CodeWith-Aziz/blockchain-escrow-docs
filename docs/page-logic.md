## Core Logic & Function Breakdown

---

Below is the production-ready code implementation of the specified escrow contract requirements:

```solidity
// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

/**
 * @title Decentralized Secure Escrow (Buyer <-> Seller)
 * @notice Handles trustless financial clearing with embedded role arbitration.
 */
contract Escrow {
    // --- State Variables ---
    address public immutable buyer;
    address public immutable seller;
    address public immutable arbiter;
    uint256 public immutable targetAmount;

    enum Status { Pending, Shipped, Delivered, Disputed, Resolved }
    Status public currentStatus;

    uint256 private reentrancyStatus = 1; // 1 = Ready, 2 = Active

    // --- Events ---
    event Funded(address indexed buyer, uint256 amount);
    event ShippedStatusConfirmed();
    event DeliveryConfirmed();
    event DisputeRaised(address indexed initiator);
    event ResolvedAndSettled(address indexed recipient, uint256 amount);

    // --- Modifiers ---
    modifier onlyRole(address authorized) {
        if (msg.sender != authorized) revert Unauthorized();
        _;
    }

    modifier inStatus(Status expected) {
        if (currentStatus != expected) revert InvalidStateTransition();
        _;
    }

    modifier nonReentrant() {
        if (reentrancyStatus == 2) revert ReentrancyGuardTriggered();
        reentrancyStatus = 2;
        _;
        reentrancyStatus = 1;
    }

    // --- Custom Errors for Gas Efficiency ---
    error Unauthorized();
    error InvalidStateTransition();
    error IncorrectFundingAmount();
    error TransferFailed();
    error ReentrancyGuardTriggered();

    /**
     * @notice Initializes the escrow terms and roles.
     */
    constructor(address _seller, address _arbiter, uint256 _targetAmount) {
        buyer = msg.sender;
        seller = _seller;
        arbiter = _arbiter;
        targetAmount = _targetAmount;
        currentStatus = Status.Pending;
    }

    /**
     * @notice Allows the buyer to lock the purchase price inside the contract balance.
     */
    function deposit() external payable inStatus(Status.Pending) onlyRole(buyer) {
        if (msg.value != targetAmount) revert IncorrectFundingAmount();
        currentStatus = Status.Shipped;
        emit Funded(msg.sender, msg.value);
    }

    /**
     * @notice Allows the seller to verify dispatch of the physical/digital asset.
     */
    function markShipped() external inStatus(Status.Shipped) onlyRole(seller) {
        currentStatus = Status.Delivered;
        emit ShippedStatusConfirmed();
    }

    /**
     * @notice Buyer releases funds directly to the seller upon satisfactory delivery.
     */
    function release() external inStatus(Status.Delivered) onlyRole(buyer) nonReentrant {
        currentStatus = Status.Resolved;
        uint256 payout = address(this).balance;

        emit ResolvedAndSettled(seller, payout);

        (bool success, ) = seller.call{value: payout}("");
        if (!success) revert TransferFailed();
    }

    /**
     * @notice Either buyer or seller can halt delivery settlement if an issue occurs.
     */
    function initiateDispute() external inStatus(Status.Delivered) {
        if (msg.sender != buyer && msg.sender != seller) revert Unauthorized();
        currentStatus = Status.Disputed;
        emit DisputeRaised(msg.sender);
    }

    /**
     * @notice Allows the designated arbiter to settle a dispute and split funds.
     * @param buyerPayout Amount allocated back to the buyer wallet in wei.
     * @param sellerPayout Amount allocated to the seller wallet in wei.
     */
    function resolveDispute(uint256 buyerPayout, uint256 sellerPayout)
        external
        inStatus(Status.Disputed)
        onlyRole(arbiter)
        nonReentrant
    {
        uint256 totalContractBalance = address(this).balance;
        if (buyerPayout + sellerPayout != totalContractBalance) revert IncorrectFundingAmount();

        currentStatus = Status.Resolved;

        if (buyerPayout > 0) {
            (bool successBuyer, ) = buyer.call{value: buyerPayout}("");
            if (!successBuyer) revert TransferFailed();
        }

        if (sellerPayout > 0) {
            (bool successSeller, ) = seller.call{value: sellerPayout}("");
            if (!successSeller) revert TransferFailed();
        }

        emit ResolvedAndSettled(arbiter, totalContractBalance);
    }
}
```

---

### Deep-Dive Function Audits (The Checks-Effects-Interactions Pattern)

---

#### 1. The `release()` Function

---

- **Checks:** The `inStatus(Status.Delivered)` guard runs first. It verifies that the lifecycle status is exactly `Delivered`. Next, the `onlyRole(buyer)` modifier asserts that only the buyer's wallet can trigger this direct settlement. Finally, the `nonReentrant` flag ensures no execution interleaving is possible.
- **Effects:** The state updates immediately: `currentStatus = Status.Resolved;`. This write happens **before** any funds move. This configuration prevents malicious reentrancy loops from re-entering the function while the status is still set to `Delivered`.
- **Interactions:** The contract executes a low-level call: `seller.call{value: payout}("")`. This hands off execution to the seller's external address. It then handles the return value explicitly to guarantee settlement completion.

---

#### 2. The `resolveDispute()` Function

---

- **Checks:** Restricts execution to the `arbiter` address. It checks that the current state is explicitly set to `Disputed`. It also runs an arithmetic sanity check: `buyerPayout + sellerPayout == totalContractBalance`. This ensures the contract is completely cleared out without leaving stuck funds.
- **Effects:** Flips the state variable `currentStatus` directly to `Resolved`. This locks out further execution before making external calls.
- **Interactions:** The contract executes low-level Ether transfers to both the buyer and seller addresses. Each operation checked via its boolean return value.
