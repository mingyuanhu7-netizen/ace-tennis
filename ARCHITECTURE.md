# Architecture

> Status: DRAFT — HIGH-LEVEL PRODUCT ARCHITECTURE; PLATFORM BASELINE VERIFIED
>
> 本文件记录技术架构与硬件能力。最新已验证的平台事实以 `AGENTS.md` 与 `PLATFORM_VALIDATION.md` 为准；产品架构、传输和传感器能力仍须按本文件及相关规范逐项确认。

## 1. Architecture Goals

NEEDS CONFIRMATION

## 2. Target Environments

| Target | Operating System / Version | Development Framework | Status |
| --- | --- | --- | --- |
| HUAWEI Mate X7 (DEL-LX9, Indonesia) | EMUI 15.0.0; build 15.0.0.166(C301E9R1P4patch01) | Android application architecture / Kotlin / Jetpack Compose | Physical platform probe PASS |
| HUAWEI WATCH GT 5 Pro (Indonesia) | HarmonyOS 6.0.0.32 | Lite Wearable / JavaScript / HML / CSS | `WATCH_APP_MODEL = LITE_WEARABLE_CONFIRMED`; API10 physical baseline PASS |

Do not generate ArkTS or ArkUI phone application code. The GT 5 Pro Lite Wearable model is physically verified by `GT5Pro-CLEAN-OFFICIAL-API10`; preserve its API10 baseline during feature migration. Historical Smart Wearable candidacy is superseded by DEC-PLATFORM-003.

## 3. Verified Capability Matrix

| Capability | Phone | Watch | Evidence | Status |
| --- | --- | --- | --- | --- |
| Fold-state detection | `NEEDS CONFIRMATION` | N/A | None | Unverified |
| Device communication | `NEEDS CONFIRMATION` | `NEEDS CONFIRMATION` | None | Unverified |
| Local persistence | `NEEDS CONFIRMATION` | `NEEDS CONFIRMATION` | None | Unverified |
| Background execution | `NEEDS CONFIRMATION` | `NEEDS CONFIRMATION` | None | Unverified |
| Crown input | N/A | `NEEDS CONFIRMATION` | None | Unverified |
| Sensor access | `NEEDS CONFIRMATION` | `NEEDS CONFIRMATION` | None | Unverified |
| Android USB debugging | Confirmed | N/A | Physical Mate X7: `adb get-state` returned `device`; `ro.product.model` returned `DEL-LX9`; `ro.build.version.emui` returned `EmotionUI_15.0.0` on 2026-09-21 | Verified |
| Lite Wearable installation and launch | N/A | Confirmed | `GT5Pro-CLEAN-OFFICIAL-API10`; physical install PASS and physical launch PASS | Verified |

No capability may be treated as available until evidence is recorded.

## 4. System Context

```text
                     TENNIS DOMAIN
                           │
                 Session State Machine
                           │
   Session / SessionSummary / SyncEnvelope / SyncStatus
                            │
             ┌─────────────┴─────────────┐
             │                           │
           PHONE                       WATCH
             │                           │
      Kotlin / Compose             Lite JS / HML / CSS*
             │                           │
      Phone Repository            Watch Repository
             │                           │
             └──────────┬────────────────┘
                        │
                  Sync Protocol
                        │
                Transport Adapter
                        │
              Huawei Wear Engine*
```

This is a logical architecture diagram, not an assertion that domain code is shared across Kotlin and ArkTS runtimes or that session authority exists on both devices. State ownership and repository responsibilities remain to be specified in Sections 6–9 and `CROSS_DEVICE_SPEC.md`.

`*` Lite Wearable is the verified watch stack: `WATCH_APP_MODEL = LITE_WEARABLE_CONFIRMED`. HUAWEI Wear Engine remains a candidate transport, not a validated integration. The sync protocol must remain independent of the transport SDK.

The four named data models are domain/protocol contracts above the transport boundary. They must not import, expose, or persist Huawei Communication SDK / Wear Engine API types.

## 5. Architectural Layers

```text
Presentation
↓
Presentation State
↓
Domain
↓
Data / Device Services
```

Layer responsibilities: `NEEDS CONFIRMATION`

## 6. Module Boundaries

### Shared Domain

NEEDS CONFIRMATION

### Phone

NEEDS CONFIRMATION

### Watch

NEEDS CONFIRMATION

### Cross-Device Communication

NEEDS CONFIRMATION

## 7. State Ownership

NEEDS CONFIRMATION

## 8. Data Flow

NEEDS CONFIRMATION

## 9. Persistence

Status: `P4-001 PHYSICAL CAPABILITY SPIKE COMPLETE — SESSION PERSISTENCE NOT IMPLEMENTED`.

`COMPLETED = P4-001`

`CURRENT_PHASE = WATCH_SESSION_PERSISTENCE_PLANNING`

`NEXT_IMPLEMENTATION_PHASE = P4-002_SESSION_RECORD_MODEL`

The next phase is limited to a local Watch session record and recovery design. It must preserve the Watch-owned session boundary and keep future synchronization transport-independent.

