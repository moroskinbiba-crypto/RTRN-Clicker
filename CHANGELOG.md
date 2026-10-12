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


## Full audit: visual polish, balance and save reliability

- Added a restrained sci-fi observatory background, a stable procedural starfield, a softly illuminated tower capsule, and clearer type hierarchy without adding external image dependencies.
- Improved responsive behavior for desktop and narrow phones, safer mobile-area padding, keyboard focus and tower activation, zoom support, and reduced-motion preferences.
- Fixed the daily reward rotation so the visible day and claimable reward stay in sync. The seventh-day reward is now a time-limited production boost rather than a permanent prestige currency grant.
- Capped offline earnings at eight hours, clarified the actual payout percentage and cap, and saved the payout immediately to prevent repeat claims after a fast reload.
- Hardened Telegram CloudStorage loading against malformed saves and slow callbacks; a newer local save is preferred. Full reset removes the local save and Telegram CloudStorage entry.
- Fixed random-event banners leaving stale event IDs after their timeout, which could block future random events.
- Added immediate saves for manual building/upgrades/research purchases, daily rewards and challenge state changes while avoiding unnecessary saves per automatic purchase.
- Rebalanced challenge one and added production/click-power requirements for higher-difficulty challenges, with the requirements visible in the UI.
- Added regression tests for daily rotation, offline caps and rates, event cleanup, accessibility, save-race protection, and CI action versions.
