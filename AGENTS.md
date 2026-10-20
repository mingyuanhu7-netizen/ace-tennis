# AceTennis / TennisApp — Codex Engineering Guide

> Authoritative baseline: 2026-10-07
>
> Priority:
> Correctness > preserve known-good baseline > minimal change >
> controlled experiment > physical-device evidence > speed.
>
> VERIFIED facts are ground truth until contradicted by newer
> physical-device evidence.

---

# 1. Project Scope

Target devices:

- HUAWEI Mate X7
- HUAWEI WATCH GT 5 Pro

Phone implementation:

- Android
- Kotlin
- Jetpack Compose

Watch implementation:

- Huawei Lite Wearable
- JS / HML / CSS project model

Do NOT migrate the watch to Smart Wearable / ArkTS unless a future
explicit platform decision replaces the currently verified architecture.

---

# 2. Mandatory Document Read Order

At the beginning of relevant work, read:

1. AGENTS.md
2. PLATFORM_VALIDATION.md
3. PRODUCT_SPEC.md
4. applicable UI_SPEC_PHONE.md / UI_SPEC_WATCH.md
5. CROSS_DEVICE_SPEC.md
6. DATA_CONTRACT.md
7. ACCEPTANCE.md
8. DECISIONS.md
9. ARCHITECTURE.md

For any task involving:

- device capability
- Watch
- SDK
- Build
- Signing
- HAP
- phone/watch communication
- sensors
- physical-device behavior

PLATFORM_VALIDATION.md MUST be read before implementation.

A new user requirement is a delta to the existing baseline unless
the user explicitly says it replaces an earlier decision.

---

# 3. Verified Physical Devices

## Mate X7

Verified device:

- Model: DEL-LX9
- EMUI: 15.0.0
- observed build:
  15.0.0.166(C301E9R1P4patch01)

Verified phone platform probe:

PHONE_BUILD = PASS
PHONE_INSTALL = PASS
PHONE_LAUNCH = PASS
PHONE_COMPOSE_RENDER = PASS
PHONE_FOLD_UNFOLD = PASS
PHONE_STATE_CONTINUITY = PASS

Observed layout sizes:

PHONE-COMPACT:
345 dp × 743 dp

PHONE-EXPANDED:
707 dp × 734 dp

Do not hardcode these exact dimensions.

Use adaptive layout / window size classes.

User-visible business state must survive fold/unfold.

Activity recreation itself is NOT considered a failure.

---

## GT 5 Pro

Verified physical device:

HUAWEI WATCH GT 5 Pro

Observed firmware:

HarmonyOS 6.0.0.32

Application model:

Lite Wearable

Physical installation and launch are now VERIFIED.

WATCH_APP_MODEL =
LITE_WEARABLE_CONFIRMED

---

# 4. Critical Physical Milestone

As of 2026-10-07:

GT5PRO_API10_PHYSICAL_INSTALL = PASS
GT5PRO_API10_PHYSICAL_LAUNCH = PASS

The clean official Lite Wearable API10 probe:

- built successfully
- signed successfully
- transferred to Mate X7
- was detected by DevEco Assistant
- installed onto the physical GT 5 Pro
- launched successfully
- rendered the default UI

This is the authoritative GT 5 Pro physical baseline.

Do NOT treat physical GT 5 Pro support as unresolved.

---

# 5. GT 5 Pro Golden Platform Baseline

Current physically verified values:

FINAL_MIN_PLATFORM_VERSION = 10
FINAL_COMPATIBLE = 40000010
FINAL_TARGET = 60001021
FINAL_COMPILE_SDK_VERSION = 6.0.1.112
FINAL_DEVICE_TYPE = liteWearable

Equivalent conceptual configuration:

minimum platform:
10

compatible:
40000010

target:
60001021

compile SDK:
6.0.1.112

device type:
liteWearable

This combination is physically verified.

Preserve it during application migration.

---

# 6. API10 Does NOT Mean Downgrading the Entire Project

The physical baseline intentionally combines:

minPlatformVersion = 10

with:

target = 60001021
compileSdkVersion = 6.0.1.112

Therefore:

DO NOT downgrade target because minimum platform is 10.

DO NOT downgrade compileSdkVersion because minimum platform is 10.

DO NOT install arbitrary API10 development SDK components.

The current DevEco Studio / HarmonyOS SDK toolchain remains the
validated build toolchain.

---

# 7. Error 40 — CLOSED FOR CURRENT BASELINE

Historical physical error:

安装失败：40. 配置文件格式错误

Known failed baseline:

minPlatformVersion = 18
compatible = 50100018

Physical result:

ERROR_40

