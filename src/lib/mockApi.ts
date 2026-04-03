// Mock API service – returns snake_case JSON compatible with Django REST Framework

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

// ─── Student Dashboard ───
export interface StudentSession {
  id: string;
  tutor_name: string;
  subject: string;
  scheduled_at: string;
  status: "upcoming" | "pending" | "completed";
  duration_minutes: number;
}

export interface StudentNotification {
  id: string;
  message: string;
  created_at: string;
  is_read: boolean;
}

export interface StudentDashboardData {
  sessions: StudentSession[];
  notifications: StudentNotification[];
  total_sessions: number;
  upcoming_count: number;
}

export async function fetchStudentDashboard(): Promise<StudentDashboardData> {
  await delay(1200);
  return {
    total_sessions: 24,
    upcoming_count: 3,
    sessions: [
      { id: "s1", tutor_name: "María González", subject: "Matemáticas", scheduled_at: "2026-04-05T14:00:00Z", status: "upcoming", duration_minutes: 60 },
      { id: "s2", tutor_name: "Carlos López", subject: "Física", scheduled_at: "2026-04-06T16:00:00Z", status: "upcoming", duration_minutes: 45 },
      { id: "s3", tutor_name: "Ana Ramírez", subject: "Química", scheduled_at: "2026-04-04T10:00:00Z", status: "pending", duration_minutes: 60 },
      { id: "s4", tutor_name: "Pedro Sánchez", subject: "Historia", scheduled_at: "2026-03-28T11:00:00Z", status: "completed", duration_minutes: 90 },
      { id: "s5", tutor_name: "Laura Díaz", subject: "Inglés", scheduled_at: "2026-03-25T09:00:00Z", status: "completed", duration_minutes: 60 },
    ],
    notifications: [
      { id: "n1", message: "Tu sesión de Matemáticas ha sido confirmada para el 5 de abril.", created_at: "2026-04-03T08:00:00Z", is_read: false },
      { id: "n2", message: "Carlos López aceptó tu solicitud de clase de Física.", created_at: "2026-04-02T17:30:00Z", is_read: false },
      { id: "n3", message: "Recuerda dejar una reseña de tu sesión con Pedro Sánchez.", created_at: "2026-04-01T12:00:00Z", is_read: true },
      { id: "n4", message: "Tu pago de $25.00 USD fue procesado exitosamente.", created_at: "2026-03-30T10:00:00Z", is_read: true },
    ],
  };
}

// ─── Tutor Dashboard ───
export interface TutorStats {
  monthly_revenue: number;
  average_rating: number;
  total_sessions: number;
  pending_requests: number;
}

export interface TutorRequest {
  id: string;
  student_name: string;
  subject: string;
  requested_at: string;
  proposed_time: string;
  duration_minutes: number;
  student_country: string;
}

export interface TutorDashboardData {
  stats: TutorStats;
  pending_requests: TutorRequest[];
  profile_complete: boolean;
}

export async function fetchTutorDashboard(): Promise<TutorDashboardData> {
  await delay(1200);
  return {
    stats: {
      monthly_revenue: 1250.0,
      average_rating: 4.8,
      total_sessions: 87,
      pending_requests: 4,
    },
    pending_requests: [
      { id: "r1", student_name: "Juan Pérez", subject: "Cálculo", requested_at: "2026-04-03T09:00:00Z", proposed_time: "2026-04-07T15:00:00Z", duration_minutes: 60, student_country: "México" },
      { id: "r2", student_name: "Sofía Martínez", subject: "Programación", requested_at: "2026-04-02T14:00:00Z", proposed_time: "2026-04-08T10:00:00Z", duration_minutes: 90, student_country: "Colombia" },
      { id: "r3", student_name: "Diego Torres", subject: "Estadística", requested_at: "2026-04-02T08:30:00Z", proposed_time: "2026-04-06T13:00:00Z", duration_minutes: 60, student_country: "Argentina" },
      { id: "r4", student_name: "Valentina Ruiz", subject: "Matemáticas", requested_at: "2026-04-01T16:00:00Z", proposed_time: "2026-04-09T11:00:00Z", duration_minutes: 45, student_country: "Chile" },
    ],
    profile_complete: false,
  };
}

export async function respondToRequest(request_id: string, action: "accept" | "reject"): Promise<{ success: boolean }> {
  await delay(800);
  console.log(`API: ${action} request ${request_id}`);
  return { success: true };
}
