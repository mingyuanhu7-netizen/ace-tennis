# Product Specification

> Status: DRAFT — CORE SCOPE CONFIRMED; REMAINING DETAILS AWAITING CONFIRMATION
>
> Version: 0.2
>
> Phase: PRODUCT ARCHITECTURE ONLY
>
> 本文件定义 Mate X7 + GT 5 Pro 双端网球 App 的产品结构。当前不进入视觉设计、UI 工程或正式业务代码。

## 1. Product Core Goal

建立一个以 GT 5 Pro 完成场上运动闭环、以 Mate X7 完成运动记录管理与分析的双端网球产品：

- 用户在手表上低干扰地开始、查看、暂停、恢复、结束运动并查看快速结果。
- 完成的运动记录可靠进入手机端，用于历史回顾、单次详细分析、长期统计、设置与设备管理。
- 手机折叠外屏与展开内屏共享同一产品状态，但采用不同的信息组织方式。
- 手机和手表保持一致的会话身份、生命周期状态和数据含义。
- 当前不承诺任何未经确认的网球专项指标或真实传感器能力。

### Requirement ID Mapping

以下 ID 与本文件的产品内容建立明确对应。`CONFIRMED SCOPE` 只表示产品范围已由用户明确提出，不表示已实现或视觉设计已获批准。

| Requirement ID | Product meaning | Location | Product status |
| --- | --- | --- | --- |
| `REQ-PRODUCT-001` | Mate X7 + GT 5 Pro 共同组成一个网球产品 | 核心目标、设备职责 | CONFIRMED SCOPE |
| `REQ-WATCH-001` | 手表完整控制闭环：开始、运动中查看、暂停、恢复、结束、快速结果 | Watch Screen Map、User Flow、MVP | CONFIRMED SCOPE |
| `REQ-PHONE-001` | 手机：首页、历史、详情、统计、设置、设备管理 | Phone Screen Map、MVP | CONFIRMED SCOPE |
| `REQ-PHONE-002` | 外屏单栏；内屏独立大屏，History / Detail 主从 | Phone Screen Map、MVP | CONFIRMED SCOPE |
| `REQ-PHONE-003` | 折叠/展开时保留适用的产品状态 | UF-07、Phone Screen Map | DRAFT; detailed behavior pending |
| `REQ-STATE-001` | 手表使用单一权威运动状态机 | Tennis Workout State Machine | DRAFT; transitions pending approval |
| `REQ-X-001` | 完成记录同步到手机；Queue、Retry、Dedup、ACK | UF-03、UF-08、双端数据流、MVP | CONFIRMED SCOPE; transport pending |
| `REQ-X-002` | 手机不可用时手表运动继续 | 产品架构、双端数据流 | DRAFT; offline behavior pending approval |
| `REQ-PLATFORM-001` | Mate X7 客户端必须在 DEL-LX9 / EMUI 15 正常运行，并分别验证折叠和展开状态 | 平台基线、验收规范 | CONFIRMED SCOPE; runtime verification pending |
| `REQ-PLATFORM-002` | GT 5 Pro 正式开发框架仅可在 HarmonyOS 6.0.0.32 真机安装及运行验证后冻结 | 平台基线、验收规范 | CONFIRMED SCOPE; POC paused and framework unverified |
| `REQ-X-003` | 跨设备领域同步协议不得依赖具体通信 SDK | 双端数据流、数据契约、架构 | CONFIRMED SCOPE; implementation pending |
| `REQ-MVP-001` | MVP 不引入未批准的网球指标或真实传感器 | MVP 排除项 | PREVIOUS USER CONSTRAINT |
| `REQ-PROCESS-001` | 产品结构确认前不进入 UI 工程 | Approval Gate | PREVIOUS USER CONSTRAINT |

## 2. Target Users and Context

### Primary User

使用 HUAWEI WATCH GT 5 Pro 记录网球运动，并通过 HUAWEI Mate X7 回顾运动数据的用户。

### Primary Contexts

- 场上：佩戴手表，交互时间短，优先可扫视性和低认知负担。
- 场下：使用手机回顾单次运动、查看长期变化、管理设置和设备。
- 折叠切换：Mate X7 在外屏与内屏切换时保持当前导航、选择和数据状态。

## 3. Device Responsibilities