Known successful controlled baseline:

minPlatformVersion = 10
compatible = 40000010

while retaining:

target = 60001021
compileSdkVersion = 6.0.1.112
deviceType = liteWearable

Physical result:

INSTALL = PASS
LAUNCH = PASS

Engineering conclusion:

For the current GT 5 Pro + firmware + Lite Wearable toolchain,
minPlatformVersion=10 / compatible=40000010 is the verified
compatibility baseline.

Treat Error 40 as CLOSED.

Do NOT reopen investigation into:

- API18
- API21 target
- certificates
- Profile
- UDID
- /sdcard/haps/
- DevEco Assistant
- signing chain

unless NEW physical evidence contradicts the golden baseline.

This conclusion is device/toolchain evidence, not a universal claim
about every Huawei wearable.

---

# 8. Golden Probe

Authoritative physical regression oracle:

GT5Pro-CLEAN-OFFICIAL-API10

Known physical test artifact:

GT5Pro-CLEAN-OFFICIAL-API10-signed.hap

Golden Probe properties:

BUILD = PASS
SIGN = PASS
STATIC_VALIDATION = PASS
PHYSICAL_INSTALL = PASS
PHYSICAL_LAUNCH = PASS

HAP_CONTENT_IDENTICAL = YES

Do NOT:

- delete it
- repurpose it
- turn it into the production app directly
- casually modify its platform configuration

Preserve it as a known-good regression reference.

When application development breaks physical installation,
compare against this probe before guessing.

---

# 9. DevEco / SDK Golden Environment

Verified toolchain:

DevEco Studio:
6.0.1 Release

Build:
6.0.1.251

HarmonyOS SDK:
6.0.1 Release

SDK version:
6.0.1.112

Build environment SDK root:

DEVECO_SDK_HOME =
/Applications/DevEco-Studio.app/Contents/sdk

This SDK-root arrangement resolved the previous:

SDK component missing

issue.

Do NOT change SDK location, SDK version or DevEco version during
normal Tennis App feature implementation.

Platform changes require a separately authorized experiment.

---

# 10. Signing — VERIFIED AND CLOSED

The currently validated signing chain is V3.

P12:

/Users/humingyuan/Documents/GT5ProSigningV3/
gt5pro-debug-v3.p12

Alias:

gt5prodebugv3

Sign algorithm:

SHA256withECDSA

Profile:

/Users/humingyuan/Documents/GT5ProSigningV3/
GT5ProDebugProfileV3.p7b

Certificate chain:

/Users/humingyuan/Documents/GT5ProSigningV3/
gt5pro-debug-v3-cert-chain.pem

Certificate chain validation:

CERT_COUNT = 3
CHAIN_ORDER_VALID = YES
LEAF_P12_PUBLIC_KEY_MATCH = YES
LEAF_PROFILE_MATCH = YES
CHAIN_CRYPTOGRAPHICALLY_VALID = YES

The chain is:

Developer certificate
→ Huawei CBG Developer Relations CA G2
→ Huawei CBG Root CA G2

This configuration successfully passed:

LegacySignLiteBin

and produced a physical-installable HAP.

Therefore:

GT5PRO_SIGNING = PASS

Signing is CLOSED.

Do NOT recreate:

- P12
- CSR
- Developer Certificate
- Intermediate certificate
- Root certificate
- Profile
- certificate chain

without direct evidence that the current signing material is invalid.

---

# 11. Signing Security

Signing passwords are local secrets.

NEVER:

- print Store Password
- print Key Password
- send passwords to ChatGPT
- put passwords in AGENTS.md
- put passwords in documentation
- copy passwords into shell commands
- commit passwords
- write passwords into source code
- expose them in logs

If DevEco requires password entry:

USER ENTERS PASSWORD MANUALLY IN GUI.

Codex may confirm:

STORE_PASSWORD_CONFIGURED = YES/NO
KEY_PASSWORD_CONFIGURED = YES/NO

but must not expose the values.

Do not infer plaintext equality solely from encrypted/serialized
strings in build-profile.json5.

---

# 12. Physical Installation Workflow

Verified workflow:

signed HAP
→ Mate X7
→ /sdcard/haps/
→ DevEco Assistant
→ Lite Wearable
→ GT 5 Pro
→ 应用管理
→ 安装
→ Watch launch

`/sdcard/haps/` is VERIFIED.

DevEco Assistant HAP detection is VERIFIED.

Do not investigate alternative transfer paths unless a new package
actually fails to appear.

Only signed HAPs may be used for physical testing.

Use explicit artifact names.

Never accidentally test an older HAP.

---

# 13. Physical Device Is Final Authority

Never equate:

