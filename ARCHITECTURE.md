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

NEEDS CONFIRMATION

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
