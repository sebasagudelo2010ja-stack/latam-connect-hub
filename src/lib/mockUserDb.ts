// Mock user database — persists registered users in localStorage
import type { ProfileData, UserType } from "@/stores/authStore";

const STORAGE_KEY = "subject-support-users";

export interface StoredUser {
  email: string;
  password: string;
  profile: ProfileData;
}

function getUsers(): StoredUser[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveUsers(users: StoredUser[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
}

export function registerUser(
  email: string,
  password: string,
  profile: ProfileData
): { success: boolean; error?: string } {
  const users = getUsers();
  if (users.some((u) => u.email === email)) {
    return { success: false, error: "Ya existe una cuenta con este email." };
  }
  users.push({ email, password, profile });
  saveUsers(users);
  return { success: true };
}

export function loginUser(
  email: string,
  password: string,
  expectedRole?: UserType
): { success: boolean; profile?: ProfileData; error?: string } {
  const users = getUsers();
  const user = users.find((u) => u.email === email);

  if (!user) {
    return { success: false, error: "No existe una cuenta con este email." };
  }
  if (user.password !== password) {
    return { success: false, error: "Contraseña incorrecta." };
  }
  if (expectedRole && user.profile.user_type !== expectedRole) {
    const roleLabel = expectedRole === "client" ? "estudiante" : "tutor";
    return {
      success: false,
      error: `Esta cuenta no está registrada como ${roleLabel}.`,
    };
  }
  return { success: true, profile: user.profile };
}
