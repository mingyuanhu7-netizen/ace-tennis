# Decisions

> Status: ACTIVE PRODUCT DECISION LOG

## 1. Decision Index

| ID | Decision | Scope | Status |
| --- | --- | --- | --- |
| DEC-001 | Separate watch workout and phone analysis responsibilities | SHARED | APPROVED BY USER DIRECTION |
| DEC-002 | Watch owns authoritative workout session during MVP | WATCH / CROSS-DEVICE | PROPOSED |
| DEC-003 | Workout State and Sync State are separate state machines | CROSS-DEVICE | PROPOSED |
| DEC-004 | Phone compact and expanded modes share state but use different composition | PHONE | PROPOSED |
| DEC-005 | Do not preselect an unvalidated watch toolchain or fallback model | WATCH | SUPERSEDED by DEC-006 |
| DEC-006 | Device platform rules and watch-app validation gate | PHONE / WATCH / CROSS-DEVICE | HISTORICAL — SUPERSEDED by DEC-PLATFORM-003 |
| DEC-007 | Communication-SDK-independent core models | CROSS-DEVICE | APPROVED BY USER DIRECTION |
| DEC-PLATFORM-001 | Mate X7 platform | PHONE | APPROVED |
| DEC-PLATFORM-002 | GT 5 Pro platform | WATCH | HISTORICAL — SUPERSEDED by DEC-PLATFORM-003 |
| DEC-XDEVICE-001 | Cross-device transport | CROSS-DEVICE | PROPOSED / VALIDATION REQUIRED |
| DEC-PHONE-001 | Mate X7 adaptive layout baseline | PHONE | APPROVED / PASS |
| DEC-PLATFORM-003 | GT 5 Pro Lite Wearable API10 physical baseline | WATCH | APPROVED / PASS |
| DEC-SCORING-001 | 6–6 tiebreak boundary | WATCH | APPROVED BY USER DIRECTION |
| DEC-SCORING-002 | Basic manual scoring and one-event Undo acceptance boundary | WATCH | APPROVED / PASS |

## DEC-001 — Device Responsibility Boundary

**Date:** 2026-09-17

**Status:** APPROVED BY USER DIRECTION

**Decision:**

- GT 5 Pro focuses on start, in-workout view, pause, resume, finish and quick result.
- Mate X7 focuses on home, history, workout detail, long-term statistics, settings and device management.
- Phone functionality is not copied wholesale to the watch.

**Reason:**

Direct user requirement.

## DEC-002 — Watch Workout Authority

**Date:** 2026-09-17

**Status:** PROPOSED

**Decision:**

GT 5 Pro owns the authoritative Workout State and timing during an active session. Phone availability is not required for the workout to continue.

**Reason:**

This best matches the on-court device role and reduces live cross-device conflict.

**Alternatives considered:**

- Shared live control: more flexible, but substantially more conflict and disconnect complexity.
- Phone authority: simpler phone persistence, but inappropriate when the phone is unavailable during play.

## DEC-003 — Separate Workout and Sync State

**Date:** 2026-09-17

**Status:** PROPOSED

**Decision:**

Workout lifecycle and record synchronization use separate state machines. A workout may be `COMPLETED` while its record is `PENDING` or `FAILED` for sync.

**Reason:**

Network or connection state must not rewrite the truth of a completed workout.

## DEC-004 — Foldable State Continuity

**Date:** 2026-09-17

**Status:** PROPOSED

**Decision:**

PHONE-COMPACT and PHONE-EXPANDED preserve the same destination, selection and loaded product state while using distinct compositions.

**Reason:**

The fold state changes layout, not user intent or domain state.

## DEC-005 — Watch Development Stack Must Be Validated

**Date:** 2026-09-19

**Status:** SUPERSEDED by DEC-006

**Decision:**

Remove the previously listed watch toolchain and fallback model. Keep the remaining watch development model and language/UI framework as candidates until deployment on the physical GT 5 Pro is verified. Do not add another toolchain or fallback by assumption.

**Reason:**

Explicit user correction to the device baseline.

## DEC-006 — Device Platform Rules and Watch-App Validation Gate