| Feature Area | Responsibility | GT 5 Pro | Mate X7 |
| --- | --- | --- | --- |
| Workout control | `WATCH ONLY` | 开始、暂停、恢复、结束 | MVP 不远程控制运动 |
| In-workout glance | `WATCH ONLY` | 查看运动状态与基础会话信息 | MVP 不实时镜像 |
| Quick result | `WATCH PRIMARY / PHONE SECONDARY` | 结束后即时查看 | 同步后进入单次详情 |
| Workout history | `PHONE ONLY` | 不提供完整历史 | 浏览历史记录 |
| Workout detail | `PHONE ONLY` | 仅快速结果 | 查看单次详细分析结构 |
| Long-term statistics | `PHONE ONLY` | 不提供 | 查看长期统计结构 |
| Settings | `PHONE ONLY` | 仅保留运动必要控制 | 管理产品设置 |
| Device management | `PHONE ONLY` | 被管理设备 | 查看连接、同步与设备状态 |
| Completed record sync | `SHARED` | 产生并发送记录 | 接收、保存并用于分析 |

## 4. Product Architecture

### 4.1 Recommended Model

采用“手表会话权威 + 手机记录分析”模型：

- 运动期间，手表拥有权威 Workout State、计时与控制权。
- 手机不参与 MVP 实时运动控制，不作为运动继续运行的前置条件。
- 运动完成后，手表生成完成记录并进入独立同步流程。
- 手机接收完成记录，以 `sessionId` 识别同一次运动，并用于历史、详情与统计。
- Workout State 与 Sync State 相互独立：运动可已完成但仍处于待同步状态。

### 4.2 Alternatives Not Selected for MVP

- 双端共同控制实时会话：暂不采用，避免控制冲突和断连复杂度。
- 手机作为会话权威：暂不采用，避免手机不可用时影响手表运动闭环。

## 5. Complete User Flow

### UF-01 — Watch Workout Happy Path

```text
Watch Ready
  → Start
  → Preparing
  → Active Workout
  → Finish
  → Finalizing
  → Quick Result
  → Completed Record queued for sync
```

### UF-02 — Pause and Resume

```text
Active Workout
  → Pause
  → Paused
  → Resume
  → Active Workout
```

用户也可从 `Paused` 进入结束流程。

### UF-03 — Completed Record Sync

```text
Watch Completed Record
  → Sync Pending
  → Send to Phone
  → Phone validates session identity
  → Phone stores or idempotently updates record
  → Phone acknowledges receipt
  → Watch marks record Synced
```

断连时记录保留在手表端并等待重试；具体保留期限与传输技术待验证。

### UF-04 — Phone History and Detail

```text
Phone Home
  → Workout History
  → Select Workout
  → Workout Detail
  → Return to History or Home
```

### UF-05 — Phone Long-Term Statistics

```text
Phone Home
  → Statistics
  → Select approved time range
  → Review approved aggregates
```

具体统计指标与时间范围仍为 `NEEDS CONFIRMATION`。

### UF-06 — Settings and Device Management

```text
Phone Home
  → Settings
  → Device Management
  → Review connection and sync status
  → Perform an approved management action
```

配对、解绑、手动同步等具体操作仍为 `NEEDS CONFIRMATION`。

### UF-07 — Mate X7 Fold / Unfold Continuity

```text
Current PHONE-COMPACT destination and state
  → Device unfolds
  → Equivalent PHONE-EXPANDED composition
  → Same destination, selected workout and loaded data remain active
```

反向折叠遵循相同连续性原则。

### UF-08 — Sync Failure Recovery

```text
Watch Sync Pending
  → Transfer fails or phone unavailable
  → Sync Failed / Pending Retry
  → Reconnect or retry trigger
  → Idempotent resend
  → Phone acknowledgment
  → Synced
```

## 6. Phone Screen Map

### 6.1 Logical Phone Screens

```text
P-01 Home
├── P-02 Workout History
│   └── P-03 Workout Detail
├── P-04 Long-Term Statistics
└── P-05 Settings
    └── P-06 Device Management
```

### 6.2 Screen Inventory

| ID | Screen | Purpose | MVP Status |
| --- | --- | --- | --- |
| P-01 | Home | 进入历史、统计、设置与设备状态 | In scope |
| P-02 | Workout History | 浏览已同步的运动记录 | In scope |
| P-03 | Workout Detail | 查看单次运动的详细分析结构 | In scope; metric set pending |
| P-04 | Long-Term Statistics | 查看长期统计结构 | In scope; metric set pending |
| P-05 | Settings | 管理已批准的产品设置 | In scope; setting list pending |
| P-06 | Device Management | 查看设备连接与同步状态 | In scope; actions pending |