BUILD PASS

with:

PHYSICAL INSTALL PASS

or:

PHYSICAL LAUNCH PASS.

Required status model:

BUILD =
PASS / FAIL / NOT_RUN

SIGN =
PASS / FAIL / NOT_RUN

STATIC_VALIDATION =
PASS / FAIL / NOT_RUN

PHYSICAL_INSTALL =
PASS / FAIL / NOT_TESTED

PHYSICAL_LAUNCH =
PASS / FAIL / NOT_TESTED

FEATURE_TEST =
PASS / FAIL / NOT_TESTED

NOT_TESTED must never silently become PASS.

For GT 5 Pro compatibility, physical-device behavior outranks:

- assumptions
- simulator behavior
- SDK naming
- Build success
- signing success
- static inspection

---

# 14. Current Development Phase

PLATFORM_FEASIBILITY =
COMPLETE

CURRENT_PHASE =
PHASE_3_BASIC_TENNIS_SCORING

The real AceTennis functionality should now be migrated onto the
verified GT5 Pro baseline.

Do NOT resume broad platform investigation during normal feature work.

---

# 15. Migration Strategy

Migration must be incremental.

Recommended sequence:

Golden Clean Probe
→ App shell
→ Watch navigation
→ Ready screen
→ Active Workout
→ Pause
→ Finish Confirmation
→ Quick Result
→ Session lifecycle/state machine
→ Persistence
→ Sensors
→ Tennis metrics
→ Phone/watch synchronization
→ production hardening

Do NOT move the complete historical Tennis application into the
Golden Probe in one operation.

Do NOT migrate several large subsystems between physical tests.

---

# 16. Watch MVP State Flow

Current intended Watch MVP lifecycle:

READY
→ ACTIVE_WORKOUT
→ PAUSED
→ ACTIVE_WORKOUT
→ FINISH_CONFIRMATION
→ QUICK_RESULT
→ COMPLETE

Finish should require explicit confirmation.

Very short sessions should not silently disappear.

Preserve them and allow product logic to flag them if needed.

Do not invent tennis metrics that have not been approved.

---

# 17. Physical Validation Cadence During Migration

After every meaningful migration increment:

1. source/config validation
2. Build
3. Sign
4. inspect final signed HAP
5. physical install
6. physical launch
7. feature test

Example:

Add Watch shell
→ Build
→ Install
→ Launch
→ PASS
→ commit / record evidence

Then:

Add navigation
→ Build
→ Install
→ Launch
→ PASS

Do NOT wait until five major systems have been migrated before
testing the watch again.

---

# 18. Preserve Platform Baseline During Feature Work

Normal feature implementation must NOT casually modify:

minPlatformVersion
compatible
target
compileSdkVersion
deviceType
bundleName
module structure
signing configuration
Profile
certificate chain
SDK location
SDK version
DevEco version

Application feature work and platform experimentation are separate
classes of change.

A feature diff should not secretly contain platform changes.

---

# 19. Controlled Experiment Rule

When platform behavior must be investigated:

CHANGE ONE PRIMARY VARIABLE AT A TIME.

Required experiment record:

HYPOTHESIS =
CONTROL =
VARIABLE =
EXPECTED_RESULT =
ACTUAL_RESULT =
CONCLUSION =

BAD:

change API
+ signing
+ config
+ UI
+ bundle
+ module structure

then test.

GOOD:

known-good baseline
→ one controlled change
→ Build
→ inspect signed artifact
→ physical test
→ record result

---

# 20. Static Verification of Final HAP

After any platform-level configuration change, inspect the FINAL
signed HAP.

Do not trust source configuration alone.

Verify at minimum:

FINAL_MIN_PLATFORM_VERSION = 10
FINAL_COMPATIBLE = 40000010
FINAL_TARGET = 60001021
FINAL_COMPILE_SDK_VERSION = 6.0.1.112
FINAL_DEVICE_TYPE = liteWearable

When relevant also verify:

SIGNING_CONFIG_REUSED = YES
PROFILE_GT5PRO_UDID_PRESENT = YES

Source config and packaged artifact must agree.

---

# 21. Never Patch Signed Artifacts

NEVER solve compatibility through:

- HAP hex editing
- patching signed binaries
- manually modifying packaged metadata
- editing .bin after signing
- replacing certificate contents after signing

Correct flow:

source configuration
→ Build
→ Package
→ Sign
→ Static verification
→ Physical test

Signed artifacts are immutable test evidence.

---

# 22. Historical Successful Package

Historical successful package:

tennis-watch-debug-20260812-153001.hap

Known useful metadata:

compatible = 40000010
minPlatformVersion = 10
target = 60001021
compileSdkVersion = 6.0.1.112

It may be used as a comparison oracle.

Other historical differences such as:

MainAbility.srcPath = "default"
distroFilter
round-screen config
466 × 466
window.designWidth = 466

are NOT proven requirements.

Do not copy them automatically.

Introduce them only if a controlled experiment demonstrates that
they are required.

---

# 23. Phone Architecture Rules

Mate X7 remains an Android application.

Use:

Kotlin
Jetpack Compose

PHONE-COMPACT:

single-column organization.

PHONE-EXPANDED:

independent large-screen organization.

History / Detail should support master-detail organization where
appropriate.

Fold/unfold must preserve business state, navigation and context.

Do not build the phone UI with ArkTS/ArkUI.

---

# 24. Cross-Device Architecture

Do not prematurely freeze a transport implementation.

Domain protocol should remain transport-independent.

Conceptual message categories:

COMMAND
STATE
EVENT
DATA

Completed workout synchronization must support:

sessionId
queue
retry
deduplication
ACK / delivery confirmation

Do not implement phone remote workout control or real-time mirroring
unless explicitly added to scope.

Transport choice must be physically validated separately.

---

# 25. Product Scope Protection

Current MVP includes:

Watch:
full workout control loop

Phone:
Home
History
Detail
Statistics
Settings
Device Management

Cross-device:
completed workout synchronization

Current MVP excludes unless explicitly approved:

social
courses
rankings
achievements
payments
cloud account
multi-device cloud sync
full history on watch
deep analysis on watch
unconfirmed tennis metrics

Do not expand scope opportunistically.

---

# 26. Minimal Change Principle

Prefer the smallest change that satisfies the task.

Do NOT:

- refactor unrelated modules
- rename unrelated files
- reorganize folders without reason
- modernize code opportunistically
- upgrade SDKs during feature development
- modify signing during UI work
- modify UI while debugging installation
- rewrite functioning platform code without evidence

Every task should produce a narrow, explainable diff.

---

# 27. Repository Reading Discipline

Before editing:

1. read AGENTS.md
2. read the relevant specification files
3. search exact symbols/config names
4. inspect the smallest dependency chain needed
5. modify only the affected scope

Do not scan the entire repository merely to “understand everything”.

Do not repeatedly reread unchanged files.

---

# 28. Debugging Discipline

When something fails:

1. reproduce
2. capture exact error
3. identify the smallest failure domain
4. form one or two hypotheses
5. test the cheapest hypothesis first
6. make the smallest correction
7. run focused validation
8. stop when evidence resolves it

Error logs and physical behavior outrank intuition.

Avoid speculative rewrites.

---

# 29. Stop Conditions

STOP when:

- requested behavior works
- relevant targeted tests pass
- required artifact exists
- no blocking evidence remains

Do not perform another broad investigation merely because further
investigation is possible.

When a controlled physical experiment completes:

REPORT
→ WAIT

Do not automatically generate another probe.

---

# 30. Closed Issues

Do not reopen without contradictory evidence:

Mate X7 fold-state platform probe = VERIFIED

Lite Wearable project model = VERIFIED

GT 5 Pro physical Lite Wearable support = VERIFIED

DevEco Assistant detection = VERIFIED

/sdcard/haps/ workflow = VERIFIED

V3 signing chain = VERIFIED

GT5 Pro Profile / device binding = VERIFIED

LegacySignLiteBin = VERIFIED

target = 60001021 = VERIFIED

compileSdkVersion = 6.0.1.112 = VERIFIED

deviceType = liteWearable = VERIFIED

minPlatformVersion = 10 = VERIFIED

compatible = 40000010 = VERIFIED

GT5PRO_API10_PHYSICAL_INSTALL = PASS

GT5PRO_API10_PHYSICAL_LAUNCH = PASS

Error 40 investigation = CLOSED for current baseline.

---

# 31. Known Failed Baseline

Known physical failure:

minPlatformVersion = 18
compatible = 50100018

Result:

ERROR 40
配置文件格式错误

Do not blindly generate:

API9
API11
API18
API21

compatibility probes.

The API10 physical baseline supersedes blind version probing.

---

# 32. Artifact Naming

Use deterministic names.

Good:

GT5Pro-CLEAN-OFFICIAL-API10-signed.hap

AceTennis-watch-shell-api10-signed.hap

AceTennis-watch-active-workout-api10-signed.hap

Bad:

final2-new-copy-fixed-signed.hap

Physical-test artifacts should communicate:

platform
feature/probe
compatibility baseline
signing state

Never rely only on timestamp to identify the test package.

---

# 33. Evidence Ledger