**Date:** 2026-09-19

**Status:** HISTORICAL — SUPERSEDED by DEC-PLATFORM-003

**Historical decision:** The following gate described the pre-validation state. Its GT 5 Pro application-model and physical-validation conditions are superseded by the verified Lite Wearable API10 baseline in DEC-PLATFORM-003.

**Decision:**

- Mate X7 uses Android application architecture, Kotlin, and Jetpack Compose for the phone app; ArkTS and ArkUI are not phone-code targets.
- GT 5 Pro remains `WATCH_APP_MODEL = UNVERIFIED`. Smart Wearable, DevEco Studio, ArkTS, and ArkUI are candidates only.
- A minimal app must be deployed to the physical watch. A successful Smart Wearable deployment selects `SMART_WEARABLE`. `LITE_WEARABLE` may be selected only if Smart Wearable is proven unsupported and the alternative deployment succeeds.
- The phone/watch domain protocol remains transport-independent. Wear Engine is a candidate transport behind an adapter, not a type dependency of Session models.
- The actual device-validation result must be recorded as a later decision with evidence; no watch model is selected by this decision.

**Reason:**

Latest explicit user platform rule supersedes the earlier removal of watch candidate tooling and fallback conditions.

**Supersedes:** DEC-005

## DEC-007 — Communication-SDK-Independent Core Models

**Date:** 2026-09-21

**Status:** APPROVED BY USER DIRECTION

**Decision:**

- `Session`, `SessionSummary`, `SyncEnvelope`, and `SyncStatus` are domain/protocol models located above the Huawei Communication SDK.
- These models remain transport-independent and must not expose Huawei Communication SDK / Wear Engine API types.
- The transport adapter is the only layer allowed to map between the models and a verified communication SDK.

**Reason:**

Explicit user architecture direction. This preserves a replaceable communication transport while keeping product session and synchronization semantics stable.

**Affected specifications:** `ARCHITECTURE.md`, `DATA_CONTRACT.md`, `CROSS_DEVICE_SPEC.md`

## DEC-PLATFORM-001 — Mate X7 Platform

**Status:** APPROVED

**Target device:** HUAWEI Mate X7 DEL-LX9, Indonesia

**OS:** EMUI 15.0.0

**Decision:**

The phone application uses Android architecture, Kotlin, and Jetpack Compose. ArkTS and ArkUI must not be used for phone implementation.

## DEC-PLATFORM-002 — GT 5 Pro Platform

**Status:** HISTORICAL — SUPERSEDED by DEC-PLATFORM-003

**Target:** HUAWEI WATCH GT 5 Pro, Indonesia

**Physical OS:** HarmonyOS 6.0.0.32

**Historical primary candidate:** HarmonyOS Smart Wearable using ArkTS and ArkUI.

**Reason:**

The target device runs HarmonyOS 6, and the current Huawei wearable development path provides a Smart Wearable ArkTS / ArkUI candidate.

**Final decision condition:**

This historical gate is closed. Physical-device evidence is recorded by DEC-PLATFORM-003.

## DEC-PLATFORM-003 — GT 5 Pro Lite Wearable API10 Physical Baseline

**Status:** APPROVED / PASS

**Date:** 2026-10-07

**Target:** HUAWEI WATCH GT 5 Pro, HarmonyOS 6.0.0.32

**Decision:**

- `WATCH_APP_MODEL = LITE_WEARABLE_CONFIRMED`.
- The physical golden baseline is `GT5Pro-CLEAN-OFFICIAL-API10`.
- Required verified values are `minPlatformVersion = 10`, `compatible = 40000010`, `target = 60001021`, `compileSdkVersion = 6.0.1.112`, and `deviceType = liteWearable`.
- The V3 signing chain and the physical Mate X7 → DevEco Assistant installation workflow are verified for this baseline.

**Evidence:**

`GT5PRO_API10_PHYSICAL_INSTALL = PASS` and `GT5PRO_API10_PHYSICAL_LAUNCH = PASS`.

**Historical context:**

The earlier API18-compatible baseline (`minPlatformVersion = 18`, `compatible = 50100018`) failed with Error 40. This diagnostic result is preserved, but the Error 40 investigation is closed for the current API10 baseline.

