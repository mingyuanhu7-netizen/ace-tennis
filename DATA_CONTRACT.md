# Data Contract

> Status: DRAFT STRUCTURAL CONTRACT — METRICS AWAITING CONFIRMATION
>
> 当前仅定义会话生命周期与同步所需的最小结构，不批准网球专项指标或真实传感器字段。

## 1. Contract Principles

- `Session`, `SessionSummary`, `SyncEnvelope`, and `SyncStatus` are transport-independent models. They sit above the Huawei Communication SDK and must not contain SDK API objects.
- Every field defines type, unit, optionality, origin, and update frequency where applicable.
- Raw sensor data, derived metrics, and display values remain separate.
- UI formatting does not change underlying meaning.
- Unavailable values are not represented as genuine zeroes.
- Mock data is explicitly labeled and isolated from future real-data pipelines.

## 2. Schema Registry

| Schema | Purpose | Producer | Consumers | Status |
| --- | --- | --- | --- | --- |
| `Session` | Represent the product-level workout lifecycle | Watch during workout; phone after sync | Domain, persistence, presentation | STRUCTURE CONFIRMED; fields pending refinement |
| `SessionSummary` | Represent approved completed-session output | Watch creates; phone consumes | Summary, history, detail, statistics | STRUCTURE CONFIRMED; fields pending refinement |
| `SyncEnvelope` | Carry a transport-independent protocol payload | Cross-device protocol | Transport adapter | STRUCTURE CONFIRMED; fields pending refinement |
| `SyncStatus` | Represent local synchronization progress | Local sync layer | Queue, retry, device status UI | STRUCTURE CONFIRMED; exact values pending refinement |
| `WorkoutSessionRecord` | Represent one workout lifecycle and completed record | Watch | Watch persistence, phone history/detail/statistics | DRAFT |
| `SyncReceipt` | Acknowledge record processing | Phone | Watch sync queue | DRAFT |
| `AnalyticsProjection` | Represent future phone-derived analysis | Phone | Phone detail/statistics | PLACEHOLDER; fields pending |

## 3. WorkoutSessionRecord

| Field | Type | Unit | Optional | Origin | Update Frequency | Description |
| --- | --- | --- | --- | --- | --- | --- |
| `schemaVersion` | String | none | No | Shared contract | Per record | Contract version |
| `sessionId` | String | none | No | Watch | Once | Stable workout identity |
| `workoutState` | Enum | none | No | Watch | On state transition | Authoritative workout lifecycle state |
| `startTime` | Timestamp | `NEEDS CONFIRMATION` | No after successful start | Watch | Once | Session start instant |
| `endTime` | Timestamp | `NEEDS CONFIRMATION` | Yes until completed | Watch | Once | Session completion instant |
| `elapsedDuration` | Integer | seconds | No after successful start | Watch | Product cadence pending | Lifecycle duration, not a tennis-specific metric |
| `syncState` | Enum | none | No | Local device | On sync transition | Local transfer status |
| `metricPayload` | Object | per future schema | Yes | `NEEDS CONFIRMATION` | `NEEDS CONFIRMATION` | Reserved; no tennis metric approved |

## 4. SyncReceipt

| Field | Type | Unit | Optional | Origin | Update Frequency | Description |
| --- | --- | --- | --- | --- | --- | --- |
| `schemaVersion` | String | none | No | Shared contract | Per receipt | Contract version |
| `sessionId` | String | none | No | Phone | Per acknowledgment | Acknowledged workout identity |
| `result` | Enum | none | No | Phone | Per acknowledgment | Processing result |
| `receivedAt` | Timestamp | `NEEDS CONFIRMATION` | No | Phone | Once | Receipt time |

## 5. Enumerations

### WorkoutState

`IDLE / PREPARING / ACTIVE / PAUSED / FINISHING / FINALIZATION_FAILED / COMPLETED`

### SyncState

`NOT_READY / PENDING / SYNCING / SYNCED / FAILED`

### SyncReceiptResult

`ACCEPTED / ALREADY_PRESENT / REJECTED_INVALID`

## 6. Unit Registry

| Quantity | Internal Unit | Display Unit | Formatting | Status |
| --- | --- | --- | --- | --- |
| Lifecycle duration | seconds | `NEEDS CONFIRMATION` | `NEEDS CONFIRMATION` | DRAFT |
| Timestamp | `NEEDS CONFIRMATION` | Localized for display | `NEEDS CONFIRMATION` | DRAFT |

No tennis performance unit has been approved.

## 6.1 Transport Boundary

```text
Session / SessionSummary / SyncEnvelope / SyncStatus
↓
Sync Protocol
↓
Transport Adapter
↓
Huawei Communication SDK (candidate)
```

The four models above are not SDK wrappers. The adapter maps them to a selected, verified transport implementation. Their exact field definitions remain subject to the existing product and data-contract approval process.

## 7. Data Lineage

```text
Watch lifecycle events
  → WorkoutSessionRecord
  → Cross-device synchronization
  → Phone stored record
  → AnalyticsProjection
  → Phone display values
```

Future sensor data must use a separate path:

```text
RAW SENSOR DATA
  → DERIVED METRIC
  → DISPLAY VALUE
```

No real sensor path is approved in MVP.

## 8. Identity and Timestamps

- `sessionId` is stable across watch persistence, retries and phone storage.
- Timestamp representation and time-zone normalization: `NEEDS CONFIRMATION`.
- Duplicate delivery uses the same `sessionId`.

## 9. Validation Rules

- Unknown schema versions are rejected explicitly.
- Required identity and lifecycle fields cannot be missing.
- `COMPLETED` requires an `endTime`.
- Metric payload validation remains undefined until metrics are approved.

## 10. Versioning and Migration

NEEDS CONFIRMATION

## 11. Mock Data

- Product/UI design may use clearly labeled mock records after fields are approved.
- Mock data must never be presented as real sensor evidence.
- Production and mock sources must remain distinguishable.

## 12. Privacy and Retention

NEEDS CONFIRMATION
