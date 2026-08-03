/**
 * Mirrors backend oxygen.util.ts so the admin form can preview
 * estimated O₂ without waiting for save.
 */

export interface OxygenEstimateInput {
  species?: string;
  plantedDate?: string;
  heightM?: number | "";
  dbhCm?: number | "";
  status?: string;
}

export interface OxygenEstimateResult {
  treeAgeYears: number;
  annualOxygenProductionKg: number;
}

const SPECIES: Record<
  string,
  { maturityYears: number; matureKgPerYear: number }
> = {
  neem: { maturityYears: 10, matureKgPerYear: 100 },
  peepal: { maturityYears: 15, matureKgPerYear: 135 },
  pipal: { maturityYears: 15, matureKgPerYear: 135 },
  banyan: { maturityYears: 20, matureKgPerYear: 160 },
  bargad: { maturityYears: 20, matureKgPerYear: 160 },
  mango: { maturityYears: 12, matureKgPerYear: 110 },
  aam: { maturityYears: 12, matureKgPerYear: 110 },
  gulmohar: { maturityYears: 8, matureKgPerYear: 90 },
  teak: { maturityYears: 15, matureKgPerYear: 120 },
  sagwan: { maturityYears: 15, matureKgPerYear: 120 },
  jamun: { maturityYears: 12, matureKgPerYear: 105 },
  amla: { maturityYears: 8, matureKgPerYear: 85 },
  babul: { maturityYears: 8, matureKgPerYear: 80 },
  sheesham: { maturityYears: 14, matureKgPerYear: 115 },
  shisham: { maturityYears: 14, matureKgPerYear: 115 },
  arjun: { maturityYears: 12, matureKgPerYear: 110 },
  kadamb: { maturityYears: 10, matureKgPerYear: 100 },
  bamboo: { maturityYears: 5, matureKgPerYear: 75 },
  default: { maturityYears: 10, matureKgPerYear: 95 },
};

function resolveSpecies(species?: string) {
  const key = (species || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (!key) return SPECIES.default;
  for (const [name, profile] of Object.entries(SPECIES)) {
    if (name === "default") continue;
    if (key === name || key.includes(name) || name.includes(key)) {
      return profile;
    }
  }
  return SPECIES.default;
}

function ageYears(plantedDate?: string) {
  if (!plantedDate) return 0;
  const planted = new Date(plantedDate);
  if (Number.isNaN(planted.getTime())) return 0;
  const ms = Date.now() - planted.getTime();
  if (ms <= 0) return 0;
  return Math.round((ms / (365.25 * 24 * 60 * 60 * 1000)) * 10) / 10;
}

function sizeFactor(heightM?: number | "", dbhCm?: number | "") {
  const h = heightM === "" || heightM == null ? null : Number(heightM);
  const d = dbhCm === "" || dbhCm == null ? null : Number(dbhCm);
  let fromDbh: number | null = null;
  let fromHeight: number | null = null;
  if (d != null && Number.isFinite(d) && d > 0) {
    fromDbh = Math.min(2, Math.max(0.25, 0.25 + (d / 40) * 0.75));
  }
  if (h != null && Number.isFinite(h) && h > 0) {
    fromHeight = Math.min(1.8, Math.max(0.25, 0.3 + (h / 12) * 0.7));
  }
  if (fromDbh != null && fromHeight != null) return fromDbh * 0.6 + fromHeight * 0.4;
  if (fromDbh != null) return fromDbh;
  if (fromHeight != null) return fromHeight;
  return 0.5;
}

export function estimateTreeOxygen(
  input: OxygenEstimateInput,
): OxygenEstimateResult {
  const treeAgeYears = ageYears(input.plantedDate);
  const status = String(input.status || "").toUpperCase();
  if (status === "DEAD") {
    return { treeAgeYears, annualOxygenProductionKg: 0 };
  }
  const profile = resolveSpecies(input.species);
  const ageFactor =
    treeAgeYears <= 0
      ? 0.05
      : 1 - Math.exp(-treeAgeYears / (profile.maturityYears * 0.45));
  const size = sizeFactor(input.heightM, input.dbhCm);
  const damaged = status === "DAMAGED" ? 0.55 : 1;
  const kg = profile.matureKgPerYear * ageFactor * size * damaged;
  return {
    treeAgeYears,
    annualOxygenProductionKg: Math.max(0, Math.round(kg)),
  };
}

export function formatOxygenDisplay(kg: number): string {
  if (kg >= 1000) {
    const tonnes = kg / 1000;
    return `${tonnes.toLocaleString(undefined, { maximumFractionDigits: 2 })} tonnes/year`;
  }
  return `${kg.toLocaleString()} kg/year`;
}
