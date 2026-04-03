import { useState, useEffect } from "react";

const LATAM_COUNTRIES = [
  "México", "Colombia", "Argentina", "Chile", "Perú",
  "Ecuador", "Venezuela", "Guatemala", "Cuba", "Bolivia",
  "Honduras", "Paraguay", "El Salvador", "Nicaragua", "Costa Rica",
  "Panamá", "Uruguay", "República Dominicana", "Brasil", "Puerto Rico",
];

interface GeoLocationResult {
  country: string | null;
  isLatam: boolean;
  loading: boolean;
}

export function useGeoLocation(): GeoLocationResult {
  const [result, setResult] = useState<GeoLocationResult>({
    country: null,
    isLatam: false,
    loading: true,
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      const randomCountry = LATAM_COUNTRIES[Math.floor(Math.random() * LATAM_COUNTRIES.length)];
      setResult({ country: randomCountry, isLatam: true, loading: false });
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  return result;
}
