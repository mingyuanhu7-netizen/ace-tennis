# Watch UI Specification

> Status: PRODUCT WORKOUT FLOW CONFIRMED — VISUAL DESIGN DRAFT
>
> Target: HUAWEI WATCH GT 5 Pro
>
> 当前只定义 Screen Map 与状态职责，不定义正式视觉稿。

## 1. WATCH Product Principles

- 手表不是手机缩小版。
- 场上交互优先可扫视性、大值、少操作与低认知负担。
- 圆形屏幕边缘必须预留安全区域。
- 表冠、手势、振动等能力必须验证后才能成为正式交互要求。

## 2. Screen Inventory

已确认手表应完成 Start → Active → Pause → Resume → Finish → Quick Result 的完整控制闭环；下表仍是逻辑页面结构，不代表视觉设计已获批准。

| ID | Screen | Workout State | Purpose | Design Status |
| --- | --- | --- | --- | --- |
| W-01 | Ready / Start | `IDLE` | 开始一次运动 | DRAFT |
| W-02 | Workout | `PREPARING / ACTIVE / PAUSED / FINISHING / FINALIZATION_FAILED` | 查看状态并控制运动 | DRAFT |
| W-03 | Quick Result | `COMPLETED` | 查看基础完成结果 | DRAFT |

## 3. State-Driven Interaction

| State | Available Product Actions |
| --- | --- |
| `IDLE` | Start |
| `PREPARING` | Cancel if supported; otherwise wait for result |
| `ACTIVE` | Pause, Finish |
| `PAUSED` | Resume, Finish |
| `FINISHING` | Prevent duplicate actions |
| `FINALIZATION_FAILED` | Retry finalization |
| `COMPLETED` | Exit result |

具体控件形式、操作确认和防误触方式待 UI 设计确认。

## 4. Active Workout Content

- Session status and duration: in scope.
- M1 mock values: heart rate, stroke count, and current score.
- M1 controls: Pause and Finish.
- Real heart-rate data requires later platform validation; stroke detection/classification remains a separate later spike.
- No forehand, backhand, serve speed, sweet-spot or quality metric is approved.

## 4.1 M1 Ready and Finish Boundaries

- Ready presents AceTennis identity, a Start entry, and only necessary preparation state.
- Finish requires explicit confirmation before Quick Result.
- Quick Result is limited to duration, heart-rate summary, stroke count, final score, and Complete.

## 5. Circular Screen Constraints

- Edge safety: `NEEDS CONFIRMATION`
- Text width: `NEEDS CONFIRMATION`
- Control reachability: `NEEDS CONFIRMATION`
- Radial spacing: `NEEDS CONFIRMATION`
- Center emphasis: `NEEDS CONFIRMATION`

## 6. Interaction Capabilities

- Crown behavior: `NEEDS CAPABILITY VERIFICATION`
- Touch behavior: `NEEDS CONFIRMATION`
- Swipe behavior: `NEEDS CONFIRMATION`
- Haptic behavior: `NEEDS CAPABILITY VERIFICATION`

## 7. Screen Definition Template

### Screen: [Screen ID / Name]

- Requirement IDs: `NEEDS CONFIRMATION`
- Design status: `DRAFT`
- Purpose: `NEEDS CONFIRMATION`
- Usage context: `NEEDS CONFIRMATION`
- Primary information: `NEEDS CONFIRMATION`
- Secondary information: `NEEDS CONFIRMATION`
- Component hierarchy: `NEEDS CONFIRMATION`
- Text hierarchy: `NEEDS CONFIRMATION`
- Crown behavior: `NEEDS CONFIRMATION`
- Touch and swipe behavior: `NEEDS CONFIRMATION`
- Circular-screen constraints: `NEEDS CONFIRMATION`
- Visual acceptance criteria: `NEEDS CONFIRMATION`

## 8. Golden Baselines

No watch design has been approved or frozen.
