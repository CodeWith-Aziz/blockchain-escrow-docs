## Access Control & Trust Models

---

### Permissions Matrix

---

| Function Name       | Allowed Cryptographic Caller Role | Expected Starting State | Resulting End State |
| :------------------ | :-------------------------------- | :---------------------- | :------------------ |
| `deposit()`         | **Buyer Only**                    | `Pending`               | `Shipped`           |
| `markShipped()`     | **Seller Only**                   | `Shipped`               | `Delivered`         |
| `release()`         | **Buyer Only**                    | `Delivered`             | `Resolved`          |
| `initiateDispute()` | **Buyer OR Seller**               | `Delivered`             | `Disputed`          |
| `resolveDispute()`  | **Arbiter Only**                  | `Disputed`              | `Resolved`          |

---

### Trust Assumptions

---

This architecture reduces counterparty risk between the buyer and seller. However, it shifts complete trust onto the **Arbiter** address:

- **The Arbiter is Absolute:** If a transaction enters a disputed state, the arbiter has absolute unilateral control over fund distribution.
- **Collusion Vulnerability:** The contract cannot programmatically detect if an arbiter colludes privately with the seller to split the buyer's stolen deposit.

---

### Decentralization Strategies

---

To avoid relying on a single trusted arbiter address, you can use these decentralized alternatives:

1. **Multi-Signature Arbitration:** Set the `arbiter` address to a 2-of-3 Multisig contract (e.g., Gnosis Safe). This setup requires two independent dispute managers to sign off on a resolution.
2. **Decentralized Jury Protocols:** Connect the arbiter role directly to an on-chain dispute system like **Kleros**. If a dispute is raised, the contract passes arbitration control to a dynamic pool of crowd-sourced web3 jurors. These jurors are financially incentivized via game-theoretic token staking to vote honestly based on the evidence.

### Consequences of Compromise

---

If a hacker steals the arbiter's private key while a transaction is in the `Disputed` state, they can drain the locked funds immediately by calling `resolveDispute()`. They can bypass both the buyer and seller by routing the full balance to an external attacker-controlled address.

---
