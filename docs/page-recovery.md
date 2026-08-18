## Edge Cases, Failure Modes & Recovery

---

### Realistic "What-If" Edge Cases

---

#### 1. The Silent Arbiter (Abandonment)

---

- **The Scenario:** The buyer raises a dispute, changing the contract state to `Disputed`. However, the arbiter loses access to their private key or abandons the project, leaving them unable to call `resolveDispute()`.
- **The Consequence:** The funds are trapped inside the contract indefinitely. Because the contract is locked in the `Disputed` state, neither the buyer nor the seller can access the funds.

#### 2. The Seller Refuses to Ship

---

- **The Scenario:** The buyer deposits the funds, moving the contract state to `Shipped`. The seller decides not to ship the item but refuses to take any further action, meaning the contract never transitions to the `Delivered` state.
- **The Consequence:** Because the dispute mechanism can only be triggered from the `Delivered` state, the buyer cannot initiate a formal dispute. This creates a standoff where the funds remain locked.

---

### Emergency Recovery & Corrective Fixes

---

To resolve these edge cases, you can add a time-locked safety valve to the contract architecture:

```solidity
uint256 public constant DISPUTE_WINDOW = 30 days;
uint256 public shipmentTimestamp;

function initiateDefaultRefund() external inStatus(Status.Shipped) onlyRole(buyer) {
    if (block.timestamp < shipmentTimestamp + DISPUTE_WINDOW) revert WindowNotOpen();
    currentStatus = Status.Resolved;
    payable(buyer).transfer(address(this).balance);
}
```

This time-lock mechanism allows the buyer to safely claw back their deposit if the seller abandons the transaction and fails to ship the goods within a 30-day window.
