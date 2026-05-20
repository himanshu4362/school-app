# 🏗️ Admissions ERP - Frontend Implementation Master Plan

## 1. Core Architecture Philosophy
* **State Machine Driven UI:** Buttons and forms will render conditionally based strictly on `app.status` and `doc.status`.
* **API Contract First:** No flat states. Forms will strictly mirror the deeply nested backend JSON structures (`studentProfile`, `guardians`).
* **Dynamic Enums:** All dropdowns will map to the `/applications/metadata` API. Zero hardcoding.
* **Separation of Concerns (Redux):** Global state will be strictly modularized to prevent desyncs.

---

## 2. Redux Store Architecture
Frontend will use Redux Toolkit + Immer to handle complex nested states without mutation bugs.

* **`admissionFormSlice`**: 
  * Handles the multi-step wizard draft.
  * Manages nested objects: `studentProfile`, `guardians` (ensuring one `isPrimaryContact: true`), `academicHistory`.
* **`applicationListSlice`**: 
  * Table data, pagination, and status filters.
* **`documentVaultSlice`**: 
  * Handles upload progress.
  * Manages the conversion of `fileKey` -> `Signed URL` for rendering `react-doc-viewer`.
* **`masterDataSlice`**: 
  * Caches `/metadata`, `academicYears`, and `grades` to prevent redundant API calls.

---

## 3. The Secure S3 Document Pipeline (The Rule of Keys)
Frontend will NEVER send files to the backend directly.
* **Upload:** `GET /upload-url` -> Direct `PUT` to AWS S3 -> Save `fileKey` in Redux.
* **Submit:** Send only `fileKey` and `documentType` in the application payload.
* **View:** `GET /documents/url?fileKey=...` -> Receive temporary Signed URL -> Feed to `react-doc-viewer`.

---

## 4. Phased Execution Strategy

###   PHASE 1: The Foundation (Core Form & Metadata)
**Goal:** Successfully generate an Application Number (e.g., APP-2026-0003) without document logic.
* Setup Redux Slices (`masterDataSlice`, `admissionFormSlice`).
* Fetch `/metadata`, Academic Years, and Grades.
* Build the multi-step form (React Hook Form) strictly mapped to the nested payload.
* **Crucial:** Ensure `isPrimaryContact` logic and `nationalIdEncrypted` validation.
* *Output: Clean `POST /applications` success.*

### 🟡 PHASE 2: S3 Document Vault (Upload & Preview)
**Goal:** Securely attach and view documents.
* Implement `react-dropzone`.
* Create the S3 upload pipeline (`/upload-url` -> S3).
* Update Step 5 of the wizard to map `fileKey`, `documentType`, and `status: 'PENDING' | 'VERIFIED'`.
* Build the Document Preview component using `@cyntler/react-doc-viewer` and `/documents/url`.

### 🟠 PHASE 3: The Review Desk (State Machine UI)
**Goal:** Build the dynamic Application Detail Page.
* Fetch `GET /applications/:id` with populated guardians.
* Render UI based on Workflow constraints:
  * If `SUBMITTED`: Show Vault Verify/Reject buttons.
  * If `DOCUMENT_PENDING`: Show Re-upload Dropzone.
  * If ALL Docs `VERIFIED`: Unlock the Pipeline Status dropdown (Move to `APPROVED`).

### 🔴 PHASE 4: The Enrollment Engine
**Goal:** Finalize admission.
* Logic: If `status === 'APPROVED'`, display the glowing Emerald **"Confirm Final Enrollment"** button.
* Hit `POST /applications/:id/enroll`.
* Lock the entire UI for editing once `status === 'ENROLLED'`.

---

## 5. Folder Structure
```text
src/features/admissions/
├── api/                  # Axios calls mapped to backend routes
├── components/           # Reusable UI (VaultViewer, Skeleton, Form Steps)
├── pages/                # AdmissionWizard.tsx, ApplicationDesk.tsx, ApplicationDetail.tsx
├── slices/               # Redux slices
├── types/                # TypeScript Interfaces matching Backend Contract
└── utils/                # S3 Upload Helpers