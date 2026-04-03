import type { ProfileData } from "@/stores/authStore";

export interface Tutor {
  id: string;
  full_name: string;
  photo_url: string;
  subjects: string[];
  hourly_rate: number;
  country: string;
  country_code: string;
  rating_avg: number;
  total_reviews: number;
  bio: string;
}

const PHOTOS = [
  "https://api.dicebear.com/9.x/avataaars/svg?seed=Maria",
  "https://api.dicebear.com/9.x/avataaars/svg?seed=Carlos",
  "https://api.dicebear.com/9.x/avataaars/svg?seed=Ana",
  "https://api.dicebear.com/9.x/avataaars/svg?seed=Pedro",
  "https://api.dicebear.com/9.x/avataaars/svg?seed=Laura",
  "https://api.dicebear.com/9.x/avataaars/svg?seed=Diego",
  "https://api.dicebear.com/9.x/avataaars/svg?seed=Sofia",
  "https://api.dicebear.com/9.x/avataaars/svg?seed=Andres",
  "https://api.dicebear.com/9.x/avataaars/svg?seed=Valentina",
  "https://api.dicebear.com/9.x/avataaars/svg?seed=Miguel",
  "https://api.dicebear.com/9.x/avataaars/svg?seed=Camila",
  "https://api.dicebear.com/9.x/avataaars/svg?seed=Fernando",
  "https://api.dicebear.com/9.x/avataaars/svg?seed=Isabella",
  "https://api.dicebear.com/9.x/avataaars/svg?seed=Roberto",
  "https://api.dicebear.com/9.x/avataaars/svg?seed=Lucia",
  "https://api.dicebear.com/9.x/avataaars/svg?seed=Gabriel",
];

export const MOCK_TUTORS: Tutor[] = [
  { id: "t1", full_name: "María González", photo_url: PHOTOS[0], subjects: ["Matemáticas", "Cálculo"], hourly_rate: 25, country: "México", country_code: "mx", rating_avg: 4.9, total_reviews: 142, bio: "Ingeniera con 10 años de experiencia en educación matemática." },
  { id: "t2", full_name: "Carlos López", photo_url: PHOTOS[1], subjects: ["Física", "Matemáticas"], hourly_rate: 30, country: "Colombia", country_code: "co", rating_avg: 4.8, total_reviews: 98, bio: "Físico de la Universidad Nacional, apasionado por la enseñanza." },
  { id: "t3", full_name: "Ana Ramírez", photo_url: PHOTOS[2], subjects: ["Química", "Biología"], hourly_rate: 22, country: "Argentina", country_code: "ar", rating_avg: 4.7, total_reviews: 76, bio: "Doctora en Bioquímica con experiencia en preparación universitaria." },
  { id: "t4", full_name: "Pedro Sánchez", photo_url: PHOTOS[3], subjects: ["Historia", "Filosofía"], hourly_rate: 18, country: "Chile", country_code: "cl", rating_avg: 4.6, total_reviews: 54, bio: "Historiador y profesor universitario con enfoque en LATAM." },
  { id: "t5", full_name: "Laura Díaz", photo_url: PHOTOS[4], subjects: ["Inglés", "Francés"], hourly_rate: 28, country: "Perú", country_code: "pe", rating_avg: 4.9, total_reviews: 210, bio: "Políglota certificada TOEFL y DALF con 8 años de experiencia." },
  { id: "t6", full_name: "Diego Torres", photo_url: PHOTOS[5], subjects: ["Programación", "Matemáticas"], hourly_rate: 35, country: "México", country_code: "mx", rating_avg: 4.8, total_reviews: 167, bio: "Ingeniero de software senior, especialista en Python y JavaScript." },
  { id: "t7", full_name: "Sofía Martínez", photo_url: PHOTOS[6], subjects: ["Economía", "Estadística"], hourly_rate: 27, country: "Colombia", country_code: "co", rating_avg: 4.7, total_reviews: 89, bio: "Economista con maestría en análisis cuantitativo." },
  { id: "t8", full_name: "Andrés Herrera", photo_url: PHOTOS[7], subjects: ["Derecho", "Historia"], hourly_rate: 32, country: "Ecuador", country_code: "ec", rating_avg: 4.5, total_reviews: 43, bio: "Abogado especialista en derecho constitucional latinoamericano." },
  { id: "t9", full_name: "Valentina Ruiz", photo_url: PHOTOS[8], subjects: ["Arte", "Historia"], hourly_rate: 20, country: "Venezuela", country_code: "ve", rating_avg: 4.8, total_reviews: 65, bio: "Artista plástica y profesora de historia del arte." },
  { id: "t10", full_name: "Miguel Ángel Castro", photo_url: PHOTOS[9], subjects: ["Cálculo", "Estadística", "Física"], hourly_rate: 40, country: "Brasil", country_code: "br", rating_avg: 5.0, total_reviews: 312, bio: "Doctor en Matemáticas Aplicadas, tutor top de la plataforma." },
  { id: "t11", full_name: "Camila Fernández", photo_url: PHOTOS[10], subjects: ["Psicología", "Filosofía"], hourly_rate: 24, country: "Uruguay", country_code: "uy", rating_avg: 4.6, total_reviews: 37, bio: "Psicóloga clínica con pasión por la filosofía contemporánea." },
  { id: "t12", full_name: "Fernando Rojas", photo_url: PHOTOS[11], subjects: ["Contabilidad", "Economía"], hourly_rate: 26, country: "Panamá", country_code: "pa", rating_avg: 4.4, total_reviews: 28, bio: "Contador público autorizado con experiencia en finanzas corporativas." },
  { id: "t13", full_name: "Isabella Moreno", photo_url: PHOTOS[12], subjects: ["Biología", "Química"], hourly_rate: 23, country: "Costa Rica", country_code: "cr", rating_avg: 4.9, total_reviews: 104, bio: "Bióloga marina con experiencia en laboratorio y campo." },
  { id: "t14", full_name: "Roberto Vargas", photo_url: PHOTOS[13], subjects: ["Programación", "Estadística"], hourly_rate: 38, country: "Argentina", country_code: "ar", rating_avg: 4.7, total_reviews: 156, bio: "Data scientist con experiencia en empresas tech de Silicon Valley." },
  { id: "t15", full_name: "Lucía Mendoza", photo_url: PHOTOS[14], subjects: ["Música", "Arte"], hourly_rate: 15, country: "Guatemala", country_code: "gt", rating_avg: 4.8, total_reviews: 71, bio: "Compositora y profesora del Conservatorio Nacional." },
  { id: "t16", full_name: "Gabriel Peña", photo_url: PHOTOS[15], subjects: ["Inglés", "Portugués"], hourly_rate: 22, country: "Paraguay", country_code: "py", rating_avg: 4.5, total_reviews: 49, bio: "Traductor profesional trilingüe con certificaciones internacionales." },
];

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function fetchTutors(): Promise<Tutor[]> {
  await delay(800);
  return MOCK_TUTORS;
}
