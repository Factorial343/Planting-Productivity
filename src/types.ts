// Units: time in milliseconds (epoch ms for timestamps), distance in meters,
// acceleration in m/s^2.
export type Millis = number;

export type SessionMode = 'single' | 'goal';
export type SessionStatus = 'idle' | 'focusing' | 'paused' | 'ended';
export type SessionEndReason =
  | 'completed'          // planned time reached
  | 'user_ended'         // user pressed End
  | 'pickup_confirmed'   // user answered "done" after a pickup prompt
  | 'left_campus'
  | 'app_closed';

export type Orientation = 'face-up' | 'face-down' | 'other';
export type PlantStage = 1 | 2 | 3 | 4 | 5;
export type GoalPeriod = 'week' | 'month';

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface Campus extends Coordinates {
  id: number;
  name: string;
  radiusM: number;
}

export interface Goal {
  id: number;
  period: GoalPeriod;
  targetMinutes: number;
  startDate: string; // ISO date, e.g. "2026-11-09"
}

export interface Session {
  id: number;
  mode: SessionMode;
  startTime: Millis;
  endTime: Millis | null;
  plannedMs: Millis;
  focusedMs: Millis;
  pickupCount: number;
  campusId: number | null;
  endReason: SessionEndReason | null;
}
export type NewSession = Omit<Session, 'id'>;

// Live session state held in memory by the session reducer (Lane B).
export interface SessionState {
  status: SessionStatus;
  mode: SessionMode;
  startedAt: Millis | null;
  lastTickAt: Millis | null;
  plannedMs: Millis;
  focusedMs: Millis;
  pickupCount: number;
  campusId: number | null;
  pauseReason: 'pickup' | 'manual' | null;
}

// ---- Events passed between layers ----

// Lane A (sensing) produces these.
export type SensorEvent =
  | { type: 'ORIENTATION_CHANGED'; orientation: Orientation; at: Millis }
  | { type: 'PICKUP_DETECTED'; at: Millis };

// Lane B (location) produces these.
export type LocationEvent =
  | { type: 'ENTERED_CAMPUS'; campusId: number; at: Millis }
  | { type: 'LEFT_CAMPUS'; campusId: number; at: Millis };

// Input to the session reducer (Lane B).
export type SessionEvent =
  | { type: 'START'; at: Millis; mode: SessionMode; plannedMs: Millis; campusId: number | null }
  | { type: 'TICK'; at: Millis }
  | { type: 'PICKUP'; at: Millis }                 // from PICKUP_DETECTED while focusing
  | { type: 'PROMPT_ANSWERED'; at: Millis; answer: 'done' | 'keep_going' }
  | { type: 'PAUSE'; at: Millis }
  | { type: 'RESUME'; at: Millis }
  | { type: 'END'; at: Millis; reason: SessionEndReason };

// ---- Data layer contracts (Lane C implements, A and B call) ----
export interface SessionsRepo {
  insert(session: NewSession): Promise<Session>;
  listBetween(from: Millis, to: Millis): Promise<Session[]>;
  totalFocusedMs(from: Millis, to: Millis): Promise<Millis>;
}
export interface CampusesRepo {
  list(): Promise<Campus[]>;
  save(campus: Omit<Campus, 'id'>): Promise<Campus>;
  remove(id: number): Promise<void>;
}
export interface GoalsRepo {
  getActive(period: GoalPeriod): Promise<Goal | null>;
  set(goal: Omit<Goal, 'id'>): Promise<Goal>;
}

// ---- Hook contracts (names and return shapes; implemented in each lane) ----
export interface AccelerometerReading { x: number; y: number; z: number }
export interface GeofenceStatus {
  isInside: boolean;
  distanceM: number | null; // null until the first location fix
}
