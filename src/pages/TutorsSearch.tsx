import { useState, useEffect, useMemo, useCallback } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Star,
  SlidersHorizontal,
  X,
  MapPin,
  ArrowLeft,
  SearchX,
  Filter,
} from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

import { fetchTutors, type Tutor } from "@/lib/mockTutors";
import { LATAM_COUNTRIES, COUNTRY_NAME_TO_CODE } from "@/lib/constants";
import { SUBJECTS } from "@/lib/constants";
import { useAuthStore } from "@/stores/authStore";
import { useGeoLocation } from "@/hooks/useGeoLocation";

// ─── Subject colors ───
const SUBJECT_COLORS: Record<string, string> = {
  Matemáticas: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  Física: "bg-purple-500/20 text-purple-300 border-purple-500/30",
  Química: "bg-green-500/20 text-green-300 border-green-500/30",
  Biología: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
  Historia: "bg-amber-500/20 text-amber-300 border-amber-500/30",
  Geografía: "bg-teal-500/20 text-teal-300 border-teal-500/30",
  Literatura: "bg-rose-500/20 text-rose-300 border-rose-500/30",
  Inglés: "bg-sky-500/20 text-sky-300 border-sky-500/30",
  Portugués: "bg-lime-500/20 text-lime-300 border-lime-500/30",
  Francés: "bg-pink-500/20 text-pink-300 border-pink-500/30",
  Programación: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30",
  Economía: "bg-orange-500/20 text-orange-300 border-orange-500/30",
  Contabilidad: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
  Derecho: "bg-red-500/20 text-red-300 border-red-500/30",
  Psicología: "bg-violet-500/20 text-violet-300 border-violet-500/30",
  Filosofía: "bg-indigo-500/20 text-indigo-300 border-indigo-500/30",
  Música: "bg-fuchsia-500/20 text-fuchsia-300 border-fuchsia-500/30",
  Arte: "bg-pink-500/20 text-pink-300 border-pink-500/30",
  Estadística: "bg-slate-400/20 text-slate-300 border-slate-400/30",
  Cálculo: "bg-blue-400/20 text-blue-200 border-blue-400/30",
};

const getSubjectColor = (s: string) =>
  SUBJECT_COLORS[s] ?? "bg-muted text-muted-foreground border-border";

// ─── Tutor Card ───
const TutorCard = ({ tutor, isLocal }: { tutor: Tutor; isLocal: boolean }) => (
  <motion.div
    layout
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, scale: 0.95 }}
    transition={{ duration: 0.3 }}
    className="group relative overflow-hidden rounded-xl border border-border/50 bg-card/80 transition-all duration-300 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5"
  >
    {/* Hover beam effect */}
    <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
      <div className="absolute -inset-px rounded-xl bg-gradient-to-r from-primary/10 via-transparent to-secondary/10" />
    </div>

    <div className="relative p-5">
      <div className="flex gap-4">
        {/* Avatar */}
        <div className="relative shrink-0">
          <img
            src={tutor.photo_url}
            alt={`Foto de ${tutor.full_name}`}
            className="h-16 w-16 rounded-full border-2 border-border/50 bg-muted object-cover"
            loading="lazy"
          />
          {isLocal && (
            <span
              className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground"
              title="Tutor de tu país"
              aria-label="Tutor de tu país"
            >
              ★
            </span>
          )}
        </div>

        {/* Info */}
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="font-semibold text-foreground">{tutor.full_name}</h3>
              <p className="flex items-center gap-1 text-xs text-muted-foreground">
                <MapPin className="h-3 w-3" />
                {tutor.country}
              </p>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold text-foreground">${tutor.hourly_rate}</p>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">USD/hora</p>
            </div>
          </div>

          {/* Rating */}
          <div className="mt-2 flex items-center gap-1.5">
            <Star className="h-4 w-4 fill-secondary text-secondary" />
            <span className="text-sm font-medium text-foreground">{tutor.rating_avg}</span>
            <span className="text-xs text-muted-foreground">({tutor.total_reviews} reseñas)</span>
          </div>
        </div>
      </div>

      {/* Bio */}
      <p className="mt-3 line-clamp-2 text-sm text-muted-foreground">{tutor.bio}</p>

      {/* Subject Tags */}
      <div className="mt-3 flex flex-wrap gap-1.5">
        {tutor.subjects.map((s) => (
          <Badge
            key={s}
            variant="outline"
            className={`text-xs ${getSubjectColor(s)}`}
          >
            {s}
          </Badge>
        ))}
      </div>

      {/* CTA */}
      <div className="mt-4">
        <Button
          asChild
          className="w-full bg-azure text-azure-foreground shadow-md shadow-azure/15 hover:bg-azure/90"
          size="sm"
        >
          <Link to={`/sessions/request/${tutor.id}`}>Ver Perfil / Solicitar</Link>
        </Button>
      </div>
    </div>
  </motion.div>
);

