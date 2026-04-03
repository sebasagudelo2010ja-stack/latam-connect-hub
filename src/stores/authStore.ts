import { create } from "zustand";
import { persist } from "zustand/middleware";

export type UserType = "client" | "tutor" | null;

export interface ProfileData {
  id: string;
  email: string;
  full_name: string;
  country?: string;
  user_type: UserType;
  // Student-specific
  is_minor?: boolean;
  guardian_name?: string;
  guardian_email?: string;
  // Tutor-specific
  subjects?: string[];
  hourly_rate?: number;
  rating?: number;
  total_sessions?: number;
}

interface AuthState {
  user_type: UserType;
  auth_token: string | null;
  profile_data: ProfileData | null;
  is_authenticated: boolean;

  login: (token: string, profile: ProfileData) => void;
  logout: () => void;
  updateProfile: (data: Partial<ProfileData>) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user_type: null,
      auth_token: null,
      profile_data: null,
      is_authenticated: false,

      login: (token, profile) =>
        set({
          auth_token: token,
          profile_data: profile,
          user_type: profile.user_type,
          is_authenticated: true,
        }),

      logout: () =>
        set({
          auth_token: null,
          profile_data: null,
          user_type: null,
          is_authenticated: false,
        }),

      updateProfile: (data) =>
        set((state) => ({
          profile_data: state.profile_data
            ? { ...state.profile_data, ...data }
            : null,
        })),
    }),
    { name: "subject-support-auth" }
  )
);
