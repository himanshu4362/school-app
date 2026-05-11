# ACADEMY Enterprise Attendance & Compliance Engine
**Architecture & Development Ledger**

## 1. Core Philosophy & Design Principles
* **Strict Domain Separation:** Official Daily Attendance (Compliance/Government) is entirely separate from Operational Period Attendance (Execution/Discipline).
* **Cryptographic Immutability:** Attendance is an audit record. State flows from `DRAFT` ➔ `COMMITTED` (30-min window) ➔ `LOCKED`. Changes require an explicit `REOPEN` flow.
* **Truth Arbitration:** The system expects multi-source inputs (Teacher, Biometric, RFID, Proxy, Auto-Leave). The `attendanceSource` and `officialOwnerTeacherId` track exact provenance.
* **Real-World Edge Cases:** Native support for `HALF_DAY`, `MEDICAL_EXIT`, and proxy disputes.

---

## 2. Expanded Schema Definitions (To be added to Zod/Redux)

### A. The Status Engines
```typescript
type DailyAttendanceStatus = 'PRESENT' | 'ABSENT' | 'LATE' | 'HALF_DAY' | 'EARLY_DISMISSAL' | 'MEDICAL_EXIT' | 'ON_LEAVE';
type PeriodPresenceStatus = 'PRESENT' | 'ABSENT' | 'LATE' | 'PROXY_ATTENDED';

type LockStatus = 'DRAFT' | 'COMMITTED_COUNTDOWN' | 'LOCKED' | 'REOPEN_REQUESTED' | 'REOPEN_APPROVED' | 'REOPENED';
type AttendanceSource = 'TEACHER_MANUAL' | 'RFID_GATE' | 'BIOMETRIC' | 'LEAVE_ENGINE_AUTO' | 'ADMIN_OVERRIDE';
type InstructionalDayType = 'FULL_DAY' | 'HALF_DAY' | 'EXAM_DAY' | 'HOLIDAY' | 'EVENT_DAY';