// ─── Filter Controls (shared between sidebar and sheet) ───
interface FilterControlsProps {
  query: string;
  setQuery: (v: string) => void;
  selectedSubjects: string[];
  toggleSubject: (s: string) => void;
  priceRange: [number, number];
  setPriceRange: (r: [number, number]) => void;
  selectedCountry: string;
  setSelectedCountry: (c: string) => void;
  clearFilters: () => void;
  activeFilterCount: number;
}

const FilterControls = ({
  query,
  setQuery,
  selectedSubjects,
  toggleSubject,
  priceRange,
  setPriceRange,
  selectedCountry,
  setSelectedCountry,
  clearFilters,
  activeFilterCount,
}: FilterControlsProps) => {
  const [subjectsOpen, setSubjectsOpen] = useState(false);

  return (
    <div className="space-y-6">
      {/* Text Search */}
      <div className="space-y-2">
        <Label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Buscar</Label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Nombre o materia..."
            className="pl-9"
            aria-label="Buscar tutor por nombre o materia"
          />
        </div>
      </div>

      {/* Subjects */}
      <div className="space-y-2">
        <Label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Materias {selectedSubjects.length > 0 && `(${selectedSubjects.length})`}
        </Label>
        <Popover open={subjectsOpen} onOpenChange={setSubjectsOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-full justify-start font-normal" type="button">
              {selectedSubjects.length > 0
                ? `${selectedSubjects.length} seleccionada(s)`
                : "Todas las materias"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64 p-0" align="start">
            <Command>
              <CommandInput placeholder="Buscar materia..." />
              <CommandList>
                <CommandEmpty>No encontrada.</CommandEmpty>
                <CommandGroup>
                  {SUBJECTS.map((s) => (
                    <CommandItem key={s} value={s} onSelect={() => toggleSubject(s)} className="cursor-pointer">
                      <span
                        className={`mr-2 flex h-4 w-4 items-center justify-center rounded border text-xs ${
                          selectedSubjects.includes(s) ? "border-primary bg-primary text-primary-foreground" : "border-muted-foreground"
                        }`}
                      >
                        {selectedSubjects.includes(s) && "✓"}
                      </span>
                      {s}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
        {selectedSubjects.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {selectedSubjects.map((s) => (
              <Badge key={s} variant="secondary" className="gap-1 text-xs">
                {s}
                <button onClick={() => toggleSubject(s)} aria-label={`Quitar ${s}`}>
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* Price Range */}
      <div className="space-y-3">
        <Label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Precio (USD/hora)
        </Label>
        <Slider
          value={priceRange}
          onValueChange={(v) => setPriceRange(v as [number, number])}
          min={0}
          max={100}
          step={1}
          className="py-2"
          aria-label="Rango de precio por hora"
        />
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>${priceRange[0]}</span>
          <span>${priceRange[1]}</span>
        </div>
      </div>

      {/* Country */}
      <div className="space-y-2">
        <Label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">País</Label>
        <Select value={selectedCountry} onValueChange={setSelectedCountry}>
          <SelectTrigger aria-label="Filtrar por país">
            <SelectValue placeholder="Todos los países" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los países</SelectItem>
            {LATAM_COUNTRIES.map((c) => (
              <SelectItem key={c.value} value={c.value}>
                {c.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Clear */}
      {activeFilterCount > 0 && (
        <Button variant="ghost" onClick={clearFilters} className="w-full text-muted-foreground">
          <X className="mr-2 h-4 w-4" />
          Limpiar filtros ({activeFilterCount})
        </Button>
      )}
    </div>
  );
};

// ─── Empty State ───
const EmptyState = ({ onClear }: { onClear: () => void }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="flex flex-col items-center justify-center py-20 text-center"
  >
    <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-muted/50">
      <SearchX className="h-12 w-12 text-muted-foreground" />
    </div>
    <h3 className="text-xl font-semibold text-foreground">No se encontraron tutores</h3>
    <p className="mt-2 max-w-md text-sm text-muted-foreground">
      Intenta ajustar tus filtros de búsqueda o amplía el rango de precio para ver más resultados.
    </p>
    <Button onClick={onClear} variant="outline" className="mt-6">
      <X className="mr-2 h-4 w-4" />
      Limpiar todos los filtros
    </Button>
  </motion.div>
);

// ─── Main Page ───
const TutorsSearch = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [tutors, setTutors] = useState<Tutor[]>([]);
  const [loading, setLoading] = useState(true);

  const { country: geoCountry } = useGeoLocation();
  const geoCode = geoCountry ? (COUNTRY_NAME_TO_CODE[geoCountry] ?? "") : "";
  const profile = useAuthStore((s) => s.profile_data);
  const userCountryCode = profile?.country ?? geoCode;

  // ─── Filter state from URL ───
  const query = searchParams.get("q") ?? "";
  const subjectsParam = searchParams.get("subject") ?? "";
  const selectedSubjects = subjectsParam ? subjectsParam.split(",") : [];
  const minPrice = parseInt(searchParams.get("min_price") ?? "0", 10);
  const maxPrice = parseInt(searchParams.get("max_price") ?? "100", 10);
  const selectedCountry = searchParams.get("country") ?? "all";

  // ─── Updaters (sync to URL) ───
  const updateParams = useCallback(
    (updates: Record<string, string | null>) => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        Object.entries(updates).forEach(([k, v]) => {
          if (v === null || v === "" || v === "all") next.delete(k);
          else next.set(k, v);
        });
        return next;
      }, { replace: true });
    },
    [setSearchParams]
  );

  const setQuery = (v: string) => updateParams({ q: v || null });
  const toggleSubject = (s: string) => {
    const next = selectedSubjects.includes(s)
      ? selectedSubjects.filter((x) => x !== s)
      : [...selectedSubjects, s];
    updateParams({ subject: next.length > 0 ? next.join(",") : null });
  };
  const setPriceRange = (r: [number, number]) =>
    updateParams({
      min_price: r[0] > 0 ? String(r[0]) : null,
      max_price: r[1] < 100 ? String(r[1]) : null,
    });
  const setSelectedCountry = (c: string) => updateParams({ country: c === "all" ? null : c });
  const clearFilters = () => setSearchParams({}, { replace: true });

  const activeFilterCount =
    (query ? 1 : 0) +
    selectedSubjects.length +
    (minPrice > 0 || maxPrice < 100 ? 1 : 0) +
    (selectedCountry !== "all" ? 1 : 0);

  // ─── Load data ───
  useEffect(() => {
    fetchTutors().then((d) => {
      setTutors(d);
      setLoading(false);
    });
  }, []);

  // ─── Filtered + prioritized ───
  const filtered = useMemo(() => {
    let result = [...tutors];

    // Text search
    if (query) {
      const q = query.toLowerCase();
      result = result.filter(
        (t) =>
          t.full_name.toLowerCase().includes(q) ||
          t.subjects.some((s) => s.toLowerCase().includes(q))
      );
    }

    // Subjects
    if (selectedSubjects.length > 0) {
      result = result.filter((t) =>
        selectedSubjects.some((s) => t.subjects.includes(s))
      );
    }

    // Price
    result = result.filter((t) => t.hourly_rate >= minPrice && t.hourly_rate <= maxPrice);

    // Country
    if (selectedCountry !== "all") {
      result = result.filter((t) => t.country_code === selectedCountry);
    }

    // LATAM prioritization: user's country first, then rest sorted by rating
    if (userCountryCode && selectedCountry === "all") {
      const local = result.filter((t) => t.country_code === userCountryCode);
      const others = result.filter((t) => t.country_code !== userCountryCode);
      local.sort((a, b) => b.rating_avg - a.rating_avg);
      others.sort((a, b) => b.rating_avg - a.rating_avg);
      return [...local, ...others];
    }

    return result.sort((a, b) => b.rating_avg - a.rating_avg);
  }, [tutors, query, selectedSubjects, minPrice, maxPrice, selectedCountry, userCountryCode]);

  const filterProps: FilterControlsProps = {
    query,
    setQuery,
    selectedSubjects,
    toggleSubject,
    priceRange: [minPrice, maxPrice],
    setPriceRange,
    selectedCountry,
    setSelectedCountry,
    clearFilters,
    activeFilterCount,
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border/40 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-7xl items-center gap-4 px-4 sm:px-6">
          <Link to="/" className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors" aria-label="Volver al inicio">
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Inicio</span>
          </Link>
          <h1 className="text-lg font-bold text-foreground">Buscar Tutores</h1>
          <div className="ml-auto flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              {loading ? "Cargando..." : `${filtered.length} tutor(es)`}
            </span>
            {/* Mobile filter toggle */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="lg:hidden relative">
                  <SlidersHorizontal className="h-4 w-4" />
                  {activeFilterCount > 0 && (
                    <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">
                      {activeFilterCount}
                    </span>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-80">
                <SheetHeader>
                  <SheetTitle className="flex items-center gap-2">
                    <Filter className="h-5 w-5" /> Filtros
                  </SheetTitle>
                </SheetHeader>
                <div className="mt-6">
                  <FilterControls {...filterProps} />
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:py-8">
        <div className="flex gap-8">
          {/* Desktop Sidebar Filters */}
          <aside className="hidden w-72 shrink-0 lg:block">
            <div className="sticky top-20 rounded-xl border border-border/50 bg-card/60 p-5 backdrop-blur-sm">
              <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold text-foreground">
                <Filter className="h-4 w-4 text-primary" />
                Filtros
              </h2>
              <FilterControls {...filterProps} />
            </div>
          </aside>

          {/* Results Grid */}
          <div className="min-w-0 flex-1">
            {/* Mobile search bar */}
            <div className="mb-4 lg:hidden">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Buscar por nombre o materia..."
                  className="pl-9"
                  aria-label="Buscar tutor"
                />
              </div>
            </div>

            {loading ? (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="rounded-xl border border-border/50 bg-card/80 p-5">
                    <div className="flex gap-4">
                      <Skeleton className="h-16 w-16 rounded-full" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-5 w-3/4" />
                        <Skeleton className="h-3 w-1/2" />
                        <Skeleton className="h-4 w-1/3" />
                      </div>
                    </div>
                    <Skeleton className="mt-3 h-10 w-full" />
                    <div className="mt-3 flex gap-2">
                      <Skeleton className="h-5 w-20 rounded-full" />
                      <Skeleton className="h-5 w-16 rounded-full" />
                    </div>
                    <Skeleton className="mt-4 h-9 w-full rounded-md" />
                  </div>
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <EmptyState onClear={clearFilters} />
            ) : (
              <AnimatePresence mode="popLayout">
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {filtered.map((tutor) => (
                    <TutorCard
                      key={tutor.id}
                      tutor={tutor}
                      isLocal={tutor.country_code === userCountryCode}
                    />
                  ))}
                </div>
              </AnimatePresence>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TutorsSearch;
