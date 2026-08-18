## System Architecture & State Flow Diagrams

---

### Visual Architecture

---

The architecture comprises five structural actors interacting via cryptographic transaction execution:

```text
                  +-----------------------------------------+

                  |         Client Frontend Application     |
                  +--------------------+--------------------+
                                       |
                     Dispatches Signed JSON-RPC Transactions
                                       |
                                       v
                  +-----------------------------------------+

                  |         EVM Blockchain Network          |
                  |                                         |
                  |  +-----------------------------------+  |
                  |  |          Escrow Contract          |  |
                  |  |                                   |  |
                  |  |  [ Balance: Native Coin / Token ] |  |
                  |  +---+---------------+-----------+---+  |
                  +------|---------------|-----------|------+
                         ^               ^           ^

                         |               |           |
               Deposits / Releases   Ships Goods  Resolves Disputes

                         |               |           |
                +--------+---+     +-----+------+  +-+----------+

                | Buyer Wallet|     |Seller Wallet|  |Arbiter Wallet|
                +------------+     +------------+  +------------+
```

---

### State Machine

---

The escrow lifecycle is modeled explicitly via an `enum Status`. Valid transitions are protected by cryptographic guards. Invalid state jumps will trigger a transaction revert:

```text
       +------------------+

       |   0. Pending     |
       +--------+---------+
                |
                |  Buyer calls deposit()
                v
       +------------------+

       |   1. Shipped     |
       +--------+---------+
                |
                |  Seller calls markShipped()
                v
       +------------------+

       |  2. Delivered    |
       +---+--------+-----+

           |        |
           |        | Buyer calls initiateDispute()
           |        v
           |   +------------------+
Buyer calls|   |   3. Disputed    |
  release()|   +--------+---------+

           |            |
           |            | Arbiter calls resolveDispute()
           v            v
       +---+------------+---------+

       |   4. Resolved / Closed   |
       +--------------------------+
```

---

#### Transition Invariants

---

- **Pending ➡️ Shipped:** Only possible if `msg.value` exactly matches the target item price.
- **Shipped ➡️ Delivered:** Only callable by the designated seller wallet.
- **Delivered ➡️ Resolved:** Direct release path via the buyer wallet when transactions proceed smoothly.
- **Delivered ➡️ Disputed:** Triggered exclusively by the buyer within their designated inspection window.
- **Disputed ➡️ Resolved:** Terminal path executed exclusively by the arbiter's cryptographic signature.

---

### Interaction Boundaries

---

Control leaves the runtime boundary of the contract at two specific execution points:

1. **Successful Delivery Settlement:** The contract transfers its entire held balance to the seller's address via a low-level call.
2. **Dispute Resolution Settlement:** The contract splits or transfers the held balance to the buyer or seller based on the arbiter's explicit runtime input.

---