### 6.3 PHONE-COMPACT Product Behavior

- 使用单栏、逐级进入的导航结构。
- History 与 Detail 分页展示。
- 一次聚焦一个主要任务。
- 折叠切换前的目标页面和选中记录必须保留。

### 6.4 PHONE-EXPANDED Product Behavior

- 不是外屏界面的等比放大。
- History / Detail 采用列表与详情同屏的主从结构；具体视觉布局待 UI 设计确认。
- Settings 可采用分类与内容同屏的主从结构。
- Home 与 Statistics 可利用更宽空间并列组织信息，但具体布局待 UI 设计确认。
- 展开切换不得重置导航、选中记录或加载状态。

## 7. Watch Screen Map

### 7.1 Logical Watch Screens

```text
W-01 Ready / Start
  → W-02 Workout
      ├── ACTIVE presentation
      ├── PAUSED presentation
      └── FINISHING presentation
  → W-03 Quick Result
```

### 7.2 Screen Inventory

| ID | Screen | Purpose | MVP Status |
| --- | --- | --- | --- |
| W-01 | Ready / Start | 进入一次新的网球运动 | In scope |
| W-02 | Workout | 查看运动状态并执行暂停、恢复和结束 | In scope |
| W-03 | Quick Result | 结束后确认运动已完成并查看基础结果 | In scope; result fields pending |

### 7.3 Watch Product Rules

- 手表不是手机缩小版。
- MVP 不提供完整历史、长期统计、详细设置或深度分析。
- 运动控制必须在圆形屏幕上快速、清晰且低误触。
- W-02 根据状态改变可用操作，而不是创建互相独立且可能矛盾的会话页面。
- 表冠和手势能力必须在平台验证后才能写入正式交互要求。

## 8. Tennis Workout State Machine

### 8.1 Authoritative Workout State

```text
IDLE
  → PREPARING
  → ACTIVE
  ⇄ PAUSED
  → FINISHING
  → COMPLETED
```

Allowed transitions:

| From | Action / Cause | To |
| --- | --- | --- |
| `IDLE` | Start | `PREPARING` |
| `PREPARING` | Start succeeds | `ACTIVE` |
| `PREPARING` | Start fails or user cancels | `IDLE` |
| `ACTIVE` | Pause | `PAUSED` |
| `PAUSED` | Resume | `ACTIVE` |
| `ACTIVE` | Finish | `FINISHING` |
| `PAUSED` | Finish | `FINISHING` |
| `FINISHING` | Record finalization succeeds | `COMPLETED` |
| `FINISHING` | Recoverable finalization failure | `FINALIZATION_FAILED` |
| `FINALIZATION_FAILED` | Retry | `FINISHING` |
| `COMPLETED` | Exit result | `IDLE` |

Rules:

- GT 5 Pro owns the authoritative state during the workout.
- Repeated Start, Pause, Resume, or Finish actions must be idempotently rejected or ignored.
- Backgrounding or display sleep must not silently change Workout State.
- Recovery after process/device interruption depends on verified platform persistence capability.
- A completed session cannot return to an active state.

### 8.2 Independent Sync State

```text
NOT_READY
  → PENDING
  → SYNCING
  → SYNCED

SYNCING → FAILED → PENDING
```

Sync State begins only after a valid completed record exists and never changes the completed Workout State.

## 9. Dual-Device Data Flow

```text
GT 5 Pro workout controls
  → Authoritative Workout State
  → Local in-progress session persistence
  → Completed Workout Record
  → Watch sync queue
  → Cross-device transfer
  → Mate X7 validation + idempotent storage
  → Phone History
  → Workout Detail
  → Long-Term Statistics
```

### Data Ownership

| Data | Authoritative Source | Consumer |
| --- | --- | --- |
| Live Workout State | GT 5 Pro | Watch UI |
| In-progress session | GT 5 Pro | Watch recovery flow |
| Completed Workout Record | GT 5 Pro at creation; phone stores synchronized copy | Phone history/detail/statistics |
| Sync status | Each device for its local transfer role | Device management UI |
| Derived phone analytics | Mate X7 | Phone detail/statistics UI |

### Data Boundaries

- MVP 不同步实时运动画面或实时控制命令。
- MVP 跨设备核心载荷是完成后的 Workout Record。
- 具体网球专项指标不在本草案中决定。
- Schema、字段、单位和可选性以 `DATA_CONTRACT.md` 为准。

## 10. MVP Scope

### 10.1 Included