For meaningful platform or device findings record:

STATUS:
VERIFIED / FAILED / UNTESTED

SOURCE:
build / static inspection / emulator / physical device

DATE:

ARTIFACT:

RESULT:

CONCLUSION:

Example:

STATUS: VERIFIED
SOURCE: physical GT5 Pro
DATE: 2026-10-07
ARTIFACT: GT5Pro-CLEAN-OFFICIAL-API10-signed.hap
RESULT: installed and launched successfully
CONCLUSION:
minPlatformVersion=10 and compatible=40000010 are valid for the
current physical GT5 Pro baseline.

This ledger exists to prevent future agents from repeating solved
investigations.

---

# 34. Required Completion Report

For GT 5 Pro work, Codex should finish with:

TASK =

FILES_CHANGED =

BUILD =
PASS / FAIL / NOT_RUN

SIGN =
PASS / FAIL / NOT_RUN

STATIC_VALIDATION =
PASS / FAIL / NOT_RUN

PHYSICAL_INSTALL =
PASS / FAIL / NOT_TESTED

PHYSICAL_LAUNCH =
PASS / FAIL / NOT_TESTED

FEATURE_TEST =
PASS / FAIL / NOT_TESTED

MIN_PLATFORM_VERSION =

COMPATIBLE =

TARGET =

COMPILE_SDK_VERSION =

DEVICE_TYPE =

ARTIFACT_PATH =

WHAT_CHANGED =

WHAT_WAS_NOT_CHANGED =

REMAINING_RISK =

NEXT_RECOMMENDED_TEST =

Never claim physical PASS unless:

- Codex directly observed supported evidence, or
- the user explicitly reported the physical result.

---

# 35. Current Authoritative State

As of 2026-10-07:

MATE_X7_PLATFORM_PROBE = PASS

GT5PRO_LITE_WEARABLE_EMULATOR = PASS

GT5PRO_SIGNING = PASS

GT5PRO_PROFILE_UDID = PASS

GT5PRO_API10_STATIC_VALIDATION = PASS

GT5PRO_API10_PHYSICAL_INSTALL = PASS

GT5PRO_API10_PHYSICAL_LAUNCH = PASS

WATCH_APP_MODEL =
LITE_WEARABLE_CONFIRMED

CURRENT_GOLDEN_BASELINE =
GT5Pro-CLEAN-OFFICIAL-API10

CURRENT_PHASE =
PHASE_3_BASIC_TENNIS_SCORING

Do not return to platform feasibility work unless new physical
evidence requires it.

---

# 36. Prime Directive

NEVER DESTROY A KNOWN-GOOD BASELINE WHILE ADDING A FEATURE.

When uncertain:

PRESERVE GOLDEN BASELINE
→ COPY / BRANCH
→ MAKE ONE CONTROLLED CHANGE
→ BUILD
→ INSPECT FINAL ARTIFACT
→ PHYSICAL TEST
→ RECORD EVIDENCE
→ ONLY THEN CONTINUE

For GT 5 Pro compatibility:

THE PHYSICAL GT 5 PRO IS THE FINAL AUTHORITY.

# Project Documentation Governance / 文档治理与读取规则

> This section defines the authoritative documentation hierarchy,
> mandatory reading order, conflict-resolution rules, and documentation
> maintenance requirements for AceTennis / TennisApp.
>
> These are long-term Codex engineering rules.
>
> Do not treat them as temporary task instructions.

---

# 1. Documentation Authority

The project root documentation is the authoritative source of:

- engineering constraints
- verified platform facts
- product scope
- UI behavior
- data contracts
- cross-device behavior
- acceptance criteria
- architecture
- approved decisions

Codex must not replace documented decisions with assumptions,
general knowledge, historical code behavior, or speculative redesign.

When documented requirements exist:

DOCUMENTED PROJECT DECISION
>
MODEL ASSUMPTION

---

# 2. Project Root Documentation

The authoritative project documents are:

## 1. AGENTS.md

Purpose:

- highest-priority Codex engineering rules
- Golden Platform Baseline
- GT 5 Pro physical validation facts
- migration strategy
- debugging rules
- security constraints
- validation hierarchy
- closed issues
- artifact rules
- minimal-change principle

`AGENTS.md` is the highest-priority project-level instruction file.

If another project document conflicts with AGENTS.md:

STOP.

Do not silently choose one.

Determine whether the other document is stale and report the conflict.

---

## 2. PLATFORM_VALIDATION.md

Purpose:

Record verified platform facts, including:

- Mate X7
- GT 5 Pro
- DevEco Studio
- HarmonyOS SDK
- Lite Wearable
- Build
- Signing
- HAP
- simulator
- physical installation
- physical launch
- sensors/platform capability probes

