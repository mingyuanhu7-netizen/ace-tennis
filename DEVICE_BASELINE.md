# Device Baseline

> Source: user-provided device information, 2026-09-19; supplemented by verified physical-device evidence on 2026-10-07.
>
> The physical-device confirmations below are user-reported. This document does not claim that an application was built, installed, launched, or tested on either device.

## Target Region

Indonesia

## PHONE

Device: HUAWEI Mate X7

Model: DEL-LX9

Operating System: EMUI 15.0.0

Software Build: 15.0.0.166(C301E9R1P4patch01)

Application Platform: Android-compatible EMUI application

Required Phone Architecture: Android application architecture

Primary Development Stack:

- Android Studio
- Kotlin
- Jetpack Compose

Do not generate ArkTS or ArkUI phone application code.

UI Baselines:

- PHONE-COMPACT
- PHONE-EXPANDED

Status: CONFIRMED BY PHYSICAL DEVICE (user-reported)

## WATCH

Device: HUAWEI WATCH GT 5 Pro

Operating System: HarmonyOS 6.0.0.32

Historical Candidate Development Model: HarmonyOS Smart Wearable

Historical Candidate Stack:

- DevEco Studio
- ArkTS
- ArkUI

WATCH_APP_MODEL: LITE_WEARABLE_CONFIRMED

Historical Validation Gate: superseded by the verified Lite Wearable API10 physical baseline.

- `GT5Pro-CLEAN-OFFICIAL-API10` physically installed and launched on the GT 5 Pro.
- Verified Lite Wearable baseline: `minPlatformVersion = 10`, `compatible = 40000010`, `target = 60001021`, `compileSdkVersion = 6.0.1.112`, `deviceType = liteWearable`.
- Historical Smart Wearable candidacy is superseded by DEC-PLATFORM-003.

Status: OS and Lite Wearable application model CONFIRMED BY PHYSICAL DEVICE

## CROSS-DEVICE

Phone: EMUI Android application

Watch: HarmonyOS wearable application

Primary Communication Candidate: HUAWEI Wear Engine

Communication architecture must remain transport-independent.

Required layering:

```text
Domain Session
↓
Sync Protocol
↓
Transport Adapter
↓
Huawei Communication SDK
```

Do not couple Session models directly to Wear Engine API objects.

Product-level protocol categories:

- COMMAND
- STATE
- EVENT
- DATA

These categories must not depend directly on a specific transport SDK.