#### WATCH

- 完整控制闭环：Start → Active → Pause → Resume → Finish → Quick Result。
- Ready / Start 流程。
- 明确的 Workout State。
- Active 状态的基础会话展示。
- Pause、Resume、Finish。
- Quick Result。
- 完成记录本地保存与待同步状态。

#### PHONE-COMPACT

- Home。
- Workout History。
- Workout Detail 结构。
- Long-Term Statistics 结构。
- Settings 与 Device Management 入口。
- 单栏导航与折叠状态连续性。

#### PHONE-EXPANDED

- 与外屏相同的产品目的和数据。
- 独立的大屏信息组织。
- History / Detail 主从结构能力。
- 折叠/展开状态连续性。

#### CROSS-DEVICE

- 完成记录从手表传至手机。
- 完成记录的 Queue、Retry、Dedup、ACK 产品规则；具体重试时机和传输实现待确认。
- 手机接收后进入历史、详情和统计数据源。

### 10.2 Explicitly Excluded from MVP

- 手机实时控制手表运动。
- 手机实时镜像运动页面。
- 手表完整历史、长期统计或深度分析。
- 社交、排行榜、训练课程、成就或支付功能。
- 未经确认的网球专项指标。
- 未经验证的真实传感器接入或算法。
- 云账户与多设备云同步。

### 10.3 Confirmed M1 Content and Sequencing

M1 is a GT 5 Pro physical, manual/Mock-data tennis Session:

`Ready → Start → timer → scoring → Pause/Resume → Finish Confirmation → Quick Result`.

- Active Workout shows duration, mock heart-rate value, mock stroke count, and current score.
- M1 scoring is minimal current-point and game/set state, with an explicit correction/undo policy; tournament management is excluded.
- Quick Result contains duration, heart-rate summary, stroke count, final score, and Complete.
- Finish requires confirmation. Very short sessions are retained.
- Scoring and state-machine work precede stroke-algorithm work. Real heart rate is a later validated platform integration; stroke detection is a separate capability spike before classification.

### 10.4 MVP Content Still Requiring Confirmation

- Exact heart-rate API availability and sampling behavior.
- Stroke-sensor capability, sampling and detection feasibility.
- Workout Detail 分析字段。
- Long-Term Statistics 指标与时间范围。
- Settings 项目。
- Device Management 的具体操作。

## 11. Feature Inventory

| ID | Feature | Device Responsibility | Product Status |
| --- | --- | --- | --- |
| F-W-01 | Start Workout | WATCH ONLY | User-directed |
| F-W-02 | View Active Workout | WATCH ONLY | User-directed; content pending |
| F-W-03 | Pause Workout | WATCH ONLY | User-directed |
| F-W-04 | Resume Workout | WATCH ONLY | User-directed |
| F-W-05 | Finish Workout | WATCH ONLY | User-directed |
| F-W-06 | Quick Result | WATCH PRIMARY / PHONE SECONDARY | User-directed; fields pending |
| F-P-01 | Home | PHONE ONLY | User-directed |
| F-P-02 | Workout History | PHONE ONLY | User-directed |
| F-P-03 | Workout Detail | PHONE ONLY | User-directed; metrics pending |
| F-P-04 | Long-Term Statistics | PHONE ONLY | User-directed; metrics pending |
| F-P-05 | Settings | PHONE ONLY | User-directed; contents pending |
| F-P-06 | Device Management | PHONE ONLY | User-directed; actions pending |
| F-X-01 | Completed Record Sync | SHARED | Proposed for product continuity |

## 12. Open Product Questions

1. Active Workout 必须显示哪些非传感器和网球专项信息？
2. Quick Result、Workout Detail 和长期统计分别需要哪些指标？
3. MVP 是否需要用户确认后才能结束运动？
4. 极短运动是否保存？如果保存，是否需要特殊标记？
5. 手机 Settings 与 Device Management 需要哪些具体操作？
6. 完成记录在手表端保留多久？
7. 手机端是否需要删除运动记录，以及删除是否回传手表？

## 13. Approval Gate

- 本次用户明确列出的双端职责、两种手机呈现、完成记录同步范围已确认；其余详细行为和 UI 视觉仍是草案，不是冻结基线。
- `UI_SPEC_PHONE.md` 与 `UI_SPEC_WATCH.md` 当前只记录页面范围和布局原则，不定义视觉稿。
- 在用户确认产品结构之前，不进入 UI 工程实现、正式业务代码、真实传感器或算法开发。
