# Acceptance

> Status: ACTIVE PRODUCT LEDGER — PLATFORM BASELINE VERIFIED; PRODUCT FEATURES NOT YET IMPLEMENTED
>
> `TODO` means an explicitly requested requirement is not implemented. `DRAFT` means the proposed product structure still awaits user approval.

## 1. Requirement Ledger

| ID | Device Scope | Requirement | Source | Status | Verification |
| --- | --- | --- | --- | --- | --- |
| REQ-PRODUCT-001 | SHARED | One coherent Mate X7 + GT 5 Pro tennis product | User request | TODO | Product structure drafted; no implementation |
| REQ-WATCH-001 | WATCH | Watch supports start, in-workout view, pause, resume, finish and quick result | User request | TODO | Product flow drafted; no implementation |
| REQ-WATCH-M1-001 | WATCH | M1 completes a manual/Mock-data Session: Ready, Start, timer, scoring, Pause/Resume, Finish Confirmation and Quick Result | User direction 2026-10-07 | TODO | Physical GT 5 Pro full-flow validation |
| REQ-WATCH-M1-002 | WATCH | M1 Active Workout displays duration, mock heart rate, mock stroke count and current score; no unapproved metrics | User direction 2026-10-07 | TODO | Runtime and visual validation |
| REQ-PHONE-001 | PHONE | Phone supports home, history, workout detail, long-term statistics, settings and device management | User request | TODO | Product flow drafted; no implementation |
| REQ-PHONE-002 | PHONE-COMPACT / PHONE-EXPANDED | Folded and expanded presentations are independently designed | User request | TODO | Separate product behavior documented; no visual design |
| REQ-PHONE-003 | PHONE-COMPACT / PHONE-EXPANDED | Fold/unfold preserves applicable product state | AGENTS.md | DRAFT | Awaiting product approval |
| REQ-STATE-001 | WATCH | Workout uses one authoritative explicit state machine | Product architecture proposal | PASS | Physical GT 5 Pro Phase 2 validation: Ready, Active, Paused, Finish Confirmation, Quick Result, transient Complete, reset, and a second zero-based session PASS |
| REQ-X-001 | CROSS-DEVICE | Completed watch record reaches phone history and analysis flow through Queue, Retry, Dedup and ACK | User confirmation 2026-09-19 | TODO | Product scope confirmed; no implementation |
| REQ-X-002 | CROSS-DEVICE | Watch workout continues without phone availability | Product architecture proposal | DRAFT | Awaiting product approval |
| REQ-MVP-001 | SHARED | MVP excludes unapproved tennis metrics and real sensor integration | User constraint | TODO | Specifications inspected; no code exists |
| REQ-PROCESS-001 | SHARED | No UI engineering before product structure approval | User constraint | TODO | Platform feasibility is complete; product-feature migration remains controlled by approved scope and specifications |
| REQ-PLATFORM-001 | PHONE-COMPACT / PHONE-EXPANDED | Mate X7 phone client runs normally on DEL-LX9 / EMUI 15 and is verified in both folded and unfolded states | User requirement 2026-09-21 | PASS | Physical Mate X7 probe: build, install, launch, fold/unfold, state continuity and window resize PASS |
| REQ-PLATFORM-002 | WATCH | GT 5 Pro production development framework may be frozen only after HarmonyOS 6.0.0.32 physical-device installation and launch verification | User requirement 2026-09-21 | PASS | `GT5Pro-CLEAN-OFFICIAL-API10`: physical install PASS and physical launch PASS; Lite Wearable confirmed |
| REQ-PLATFORM-003 | CROSS-DEVICE | Domain Session and Sync Protocol remain independent of the transport adapter and Wear Engine API objects | Superseded by REQ-X-003 | SUPERSEDED | Requirement retained for traceability |
| REQ-X-003 | CROSS-DEVICE | Cross-device domain synchronization protocol must not depend on a specific communication SDK | User requirement 2026-09-21 | TODO | Architecture review plus transport-substitution/integration verification; no implementation exists |

## 2. Status Values

- `DRAFT`: proposed but not approved.
- `TODO`: approved requirement, not implemented.
- `PASS`: implemented and supported by current evidence.
- `FAIL`: current verification failed.
- `BLOCKED`: explicit dependency prevents verification.
- `SUPERSEDED`: replaced; original ID remains.

## 3. MUST NOT REGRESS

- Phone and watch must not become duplicate full products.
- PHONE-COMPACT and PHONE-EXPANDED must remain independent presentation baselines.
- WATCH must remain an independent wrist-appropriate baseline.
- No unapproved tennis metric may enter product or UI requirements.
- No real sensor capability may be assumed without verification.
- No UI engineering begins before product structure approval.
- Phone application code must remain Android/Kotlin/Jetpack Compose, never ArkTS/ArkUI.
- Mate X7 runtime must be verified separately in folded and unfolded states before platform acceptance.
- The confirmed watch architecture must remain Lite Wearable unless new physical-device evidence and an explicit decision replace it.
- Session domain models must not depend on transport SDK objects.

## 4. Platform Verification Baseline

| Scope | Result | Evidence |
| --- | --- | --- |
| Mate X7 platform probe | PASS | Physical build, install, launch, fold/unfold, state continuity and window resize |
| GT 5 Pro Lite Wearable baseline | PASS | `GT5Pro-CLEAN-OFFICIAL-API10`; physical install and launch |
| GT 5 Pro Error 40 historical baseline | HISTORICAL FAIL | API18-compatible `minPlatformVersion = 18` / `compatible = 50100018`; investigation closed for API10 |

## 5. Verification Matrix

