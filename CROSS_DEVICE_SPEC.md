# Cross-Device Specification

> Status: COMPLETED-RECORD SYNC SCOPE CONFIRMED — TRANSPORT AND DETAILS DRAFT
>
> 当前定义产品级同步语义。HUAWEI Wear Engine 是主要候选传输技术，不是已验证实现；协议必须保持传输层无关。

## 1. Scope

MVP 跨设备范围仅包括：

- GT 5 Pro 生成完成运动记录。
- 完成记录传输到 Mate X7。
- Mate X7 验证、去重、持久化并确认接收。
- 断连时手表排队，恢复后重试。
- 手机展示连接与同步状态。

MVP 不包括实时运动画面镜像或手机远程运动控制。

Confirmed product-level stages: completed record → Queue → Retry when needed → Dedup at the phone → ACK after accepted processing → Recovery after interruption. These semantics must work independently from the transport implementation. This does not select a transport or retry schedule.

## 2. Device Responsibilities

- Watch: 运动期间权威状态、基础会话信息、完成记录创建、本地待同步队列。
- Phone: 完成记录接收、持久化、历史、详情、统计和设备状态展示。
- Shared: 会话身份、schema 版本、同步确认和错误语义。

## 3. Session Authority

- Authoritative workout owner: GT 5 Pro.
- Workout state owner: GT 5 Pro.
- Workout timing owner: GT 5 Pro.
- Completed record creator: GT 5 Pro.
- Synchronized record repository: Mate X7, with watch retaining records according to a future retention rule.
- Authority transfer during an active workout: not supported in MVP.

## 4. Synchronization Vocabulary

`COMMAND`、`STATE`、`EVENT`、`DATA` 是产品协议类别，不得直接依赖某个传输 SDK。候选技术及设备环境见 `DEVICE_BASELINE.md`。

Required layering:

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

`Session`, `SessionSummary`, `SyncEnvelope`, and `SyncStatus` are above the communication SDK boundary and must not contain Wear Engine API objects. The adapter alone translates protocol messages to and from a verified transport.

### COMMAND

- `REQUEST_RECORD_SYNC`: request pending completed records.
- `RETRY_RECORD_SYNC`: request another transfer attempt.

Workout control commands are not cross-device MVP messages.

### STATE

- Workout State: defined in `PRODUCT_SPEC.md` and owned by the watch.
- Sync State: `NOT_READY / PENDING / SYNCING / SYNCED / FAILED`.
- Connection State: exact values `NEEDS CONFIRMATION`.

### EVENT

- `RECORD_READY`
- `RECORD_RECEIVED`
- `RECORD_SYNCED`
- `RECORD_SYNC_FAILED`

### DATA

- `WorkoutSessionRecord`
- Future approved data extensions

## 5. Completed Record Flow

```text
Watch finalizes session
  → Creates WorkoutSessionRecord
  → Persists locally
  → Marks Sync State PENDING
  → Transfers record
  → Phone validates schema and identity
  → Phone idempotently inserts or updates
  → Phone acknowledges sessionId
  → Watch marks record SYNCED
```

| Stage | Product rule | Detail still open |
| --- | --- | --- |
| Queue | Completed records wait for transfer on the watch | Storage limit and retention |
| Retry | Pending/failed transfer can be attempted again | Trigger, interval and backoff |
| Dedup | Repeated delivery of one `sessionId` creates no duplicate phone history item | Record version and conflict details |
| ACK | Phone acknowledges an accepted or already-present record; watch marks it synced only after ACK | Receipt format and timeout |
| Recovery | After interruption, pending identities and local sync status are reconciled before normal transfer resumes | Recovery trigger and detailed policy |

## 6. Offline Behavior

- Phone unavailable: watch workout continues independently.
- Watch unavailable: phone retains previously synchronized records.
- Completed but unsynchronized record: remains queued on watch.
- Retry trigger and interval: `NEEDS CONFIRMATION`.
- Retention duration: `NEEDS CONFIRMATION`.

## 7. Reconnection and Reconciliation

- Reconnection checks pending record identities.
- Records may be resent safely.
- Phone processing must be idempotent by `sessionId` and schema version.
- A phone copy must not cause a completed watch session to return to an active state.

## 8. Conflict Resolution

- Session identity: `sessionId` is the logical record key.
- Workout State authority: watch during the session.
- Completed state: terminal for the same session identity.
- Duplicate record: idempotent update or no-op, never a second history item.
- Timestamp representation: `NEEDS CONFIRMATION`.
- Editable phone fields and merge rules: out of MVP unless later approved.

## 9. Error States

- Phone unavailable.
- Watch unavailable.
- Transfer pending.
- Transfer failed.
- Invalid schema.
- Duplicate delivery.
- Storage failure.

Detailed recovery UI remains `NEEDS CONFIRMATION`.

## 10. Security and Privacy

NEEDS CONFIRMATION

## 11. Data Contract Dependency

All payloads must use schemas and units defined in `DATA_CONTRACT.md`.

## 12. Acceptance Criteria

- An active watch workout does not depend on phone availability.
- A completed record can remain pending without changing Workout State.
- Repeated delivery does not create duplicate phone history entries.
- A successfully acknowledged record becomes available to phone history and downstream analysis.
- Communication transport is not assumed until platform capability is verified.
