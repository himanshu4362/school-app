import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  StudentExitRecord,
  ExitType,
  OutboundDocument,
  ExitClearanceItem,
} from "../../types/student/exit.schema";

interface StudentExitState {
  exitRecords: Record<string, StudentExitRecord>; // Keyed by studentId
  validationErrors: { message: string; severity: "error" | "warning" }[];
}

const initialState: StudentExitState = {
  exitRecords: {},
  validationErrors: [],
};

export const studentExitSlice = createSlice({
  name: "studentExit",
  initialState,
  reducers: {
    clearExitErrors: (state) => {
      state.validationErrors = [];
    },

    // 1. INITIATION
    initiateExit: (
      state,
      action: PayloadAction<{
        studentId: string;
        academicYearId: string;
        exitType: ExitType;
        effectiveExitDate: string;
        adminId: string;
        parentRequestUrl?: string;
      }>,
    ) => {
      const {
        studentId,
        academicYearId,
        exitType,
        effectiveExitDate,
        adminId,
        parentRequestUrl,
      } = action.payload;

      // Ensure effective date is valid (Basic check, could be expanded to check academic calendar)
      if (new Date(effectiveExitDate) < new Date()) {
        state.validationErrors.push({
          message: "Effective Exit Date must be today or in the future.",
          severity: "error",
        });
        return;
      }

      const initialStatus =
        exitType === "EXPULSION" ? "CLEARANCE_PENDING" : "EXIT_PENDING";

      state.exitRecords[studentId] = {
        id: `EXT-${Date.now()}`,
        studentId,
        academicYearId,
        exitType,
        initiatedOn: new Date().toISOString(),
        effectiveExitDate,
        status: initialStatus,
        clearanceMatrix: [
          {
            department: "LIBRARY",
            status: "PENDING",
            clearedBy: null,
            clearedAt: null,
          },
          {
            department: "SPORTS",
            status: "PENDING",
            clearedBy: null,
            clearedAt: null,
          },
          {
            department: "TRANSPORT",
            status: "PENDING",
            clearedBy: null,
            clearedAt: null,
          },
          {
            department: "FINANCE",
            status: "PENDING",
            clearedBy: null,
            clearedAt: null,
          },
        ],
        refundIntent: null,
        issuedDocuments: [],
        boardRegistrationReleased: false,
        initiatedBy: adminId,
        parentRequestUrl,
      };
    },

    // 2. CLEARANCE MATRIX
    updateClearance: (
      state,
      action: PayloadAction<{
        studentId: string;
        department: ExitClearanceItem["department"];
        status: ExitClearanceItem["status"];
        remarks: string;
        adminId: string;
      }>,
    ) => {
      const record = state.exitRecords[action.payload.studentId];
      if (!record) return;

      // GUARDRAIL: Expulsion Locks
      if (
        record.exitType === "EXPULSION" &&
        !action.payload.adminId.startsWith("PRIN-") &&
        action.payload.adminId !== "ADMIN-SUPER"
      ) {
        state.validationErrors.push({
          message:
            "Expulsion clearance requires Principal or Super Admin authorization.",
          severity: "error",
        });
        return;
      }

      // GUARDRAIL: Waived requires remarks
      if (action.payload.status === "WAIVED" && !action.payload.remarks) {
        state.validationErrors.push({
          message:
            "Audit Remarks are mandatory when overriding and WAIVING a clearance.",
          severity: "error",
        });
        return;
      }

      const item = record.clearanceMatrix.find(
        (c) => c.department === action.payload.department,
      );
      if (item) {
        item.status = action.payload.status;
        item.clearedBy =
          action.payload.status === "PENDING" ? null : action.payload.adminId;
        item.clearedAt =
          action.payload.status === "PENDING" ? null : new Date().toISOString();
        item.remarks = action.payload.remarks;
      }

      // Auto-transition to Finance Settlement if everything EXCEPT Finance is cleared/waived
      const allOpsCleared = record.clearanceMatrix
        .filter((c) => c.department !== "FINANCE")
        .every((c) => ["CLEARED", "WAIVED"].includes(c.status));
      if (allOpsCleared && record.status === "CLEARANCE_PENDING") {
        record.status = "FINANCE_SETTLEMENT_PENDING";
      }
    },

    // 3. FINANCE OVERRIDE & HARD LOCK
    completeFinanceSettlement: (
      state,
      action: PayloadAction<{
        studentId: string;
        isWaived: boolean;
        remarks: string;
        adminId: string;
      }>,
    ) => {
      const record = state.exitRecords[action.payload.studentId];
      if (!record || record.status !== "FINANCE_SETTLEMENT_PENDING") return;

      if (action.payload.isWaived && !action.payload.remarks) {
        state.validationErrors.push({
          message: "Mandatory remarks required for Finance Waiver.",
          severity: "error",
        });
        return;
      }

      const financeItem = record.clearanceMatrix.find(
        (c) => c.department === "FINANCE",
      );
      if (financeItem) {
        financeItem.status = action.payload.isWaived ? "WAIVED" : "CLEARED";
        financeItem.clearedBy = action.payload.adminId;
        financeItem.clearedAt = new Date().toISOString();
        financeItem.remarks = action.payload.remarks;
      }

      record.status = "DOCUMENT_ISSUANCE_PENDING";
    },

    // 4. DOCUMENT VAULT (Serialization)
    issueDocument: (
      state,
      action: PayloadAction<{
        studentId: string;
        documentType: OutboundDocument["documentType"];
        documentName: string;
        fileUrl: string;
        adminId: string;
        isDuplicate: boolean;
      }>,
    ) => {
      state.validationErrors = []; // 🔴 FIX: Auto-clear stale errors

      const record = state.exitRecords[action.payload.studentId];
      if (!record) return;

      const financeStatus = record.clearanceMatrix.find(
        (c) => c.department === "FINANCE",
      )?.status;
      if (!["CLEARED", "WAIVED"].includes(financeStatus || "")) {
        state.validationErrors.push({
          message: "Cannot issue documents. Finance lock is active.",
          severity: "error",
        });
        return;
      }

      const existingDocs = record.issuedDocuments.filter(
        (d) =>
          d.documentType === action.payload.documentType &&
          d.documentType !== "UPLOADED_PHYSICAL",
      );
      const version = existingDocs.length + 1;

      const newDoc: OutboundDocument = {
        id: crypto.randomUUID(),
        documentType: action.payload.documentType,
        documentName: action.payload.documentName, // 🔴 NEW: Custom Name
        serialNumber: `${action.payload.documentType.substring(0, 2)}-${new Date().getFullYear()}-${Math.floor(
          Math.random() * 10000,
        )
          .toString()
          .padStart(4, "0")}`,
        issuedAt: new Date().toISOString(),
        issuedBy: action.payload.adminId,
        version,
        isDuplicate: action.payload.isDuplicate,
        watermarkText: action.payload.isDuplicate
          ? `DUPLICATE COPY - REISSUED V${version}`
          : null,
        fileUrl: action.payload.fileUrl,
      };

      record.issuedDocuments.push(newDoc);
    },

    // 5. THE TRANSIENT EVENT: EXIT COMPLETED
    finalizeExit: (state, action: PayloadAction<{ studentId: string }>) => {
      state.validationErrors = []; // 🔴 FIX: Auto-clear stale errors

      const record = state.exitRecords[action.payload.studentId];
      if (!record || record.status !== "DOCUMENT_ISSUANCE_PENDING") return;

      const hasTC = record.issuedDocuments.some(
        (d) =>
          d.documentType === "TRANSFER_CERTIFICATE" ||
          d.documentName.toUpperCase().includes("TRANSFER CERTIFICATE"),
      );
      if (!hasTC) {
        state.validationErrors.push({
          message:
            "Transfer Certificate must be issued or uploaded before finalizing exit.",
          severity: "error",
        });
        return;
      }

      record.status = record.exitType === "GRADUATION" ? "ALUMNI" : "ARCHIVED";
    },
    beginClearance: (state, action: PayloadAction<string>) => {
      const record = state.exitRecords[action.payload];
      if (record && record.status === "EXIT_PENDING") {
        record.status = "CLEARANCE_PENDING";
      }
    },
  },
});

export const {
  clearExitErrors,
  initiateExit,
  updateClearance,
  completeFinanceSettlement,
  issueDocument,
  finalizeExit,
  beginClearance,
} = studentExitSlice.actions;

export default studentExitSlice.reducer;