**Supersedes:** DEC-006 and DEC-PLATFORM-002 for GT 5 Pro application-model selection and physical validation.

## DEC-XDEVICE-001 — Cross-device Transport

**Status:** PROPOSED / VALIDATION REQUIRED

**Primary candidate:** HUAWEI Wear Engine.

**Architecture requirement:**

Session/domain models remain independent from the transport SDK.

**Cross-device semantics:**

Queue, Retry, Deduplication, ACK, and Recovery must work independently from the transport implementation.

## DEC-PHONE-001 — Mate X7 Adaptive Layout Baseline

**Status:** APPROVED

**Device:** HUAWEI Mate X7 DEL-LX9

**OS:** EMUI 15.0.0

**Validation:**

| Presentation baseline | Width | Height |
| --- | --- | --- |
| PHONE-COMPACT | 345dp | 743dp |
| PHONE-EXPANDED | 707dp | 734dp |

**Decision:**

- Phone UI must use adaptive layout.
- Compact and Expanded layouts are separate UX baselines.
- Window size must be detected through `WindowSizeClass`.
- Do not detect the device model.
- Do not hardcode screen dimensions.

**Result:** PASS

## DEC-SCORING-001 — 6–6 Tiebreak Boundary

**Date:** 2026-10-20

**Status:** APPROVED BY USER DIRECTION

**Scope:** WATCH manual scoring domain

**Decision:**

- At `6–6` games, the scoring domain enters `TIEBREAK_PENDING`.
- A set is not awarded at `6–6`; no conventional game score may advance until a tiebreak rule is explicitly approved and implemented.
- The point-award controls are visibly disabled while `TIEBREAK_PENDING` is active.
- Workout lifecycle controls remain available, including pause, finish confirmation, Quick Result, and Done.

**Reason:**

The user directed a controlled Set-scoring increment without introducing a tiebreak algorithm.

**Affected specifications:** `PRODUCT_SPEC.md`, `UI_SPEC_WATCH.md`, `ACCEPTANCE.md`

## DEC-SCORING-002 — Basic Manual Scoring and One-Event Undo Acceptance Boundary

**Date:** 2026-10-20

**Status:** APPROVED / PASS

**Scope:** WATCH manual scoring domain

**Decision:**

- The current manual scoring scope includes point, game, deuce, advantage, basic Set, `TIEBREAK_PENDING`, and one-event Undo correction.
- Undo restores the complete prior scoring snapshot without altering the workout lifecycle or timer state.
- This acceptance does not approve Redo, a tiebreak algorithm, persistent records, sensor integration, or phone synchronization.
- The P3-006 artifact and its source/test records must be retained as a regression baseline. Its tested-device hash linkage and source commit linkage remain `UNKNOWN` rather than inferred.
- The next implementation priority is Watch Session local persistence, after a separately validated Lite Wearable storage capability probe.

**Evidence:**

User-reported physical GT 5 Pro P3-006 acceptance: TB Pending, Game, and Set Undo; score-button recovery; Paused Undo timer continuity; and workout-state regression all PASS.

**Artifact traceability:**

Repository artifact: `AceTennis-P3-006-UNDO-API10-signed.hap`; current repository SHA-256 is recorded in `PLATFORM_VALIDATION.md`. Tested-device hash linkage and source commit linkage are `UNKNOWN`.

**Affected specifications:** `PRODUCT_SPEC.md`, `UI_SPEC_WATCH.md`, `ACCEPTANCE.md`, `PLATFORM_VALIDATION.md`

## Decision Template

### DEC-XXX — [Title]

- Date: `YYYY-MM-DD`
- Status: `PROPOSED / APPROVED / SUPERSEDED`
- Scope: `NEEDS CONFIRMATION`
- Context: `NEEDS CONFIRMATION`
- Decision: `NEEDS CONFIRMATION`
- Reason: `NEEDS CONFIRMATION`
- Alternatives: `NEEDS CONFIRMATION`
- Affected specifications: `NEEDS CONFIRMATION`
- Supersedes: None
