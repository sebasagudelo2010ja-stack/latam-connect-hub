import { z } from "zod";

const passwordSchema = z
  .string()
  .min(8, "La contraseña debe tener al menos 8 caracteres")
  .regex(/\d/, "La contraseña debe contener al menos 1 número");

export const studentSchema = z
  .object({
    email: z.string().trim().email("Ingresa un email válido").max(255, "Máximo 255 caracteres"),
    full_name: z.string().trim().min(1, "El nombre es obligatorio").max(100, "Máximo 100 caracteres"),
    password: passwordSchema,
    confirm_password: z.string().min(1, "Confirma tu contraseña"),
    is_minor: z.boolean().default(false),
    guardian_name: z.string().max(100, "Máximo 100 caracteres").optional(),
    guardian_email: z.string().email("Ingresa un email válido").max(255).optional().or(z.literal("")),
    country: z.string().min(1, "Selecciona un país"),
  })
  .refine((d) => d.password === d.confirm_password, {
    message: "Las contraseñas no coinciden",
    path: ["confirm_password"],
  })
  .refine((d) => !d.is_minor || (d.guardian_name && d.guardian_name.trim().length > 0), {
    message: "El nombre del tutor legal es obligatorio",
    path: ["guardian_name"],
  })
  .refine((d) => !d.is_minor || (d.guardian_email && d.guardian_email.trim().length > 0), {
    message: "El email del tutor legal es obligatorio",
    path: ["guardian_email"],
  });

export type StudentFormData = z.infer<typeof studentSchema>;

export const tutorSchema = z.object({
  email: z.string().trim().email("Ingresa un email válido").max(255, "Máximo 255 caracteres"),
  full_name: z.string().trim().min(1, "El nombre es obligatorio").max(100, "Máximo 100 caracteres"),
  password: passwordSchema,
  subjects: z
    .array(z.string())
    .min(1, "Selecciona al menos 1 materia")
    .max(5, "Máximo 5 materias"),
  hourly_rate: z
    .string()
    .min(1, "La tarifa es obligatoria")
    .refine((v) => /^\d+(\.\d{1,2})?$/.test(v), "Ingresa un monto válido (máx. 2 decimales)")
    .refine((v) => parseFloat(v) > 0, "La tarifa debe ser mayor a 0"),
});

export type TutorFormData = z.infer<typeof tutorSchema>;