The installed Lite Wearable JS SDK declares the FA-model `@system.storage` API with `SystemCapability.DistributedDataManager.Preferences.Core.Lite`; the Lite Wearable device capability definition includes that capability. P4-001 additionally has user-confirmed GT 5 Pro physical evidence for missing-key read, JSON string write/read, app-restart persistence, overwrite/read-back, delete/read-back/restart-missing, and invalid-key error handling (`202; Invalid parameter`) without crash. This is a basic storage capability result, not a production Session Persistence implementation. Capacity, maximum value size, high-frequency writes, concurrent access, atomicity, power loss, watch reboot durability, and recovery behavior remain `NOT_TESTED`.

The ArkTS `@ohos.data.preferences` and Android persistence APIs are not approved substitutes for this legacy Lite Wearable JS/HML/CSS project.

### Watch Session Persistence Proposal — Not Implemented

**Record boundary.** One in-progress record (`ace_tennis_session_v1`) and, after a confirmed finish, one completed local record are proposed. They remain local Watch records; no phone transfer, queue, retry, ACK, or cloud behavior is part of this phase.

**Proposed in-progress payload.**

- `schemaVersion` — proposed, for forward-compatible parsing and Mate X7 transport payloads.
- `sessionId` — proposed unique identifier; the Lite-compatible generation strategy remains `NEEDS CONFIRMATION` because P4-001 validated storage behavior, not identifier generation.
- `sessionStatus` / `recordStatus` — proposed `IN_PROGRESS` or `COMPLETED` local-record state.
- `startedAt`, `endedAt`, `elapsedActiveMs`, `pausedDurationMs`, `activeSegmentStartedAt`, and `finishReturnState` — `elapsedActiveMs` exists in current runtime; the other persistence representation is proposed.
- `playerSets`, `opponentSets`, `playerGames`, `opponentGames`, point indices, `pointMode`, and `tiebreakPending` — implemented in runtime scoring; persistence is proposed.
- bounded `scoreHistory` only while the session is in progress, preserving the current Undo scope across recovery — proposed.
- `heartRateValue`, `heartRateSource`, `swingCount`, and `swingSource` — runtime mock values exist; their persisted source markers are proposed and must remain `MOCK` until a real sensor phase is approved.
- `createdAt`, `updatedAt`, `writeVersion`, and `syncStatus` — proposed. `syncStatus` is a local placeholder only; it must not initiate communication.

**Lifecycle proposal.** Write an in-progress checkpoint after successful Start, score correction, Pause, Resume, and Finish-request transitions. Before a deliberate Pause or Finish, settle the active duration and persist that settled value. Preserve very short sessions; they are never discarded solely because elapsed duration is small. On Done, clear the in-progress checkpoint only after a completed record has been written and read back successfully.

**Unexpected termination proposal.** A restored incomplete record must never revive a timer handle. The first physical recovery probe must decide, with explicit product approval, whether a previously active record resumes wall-clock accumulation or is restored as a recoverable paused session. Until that probe passes, this behavior remains `NEEDS CONFIRMATION`.

**Validation ladder before implementation.**

1. **COMPLETE:** Build and physically validate the isolated Lite Wearable `@system.storage` capability probe for missing-key read, JSON write/read, app restart, overwrite, delete, and invalid-key error handling.
2. Implement `P4-002_SESSION_RECORD_MODEL`: a pure `schemaVersion`-based record, serializer, parser, malformed-payload validation, score snapshot, mock-data source markers, and future-sync reservation fields. Do not write to device storage in this step.
3. Record actual capacity/error behavior before a multi-record or checkpoint design; do not assume atomic transactions or Android-style storage semantics.
4. Only then implement the session repository and run lifecycle/recovery regression tests.

### P4 Implementation Plan — Low to High Risk

