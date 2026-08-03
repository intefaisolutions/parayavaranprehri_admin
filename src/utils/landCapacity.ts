export const TREES_PER_ACRE = 400;

export type AreaUnit = "SQ_FT" | "SQ_METER" | "ACRE" | "HECTARE";

export function toAcres(totalArea: number, unit: AreaUnit): number {
  if (!Number.isFinite(totalArea) || totalArea <= 0) return 0;
  switch (unit) {
    case "ACRE":
      return totalArea;
    case "HECTARE":
      return totalArea * 2.4710538147;
    case "SQ_FT":
      return totalArea / 43560;
    case "SQ_METER":
      return totalArea / 4046.8564224;
    default:
      return 0;
  }
}

export function recommendMaxTreeCapacity(
  totalArea: number,
  areaUnit: AreaUnit,
): number {
  return Math.max(0, Math.floor(toAcres(totalArea, areaUnit) * TREES_PER_ACRE));
}

export const OWNERSHIP_LABELS: Record<string, string> = {
  GOVERNMENT: "Government",
  PRIVATE: "Private",
  FOREST_DEPARTMENT: "Forest Department",
  SCHOOL_COLLEGE: "School/College",
  PANCHAYAT: "Panchayat",
  NGO: "NGO",
  CORPORATE_CSR: "Corporate (CSR)",
  OTHER: "Other",
};

export const STATUS_LABELS: Record<string, string> = {
  AVAILABLE: "Available for Plantation",
  PARTIALLY_OCCUPIED: "Partially Occupied",
  FULLY_OCCUPIED: "Fully Occupied",
  UNDER_MAINTENANCE: "Under Maintenance",
  RESTRICTED: "Restricted",
};
