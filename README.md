# ⚡ Divergence Router

> **1-Click Atomic Execution Engine for Structured Multi-Leg Event Contracts on Somnia DreamDEX**
> 
> *Winner-focused submission for the Somnia × DreamDEX Event Contracts Hackathon.*

[![Somnia Network](https://img.shields.io/badge/Network-Somnia_Shannon_Testnet-6366f1.svg)](https://shannon-explorer.somnia.network)
[![DreamDEX Protocol](https://img.shields.io/badge/Protocol-DreamDEX_CLOB-10b981.svg)](https://docs.dreamdex.io)
[![Solidity](https://img.shields.io/badge/Solidity-0.8.20-3b82f6.svg)](https://soliditylang.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

## 🎯 Executive Summary

Every current event-contract implementation on DreamDEX treats markets in **1D isolation**: a single asset, a single expiry window, and a binary UP/DOWN coin-flip.

**Divergence Router** turns binary primitives into **institutional-grade structured positions**. By simultaneously bridging the two native dimensions DreamDEX provides—**Asset** (BTC, ETH) and **Cadence Window** (15m, 1h)—Divergence Router enables traders to execute:

1. **Cross-Asset Divergence Splits**: Long BTC-15m UP + Long ETH-15m DOWN (monetizing decoupling events without directional market beta).
2. **Calendar Term-Structure Splits**: Long BTC-15m UP + Long BTC-1h DOWN (expressing a short-term momentum bounce within a macro downward trend).

---

## 🛡️ Resolving the 3 Core Traps (Engineering Preemption)

A critical differentiator of Divergence Router is that it addresses and solves three common flaws that undermine multi-market designs:

### 1. The "Binary Correlation Trap" (Economic Reframing)
* **The Trap**: In traditional finance, pairs trades profit from continuous deltas ($P_{\text{BTC}} - P_{\text{ETH}}$). In DreamDEX, event contracts are binary $\{0, 1\}$. If both BTC and ETH pump, both resolve UP—a DOWN hedge on ETH drops to 0, destroying the trade even if BTC gained more in percentage terms.
* **Our Solution**: We explicitly discard misleading "pairs trade" and "delta-neutral hedge" marketing. The product is strictly framed as a **"Divergence Split"**. Before confirming any trade, the user must review an interactive **4-Quadrant Payoff Matrix**:

| Leg A (BTC-15m) | Leg B (ETH-15m) | Payout per Split | Financial Dynamic |
| :---: | :---: | :---: | :--- |
| **UP** | **DOWN** | **$2.00$ (2x)** | **Target Divergence Realized** |
| **DOWN** | **UP** | **$0.00$** | Both Legs Failed |
| **UP** | **UP** | **$1.00$ (Flat)** | Macro Co-movement (Both Pumped) |
| **DOWN** | **DOWN** | **$1.00$ (Flat)** | Macro Co-movement (Both Dumped) |

### 2. "Legging-In" & Execution Slippage (Technical Implementation)
* **The Trap**: Testnet order books are thin. If an app attempts to buy Leg A and Leg B in separate calls, Leg A may fill while Leg B fails or slips wildly. The user is left holding an unhedged, naked single-leg bet.
* **Our Solution**: `DivergenceRouter.sol` enforces **EVM Transaction Atomicity**. Leg A and Leg B execute sequentially inside one Solidity transaction. If Leg B fails or slips past `minFillAmount`, the entire transaction reverts automatically, unwinding Leg A via EVM state rollback. **Legging-in is mathematically impossible.**

### 3. Mislabeling as a "Passive Yield Vault" (Scope & Architecture)
* **The Trap**: Labeling the system a "Vault" leads DeFi judges to expect ERC-4626 continuous yield farming. Rebalancing continuous LP capital across 15-minute expiring binary tokens creates an unfeasible gas overhead.
* **Our Solution**: Divergence Router is explicitly a **Stateless 1-Click Execution Router**. It holds zero continuous LP custody and runs no speculative rebalancing loops. Users supply capital on-demand to execute structured combo positions that resolve and disburse clean payouts.

---

## 🏗️ Architecture & Core Components

```
                                  DIVERGENCE ROUTER ARCHITECTURE
                                  
  ┌────────────────────────────────────────────────────────────────────────────────────────┐
  │                                     FRONTEND TERMINAL                                  │
  │  Next.js 14 • TailwindCSS • Viem • Wagmi • Lucide Icons • Lightweight Charts           │
  │  ┌───────────────────────┐  ┌────────────────────────┐  ┌───────────────────────────┐  │
  │  │ Strategy Mode Toggle  │  │ 4-Quadrant Payoff Modal│  │ Sub-second Spread Monitor │  │
  │  └───────────────────────┘  └────────────────────────┘  └───────────────────────────┘  │
  └───────────────────────────────────────────┬────────────────────────────────────────────┘
                                              │
                                              ▼
  ┌────────────────────────────────────────────────────────────────────────────────────────┐
  │                            OFF-CHAIN ROUTING & PRE-FLIGHT                              │
  │  TypeScript SDK Engine (@somnia-chain/markets-sdk + viem)                              │
  │  • Market Discovery (listLiveBinaryMarkets)                                            │
  │  • Pre-flight Book Depth & Slippage Simulation (scripts/quant.ts)                      │
  │  • Chaos Revert Verifier (scripts/chaos-thin-book.ts)                                  │
  └───────────────────────────────────────────┬────────────────────────────────────────────┘
                                              │
                                              ▼
  ┌────────────────────────────────────────────────────────────────────────────────────────┐
  │                       SMART CONTRACT LAYER (Somnia Testnet 50312)                      │
  │                                                                                        │
  │  DivergenceRouter.sol                                                                  │
  │  ┌──────────────────────────────────────────────────────────────────────────────────┐  │
  │  │  openSplit(MarketLeg legA, MarketLeg legB, uint256 collateral, uint64 deadline)  │  │
  │  │  • Pulls tUSDC collateral (0x70a86D8842FB63C4Ad2b7cdddF530eBf1BB25d8E)           │  │
  │  │  • Sequential complete-set minting (mintCompleteSet) on BinaryMarketsModule       │  │
  │  │  • Enforces minFillAmount on both legs -> EVM rollback on any breach             │  │
  │  │  • Stores position metadata linked to msg.sender                                 │  │
  │  └──────────────────────────────────────────────────────────────────────────────────┘  │
  │  ┌──────────────────────────────────────────────────────────────────────────────────┐  │
  │  │  redeemSplit(uint256 positionId)                                                 │  │
  │  │  • Queries on-chain settlement status from BinarySettlement                      │  │
  │  │  • Redeems winning outcome tokens across both legs                               │  │
  │  │  • Disburses 100% of collateral payout back to position owner                    │  │
  │  └──────────────────────────────────────────────────────────────────────────────────┘  │
  └────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## ⚡ Why Somnia? The Sub-Second Advantage

Divergence and term-structure mispricings between fast (15m) and slow (1h) windows are ephemeral. On slow, high-gas L1s or congested L2s:
* Spread opportunities disappear during block confirmation delays.
* Multi-leg atomic routing is cost-prohibitive for retail traders.

**Somnia's high-throughput architecture (100k+ TPS, sub-second block times, and minimal gas fees)** enables Divergence Router to evaluate live orderbook depth and execute atomic multi-leg transactions instantly, allowing retail traders to capture decorrelation premiums previously reserved for proprietary HFT desks.

---

## 📋 Deployed Contract Addresses (Somnia Shannon Testnet)

| Contract | Address | Explorer Link |
| :--- | :--- | :--- |
| **DivergenceRouter** | `0xdAf78533193043107dC802E67696E4aB7EB2875F` | [Verify On-Chain](https://shannon-explorer.somnia.network/address/0xdAf78533193043107dC802E67696E4aB7EB2875F) |
| **Live Proof Split Tx (`openSplit`)** | `0xdfed824dd162cb10517c5faa5a972fc2f00455e34e5eb32bdca7c03f72f3dc53` | [View Execution](https://shannon-explorer.somnia.network/tx/0xdfed824dd162cb10517c5faa5a972fc2f00455e34e5eb32bdca7c03f72f3dc53) |
| **Live Proof Redeem Tx (`redeemSplit`)** | `0x12412c7b107249aefb8114435762db9302ec45452e81a9e1b07ee1dee632c632` | [View Execution](https://shannon-explorer.somnia.network/tx/0x12412c7b107249aefb8114435762db9302ec45452e81a9e1b07ee1dee632c632) |
| **BinaryMarketsModule** | `0x3ecC694Cef705358864a646142ac17A90E29e388` | [Verify On-Chain](https://shannon-explorer.somnia.network/address/0x3ecC694Cef705358864a646142ac17A90E29e388) |
| **MarketsCore** | `0x2802504314685D89bF6C992CA5a8e7cC78bc0294` | [Verify On-Chain](https://shannon-explorer.somnia.network/address/0x2802504314685D89bF6C992CA5a8e7cC78bc0294) |
| **BinarySettlement** | `0xbF4a49e0Dfd092e5FBE8E5761064C49533e6Ed23` | [Verify On-Chain](https://shannon-explorer.somnia.network/address/0xbF4a49e0Dfd092e5FBE8E5761064C49533e6Ed23) |
| **OutcomeToken6909** | `0xB52c5934113Af5c0Bb20eb3C72290C8215f755b9` | [Verify On-Chain](https://shannon-explorer.somnia.network/address/0xB52c5934113Af5c0Bb20eb3C72290C8215f755b9) |
| **Collateral (tUSDC)** | `0x70a86D8842FB63C4Ad2b7cdddF530eBf1BB25d8E` | [Verify On-Chain](https://shannon-explorer.somnia.network/address/0x70a86D8842FB63C4Ad2b7cdddF530eBf1BB25d8E) |

---

## 🚀 Quick Start & Verification

### 1. Installation
```bash
git clone https://github.com/your-username/dreamdex-divergence-router.git
cd dreamdex-divergence-router
npm install
```

### 2. Run Comprehensive Test Suite
Verifies atomic fills, 100% collateral rollback on Leg B failure, and all 4 payoff matrix outcomes:
```bash
npx hardhat test
```

### 3. Run Quantitative Pre-Flight Engine
Discovers live Somnia testnet markets, computes live probability spreads, and validates order book depth:
```bash
npx tsx scripts/quant.ts
```

### 4. Run Live "Chaos Mode" Revert Demo
Simulates execution on a starved orderbook, proving on-chain that user collateral is completely safe:
```bash
npx tsx scripts/chaos-thin-book.ts
```

### 5. Run Starter Template On-Chain Log Discovery
Scans raw `MarketCreated` events backwards through Somnia blocks without indexer dependencies (integrated from `ec-dreamdex-hackathon-template`):
```bash
npx tsx scripts/discover-events.ts
```

### 6. Launch Frontend Terminal
```bash
cd frontend
npm install
npm run dev
```
Open `http://localhost:3000` to interact with the trading terminal.

---

## 📊 Mapping to Hackathon Judging Criteria

| Criterion | Weight | How Divergence Router Wins |
| :--- | :---: | :--- |
| **Innovation & Originality** | **20%** | Moves beyond 1D coin-flips to create Somnia's first structured relative-value / decorrelation engine across Asset and Window dimensions. |
| **Technical Implementation** | **25%** | EVM-level atomic router (`DivergenceRouter.sol`), deep integration with `@somnia-chain/markets-sdk`, and zero-slippage rollback tests. |
| **User Experience & Design** | **20%** | Intuitive Next.js 14 terminal with sub-second latency monitor, 1-click execution, and transparent 4-Quadrant Payoff Matrix. |
| **Business & Ecosystem Impact** | **20%** | Drives organic two-sided volume to DreamDEX order books, providing liquidity across disparate trading windows. |
| **Presentation & Demo** | **15%** | Second-by-second 3-minute video demo (`DEMO_SCRIPT.md`) featuring the "Chaos Revert" money shot and professional SDK feedback. |