| Scope | Result | Evidence |
| --- | --- | --- |
| GT 5 Pro Phase 2 Mock Session lifecycle | PASS | `AceTennis-P2-010-COMPLETE-RESET-API10-signed.hap`: full state lifecycle, timer pause/resume, finish confirmation, Quick Result, reset, and a second session starting at `00:00` physically validated |
| GT 5 Pro Phase 3 P3-004 manual scoring | PASS | `AceTennis-P3-004-DEUCE-ADVANTAGE-API10-signed.hap`: manual point/game scoring, Deuce/Advantage transitions, game increment, and point reset physically validated |
| GT 5 Pro Phase 3 P3-005 basic Set scoring | PASS | `AceTennis-P3-005-BASIC-SET-API10-signed.hap`: `5–3 → 6–3` and `6–5 → 7–5` Set awards, `5–5 → 6–5` no-set boundary, `6–6 → TIEBREAK_PENDING` input blocking, Quick Result Set/Game display, and new-session scoring reset physically validated |
| GT 5 Pro Phase 3 P3-006 score Undo / correction | PASS | User-reported physical GT 5 Pro acceptance: TB Pending, Game, and Set Undo; score-button recovery; Paused Undo timer continuity; and Workout lifecycle regression all PASS. Repository artifact: `AceTennis-P3-006-UNDO-API10-signed.hap`; tested-device hash linkage and source commit linkage are UNKNOWN. |
| GT 5 Pro Phase 4 P4-001 `@system.storage` capability spike | PASS | User physical-device photos confirm missing-key read, JSON write/read, restart persistence, overwrite/read-back, delete/read-back/restart-missing, and expected invalid-key error `202; Invalid parameter`, with no crash. Tested HAP, SHA-256, and source mapping are UNKNOWN. |

### P3-006 Detailed Physical Acceptance

| Function | Expected behavior | Physical result | Evidence type | Acceptance |
| --- | --- | --- | --- | --- |
| TB Pending Undo | Restores the preceding Games/Points state and re-enables score controls | PASS | USER_CONFIRMED_PHYSICAL_PASS | PASS |
| Game Undo | Restores the complete pre-game scoring snapshot | PASS | USER_CONFIRMED_PHYSICAL_PASS | PASS |
| Set Undo | Restores Sets, Games, and Points before the Set award | PASS | USER_CONFIRMED_PHYSICAL_PASS | PASS |
| Paused Undo | Corrects score while preserving `PAUSED` and stopped timing | PASS | USER_CONFIRMED_PHYSICAL_PASS | PASS |
| Workout lifecycle regression | Ready → Active → Paused → Active → Finish Confirmation → Quick Result → Ready remains valid | PASS | USER_CONFIRMED_PHYSICAL_PASS | PASS |

Historical P3-006 scope closure: platform feasibility and the Phase 2 workout state machine were complete at that point. This P3-specific record does not supersede the later P4-001 storage acceptance. Tiebreak implementation, real sensors, phone sync, history, and tennis algorithms remain out of the P3 result's scope.

### P4-001 Detailed Physical Acceptance — Lite Wearable Storage API

| Function | Physical result | Evidence type | Acceptance |
| --- | --- | --- | --- |
| Missing-key read | PASS | USER_CONFIRMED_PHYSICAL_PASS / USER_PHYSICAL_DEVICE_PHOTOS | PASS |
| JSON write | PASS | USER_CONFIRMED_PHYSICAL_PASS / USER_PHYSICAL_DEVICE_PHOTOS | PASS |
| JSON read | PASS — `JSON: WRITE` | USER_CONFIRMED_PHYSICAL_PASS / USER_PHYSICAL_DEVICE_PHOTOS | PASS |
| App restart persistence | PASS — startup value `FOUND` | USER_CONFIRMED_PHYSICAL_PASS / USER_PHYSICAL_DEVICE_PHOTOS | PASS |
| Overwrite and read-back | PASS — `JSON: OVERWRITE` | USER_CONFIRMED_PHYSICAL_PASS / USER_PHYSICAL_DEVICE_PHOTOS | PASS |
| Delete, read-back, and restart-missing | PASS — `MISSING` after delete and restart | USER_CONFIRMED_PHYSICAL_PASS / USER_PHYSICAL_DEVICE_PHOTOS | PASS |
| Invalid-key error handling | PASS — expected failure reported as `202; Invalid parameter` without crash | USER_CONFIRMED_PHYSICAL_PASS / USER_PHYSICAL_DEVICE_PHOTOS | PASS |
| App stability | PASS — install and launch succeed; no crash | USER_CONFIRMED_PHYSICAL_PASS / USER_PHYSICAL_DEVICE_PHOTOS | PASS |

`P4_001_PHYSICAL_ACCEPTANCE = PASS`

This verifies only the observed basic `@system.storage` behavior on the physical GT 5 Pro. It does not make a tool-only build result into physical evidence, and it does not implement Session Persistence. The exact installed HAP, artifact SHA-256, and source commit relationship remain `UNKNOWN`.

`COMPLETED = P4-001`; `CURRENT_PHASE = WATCH_SESSION_PERSISTENCE_PLANNING`; `NEXT_IMPLEMENTATION_PHASE = P4-002_SESSION_RECORD_MODEL`.

## 6. Product Approval Checklist

- [ ] Core goal approved.
- [x] Device responsibilities confirmed at product-scope level; details remain open.
- [ ] User flows approved.
- [x] Phone Screen Map scope confirmed; visual design remains open.
- [x] Watch Screen Map scope confirmed; visual design remains open.
- [x] Workout State Machine approved and physically validated on GT 5 Pro.
- [x] Completed-record sync stages confirmed; protocol details remain open.
- [ ] MVP scope approved.
