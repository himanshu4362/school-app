import { createSelector } from "@reduxjs/toolkit";
import { RootState } from "../store";

// Inputs
const selectSections = (state: RootState) => state.systemConfig.sections;
const selectPolicies = (state: RootState) => state.seats.policies;
const selectPolicyIndex = (state: RootState) => state.seats.policyByGradeYear;
const selectReservations = (state: RootState) => state.seats.reservations;
const selectReservationIndex = (state: RootState) =>
  state.seats.reservationsByGradeYear;

export const selectLiveGradeInventory = (
  gradeId: string,
  academicYearId: string,
) =>
  createSelector(
    [
      selectSections,
      selectPolicies,
      selectPolicyIndex,
      selectReservations,
      selectReservationIndex,
    ],
    (sections, policies, policyIndex, reservations, resIndex) => {
      // 1. CALCULATE PHYSICAL CAPACITY (Fix 1: Dynamic Derivation)
      // Only count 'active' or 'draft' sections (not 'closed' or 'archived')
      const activeSections = Object.values(sections).filter(
        (s) =>
          s.gradeId === gradeId &&
          s.academicYearId === academicYearId &&
          (s.status === "ACTIVE" || !s.status),
      );
      const totalPhysicalCapacity = activeSections.reduce(
        (sum, sec) => sum + sec.targetCapacity,
        0,
      );

      // 2. GET LIVE ESCROW TRANSACTIONS
      const resIds = resIndex[`${gradeId}_${academicYearId}`] || [];
      let currentlyReserved = 0;
      let currentlyConsumed = 0;
      const waitlistedCount = 0;

      resIds.forEach((id) => {
        const res = reservations[id];
        // Ghost Reservation Check: If expired, don't count it against capacity
        if (res.state === "locked" && new Date(res.expiresAt!) > new Date())
          currentlyReserved++;
        if (res.state === "consumed") currentlyConsumed++;
      });

      const availableGeneralSeats =
        totalPhysicalCapacity - (currentlyReserved + currentlyConsumed);

      // 3. GET QUOTA POLICY (If one exists for this grade)
      const policyId = policyIndex[`${gradeId}_${academicYearId}`];
      const policy = policyId ? policies[policyId] : null;

      // Optional: We can map consumption directly to quotas here later.
      // For V1, we just return the global aggregates.

      return {
        totalPhysicalCapacity,
        activeSectionCount: activeSections.length,

        // The Live Ledger
        currentlyConsumed,
        currentlyReserved, // Soft-Locked
        waitlistedCount,

        // The Golden Number for Admissions
        availableGeneralSeats,

        hasPolicyAttached: !!policy,
        policyDetails: policy,
      };
    },
  );
