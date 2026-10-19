# Platform Validation

> Status: CONFIRMED PLATFORM FACTS
>
> This document records facts verified on the target Mate X7 and GT 5 Pro environments. It prevents future work from guessing device systems, frameworks, or confirmed capabilities. Physical-device evidence is authoritative.

## 1. Phone

| Property | Confirmed value |
| --- | --- |
| Device | HUAWEI Mate X7 |
| Model | DEL-LX9 |
| Region | Indonesia |
| Operating system | EMUI 15.0.0 |
| Software | 15.0.0.166(C301E9R1P4patch01) |
| Phone stack | Android / Kotlin / Jetpack Compose |

### Mate X7 Platform Probe

| Validation | Result |
| --- | --- |
| Build | PASS |
| Install | PASS |
| Launch | PASS |
| USB Debug | PASS |
| Fold / Unfold | PASS |
| State Continuity | PASS |
| Window Resize | PASS |

### Actual Window Sizes

| Presentation baseline | Actual window size |
| --- | --- |
| PHONE-COMPACT | 345dp × 743dp |
| PHONE-EXPANDED | 707dp × 734dp |

## 2. Watch

| Property | Confirmed value |
| --- | --- |
| Device | HUAWEI WATCH GT 5 Pro |
| Region | Indonesia |
| Operating system | HarmonyOS 6.0.0.32 |
| DevEco generated device type | `liteWearable` |
| Current watch app model | `WATCH_APP_MODEL = LITE_WEARABLE_CONFIRMED` |

### Lite Wearable Simulator

| Validation | Result |
| --- | --- |
| Build | PASS |
| Install | PASS |
| Launch | PASS |

### DevEco Assistant

- GT 5 Pro detected.
- UDID obtained.
- UDID registered.

### HarmonyOS Developer Center

| Item | Confirmed value |
| --- | --- |
| App ID | Created |
| Bundle | `com.example.gt5proplatformprobe` |
| Debug certificate | Created / valid |
| Debug profile | `GT5ProDebugProfile` — created / valid |

### Historical Initial Signing Assets

- `gt5pro-debug.p12`
- `gt5pro-debug.csr`
- `gt5pro-debug.csr.cer`
- `GT5ProDebugProfileDebug.p7b`

Do not write passwords into repository files.

### Verified GT 5 Pro Golden Platform Baseline

| Property | Confirmed value |
| --- | --- |
| Golden probe | `GT5Pro-CLEAN-OFFICIAL-API10` |
| Minimum platform version | `10` |
| Compatible value | `40000010` |
| Target value | `60001021` |
| Compile SDK version | `6.0.1.112` |
| Device type | `liteWearable` |
| DevEco Studio | `6.0.1 Release` / build `6.0.1.251` |
| SDK root for builds | `/Applications/DevEco-Studio.app/Contents/sdk` |

The V3 signing chain used by the golden probe is verified. Signing passwords remain local secrets and must not be documented.

## 3. Physical Watch Status

| Validation | Result |
| --- | --- |
| Physical GT 5 Pro install | PASS — `GT5PRO_API10_PHYSICAL_INSTALL` |
| Physical GT 5 Pro launch | PASS — `GT5PRO_API10_PHYSICAL_LAUNCH` |

The physical target validated the Lite Wearable application model, installation, and launch using the API10 golden baseline.

## 4. Historical Validation Path — Superseded

```text
Manual Signing
→ Build signed HAP
→ transfer to Mate X7
→ DevEco Assistant
→ install on GT 5 Pro
→ physical launch
```

This gate is complete for the API10 golden probe. The earlier API18-compatible baseline (`minPlatformVersion = 18`, `compatible = 50100018`) failed physical installation with Error 40 and is retained only as historical diagnostic evidence. The Error 40 investigation is closed for the current baseline.
