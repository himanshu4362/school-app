# School Management System: Admissions Architecture Reference

## 1. Architectural Philosophy
This document serves as the master blueprint for the Admissions & Enrollment module. The architecture shifts away from a traditional "form-centric" data collection model to an **Enterprise Lifecycle Management** system. 

The system is normalized into distinct domain entities connected by a strict Business Rules Engine, ensuring scalability, legal compliance, and operational auditability from the first parent inquiry to the final seat allocation.

---

## 2. The Core Lifecycle (State Machines)

The system relies on strict state transitions to govern workflow.

### A. Lead CRM Workflow (`LeadStatus`)
Tracks the pre-application sales funnel.
* `new` → `contacted` → `follow_up` → `converted` (or `closed`)

### B. Application Workflow (`AdmissionStatus`)
The master state of an active application.
* `draft`: Initial data entry, incomplete.
* `submitted`: Profile complete, awaiting admin review.
* `under_review`: Admin is actively evaluating.
* `assessment_pending`: Scheduled for written test or viva.
* `document_pending`: Missing mandatory documents.
* `verification_pending`: Documents submitted, awaiting admin verification.
* `waitlisted`: Approved, but target class seats are full.
* `approved`: Fully vetted, seat allocated, fee pending.
* `enrolled`: Officially a student of the school.
* `rejected` / `cancelled`: Terminal states.

### C. Document Verification Engine
Documents maintain dual-state tracking.
* **Submission Status:** `submitted` | `pending` | `refused` | `not_applicable`
* **Verification Status:** `unverified` | `verified` | `rejected` | `needs_resubmission`

---

## 3. Domain Entities (Data Dictionary)

### Module 1: Pre-Admissions CRM
* **`AdmissionLead`**: The initial inquiry. Captures parent name, mobile, interested class, and lead source (`walk_in`, `website`, etc.).
* **`CommunicationLog`**: Tracks all outbound touchpoints (calls, SMS, emails) sent to the lead or applicant to maintain operational history.

### Module 2: Configuration & Rules
* **`AcademicClass`**: The seat management layer. Tracks total seats vs. occupied seats for a specific academic year.
* **`RequiredDocumentRule`**: The logic layer mapping which documents are mandatory based on `classId` and `admissionType` (e.g., Transfer Certificates for transfer students).

### Module 3: Global Student Identity
* **`Student`**: The persistent, global record of the child. Exists independently of the application.
* **`MedicalProfile`**: Tracks blood group, allergies, and disability status.
* **`FileAsset`**: A storage-agnostic abstraction for all uploaded files (photos, PDFs).

### Module 4: The Application Entities
* **`GuardianProfile`**: Supports multiple parents/guardians, tracking primary and emergency contact flags.
* **`AcademicHistory`**: Conditional entity tracking previous school, board, and migration reasons.
* **`AssessmentRecord`**: Tracks multiple evaluation rounds (written, viva, observation) with evaluator remarks.
* **`AdmissionDocument`**: The compliance vault. Tracks document numbers, expiries, and verification metadata.

### Module 5: The Aggregate Root
* **`AdmissionApplication`**: The central nervous system. Ties the global student, guardians, assessments, and documents to a specific `campaignId` and `classId`. Manages internal notes and activity logs for auditability.

---

## 4. Business Rules Engine (Guardrails)

These rules dictate how entities interact and transition.

1. **The Conversion Rule:** A Lead cannot be marked `converted` unless an `AdmissionApplication` is successfully instantiated linking back to the Lead's ID.
2. **The Submission Guard:** An application cannot move from `draft` to `submitted` unless the `checklist.profileCompleted` flag evaluates to true.
3. **The Document Generation Rule:** Upon application creation, the system evaluates `RequiredDocumentRule` to auto-populate the `documents` array with the exact compliance requirements for that specific student.
4. **The Final Approval Guard:** An application can only reach `approved` if:
   * All Tier 1 (Mandatory) documents possess a `verified` status.
   * `AcademicClass.occupiedSeats` is strictly less than `AcademicClass.totalSeats` (otherwise, route to `waitlisted`).

---

## 5. Frontend Execution Strategy
For Version 1, the frontend will be built chronologically down the pipeline using React and strict TypeScript interfaces to guarantee data integrity before the backend API is wired up.

**Phase 1:** Lead Management (CRM Kanban & Enquiry Capture)
**Phase 2:** Global Configuration (Class & Rule setup)
**Phase 3:** The Smart Application Controller (Master Application Wizard)
**Phase 4:** The Compliance Vault (Document Verification UI)