| Phase | Modification scope and key implementation | Automated test | Physical test and acceptance | Rollback and principal risk |
| --- | --- | --- | --- | --- |
| P4-001 | Isolated Lite Wearable `@system.storage` capability probe only; no AceTennis session code. **COMPLETE:** user GT5 Pro physical photos confirm missing-key read, JSON write/read, app-restart persistence, overwrite, delete, and expected invalid-key error handling. Tested artifact/source mapping is `UNKNOWN`. | API-shape and JSON round-trip contract. | USER_CONFIRMED_PASS; capacity, high-rate writes, power loss, reboot, and concurrency remain `NOT_TESTED`. | Retain the isolated probe; risk: verified behavior is narrower than production persistence requirements. |
| P4-002 | **NEXT:** Pure Session record model, serializer, parser, schema validation; no device writes. Include `sessionId`, start/end timestamps, active/paused duration, session status, Sets/Games/Points, incomplete state, mock HR/Swing source markers, short-session retention policy, `schemaVersion`, and reserved future-sync fields. | Round-trip, malformed payload, schema-version, and score/Undo snapshot tests. | No physical feature claim required. | Revert model-only files; risk: model exceeds Lite storage limits. |
| P4-003 | One completed Session save/read using only the P4-001-verified API. | Write-success, read-back, parse-failure, and short-session retention tests. | Save, close/reopen, and read one completed session on GT5 Pro. | Disable repository call behind one adapter; risk: write failure or partial data. |
| P4-004 | Bounded multi-session completed-record index and list read. | Ordering, deduplication by `sessionId`, capacity boundary, and corrupt-entry isolation tests. | Create/read several local records on GT5 Pro. | Keep the single-record path; risk: capacity and read latency. |
| P4-005 | Active Session checkpoint adapter at Start, score correction, Pause, Resume, Finish request, and confirm. | Trigger cadence, no timer-handle serialization, paused-duration, and no duplicate Session tests. | Start/pause/exit/reopen with one in-progress session. | Disable active checkpoints while retaining completed records; risk: battery impact and write cadence. |
| P4-006 | Recovery policy and time consistency, gated by an approved P4-001 result. | Restore state, malformed checkpoint, duplicate launch, and no double-counting tests. | App termination/restart and watch reboot scenarios; physical timing evidence required. | Restore conservatively as recoverable paused state; risk: unverified background duration semantics. |
| P4-007 | Persistence regression matrix and baseline archive; no new product capability. | Full P2/P3/P4 suite and migration compatibility tests. | Physical lifecycle, recovery, short-session, and retained-record regression. | Preserve P3-006 baseline artifact and revert persistence adapter; risk: incomplete evidence mapping. |

Every P4 step changes one primary risk variable, produces a sequential `AceTennis-P4-00X-<DESCRIPTION>-API10-signed.hap` artifact, and remains `PHYSICAL_NOT_TESTED` until the user confirms GT 5 Pro results.

## 10. Cross-Device Transport

HUAWEI Wear Engine is the primary candidate, not a verified working transport. The communication architecture must remain transport-independent; `COMMAND`, `STATE`, `EVENT`, and `DATA` product semantics must not depend directly on an SDK. Actual transport and device-to-device behavior require validation on the target phone and watch. See `CROSS_DEVICE_SPEC.md` and `DEVICE_BASELINE.md`.

```text
Domain Session
↓
Session / SessionSummary / SyncEnvelope / SyncStatus
↓
Sync Protocol
↓
Transport Adapter
↓
Huawei Communication SDK
```

`Session`, `SessionSummary`, `SyncEnvelope`, and `SyncStatus` must not directly reference Wear Engine API objects. Only the transport adapter may translate between these contracts and Huawei Communication SDK types.

## 11. Sensor Pipeline

No real sensor pipeline has been approved.

```text
Sensor Input
↓
Collection
↓
Normalization
↓
Processing
↓
Derived Metric
↓
Persistence
↓
Synchronization
↓
Presentation
```

All stages remain `NEEDS CONFIRMATION`.

## 12. Error Handling

NEEDS CONFIRMATION

## 13. Performance and Battery

NEEDS CONFIRMATION

## 14. Security and Privacy

NEEDS CONFIRMATION

## 15. Testing Strategy

NEEDS CONFIRMATION

## 16. Build and Deployment

### Physical-Device POC Status

**Watch application model:** COMPLETE / PASS. `GT5Pro-CLEAN-OFFICIAL-API10` installed and launched on the physical GT 5 Pro. `WATCH_APP_MODEL = LITE_WEARABLE_CONFIRMED`.

**Cross-device transport:** NOT VERIFIED. A minimal phone↔watch message exchange remains a separate future POC. Its absence does not alter the confirmed watch application model.

POC implementation, if authorized, must remain isolated from production workout functionality and must not use real sensors or invent tennis metrics.

### POC Evidence Log

| Date | Scope | Result | Evidence / Limitation |
| --- | --- | --- | --- |
| 2026-09-21 | Mate X7 Android debugging | PASS | Android SDK Platform-Tools `adb` 37.0.1 installed from the official Android release. The physical phone was enumerated over USB and authorized as `device`; model and EMUI version verified. This does not validate watch deployment or cross-device communication. |
| 2026-09-21 | GT 5 Pro direct HDC connection | NOT VERIFIED | `hdc list targets` returned `[Empty]`. The currently connected USB device is the Mate X7; no watch deployment evidence exists. |
| 2026-09-21 | Lite Wearable Assistant device-management path | PARTIAL EVIDENCE | User-provided physical-phone screenshot shows Lite Wearable Assistant 1.2.1.600 connected to `HUAWEI WATCH GT 5 Pro-20E`, with Application Management and View Logs actions. This establishes a candidate phone-mediated Lite deployment/logging path only; no app package has yet been installed or launched, and it does not select the watch app model. |
| 2026-10-07 | GT 5 Pro Lite Wearable API10 golden probe | PASS | `GT5Pro-CLEAN-OFFICIAL-API10`: signed HAP physical install and launch PASS. This supersedes the earlier unverified candidate state; Error 40 is closed for the API10 baseline. |

## 17. Open Architecture Questions

NEEDS CONFIRMATION
