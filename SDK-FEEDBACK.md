# 🛠️ DreamDEX SDK & Protocol Engineering Feedback

> **Author**: Divergence Router Engineering Team  
> **Date**: September 2026  
> **Audience**: Somnia Network & DreamDEX Core Protocol Engineers

During the development of **Divergence Router**, our team deeply integrated with the `@somnia-chain/markets-sdk` (v0.29.0), the on-chain `BinaryMarketsModule`, and the underlying CLOB pools. 

Below is an objective, constructive engineering report detailing protocol bottlenecks encountered, how we engineered around them, and recommended improvements for future iterations of DreamDEX.

---

## 1. Absence of a Strike-Price Axis in Event Contracts

### The Constraint
Current DreamDEX event contracts operate exclusively on a **time-window comparison**: whether the asset price at the expiry timestamp is $\ge$ the opening price. There is no concept of a strike price or price hurdle ($P_{\text{expiry}} \ge K$).

### The Impact on Derivative Builders
In traditional derivatives finance, structured products like vertical bull/bear spreads, butterflies, and condors require different strikes along the same asset and timeframe. Without a strike axis, developers cannot build vertical spreads for a single market window.

### How We Engineered Around It
Instead of abandoning structured products, we realized DreamDEX provides two orthogonal, live dimensions:
1. **Asset Axis**: BTC vs. ETH.
2. **Cadence Window Axis**: 15m vs. 1h.

By pairing legs across these two dimensions, Divergence Router constructs **Cross-Asset Divergence Splits** and **Calendar Term-Structure Splits**, introducing structured payoffs to Somnia without requiring contract strikes that don't exist.

### Recommendation for DreamDEX Core
Consider deploying **Offset Event Contracts** (e.g., $P_{\text{expiry}} \ge P_{\text{open}} + 1.5\%$). This introduces a pseudo-strike dimension and unlocks vertical options spreads on Somnia.

---

## 2. Lack of Protocol-Native Atomic Combo Orders

### The Constraint
Currently, placing trades across multiple event contracts requires submitting separate `placeOrder` or `mintSet` transactions, or deploying a custom smart contract router.

### The Impact
If a trading bot or retail user attempts a multi-leg trade directly via the SDK, they face **legging-in risk**: Leg A fills on-chain, but before Leg B executes, the price moves or liquidity evaporates. The trader is left with an accidental naked directional bet.

### How We Engineered Around It
We authored `DivergenceRouter.sol`, which wraps both leg executions into a single atomic Solidity function call (`openSplit`). Leveraging EVM atomicity, if Leg B reverts or slips past `minFillAmount`, the entire transaction reverts and Leg A is automatically rolled back.

### Recommendation for DreamDEX Core
We strongly recommend DreamDEX implement a native **Multi-Leg / Combo Order Type** in `BinaryMarketsModule` (e.g. `placeComboOrder(bytes32[] marketIds, uint8[] sides, uint256[] amounts)`). Several hackathon teams are independently reinventing atomicity at the application layer; moving this primitive to the core protocol would establish DreamDEX as the default venue for structured DeFi derivatives.

---

## 3. Orderbook Fill Simulation Endpoint (`quoteFill`)

### The Constraint
To compute the expected slippage or price impact of taking liquidity on a market, the SDK requires fetching the entire orderbook (`fetchOrderBook(symbol, depth)`) and manually iterating through the price-tick arrays in client-side code.

### The Impact
- High RPC round-trip overhead on rapid quoting bots.
- In race conditions, book depth changes between the `fetchOrderBook` call and the transaction arrival, causing unexpected slippage.

### Recommendation for DreamDEX Core
Surface a lightweight on-chain view function (or indexer query) such as:
```solidity
function quoteFill(
    address pool,
    uint8 side,
    uint256 quantity
) external view returns (uint256 expectedAveragePrice, uint256 maxPriceImpact);
```
This would enable instantaneous pre-flight slippage checks for algorithmic strategies and eliminate off-chain tick reconstruction.

---

## 4. Documentation Polish & SDK Developer Experience

### Positives
* **Single Shared ERC-6909**: Storing all outcome tokens on one singleton contract (`OutcomeToken6909`) drastically simplified approvals and multi-market portfolio tracking compared to fragmented ERC-20 setups.
* **Deterministic CREATE3 Deployments**: Having identical contract addresses across testnet (50312) and mainnet (5031) significantly accelerated testing and environment configuration.
* **Zero Trading Fees**: The zero-fee model enabled multi-leg hedging and netting without eroding trader edge on small spread discrepancies.

### Areas for Improvement
* **Settled Market Discovery**: The fact that `loadMarkets()` skips finalized binary markets is a known gotcha. Explicitly highlighting `listBinaryMarkets({ status: "Finalized" })` on the main getting-started guide will save new developers hours of debugging unredeemed winnings.
* **Typing for PlaceOrderResult**: The unified verb `createOrder` returns a `UnifiedOrder` where `receipt` is nested under `order.info as PlaceOrderResult`. Standardizing top-level receipt access across the unified and trader tiers would improve TypeScript ergonomics.
