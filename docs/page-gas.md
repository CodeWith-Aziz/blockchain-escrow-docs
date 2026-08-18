## Gas Optimization & EVM Mechanics

---

### Identifying Expensive Operations

---

Storage operations dominate gas costs on the EVM:

- **SSTORE (Storage Write):** Modifying a storage variable from zero to non-zero costs 20,000 gas. Changing an existing storage value costs 5,000 gas.
- **SLOAD (Storage Read):** Reading a raw variable directly from storage costs up to 2,100 gas for "cold" storage locations.

---

### Implemented Optimization Techniques

---

1. **The `immutable` Keyword:** The addresses for the `buyer`, `seller`, and `arbiter`, along with the `targetAmount`, are declared as `immutable`. Instead of taking up expensive storage slots on the blockchain, these values are embedded directly into the contract's runtime bytecode during deployment. This reduces the cost of reading these values from a 2,100-gas storage read to a cheap 3-gas execution step.
2. **Custom Errors vs. String Reverts:** Instead of using traditional error handling like `require(condition, "Error: The caller is not authorized")`, which stores expensive text strings in the contract bytecode, this contract uses custom errors:

   ```solidity
   if (msg.sender != authorized) revert Unauthorized();
   ```

   Custom errors generate a compact 4-byte selector hash. This optimization saves more than 100 gas on every failed transaction check.

   ***

### EVM Execution Context

---

When an external wallet calls a function, the EVM runs a dispatch loop. It analyzes the first 4 bytes of the transaction data (the calldata selector) to find a matching function signature in the contract.

When transferring funds via `seller.call{value: amount}("")`, the EVM shifts execution control directly to the receiving address. If the receiving address is a smart contract, it runs its internal `receive()` or `fallback()` function. This shift can introduce security risks like reentrancy if your contract is not properly defended.

---
