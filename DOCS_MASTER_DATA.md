ARCHITECTURE BLUEPRINT: Master Data & Governance Hub
1. Module Overview
This module acts as the "Engine Room" of the ERP. It defines the physical and operational boundaries of the school. No other module (Admissions, HR, Timetable) can function without querying this data first.

2. Database Schema (Entities & Relationships)
The backend must create relational tables (or NoSQL collections) for the following entities, strictly adhering to these constraints:

Core Infrastructure & Academics
AcademicYear: id, code (Unique), startDate, endDate, status (draft/active/closed/archived).

Department: id, code (Unique), name, budget (Number), status.

Designation: id, title (Unique), hierarchyLevel (Number), departmentId (FK - Nullable), status.

Room: id, roomNumber (Unique), buildingWing, capacity (Min: 1), roomType, status.

Grade: id, name (Unique), level (Number), status.

Subject: id, code (Unique), name, status.

The Relational Glue
Section: id, academicYearId (FK), gradeId (FK), roomId (FK - Nullable), classTeacherId (FK - Nullable), name, maxCapacity (Min: 1), status.

Constraint: name must be unique per gradeId + academicYearId.

CurriculumSubject: id, academicYearId (FK), subjectId (FK), gradeId (FK), departmentId (FK), type (core/elective), weeklyPeriods (Min: 1).

Admissions Governance (Seat Management)
GradeSeatPolicy: id, academicYearId (FK), gradeId (FK), status.

Constraint: Only ONE policy allowed per gradeId + academicYearId.

SeatQuota: id, policyId (FK), name, reservedSeats, isSpilloverAllowed (Boolean).

SeatReservation (The Escrow Ledger): id, studentApplicationId (FK), academicYearId (FK), gradeId (FK), quotaId (FK - Nullable), state (reserved/consumed/expired/released/waitlisted), reservedAt (Timestamp), expiresAt (Timestamp - Nullable), consumedAt (Timestamp - Nullable).

3. Required API Endpoints (RESTful Contract)
The frontend Redux engine will eventually map its upsert actions to these endpoints.

Master Data CRUD (Applies to Years, Depts, Rooms, Grades, Subjects)
GET /api/v1/system-config/:entity -> Fetches all active/draft records.

POST /api/v1/system-config/:entity -> Creates a new record.

PUT /api/v1/system-config/:entity/:id -> Updates an existing record.

Section Operations
POST /api/v1/sections -> Create Section.

PATCH /api/v1/sections/:id/close -> Triggers the "Close Section" state change.

Seat Management Operations
POST /api/v1/seat-policies -> Create/Update Grade Quotas.

GET /api/v1/seat-policies/inventory?yearId=X&gradeId=Y -> Calculates and returns live seat availability.

POST /api/v1/seat-reservations/lock -> Attempts to Soft-Lock a seat for an applicant.

4. Critical Backend Business Logic (The "Guards")
The backend controllers MUST enforce these rules before touching the database. The frontend validates these for UX, but the backend must be the ultimate authority.

Temporal Logic Check: For Academic Years, endDate MUST be > startDate.

Room Capacity Guard: When saving a Section, backend must check Section.maxCapacity <= Room.capacity. Reject if false.

Section Closure Guard: A Section cannot transition to status = 'closed' if current_students > 0 or if a classTeacherId is currently assigned.

Seat Policy Math Guard: When saving a GradeSeatPolicy, SUM(quotas.reservedSeats) MUST be <= the total maxCapacity of all active sections for that Grade + Year.

The Concurrency Lock (CRITICAL): When POST /api/v1/seat-reservations/lock is called, the database must use a transactional lock (e.g., SELECT ... FOR UPDATE) to prevent two admins from giving away the last physical seat at the exact same millisecond.

Cron Job Requirement (Ghost Sweeper): A background script must run every 15 minutes to find SeatReservation records where state = 'reserved' and expiresAt < NOW(), and automatically change them to state = 'expired' to release the inventory back to the general pool.