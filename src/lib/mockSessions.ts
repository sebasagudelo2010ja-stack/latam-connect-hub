// Mock sessions service – snake_case for Django compatibility

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

export type SessionStatus = "pending" | "confirmed" | "cancelled" | "completed";
export type Platform = "google_meet" | "zoom" | "custom";

export interface Session {
  id: string;
  tutor_id: string;
  student_id: string;
  tutor_name: string;
  student_name: string;
  subject: string;
  start_time: string; // ISO
  duration_minutes: number;
  platform: Platform;
  meeting_link: string | null;
  hourly_rate: number;
  total_price: number;
  status: SessionStatus;
  cancel_reason: string | null;
  created_at: string;
}

// Simulated existing confirmed sessions for overlap detection
const EXISTING_SESSIONS: Session[] = [
  {
    id: "es1",
    tutor_id: "t1",
    student_id: "s99",
    tutor_name: "María González",
    student_name: "Otro Estudiante",
    subject: "Matemáticas",
    start_time: "2026-04-07T14:00:00Z",
    duration_minutes: 60,
    platform: "google_meet",
    meeting_link: "https://meet.google.com/abc-defg-hij",
    hourly_rate: 25,
    total_price: 25,
    status: "confirmed",
    cancel_reason: null,
    created_at: "2026-04-01T10:00:00Z",
  },
  {
    id: "es2",
    tutor_id: "t6",
    student_id: "s99",
    tutor_name: "Diego Torres",
    student_name: "Otro Estudiante",
    subject: "Programación",
    start_time: "2026-04-08T10:00:00Z",
    duration_minutes: 90,
    platform: "zoom",
    meeting_link: "https://zoom.us/j/123456",
    hourly_rate: 35,
    total_price: 52.5,
    status: "confirmed",
    cancel_reason: null,
    created_at: "2026-04-02T09:00:00Z",
  },
];

let sessions: Session[] = [...EXISTING_SESSIONS];

export async function createSession(data: {
  tutor_id: string;
  student_id: string;
  tutor_name: string;
  student_name: string;
  subject: string;
  start_time: string;
  duration_minutes: number;
  platform: Platform;
  hourly_rate: number;
}): Promise<Session> {
  await delay(800);
  const total_price = (data.hourly_rate * data.duration_minutes) / 60;
  const session: Session = {
    id: `session-${Date.now()}`,
    ...data,
    meeting_link: data.platform === "google_meet" ? "https://meet.google.com/auto-generated" : null,
    total_price,
    status: "pending",
    cancel_reason: null,
    created_at: new Date().toISOString(),
  };
  sessions.push(session);
  return session;
}

export async function getSession(id: string): Promise<Session | null> {
  await delay(500);
  return sessions.find((s) => s.id === id) ?? null;
}

export async function getTutorSessions(tutor_id: string): Promise<Session[]> {
  await delay(500);
  return sessions.filter((s) => s.tutor_id === tutor_id);
}

export async function confirmSession(id: string, meeting_link: string | null): Promise<Session> {
  await delay(600);
  const idx = sessions.findIndex((s) => s.id === id);
  if (idx === -1) throw new Error("Session not found");
  sessions[idx] = { ...sessions[idx], status: "confirmed", meeting_link };
  return sessions[idx];
}

export async function cancelSession(id: string, cancel_reason: string): Promise<Session> {
  await delay(600);
  const idx = sessions.findIndex((s) => s.id === id);
  if (idx === -1) throw new Error("Session not found");
  sessions[idx] = { ...sessions[idx], status: "cancelled", cancel_reason };
  return sessions[idx];
}

export function checkOverlap(
  tutor_id: string,
  start_time: string,
  duration_minutes: number,
  exclude_session_id?: string
): Session | null {
  const newStart = new Date(start_time).getTime();
  const newEnd = newStart + duration_minutes * 60_000;

  for (const s of sessions) {
    if (s.tutor_id !== tutor_id) continue;
    if (s.status !== "confirmed" && s.status !== "pending") continue;
    if (exclude_session_id && s.id === exclude_session_id) continue;

    const existStart = new Date(s.start_time).getTime();
    const existEnd = existStart + s.duration_minutes * 60_000;

    if (newStart < existEnd && newEnd > existStart) return s;
  }
  return null;
}

export const CANCEL_REASONS = [
  "Conflicto de horario",
  "Emergencia personal",
  "El estudiante lo solicitó",
  "Problemas técnicos",
  "Otro motivo",
];
