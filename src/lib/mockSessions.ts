// Mock sessions service – snake_case for Django compatibility

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

export type SessionStatus = "pending" | "negotiating" | "confirmed" | "cancelled" | "completed";
export type NegotiationStatus = "pending" | "counter_offered" | "accepted" | "rejected";
export type Platform = "google_meet" | "zoom" | "custom";

export interface NegotiationEntry {
  id: string;
  sender: "student" | "tutor";
  sender_name: string;
  amount: number;
  message: string;
  created_at: string;
  type: "offer" | "counter_offer" | "accept" | "reject";
}

export interface Session {
  id: string;
  tutor_id: string;
  student_id: string;
  tutor_name: string;
  student_name: string;
  subject: string;
  start_time: string;
  duration_minutes: number;
  platform: Platform;
  meeting_link: string | null;
  hourly_rate: number;
  proposed_price: number;
  final_price: number | null;
  total_price: number;
  status: SessionStatus;
  negotiation_status: NegotiationStatus;
  negotiation_history: NegotiationEntry[];
  cancel_reason: string | null;
  created_at: string;
}

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
    proposed_price: 25,
    final_price: 25,
    total_price: 25,
    status: "confirmed",
    negotiation_status: "accepted",
    negotiation_history: [],
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
    proposed_price: 30,
    final_price: 32,
    total_price: 48,
    status: "confirmed",
    negotiation_status: "accepted",
    negotiation_history: [
      { id: "nh1", sender: "student", sender_name: "Otro Estudiante", amount: 30, message: "¿Podría ser a $30/h?", created_at: "2026-04-02T09:00:00Z", type: "offer" },
      { id: "nh2", sender: "tutor", sender_name: "Diego Torres", amount: 32, message: "Puedo hacerlo por $32/h", created_at: "2026-04-02T09:15:00Z", type: "counter_offer" },
      { id: "nh3", sender: "student", sender_name: "Otro Estudiante", amount: 32, message: "¡Perfecto, acepto!", created_at: "2026-04-02T09:20:00Z", type: "accept" },
    ],
    cancel_reason: null,
    created_at: "2026-04-02T09:00:00Z",
  },
  // A session in negotiation for demo
  {
    id: "neg1",
    tutor_id: "t10",
    student_id: "demo-student",
    tutor_name: "Miguel Ángel Castro",
    student_name: "Demo Estudiante",
    subject: "Cálculo",
    start_time: "2026-04-10T15:00:00Z",
    duration_minutes: 90,
    platform: "google_meet",
    meeting_link: null,
    hourly_rate: 40,
    proposed_price: 30,
    final_price: null,
    total_price: 45,
    status: "negotiating",
    negotiation_status: "counter_offered",
    negotiation_history: [
      { id: "neg1-1", sender: "student", sender_name: "Demo Estudiante", amount: 30, message: "Mi presupuesto es de $30/h, ¿es posible?", created_at: "2026-04-03T10:00:00Z", type: "offer" },
      { id: "neg1-2", sender: "tutor", sender_name: "Miguel Ángel Castro", amount: 35, message: "Puedo ofrecer $35/h por la duración que necesitas.", created_at: "2026-04-03T10:30:00Z", type: "counter_offer" },
    ],
    cancel_reason: null,
    created_at: "2026-04-03T10:00:00Z",
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
  proposed_price: number;
}): Promise<Session> {
  await delay(800);
  const isExactRate = data.proposed_price === data.hourly_rate;
  const total_price = (data.proposed_price * data.duration_minutes) / 60;
  const session: Session = {
    id: `session-${Date.now()}`,
    ...data,
    meeting_link: data.platform === "google_meet" ? "https://meet.google.com/auto-generated" : null,
    final_price: isExactRate ? data.hourly_rate : null,
    total_price,
    status: isExactRate ? "pending" : "negotiating",
    negotiation_status: isExactRate ? "accepted" : "pending",
    negotiation_history: [
      {
        id: `nh-${Date.now()}`,
        sender: "student",
        sender_name: data.student_name,
        amount: data.proposed_price,
        message: isExactRate
          ? `Acepto la tarifa de $${data.hourly_rate}/h.`
          : `Mi oferta es de $${data.proposed_price}/h.`,
        created_at: new Date().toISOString(),
        type: "offer",
      },
    ],
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

export interface SessionFeedback {
  session_id: string;
  rating: number;
  comment: string;
  submitted_at: string;
}

const feedbacks: SessionFeedback[] = [];

export async function completeSession(
  id: string,
  rating: number,
  comment: string
): Promise<{ session: Session; feedback: SessionFeedback }> {
  await delay(600);
  const idx = sessions.findIndex((s) => s.id === id);
  if (idx === -1) throw new Error("Session not found");
  sessions[idx] = { ...sessions[idx], status: "completed" };

  const feedback: SessionFeedback = {
    session_id: id,
    rating,
    comment,
    submitted_at: new Date().toISOString(),
  };
  feedbacks.push(feedback);
  return { session: sessions[idx], feedback };
}

export async function reportSessionIssue(
  session_id: string,
  issue: string
): Promise<{ success: boolean }> {
  await delay(400);
  console.log("[Mock API] Issue reported for session", session_id, ":", issue);
  return { success: true };
}

export async function cancelSession(id: string, cancel_reason: string): Promise<Session> {
  await delay(600);
  const idx = sessions.findIndex((s) => s.id === id);
  if (idx === -1) throw new Error("Session not found");
  sessions[idx] = { ...sessions[idx], status: "cancelled", cancel_reason, negotiation_status: "rejected" };
  return sessions[idx];
}

// ─── Negotiation API ───

export async function sendCounterOffer(
  session_id: string,
  sender: "student" | "tutor",
  sender_name: string,
  amount: number,
  message: string
): Promise<Session> {
  await delay(600);
  const idx = sessions.findIndex((s) => s.id === session_id);
  if (idx === -1) throw new Error("Session not found");

  const entry: NegotiationEntry = {
    id: `nh-${Date.now()}`,
    sender,
    sender_name,
    amount,
    message,
    created_at: new Date().toISOString(),
    type: "counter_offer",
  };

  sessions[idx] = {
    ...sessions[idx],
    proposed_price: amount,
    negotiation_status: "counter_offered",
    status: "negotiating",
    negotiation_history: [...sessions[idx].negotiation_history, entry],
  };
  return sessions[idx];
}

export async function acceptOffer(
  session_id: string,
  sender: "student" | "tutor",
  sender_name: string
): Promise<Session> {
  await delay(600);
  const idx = sessions.findIndex((s) => s.id === session_id);
  if (idx === -1) throw new Error("Session not found");

  const currentPrice = sessions[idx].proposed_price;
  const entry: NegotiationEntry = {
    id: `nh-${Date.now()}`,
    sender,
    sender_name,
    amount: currentPrice,
    message: `¡Trato hecho a $${currentPrice}/h!`,
    created_at: new Date().toISOString(),
    type: "accept",
  };

  const total_price = (currentPrice * sessions[idx].duration_minutes) / 60;

  sessions[idx] = {
    ...sessions[idx],
    final_price: currentPrice,
    total_price,
    negotiation_status: "accepted",
    status: "pending", // moves to pending for confirmation
    negotiation_history: [...sessions[idx].negotiation_history, entry],
  };
  return sessions[idx];
}

export async function rejectOffer(
  session_id: string,
  sender: "student" | "tutor",
  sender_name: string,
  message: string
): Promise<Session> {
  await delay(600);
  const idx = sessions.findIndex((s) => s.id === session_id);
  if (idx === -1) throw new Error("Session not found");

  const entry: NegotiationEntry = {
    id: `nh-${Date.now()}`,
    sender,
    sender_name,
    amount: sessions[idx].proposed_price,
    message,
    created_at: new Date().toISOString(),
    type: "reject",
  };

  sessions[idx] = {
    ...sessions[idx],
    negotiation_status: "rejected",
    status: "cancelled",
    negotiation_history: [...sessions[idx].negotiation_history, entry],
  };
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
