import { z } from "zod";

export const SessionStateEnum = z.enum([
  "UPCOMING", "ACTIVE", "IN_PROGRESS", "COMPLETED", 
  "MISSED", "CANCELLED", "SUBSTITUTED", "INTERRUPTED"
]);

export const InterruptionReasonEnum = z.enum([
  "EMERGENCY", "DISCIPLINE", "TECHNICAL_FAILURE", 
  "SUBSTITUTE_CALLED", "PRINCIPAL_INTERVENTION", "NONE"
]);

export const CoverageStatusEnum = z.enum([
  "NOT_STARTED", "INTRODUCED", "PARTIALLY_COVERED", 
  "COMPLETED", "REVISED", "ASSESSED"
]);

export const AttendanceStatusEnum = z.enum(["PRESENT", "ABSENT", "LATE", "EXCUSED"]);
export const SyncStatusEnum = z.enum(["DRAFT", "PENDING_SYNC", "SYNCED", "CONFLICT"]);

export const TopicCoverageSchema = z.object({
  topicId: z.string(), 
  status: CoverageStatusEnum,
  notes: z.string().optional(),
});

export const ClassExecutionSessionSchema = z.object({
  id: z.string().uuid(),
  version: z.number().int().nonnegative().default(1),

  allocationId: z.string(),
  timetablePeriodId: z.string(),
  date: z.string(), 

  originalTeacherId: z.string(),
  substituteTeacherId: z.string().optional(),
  activeDeviceSessionId: z.string().nullable(), 

  subjectNameSnapshot: z.string(),
  classNameSnapshot: z.string(),
  sectionNameSnapshot: z.string(),
  periodNameSnapshot: z.string(),

  status: SessionStateEnum,
  interruptionReason: InterruptionReasonEnum.default("NONE"),

  attendanceSnapshot: z.record(z.string(), AttendanceStatusEnum), 
  syllabusCoverage: z.array(TopicCoverageSchema), 
  homeworkAssigned: z.string().optional(),
  
  resourcesUsed: z.array(z.string()).default([] as string[]),
  classRemarks: z.string().optional(),

  serverTimeReference: z.number().optional(), 
  startedAt: z.string().optional(), 
  completedAt: z.string().optional(), 
  lateStartFlag: z.boolean().default(false),
  
  escalationFlags: z.array(z.string()).default([] as string[]), 

  syncStatus: SyncStatusEnum.default("DRAFT"),
  lastSyncedAt: z.string().optional(),
});


export type ClassExecutionSession = z.infer<typeof ClassExecutionSessionSchema>;
export type TopicCoverage = z.infer<typeof TopicCoverageSchema>;
export type SessionState = z.infer<typeof SessionStateEnum>;
export type InterruptionReason = z.infer<typeof InterruptionReasonEnum>;
export type AttendanceStatus = z.infer<typeof AttendanceStatusEnum>;
export type CoverageStatus = z.infer<typeof CoverageStatusEnum>;
export type SyncStatus = z.infer<typeof SyncStatusEnum>;