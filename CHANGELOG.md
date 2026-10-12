# RTRS Clicker — development notes

## Cookie Clicker-inspired systems

- Added timed golden signals with several positive rewards and a risky interference variant after awakening the radio elders.
- Added radio elders and signal parasites that siphon part of passive production and return stored signals when removed.
- Added time crystals and a 20-level modulator, giving long-term goals beyond building purchases.
- Added a fluctuating radio-equipment stock market with dividends and a ledger-safe buy/sell flow.
- Added a three-plot timed garden with three seed types, crop rewards, temporary production effects, and crystal rewards.
- Added four collectible seasonal radio artifacts and a permanent production reward for completing the set.
- Added a permanent legacy upgrade tree purchased with tokens from the Great Reset.
- Expanded achievements and the live radio-news ticker.
- Prestige now uses cumulative lifetime signal production and tracks already-claimed frequency points, preventing repeated claims after a Great Reset.
- Save migration includes the new systems while preserving the existing `rtrs_v2` save key and Telegram CloudStorage support.
- Corrected the last-save timestamp restore so offline gains can be calculated; timed buffs are removed and recalculated after expiry.

## Verification

Run `node tests/validate.mjs` from the repository root. It parses both scripts and runs smoke tests for migration, multipliers, stock accounting, golden signals, and the garden.