This file answers:

"What has actually been verified?"

Physical-device evidence has higher authority than assumptions.

---

## 3. PRODUCT_SPEC.md

Purpose:

Define:

- product goals
- MVP
- user flows
- device responsibilities
- feature scope
- exclusions
- product behavior
- unresolved product questions

This file answers:

"What are we building?"

Do not add features outside PRODUCT_SPEC without explicit user approval.

---

## 4. UI_SPEC_PHONE.md

Purpose:

Define Mate X7 / Android phone UI.

Includes:

- PHONE-COMPACT
- PHONE-EXPANDED
- page hierarchy
- fold/unfold behavior
- navigation
- large-screen organization
- master-detail behavior
- visual/state rules

Use for phone-facing UI implementation.

---

## 5. UI_SPEC_WATCH.md

Purpose:

Define GT 5 Pro Watch UI.

Includes:

- Ready
- Active Workout
- Pause
- Finish Confirmation
- Quick Result
- watch interaction behavior
- layout/state requirements

Use for Watch-facing UI implementation.

---

## 6. CROSS_DEVICE_SPEC.md

Purpose:

Define phone ↔ watch behavior.

Includes:

- synchronization lifecycle
- COMMAND
- STATE
- EVENT
- DATA
- queue
- retry
- deduplication
- ACK
- completed-session synchronization
- transport-independent protocol rules

This file defines behavior.

It does NOT automatically freeze a transport implementation.

---

## 7. DATA_CONTRACT.md

Purpose:

Define shared domain data contracts.

Includes when applicable:

- sessionId
- Workout Session
- Summary
- timestamps
- device/source information
- sync payloads
- state values
- identifiers
- versioning
- idempotency fields

Do not invent incompatible data structures locally if a contract already exists.

---

## 8. ACCEPTANCE.md

Purpose:

Define:

- REQ IDs
- acceptance criteria
- regression requirements
- pass/fail definitions
- completion gates

This file answers:

"How do we know the requirement is complete?"

Implementation is not complete merely because code was written.

---

## 9. DECISIONS.md

Purpose:

Record engineering and product decisions as:

- APPROVED
- CANDIDATE
- REJECTED
- SUPERSEDED

Use it to prevent repeatedly reopening settled questions.

A CLOSED / APPROVED decision must not be silently reconsidered.

New contradictory evidence must be recorded explicitly.

---

## 10. ARCHITECTURE.md

Purpose:

Define:

- system layers
- module responsibilities
- platform boundaries
- domain architecture
- communication abstraction
- persistence boundaries
- dependency direction
- separation of transport and domain logic

Architecture changes require intentional scope.

Do not opportunistically refactor architecture during unrelated tasks.

---

## 11. DEVICE_BASELINE.md

Purpose:

Reference information for:

- device models
- firmware
- initial technology assumptions
- development environment
- historical device baseline

This is supporting documentation.

It is not required to be fully reread for every task.

If DEVICE_BASELINE.md conflicts with newer physical evidence in
PLATFORM_VALIDATION.md or AGENTS.md, newer verified evidence wins.

---

# 3. Mandatory Reading Order

For substantial implementation, design, debugging, or architecture work,
Codex must use this reading order:

1. AGENTS.md
2. PLATFORM_VALIDATION.md
3. PRODUCT_SPEC.md
4. applicable UI specification:
   - UI_SPEC_PHONE.md
   - and/or UI_SPEC_WATCH.md
5. CROSS_DEVICE_SPEC.md
6. DATA_CONTRACT.md
7. ACCEPTANCE.md
8. DECISIONS.md
9. ARCHITECTURE.md

DEVICE_BASELINE.md is supporting reference and should be read when
device/environment history is relevant.

---

# 4. Do Not Blindly Read Everything

Mandatory reading order does NOT mean:

"Read every file completely before every edit."

Use targeted reading.

Required workflow:

AGENTS.md
→ identify task domain
→ read authoritative related documents
→ search exact REQ / state / symbol / config
→ inspect smallest required dependency chain
→ make minimal change

Do not repeatedly reread unchanged large files.

Do not scan the entire repository simply to "understand everything."

---

# 5. Platform-Related Mandatory Rule

For ANY task involving:

- GT 5 Pro
- Lite Wearable
- DevEco Studio
- HarmonyOS SDK
- Build
- Signing
- HAP
- physical-device installation
- physical-device launch
- deviceType
- minPlatformVersion
- compatible version
- target version
- compile SDK
- sensors
- watch capability
- phone/watch communication
- platform APIs

Codex MUST read:

1. AGENTS.md
2. PLATFORM_VALIDATION.md

BEFORE making technical recommendations or changing code/configuration.

Do not rely on old chat history or previous assumptions instead of
the current platform documents.

---

# 6. UI Task Reading Rules

For phone UI work:

AGENTS.md
→ PRODUCT_SPEC.md
→ UI_SPEC_PHONE.md
→ relevant DATA_CONTRACT.md / ACCEPTANCE.md

For Watch UI work:

AGENTS.md
→ PLATFORM_VALIDATION.md
→ PRODUCT_SPEC.md
→ UI_SPEC_WATCH.md
→ relevant DATA_CONTRACT.md / ACCEPTANCE.md

For cross-device UI/state work:

also read:

CROSS_DEVICE_SPEC.md

---

# 7. Cross-Device Task Reading Rules

For phone/watch synchronization work:

AGENTS.md
→ PLATFORM_VALIDATION.md
→ PRODUCT_SPEC.md
→ CROSS_DEVICE_SPEC.md
→ DATA_CONTRACT.md
→ ACCEPTANCE.md
→ DECISIONS.md
→ ARCHITECTURE.md

Do not freeze transport technology merely because a protocol is defined.

Domain behavior and transport implementation must remain separated
unless DECISIONS.md explicitly approves a transport.

---

# 8. Requirement Interpretation Rule

A new user instruction should normally be interpreted as:

DELTA TO CURRENT BASELINE

not:

REPLACEMENT OF ALL PREVIOUS REQUIREMENTS

unless the user explicitly says things such as:

- ignore previous requirements
- replace the previous design
- start over
- old requirement is cancelled

When uncertain:

preserve existing approved behavior
and apply the smallest compatible delta.

Do not silently discard earlier requirements.

---

# 9. Conflict Resolution

If documents disagree:

Do NOT silently reconcile them.

Use this priority:

1. latest explicit user instruction
2. AGENTS.md engineering constraints
3. newer verified physical-device evidence
4. PLATFORM_VALIDATION.md
5. PRODUCT_SPEC.md
6. applicable UI specification
7. CROSS_DEVICE_SPEC.md
8. DATA_CONTRACT.md
9. ACCEPTANCE.md
10. DECISIONS.md
11. ARCHITECTURE.md
12. DEVICE_BASELINE.md / historical information

However:

If the conflict suggests that AGENTS.md itself is stale,
STOP and report the inconsistency.

Do not rewrite project truth without evidence.

---

# 10. Physical Evidence Rule

For device-facing questions:

PHYSICAL DEVICE EVIDENCE
>
SIGNED HAP STATIC INSPECTION
>
BUILD RESULT
>
SIMULATOR
>
ASSUMPTION

Therefore:

BUILD = PASS

does NOT imply:

PHYSICAL_INSTALL = PASS

and does NOT imply:

PHYSICAL_LAUNCH = PASS

Never upgrade an untested state to PASS.

---

# 11. Current GT 5 Pro Authoritative Baseline

The current project baseline is:

WATCH_APP_MODEL =
LITE_WEARABLE_CONFIRMED

CURRENT_GOLDEN_BASELINE =
GT5Pro-CLEAN-OFFICIAL-API10

Verified configuration:

MIN_PLATFORM_VERSION = 10
COMPATIBLE = 40000010
TARGET = 60001021
COMPILE_SDK_VERSION = 6.0.1.112
DEVICE_TYPE = liteWearable

Verified physical state:

GT5PRO_API10_PHYSICAL_INSTALL = PASS
GT5PRO_API10_PHYSICAL_LAUNCH = PASS

Do not allow older documents to revert these values to:

LITE_WEARABLE_CANDIDATE

or:

PHYSICAL_INSTALL = NOT_CONFIRMED

Such values are stale.

---

# 12. Current Development Phase

Current phase:

PLATFORM_FEASIBILITY = COMPLETE

CURRENT_PHASE =
PHASE_3_BASIC_TENNIS_SCORING

Therefore the default task direction is now:

PRESERVE GOLDEN BASELINE
→ MIGRATE ACE TENNIS IN SMALL INCREMENTS
→ BUILD
→ SIGN
→ STATIC VALIDATION
→ PHYSICAL INSTALL
→ PHYSICAL LAUNCH
→ FEATURE TEST

Do not return to broad platform feasibility investigation unless new
physical evidence contradicts the current baseline.

---

# 13. Documentation Synchronization Requirement

When a verified project fact changes, update the affected documentation.

Example:

A physical-device capability moves from:

CANDIDATE

to:

CONFIRMED

then inspect whether the following require synchronization:

