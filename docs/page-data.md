## Data Structures & Storage Layout

---

### Variables & Type Mappings

---

The state layout is intentionally compact to preserve storage efficiency:

- `address public buyer;` Primitive type. Stores the account responsible for funding the transaction.
- `address public seller;` Primitive type. Stores the account receiving the funds upon successful contract resolution.
- `address public arbiter;` Primitive type. Stores the authorized independent arbitrator account for dispute settlement.
- `uint256 public targetAmount;` Primitive type. Stores the explicit financial value in wei required to fulfill the purchase.
- `Status public currentStatus;` Custom enum value representing the contract's real-time operational stage.

_Architectural Choice:_ Mappings or dynamic arrays are avoided here. This design represents a single-deal instance architecture. Each physical transaction instantiates a clean, independent contract clone rather than storing multiple unrelated deals inside a single shared table.

---

### Structs & Enums

---

```solidity
enum Status { Pending, Shipped, Delivered, Disputed, Resolved }
```

An `enum` compiles down natively into an ordinary `uint8` integer type. This structure keeps tracking simple. It prevents unmapped arbitrary states from corrupting the internal state machine.

---

### Storage vs. Memory vs. Calldata

---

| Storage Type                       | Gas Cost & Behavior                                                      |
| :--------------------------------- | :----------------------------------------------------------------------- |
| **Storage (Persistent State)**     | Ultra-expensive (up to 20,000 gas). Permanently alters blockchain disk.  |
| **Memory (Temporary Mutable)**     | Very cheap. Allocation disappears immediately when function finishes.    |
| **Calldata (Temporary Immutable)** | Cheapest array/struct reading area. Direct, read-only transaction input. |

---

### Storage Slot Layout

---

Compilation optimization packs variables tightly according to EVM 32-byte rules:

```text
Slot 0: [ 12 bytes: empty ] [ 20 bytes: address buyer  ] -> Packs into single 32-byte word
Slot 1: [ 12 bytes: empty ] [ 20 bytes: address seller ] -> Packs into single 32-byte word
Slot 2: [ 12 bytes: empty ] [ 20 bytes: address arbiter] -> Packs into single 32-byte word
Slot 3: [ 32 bytes:          uint256 targetAmount      ] -> Demands full 32-byte word
Slot 4: [ 31 bytes: empty ] [  1 byte:  Status enum    ] -> Fits into uint8 bounds
```

---
