import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  MasterTitle,
  PhysicalCopy,
  BorrowerProfile,
  LibraryTransaction,
  ReservationItem,
} from "../../types/library/library.schema";

interface LibraryState {
  titles: Record<string, MasterTitle>;
  copies: Record<string, PhysicalCopy>;
  borrowers: Record<string, BorrowerProfile>;
  transactions: LibraryTransaction[];
  reservations: ReservationItem[];
  validationErrors: { message: string; severity: "error" }[];
}

const initialState: LibraryState = {
  titles: {},
  copies: {},
  borrowers: {},
  transactions: [],
  reservations: [],
  validationErrors: [],
};

export const librarySlice = createSlice({
  name: "library",
  initialState,
  reducers: {
    clearLibraryErrors: (state) => {
      state.validationErrors = [];
    },

    // ==========================================
    // CATALOG & PROCUREMENT INVENTORY
    // ==========================================
    addMasterTitle: (state, action: PayloadAction<MasterTitle>) => {
      state.titles[action.payload.id] = action.payload;
    },

    addPhysicalCopies: (state, action: PayloadAction<PhysicalCopy[]>) => {
      action.payload.forEach((copy) => {
        state.copies[copy.id] = copy;
      });
    },

    // ==========================================
    // OPAC & FIFO RESERVATION ENGINE
    // ==========================================
    reserveTitle: (
      state,
      action: PayloadAction<{ titleId: string; borrowerId: string }>,
    ) => {
      const { titleId, borrowerId } = action.payload;
      const borrower = state.borrowers[borrowerId];

      if (!borrower || borrower.status !== "ACTIVE") {
        state.validationErrors.push({
          message: "Borrower is suspended or inactive.",
          severity: "error",
        });
        return;
      }

      state.reservations.push({
        id: crypto.randomUUID(),
        titleId,
        borrowerId,
        requestedAt: new Date().toISOString(),
        assignedCopyId: null,
        expiresAt: null,
      });
    },

    // ==========================================
    // CIRCULATION DESK (State Machine)
    // ==========================================
    issueCopy: (
      state,
      action: PayloadAction<{
        copyId: string;
        borrowerId: string;
        operatorId: string;
      }>,
    ) => {
      const { copyId, borrowerId, operatorId } = action.payload;
      const copy = state.copies[copyId];
      const borrower = state.borrowers[borrowerId];

      // 🛑 GUARDRAILS: Strict State & Identity Checks
      if (!copy) return;
      if (!borrower || borrower.status !== "ACTIVE") {
        state.validationErrors.push({
          message: "Transaction Blocked: Borrower account is restricted.",
          severity: "error",
        });
        return;
      }

      // If reserved, ensure it's reserved by THIS specific borrower
      if (copy.status === "RESERVED") {
        const activeRes = state.reservations.find(
          (r) => r.assignedCopyId === copyId && r.borrowerId === borrowerId,
        );
        if (!activeRes) {
          state.validationErrors.push({
            message: "Transaction Blocked: Copy is reserved by another user.",
            severity: "error",
          });
          return;
        }
        // Remove from queue since it's being issued
        state.reservations = state.reservations.filter(
          (r) => r.id !== activeRes.id,
        );
      } else if (copy.status !== "AVAILABLE") {
        state.validationErrors.push({
          message: `Transaction Blocked: Copy is currently ${copy.status}.`,
          severity: "error",
        });
        return;
      }

      // Calculate Snapshots
      const now = new Date();
      const dueDate = new Date(
        now.setDate(now.getDate() + borrower.maxDaysAllowed),
      );

      // Execute State Transition
      copy.status = "ISSUED";

      // Log Immutable Ledger Entry
      state.transactions.push({
        id: crypto.randomUUID(),
        copyId,
        borrowerId,
        type: "ISSUE",
        timestamp: new Date().toISOString(),
        dueDateSnapshot: dueDate.toISOString(),
        finePolicySnapshot: borrower.finePerDay,
        operatorId,
      });
    },

    returnCopy: (
      state,
      action: PayloadAction<{
        copyId: string;
        borrowerId: string;
        operatorId: string;
        condition: "GOOD" | "DAMAGED";
      }>,
    ) => {
      const { copyId, borrowerId, operatorId, condition } = action.payload;
      const copy = state.copies[copyId];

      if (!copy || copy.status !== "ISSUED") {
        state.validationErrors.push({
          message: "Transaction Blocked: Copy is not currently issued.",
          severity: "error",
        });
        return;
      }

      copy.condition = condition;

      // 🔴 FIFO QUEUE AUTO-ADVANCEMENT
      const pendingReservations = state.reservations
        .filter((r) => r.titleId === copy.titleId && !r.assignedCopyId)
        .sort(
          (a, b) =>
            new Date(a.requestedAt).getTime() -
            new Date(b.requestedAt).getTime(),
        );

      if (pendingReservations.length > 0 && condition !== "DAMAGED") {
        // Assign to the next person in line
        const nextInLine = pendingReservations[0];
        nextInLine.assignedCopyId = copyId;

        // Expiry Engine: They have 48 hours to pick it up
        const expiry = new Date();
        expiry.setHours(expiry.getHours() + 48);
        nextInLine.expiresAt = expiry.toISOString();

        copy.status = "RESERVED";
      } else {
        copy.status = "AVAILABLE";
      }

      // Log Immutable Ledger Entry
      state.transactions.push({
        id: crypto.randomUUID(),
        copyId,
        borrowerId,
        type: "RETURN",
        timestamp: new Date().toISOString(),
        dueDateSnapshot: null,
        finePolicySnapshot: null,
        operatorId,
        remarks:
          condition === "DAMAGED"
            ? "Returned in damaged condition."
            : undefined,
      });
    },

    declareLost: (
      state,
      action: PayloadAction<{
        copyId: string;
        borrowerId: string;
        operatorId: string;
      }>,
    ) => {
      const { copyId, borrowerId, operatorId } = action.payload;
      const copy = state.copies[copyId];

      if (copy) {
        copy.status = "LOST"; // Terminal State Transition

        state.transactions.push({
          id: crypto.randomUUID(),
          copyId,
          borrowerId,
          type: "LOST_DECLARED",
          timestamp: new Date().toISOString(),
          dueDateSnapshot: null,
          finePolicySnapshot: null,
          operatorId,
        });
      }
    },
    // ==========================================
    // BORROWER IDENTITY
    // ==========================================
    registerBorrower: (state, action: PayloadAction<BorrowerProfile>) => {
      state.borrowers[action.payload.id] = action.payload;
    },
  },
});

export const {
  clearLibraryErrors,
  addMasterTitle,
  addPhysicalCopies,
  reserveTitle,
  registerBorrower,
  issueCopy,
  returnCopy,
  declareLost,
} = librarySlice.actions;
export default librarySlice.reducer;