PLATFORM_VALIDATION.md
DECISIONS.md
ACCEPTANCE.md
AGENTS.md

Do not leave contradictory states across authoritative documents.

---

# 14. Current Documentation Alignment Task

Current AGENTS.md already contains the latest authoritative baseline.

The following documents must be checked for stale platform state:

PLATFORM_VALIDATION.md
DECISIONS.md
ACCEPTANCE.md

Specifically search for outdated states such as:

LITE_WEARABLE_CANDIDATE
WATCH_PHYSICAL_INSTALL = NOT_CONFIRMED
WATCH_PHYSICAL_LAUNCH = NOT_CONFIRMED
API18/API21 Error-40 investigation still open

These must eventually be aligned with the verified API10 physical baseline.

Do NOT change them automatically unless the current task authorizes
documentation synchronization.

---

# 15. Documentation Change Discipline

Documentation changes must be:

- evidence-based
- minimal
- traceable
- consistent with current project state

Do not rewrite an entire document when only one status changed.

Do not delete historical reasoning that is useful for understanding
why a decision exists.

Prefer:

previous state
→ superseded by
→ new verified state

where historical context is useful.

---

# 16. Closed Platform Issues

The following should not be reopened merely because older documents
or logs mention them:

- Lite Wearable vs Smart Wearable
- GT 5 Pro physical Lite Wearable support
- /sdcard/haps/
- DevEco Assistant HAP detection
- current V3 signing chain
- GT 5 Pro device/Profile binding
- LegacySignLiteBin
- target = 60001021
- compileSdkVersion = 6.0.1.112
- deviceType = liteWearable
- minPlatformVersion = 10
- compatible = 40000010
- API10 Clean Probe physical installation
- API10 Clean Probe physical launch
- Error 40 investigation for the current baseline

Only NEW contradictory physical evidence can reopen these issues.

---

# 17. Product Scope Authority

PRODUCT_SPEC.md defines product scope.

Do not infer that a platform capability automatically belongs in the product.

For example:

a sensor being available

does NOT automatically mean:

the product should expose a new tennis metric.

Product approval and platform capability are separate.

---

# 18. Specification Before Implementation

If implementation behavior is unclear:

check the relevant spec first.

Do not let existing code silently become the product specification.

Priority:

approved specification
→ implementation

not:

old implementation
→ assumed requirement

If the spec is genuinely incomplete:

report the unresolved decision.

Do not invent durable product behavior without approval.

---

# 19. Acceptance-Driven Completion

Before declaring a task complete:

check ACCEPTANCE.md.

A task is complete only when applicable acceptance criteria are satisfied.

For device functionality, this may require:

BUILD
SIGN
STATIC_VALIDATION
PHYSICAL_INSTALL
PHYSICAL_LAUNCH
FEATURE_TEST

Do not report "done" merely because source changes exist.

---

# 20. Required Documentation Check in Completion Report

For substantial changes, Codex should report:

DOCUMENTS_READ =

DOCUMENTS_CHANGED =

REQUIREMENTS_AFFECTED =

DECISIONS_AFFECTED =

PLATFORM_BASELINE_CHANGED =
YES / NO

PRODUCT_SCOPE_CHANGED =
YES / NO

ACCEPTANCE_UPDATED =
YES / NO / NOT_REQUIRED

DOCUMENT_CONFLICT_FOUND =
YES / NO

If conflict exists:

CONFLICT =
RECOMMENDED_RESOLUTION =

Do not silently resolve authoritative conflicts.

---

# 21. Documentation Hierarchy Summary

Think of project documentation as three layers.

## Layer 1 — Engineering Constitution

AGENTS.md

Defines:

what Codex may and may not do.

---

## Layer 2 — Product and Platform Truth

PLATFORM_VALIDATION.md
PRODUCT_SPEC.md
UI_SPEC_PHONE.md
UI_SPEC_WATCH.md
CROSS_DEVICE_SPEC.md
DATA_CONTRACT.md

Defines:

what is true
and
what should exist.

---

## Layer 3 — Verification and Design Record

ACCEPTANCE.md
DECISIONS.md
ARCHITECTURE.md
DEVICE_BASELINE.md

Defines:

how it is accepted,
why decisions exist,
how the system is organized,
and historical device context.

---

# 22. Prime Documentation Rule

Never let an old document silently override newer verified reality.

Never let new code silently override approved requirements.

When uncertain:

READ AUTHORITY
→ FIND EVIDENCE
→ IDENTIFY CONFLICT
→ PRESERVE CURRENT BASELINE
→ MAKE MINIMAL CHANGE
→ UPDATE AFFECTED DOCUMENTS
→ VALIDATE
