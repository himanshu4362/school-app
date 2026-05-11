import { createSlice, PayloadAction } from "@reduxjs/toolkit";

import {
  ClassExecutionSession,
  InterruptionReason,
  AttendanceStatus,
  TopicCoverage,
} from "../../types/execution/execution.schema";

export interface ExecutionState {
  sessions: Record<string, ClassExecutionSession>;
  activeDraftId: string | null;
  policies: {
    maxEditWindowHours: number;
    lateStartThresholdMinutes: number;
  };
}

export const initialState: ExecutionState = {
  sessions: {},
  activeDraftId: null,
  policies: {
    maxEditWindowHours: 24,
    lateStartThresholdMinutes: 15,
  },
};

export interface ClaimSessionPayload {
  session: ClassExecutionSession;
  deviceId: string;
  currentTime: string;
}

export interface UpdateDraftPayloadType {
  sessionId: string;
  attendance?: Record<string, AttendanceStatus>;
  syllabus?: TopicCoverage[];
  homework?: string;
  syllabusCoverage?: TopicCoverage[];
  homeworkAssigned?: string;
  resources?: string[];
}

export interface CommitSessionPayload {
  sessionId: string;
  commitTime: string;
}

export interface UnlockEditPayload {
  sessionId: string;
  currentTimeMs: number;
  deviceId: string;
}

export interface InterruptSessionPayload {
  sessionId: string;
  reason: InterruptionReason;
  time: string;
}

export const executionSlice = createSlice({
  name: "execution",
  initialState,
  reducers: {
    // 1. INITIATE DRAFT
    claimSession: (state, action: PayloadAction<ClaimSessionPayload>) => {
      const { session, deviceId, currentTime } = action.payload;

      if (
        session.activeDeviceSessionId &&
        session.activeDeviceSessionId !== deviceId &&
        session.status === "IN_PROGRESS"
      ) {
        console.error("Session locked by another device.");
        return;
      }

      state.sessions[session.id] = {
        ...session,
        status: "IN_PROGRESS",
        activeDeviceSessionId: deviceId,
        startedAt: session.startedAt || currentTime,
        syncStatus: "DRAFT",
      };

      state.activeDraftId = session.id;
    },

    // 2. UPDATE DRAFT
    updateDraftPayload: (
      state,
      action: PayloadAction<UpdateDraftPayloadType>,
    ) => {
      const { sessionId, attendance, syllabus, homework, resources } =
        action.payload;
      const session = state.sessions[sessionId];

      if (!session || session.status === "COMPLETED") return;

      if (attendance) session.attendanceSnapshot = attendance;
      if (syllabus) session.syllabusCoverage = syllabus;
      if (homework !== undefined) session.homeworkAssigned = homework;
      if (resources) session.resourcesUsed = resources;

      session.syncStatus = "DRAFT";
    },

    // 3. COMMIT SESSION
    commitSession: (state, action: PayloadAction<CommitSessionPayload>) => {
      const { sessionId, commitTime } = action.payload;
      const session = state.sessions[sessionId];

      if (!session) return;

      session.version += 1;
      session.status = "COMPLETED";
      session.completedAt = commitTime;
      session.activeDeviceSessionId = null;
      session.syncStatus = "PENDING_SYNC";

      if (state.activeDraftId === sessionId) {
        state.activeDraftId = null;
      }
    },

    // 4. THE EDIT WINDOW GUARD
    unlockForEdit: (state, action: PayloadAction<UnlockEditPayload>) => {
      const { sessionId, currentTimeMs, deviceId } = action.payload;
      const session = state.sessions[sessionId];

      if (!session || !session.completedAt) return;

      const completedAtMs = new Date(session.completedAt).getTime();
      const hoursSinceCompletion =
        (currentTimeMs - completedAtMs) / (1000 * 60 * 60);

      if (hoursSinceCompletion <= state.policies.maxEditWindowHours) {
        session.status = "IN_PROGRESS";
        session.activeDeviceSessionId = deviceId;
        session.syncStatus = "DRAFT";
        session.version += 1;
        state.activeDraftId = sessionId;
      } else {
        console.error("Edit window has expired.");
      }
    },

    // 5. EXCEPTIONAL STATES
    interruptSession: (
      state,
      action: PayloadAction<InterruptSessionPayload>,
    ) => {
      const { sessionId, reason, time } = action.payload;
      const session = state.sessions[sessionId];
      if (session) {
        session.status = "INTERRUPTED";
        session.interruptionReason = reason;
        session.completedAt = time;
        session.activeDeviceSessionId = null;
        session.version += 1;
        session.syncStatus = "PENDING_SYNC";
        if (state.activeDraftId === sessionId) state.activeDraftId = null;
      }
    },
  },
});

export const {
  claimSession,
  updateDraftPayload,
  commitSession,
  unlockForEdit,
  interruptSession,
} = executionSlice.actions;
export default executionSlice.reducer;
