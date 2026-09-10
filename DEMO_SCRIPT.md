# 🎬 Divergence Router — 3-Minute Video Demo Script

> **Target Duration**: 03:00 (180 Seconds)  
> **Judges Focus**: Innovation (20%), Technical Implementation (25%), UX (20%), Ecosystem Impact (20%), Demo Clarity (15%)

---

## ⏱️ Timeline & Scene Breakdown

### 0:00 – 0:35 | The 1D Problem & The Core Breakthrough
* **Visual**: Show traditional prediction market interfaces with binary UP / DOWN choices on a single market.
* **Speaker Voiceover**:
  > *"Every event contract today is built like a coin-flip: pick an asset, pick 15 minutes, and bet UP or DOWN. But real traders don't just gamble on direction—they trade relative value, spreads, and term structure.
  > 
  > When we looked at DreamDEX, we discovered that while event contracts don't have strike prices, they have two live, orthogonal dimensions: **Asset** (BTC, ETH) and **Cadence Window** (15m, 1h).
  > 
  > Introducing **Divergence Router**: Somnia's first 1-click structured execution engine that trades the spread between two live event-contract legs simultaneously."*

---

### 0:35 – 1:15 | User Experience & The Payoff Matrix (Flag 1 & Flag 3 Fixes)
* **Visual**: Navigate through the Divergence Router trading terminal. Select "Cross-Asset Divergence Split (BTC-15m ↑ / ETH-15m ↓)". Click "Review Position" to trigger the Payoff Matrix modal.
* **Speaker Voiceover**:
  > *"In traditional finance, a pairs trade makes continuous money on relative percentage outperformance. But binary contracts are all-or-nothing: if both assets pump together, an ETH short leg drops to absolute zero.
  > 
  > Instead of falling into that correlation trap, Divergence Router is engineered explicitly around **decorrelation**.
  > 
  > Look at our interactive 4-Quadrant Payoff Matrix: before confirming, traders see the exact math. You aren't hoping for a fractional percentage spread; you are betting that BTC and ETH will decouple. If BTC pumps and ETH dumps in the same window, you capture a 2x double-win payout. And if they move together, your position nets out cleanly without naked loss.
  > 
  > Notice also what this isn't: it's not an ERC-4626 vault with passive LP decay. It is a clean, stateless 1-click execution router."*

---

### 1:15 – 1:55 | The Technical "Money Shot": Atomic Rollback (Flag 2 Fix)
* **Visual**: Activate "Chaos Mode / Thin-Book Simulator" in the UI. Attempt to place a split on a starved or illiquid market window for Leg B. Show the on-chain transaction revert and the user's untouched wallet balance.
* **Speaker Voiceover**:
  > *"Now for the hardest technical challenge in multi-leg trading: **legging-in**. On thin order books, if Leg A fills and Leg B fails, the trader is stranded holding an unhedged, naked directional bet.
  > 
  > Watch what happens when our router encounters a starved book on Leg B. 
  > 
  > We click 'Execute Split'. The transaction attempts execution, detects that Leg B cannot fill within our slippage tolerance, and immediately reverts. 
  > 
  > Because both legs are executed sequentially within a single Solidity function in `DivergenceRouter.sol`, EVM atomicity gives us an ironclad guarantee: **either both legs fill within tolerance, or the entire transaction rolls back.** Not a single dollar of collateral was lost, and zero orphan tokens were left open."*

---

### 1:55 – 2:30 | Business & Ecosystem Impact: Organic Liquidity & Sub-Second Speed
* **Visual**: Show the Sub-Second Latency Ping counter in the navbar, the Live Spread Delta Tracker, and the Active Positions tab. Click "Claim Settlement" on an expired split to redeem collateral.
* **Speaker Voiceover**:
  > *"Why does this matter for the Somnia ecosystem?
  > 
  > First, **speed**: divergence spreads between 15-minute and 1-hour windows open and close in seconds. Somnia's sub-second block times and ultra-low fees make these micro-arbitrage trades viable for retail users for the first time.
  > 
  > Second, **liquidity**: every single split executed through our router provides simultaneous two-sided volume to DreamDEX's central limit order book. It turns retail traders into organic market-makers across disparate cadences and pairs."*

---

### 2:30 – 3:00 | Protocol Feedback & Closing
* **Visual**: Show `SDK-FEEDBACK.md` document, GitHub repository structure, and unit tests passing with 100% success.
* **Speaker Voiceover**:
  > *"We didn't just build an app; we contributed back to the ecosystem. In our SDK Feedback report, we documented our findings—including the architectural case for protocol-level atomic combo orders and offset contracts for vertical strikes.
  > 
  > With full unit test coverage, an atomic Solidity core, and a responsive frontend, Divergence Router demonstrates the true power of building structured derivatives on Somnia.
  > 
  > Thank you."*
