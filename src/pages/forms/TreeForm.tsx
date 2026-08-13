import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Building2,
  Car,
  Hash,
  Landmark,
  Leaf,
  Loader2,
  MapPin,
  Navigation,
  Phone,
  Plus,
  Ruler,
  Search,
  ShieldCheck,
  Sprout,
  StickyNote,
  User,
  Wind,
  X,
} from "lucide-react";
import { apiFetch } from "../../utils/apiConfig";
import {
  estimateTreeOxygen,
  formatOxygenDisplay,
} from "../../utils/oxygenEstimate";
import {
  getDistrictOptions,
  getStateOptions,
} from "../../utils/indiaLocations";
import { SmartForm } from "../../components/form/SmartForm";
import type { FormSectionConfig } from "../../components/form/SmartForm";
import { FormPageHeader } from "../../components/form/FormPageHeader";
import { LocationPickerModal } from "../../components/map/LocationPickerModal";
import { InlineLocationPicker } from "../../components/map/InlineLocationPicker";
import {
  boundaryCentroid,
  coordsFromLand,
  forwardGeocodePlace,
} from "../../utils/locationAutoFill";

const OWNERSHIP_LABELS: Record<string, string> = {
  GOVERNMENT: "Government",
  PRIVATE: "Private",
  FOREST_DEPARTMENT: "Forest Dept",
  SCHOOL_COLLEGE: "School/College",
  PANCHAYAT: "Panchayat",
  NGO: "NGO",
  CORPORATE_CSR: "Corporate CSR",
  OTHER: "Other",
};

function formatLandOption(l: any) {
  const ownership =
    OWNERSHIP_LABELS[l.ownershipType] || l.ownershipType || "Land";
  const acres = l.totalAreaAcres ?? l.totalArea ?? "—";
  const unit = l.totalAreaAcres != null ? "Acre" : l.areaUnit || "";
  const rem = l.availableCapacity ?? 0;
  const district = l.district || "—";
  return {
    label: `${l.landName} (${ownership}) · ${acres} ${unit} · ${district} · rem ${rem}`,
    value: l._id,
    meta: l,
  };
}

export interface TreesFormData {
  _id?: string;
  treeId?: string;
  treeName: string;
  species: string;
  scientificName: string;
  personId: string;
  userId: string;
  userName: string;
  mobile: string;
  vehicleNumber: string;
  policyNumber: string;
  insuranceStatus: string;
  plantedDate: string;
  plantedBy: string;
  assignedMitraId: string;
  state: string;
  district: string;
  city: string;
  location: string;
  latitude: number | "";
  longitude: number | "";
  status: string;
  height: number | "";
  dbh: number | "";
  vidhanSabha: string;
  landId: string;
  landName: string;
  landSearch: string;
  plantationMethod: string;
  responsibleOrganization: string;
  treeAgeYears?: number;
  annualOxygenProductionKg?: number;
  remarks: string;
  image: string;
}

type MitraOption = {
  _id: string;
  name: string;
  mobile?: string;
  district?: string;
  vidhanSabha?: string;
  status?: string;
};

type PersonOption = {
  _id: string;
  personId?: string;
  name: string;
  mobile?: string;
  city?: string;
  status?: string;
};

type OwnerVehicle = {
  registrationNumber?: string;
  vehicleType?: string;
  vehicleModel?: string;
  isInsured?: boolean;
  policyStatus?: string;
  policyNumber?: string | null;
};

const ADD_MITRA_VALUE = "__add_mitra__";
const ADD_PERSON_VALUE = "__add_person__";

function mapInsuranceStatus(vehicle?: OwnerVehicle | null): string {
  if (!vehicle) return "NOT_INSURED";
  const status = String(vehicle.policyStatus || "").toUpperCase();
  if (status === "ACTIVE") return "ACTIVE";
  if (status === "EXPIRED") return "EXPIRED";
  if (vehicle.isInsured || vehicle.policyNumber) return "EXPIRED";
  return "NOT_INSURED";
}

function normalizeOwnerVehicle(raw: any, index: number): OwnerVehicle {
  const registrationNumber = String(
    raw?.registrationNumber ||
      raw?.plate ||
      raw?.vehicleNumber ||
      raw?.regNo ||
      raw?.registration_number ||
      "",
  ).trim();
  return {
    registrationNumber: registrationNumber || `UNKNOWN-${index + 1}`,
    vehicleType: raw?.vehicleType ? String(raw.vehicleType) : undefined,
    vehicleModel: raw?.vehicleModel ? String(raw.vehicleModel) : undefined,
    isInsured: !!raw?.isInsured,
    policyStatus: String(raw?.policyStatus || "NOT_INSURED").toUpperCase(),
    policyNumber: raw?.policyNumber != null ? String(raw.policyNumber) : null,
  };
}

function vehicleFieldsFrom(vehicle?: OwnerVehicle | null) {
  return {
    vehicleNumber: vehicle?.registrationNumber || "",
    policyNumber: vehicle?.policyNumber ? String(vehicle.policyNumber) : "",
    insuranceStatus: mapInsuranceStatus(vehicle),
  };
}

const emptyForm: TreesFormData = {
  treeName: "",
  species: "",
  scientificName: "",
  personId: "",
  userId: "",
  userName: "",
  mobile: "",
  vehicleNumber: "",
  policyNumber: "",
  insuranceStatus: "NOT_INSURED",
  plantedDate: new Date().toISOString().split("T")[0],
  plantedBy: "",
  assignedMitraId: "",
  state: "",
  district: "",
  city: "",
  location: "",
  latitude: "",
  longitude: "",
  status: "PLANTED",
  height: "",
  dbh: "",
  vidhanSabha: "",
  landId: "",
  landName: "",
  landSearch: "",
  plantationMethod: "INDIVIDUAL",
  responsibleOrganization: "",
  remarks: "",
  image: "",
};

const FALLBACK_SPECIES_OPTIONS = [
  { label: "Neem", value: "Neem" },
  { label: "Peepal", value: "Peepal" },
  { label: "Banyan", value: "Banyan" },
  { label: "Mango", value: "Mango" },
  { label: "Other", value: "Other" },
];

const toDateInputValue = (value: any): string => {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return d.toISOString().split("T")[0];
};

export const TreeForm = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const editTree = location.state?.tree;
  const isEditing = !!editTree;

  const [formData, setFormData] = useState<TreesFormData>(
    editTree
      ? {
          ...emptyForm,
          ...editTree,
          plantedDate:
            toDateInputValue(editTree.plantedDate) || emptyForm.plantedDate,
          latitude: editTree.latitude ?? "",
          longitude: editTree.longitude ?? "",
          height: editTree.height ?? "",
          dbh: editTree.dbh ?? "",
          vidhanSabha: editTree.vidhanSabha ?? "",
          landId: editTree.landId ?? "",
          landName: editTree.landName ?? "",
          plantationMethod: editTree.plantationMethod ?? "INDIVIDUAL",
          responsibleOrganization: editTree.responsibleOrganization ?? "",
          assignedMitraId: editTree.assignedMitraId
            ? String(editTree.assignedMitraId)
            : "",
          plantedBy:
            editTree.assignedMitraName || editTree.plantedBy || "",
          personId: editTree.personId ? String(editTree.personId) : "",
          userId: editTree.userId ? String(editTree.userId) : "",
        }
      : emptyForm,
  );

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [mapOpen, setMapOpen] = useState(false);
  const [resolvingMap, setResolvingMap] = useState(false);
  const [mapStatusNote, setMapStatusNote] = useState("");
  /** Camera-only center when land has no saved pin (NOT the planting coordinates). */
  const [mapViewCenter, setMapViewCenter] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [landOptions, setLandOptions] = useState<
    { label: string; value: string; meta?: any }[]
  >([]);
  const [loadingLands, setLoadingLands] = useState(false);
  const [vsOptions, setVsOptions] = useState<
    { label: string; value: string; meta?: any }[]
  >([]);
  const [loadingVs, setLoadingVs] = useState(false);
  const [mitras, setMitras] = useState<MitraOption[]>([]);
  const [loadingMitras, setLoadingMitras] = useState(false);
  const [persons, setPersons] = useState<PersonOption[]>([]);
  const [loadingPersons, setLoadingPersons] = useState(false);
  const [ownerVehicles, setOwnerVehicles] = useState<OwnerVehicle[]>([]);
  const [loadingOwnerVehicles, setLoadingOwnerVehicles] = useState(false);
  const [vehicleLoadMessage, setVehicleLoadMessage] = useState("");
  const [showAddMitra, setShowAddMitra] = useState(false);
  const [addingMitra, setAddingMitra] = useState(false);
  const [addMitraError, setAddMitraError] = useState("");
  const [newMitra, setNewMitra] = useState({ name: "", mobile: "" });
  const [speciesOptions, setSpeciesOptions] = useState(FALLBACK_SPECIES_OPTIONS);
  const [treeMasterMeta, setTreeMasterMeta] = useState<
    Record<string, { scientificName?: string; name: string }>
  >({});

  useEffect(() => {
    apiFetch<any[]>("/api/v1/tree-masters?isActive=true")
      .then((list) => {
        const items = Array.isArray(list) ? list : [];
        if (items.length === 0) return;
        const meta: Record<string, { scientificName?: string; name: string }> =
          {};
        const options = items.map((t) => {
          const key = t.species || t.name;
          meta[key] = { scientificName: t.scientificName, name: t.name };
          return {
            label: `${t.name}${
              t.availability === "OUT_OF_STOCK" ? " (Unavailable)" : ""
            }`,
            value: key,
          };
        });
        setSpeciesOptions([...options, { label: "Other", value: "Other" }]);
        setTreeMasterMeta(meta);
      })
      .catch(() => {
        /* keep fallback */
      });
  }, []);

  const loadMitras = async () => {
    setLoadingMitras(true);
    try {
      const rows = await apiFetch<MitraOption[]>(
        "/api/v1/mitras?status=Approved",
      );
      setMitras(Array.isArray(rows) ? rows : []);
    } catch {
      setMitras([]);
    } finally {
      setLoadingMitras(false);
    }
  };

  useEffect(() => {
    loadMitras();
  }, []);

  const loadPersons = async () => {
    setLoadingPersons(true);
    try {
      const params = new URLSearchParams({
        limit: "500",
        sortBy: "name",
        sortOrder: "asc",
        status: "Active",
      });
      const rows = await apiFetch<PersonOption[]>(
        `/api/v1/persons?${params.toString()}`,
      );
      setPersons(Array.isArray(rows) ? rows : []);
    } catch {
      setPersons([]);
    } finally {
      setLoadingPersons(false);
    }
  };

  useEffect(() => {
    loadPersons();
  }, []);

  useEffect(() => {
    if (!formData.state || !formData.district) {
      setVsOptions([]);
      return;
    }

    setLoadingVs(true);
    const params = new URLSearchParams({
      limit: "200",
      sortBy: "vidhanSabhaName",
      sortOrder: "asc",
      district: formData.district,
    });

    apiFetch<any[]>(`/api/v1/vidhan-sabhas?${params.toString()}`)
      .then((rows) => {
        let items = Array.isArray(rows) ? rows : [];
        if (formData.state) {
          const stateLc = formData.state.toLowerCase();
          const byState = items.filter(
            (v) => !v.state || String(v.state).toLowerCase() === stateLc,
          );
          if (byState.length) items = byState;
        }
        const opts = items.map((v) => ({
          label: v.vidhanSabhaName,
          value: v.vidhanSabhaName,
          meta: v,
        }));
        // Keep current VS visible when editing even if list is empty/filtered
        if (
          formData.vidhanSabha &&
          !opts.some((o) => o.value === formData.vidhanSabha)
        ) {
          opts.unshift({
            label: formData.vidhanSabha,
            value: formData.vidhanSabha,
            meta: undefined,
          });
        }
        setVsOptions(opts);
      })
      .catch(() => setVsOptions([]))
      .finally(() => setLoadingVs(false));
  }, [formData.state, formData.district]);

  useEffect(() => {
    if (!formData.state || !formData.district || !formData.vidhanSabha) {
      setLandOptions([]);
      return;
    }

    const timer = setTimeout(() => {
      setLoadingLands(true);
      const params = new URLSearchParams({
        state: formData.state,
        district: formData.district,
        vidhanSabha: formData.vidhanSabha,
      });
      if (formData.landSearch.trim()) {
        params.set("search", formData.landSearch.trim());
      }

      apiFetch<any[]>(`/api/v1/lands?${params.toString()}`)
        .then((list) => {
          const items = Array.isArray(list) ? list : [];
          setLandOptions(items.map(formatLandOption));
        })
        .catch(() => setLandOptions([]))
        .finally(() => setLoadingLands(false));
    }, 250);

    return () => clearTimeout(timer);
  }, [
    formData.state,
    formData.district,
    formData.vidhanSabha,
    formData.landSearch,
  ]);

  const selectedLand = useMemo(
    () => landOptions.find((l) => l.value === formData.landId)?.meta,
    [landOptions, formData.landId],
  );

  const selectedVs = useMemo(
    () => vsOptions.find((v) => v.value === formData.vidhanSabha)?.meta,
    [vsOptions, formData.vidhanSabha],
  );

  const landCoords = useMemo(() => {
    const pair = coordsFromLand(selectedLand);
    if (!pair) return { latitude: "" as const, longitude: "" as const };
    return { latitude: pair.lat, longitude: pair.lng };
  }, [selectedLand]);

  const vsBoundary = selectedVs?.boundary?.type ? selectedVs.boundary : null;

  const mapInitialLat =
    formData.latitude !== "" ? formData.latitude : landCoords.latitude;
  const mapInitialLng =
    formData.longitude !== "" ? formData.longitude : landCoords.longitude;

  /** When land has no saved pin, find a usable map center (VS / geocode). */
  const resolvePlantingMapCenter = async (opts: {
    landId: string;
    land: any;
    state: string;
    district: string;
    vidhanSabha: string;
  }) => {
    const { landId, land, state, district, vidhanSabha } = opts;
    setResolvingMap(true);
    setMapStatusNote("Finding map location for this land…");

    try {
      let landDoc = land;
      let pair = coordsFromLand(landDoc);

      if (!pair && landId) {
        try {
          landDoc = await apiFetch<any>(`/api/v1/lands/${landId}`);
          pair = coordsFromLand(landDoc);
        } catch {
          /* keep list meta */
        }
      }

      if (pair) {
        setFormData((prev) => {
          if (prev.landId !== landId) return prev;
          return {
            ...prev,
            latitude: Number(pair!.lat.toFixed(6)),
            longitude: Number(pair!.lng.toFixed(6)),
            city:
              prev.city ||
              landDoc?.villageOrCity ||
              landDoc?.village ||
              landDoc?.tehsil ||
              landDoc?.district ||
              prev.city,
          };
        });
        setMapStatusNote(
          "Starting pin = Land Parcel map point. Drag it to the exact planting spot.",
        );
        return;
      }

      // Acres/khasra ≠ map pin. Only move the camera — user must click to set planting coords.
      const vsMeta =
        vsOptions.find((v) => v.value === vidhanSabha)?.meta || selectedVs;
      const vsCenter = boundaryCentroid(vsMeta?.boundary);
      if (vsCenter) {
        setMapViewCenter(vsCenter);
        setMapStatusNote(
          "Land “Times” has no saved map pin (only acres/khasra). Map is only centered on Vidhan Sabha — this is NOT the land point. Click the map on the actual land to set the tree pin.",
        );
        return;
      }

      const queries = [
        [vidhanSabha, district, state, "India"].filter(Boolean).join(", "),
        [land?.khasraNumber ? `Khasra ${land.khasraNumber}` : "", district, state, "India"]
          .filter(Boolean)
          .join(", "),
        [district, state, "India"].filter(Boolean).join(", "),
      ];
      for (const q of queries) {
        const geo = await forwardGeocodePlace(q);
        if (!geo) continue;
        setMapViewCenter(geo);
        setMapStatusNote(
          "This land has no saved map pin. Map opened near the constituency only — click the exact planting spot on the land before Register.",
        );
        return;
      }

      setMapStatusNote(
        "Could not find the area on map. Open “Pick on Map” and drop the pin on the actual land.",
      );
    } finally {
      setResolvingMap(false);
    }
  };

  const oxygenPreview = useMemo(
    () =>
      estimateTreeOxygen({
        species: formData.species,
        plantedDate: formData.plantedDate,
        heightM: formData.height,
        dbhCm: formData.dbh,
        status: formData.status,
      }),
    [
      formData.species,
      formData.plantedDate,
      formData.height,
      formData.dbh,
      formData.status,
    ],
  );

  const mitraSelectOptions = useMemo(() => {
    const sorted = [...mitras].sort((a, b) => {
      const aMatch =
        (formData.district && a.district === formData.district) ||
        (formData.vidhanSabha && a.vidhanSabha === formData.vidhanSabha)
          ? 0
          : 1;
      const bMatch =
        (formData.district && b.district === formData.district) ||
        (formData.vidhanSabha && b.vidhanSabha === formData.vidhanSabha)
          ? 0
          : 1;
      if (aMatch !== bMatch) return aMatch - bMatch;
      return a.name.localeCompare(b.name);
    });

    const opts = [
      { label: "+ Add new Mitra", value: ADD_MITRA_VALUE },
      ...sorted.map((m) => ({
        label: `${m.name}${m.mobile ? ` · ${m.mobile}` : ""}${
          m.district ? ` · ${m.district}` : ""
        }`,
        value: m._id,
      })),
    ];

    if (
      formData.assignedMitraId &&
      formData.assignedMitraId !== ADD_MITRA_VALUE &&
      !opts.some((o) => o.value === formData.assignedMitraId)
    ) {
      opts.splice(1, 0, {
        label: formData.plantedBy || formData.assignedMitraId,
        value: formData.assignedMitraId,
      });
    }

    return opts;
  }, [
    mitras,
    formData.district,
    formData.vidhanSabha,
    formData.assignedMitraId,
    formData.plantedBy,
  ]);

  const personSelectOptions = useMemo(() => {
    const opts = [
      { label: "+ Add new Person", value: ADD_PERSON_VALUE },
      ...persons.map((p) => ({
        label: `${p.name}${p.mobile ? ` · ${p.mobile}` : ""}${
          p.personId ? ` · ${p.personId}` : ""
        }`,
        value: p._id,
      })),
    ];

    if (
      formData.personId &&
      formData.personId !== ADD_PERSON_VALUE &&
      !opts.some((o) => o.value === formData.personId)
    ) {
      opts.splice(1, 0, {
        label:
          formData.userName ||
          formData.mobile ||
          formData.personId,
        value: formData.personId,
      });
    }

    return opts;
  }, [persons, formData.personId, formData.userName, formData.mobile]);

  const fillOwnerVehicles = async (personMongoId: string) => {
    if (!personMongoId) {
      setOwnerVehicles([]);
      setVehicleLoadMessage("");
      setFormData((prev) => ({
        ...prev,
        ...vehicleFieldsFrom(null),
      }));
      return;
    }

    setLoadingOwnerVehicles(true);
    setVehicleLoadMessage("");
    try {
      const data = await apiFetch<{
        vehicles?: any[];
        message?: string;
      }>(`/api/v1/persons/${personMongoId}/vehicles`);
      const vehicles = (Array.isArray(data?.vehicles) ? data.vehicles : []).map(
        (v, i) => normalizeOwnerVehicle(v, i),
      );
      setOwnerVehicles(vehicles);
      setVehicleLoadMessage(
        data?.message ||
          (vehicles.length
            ? `${vehicles.length} vehicle(s) — select one to continue`
            : "No vehicles found for this owner"),
      );
      // Auto-pick only when exactly one vehicle; otherwise user must choose
      if (vehicles.length === 1) {
        setFormData((prev) => ({
          ...prev,
          ...vehicleFieldsFrom(vehicles[0]),
        }));
      } else {
        setFormData((prev) => ({
          ...prev,
          ...vehicleFieldsFrom(null),
        }));
      }
    } catch (err: any) {
      setOwnerVehicles([]);
      setVehicleLoadMessage(
        err?.message || "Failed to load vehicles for this owner",
      );
      setFormData((prev) => ({
        ...prev,
        ...vehicleFieldsFrom(null),
      }));
    } finally {
      setLoadingOwnerVehicles(false);
    }
  };

  const selectOwnerVehicle = (regNo: string) => {
    const vehicle =
      ownerVehicles.find((v) => v.registrationNumber === regNo) || null;
    setFormData((prev) => ({
      ...prev,
      ...vehicleFieldsFrom(vehicle),
    }));
  };

  const handleFieldChange = (name: string, value: any) => {
    if (name === "assignedMitraId" && value === ADD_MITRA_VALUE) {
      setNewMitra({ name: "", mobile: "" });
      setAddMitraError("");
      setShowAddMitra(true);
      return;
    }
    if (name === "personId" && value === ADD_PERSON_VALUE) {
      navigate("/persons/add");
      return;
    }

    setFormData((prev) => {
      if (name === "species") {
        const master = treeMasterMeta[value];
        return {
          ...prev,
          species: value,
          treeName: prev.treeName || master?.name || value,
          scientificName:
            master?.scientificName ||
            (value === "Other" ? prev.scientificName : prev.scientificName),
        };
      }
      if (name === "state") {
        return {
          ...prev,
          state: value,
          district: "",
          vidhanSabha: "",
          landId: "",
          landName: "",
          landSearch: "",
        };
      }
      if (name === "district") {
        return {
          ...prev,
          district: value,
          vidhanSabha: "",
          landId: "",
          landName: "",
          landSearch: "",
        };
      }
      if (name === "vidhanSabha") {
        return {
          ...prev,
          vidhanSabha: value,
          landId: "",
          landName: "",
          landSearch: "",
        };
      }
      if (name === "landId") {
        const land = landOptions.find((l) => l.value === value)?.meta;
        const village =
          land?.villageOrCity ||
          land?.village ||
          land?.tehsil ||
          land?.district ||
          "";
        const addressParts = [
          land?.landAddress,
          land?.landmark,
          land?.khasraNumber ? `Khasra ${land.khasraNumber}` : "",
        ].filter(Boolean);
        const pair = coordsFromLand(land);

        return {
          ...prev,
          landId: value,
          landName: land?.landName || "",
          vidhanSabha: land?.vidhanSabha || prev.vidhanSabha,
          state: land?.state || prev.state,
          district: land?.district || prev.district,
          city: village || prev.city,
          location: addressParts.length
            ? addressParts.join(", ")
            : prev.location,
          // Clear previous pin when switching lands; async resolver fills if missing
          latitude: pair ? pair.lat : "",
          longitude: pair ? pair.lng : "",
        };
      }
      if (name === "assignedMitraId") {
        const mitra = mitras.find((m) => m._id === value);
        return {
          ...prev,
          assignedMitraId: value,
          plantedBy: mitra?.name || prev.plantedBy,
        };
      }
      if (name === "personId") {
        const person = persons.find((p) => p._id === value);
        return {
          ...prev,
          personId: value,
          userId: value,
          userName: person?.name || "",
          mobile: person?.mobile || "",
          vehicleNumber: "",
          policyNumber: "",
          insuranceStatus: "NOT_INSURED",
        };
      }
      if (name === "vehicleNumber") {
        const vehicle =
          ownerVehicles.find((v) => v.registrationNumber === value) || null;
        return {
          ...prev,
          vehicleNumber: value,
          policyNumber: vehicle
            ? vehicle.policyNumber
              ? String(vehicle.policyNumber)
              : ""
            : prev.policyNumber,
          insuranceStatus: vehicle
            ? mapInsuranceStatus(vehicle)
            : prev.insuranceStatus,
        };
      }
      return { ...prev, [name]: value };
    });

    if (name === "personId" && value && value !== ADD_PERSON_VALUE) {
      void fillOwnerVehicles(value);
    }
    if (name === "personId" && !value) {
      setOwnerVehicles([]);
    }
    if (name === "landId") {
      setMapViewCenter(null);
      if (!value) {
        setMapStatusNote("");
        setResolvingMap(false);
        return;
      }
      const land = landOptions.find((l) => l.value === value)?.meta;
      const pair = coordsFromLand(land);
      if (pair) {
        setMapViewCenter(pair);
        setMapStatusNote(
          "Starting pin = Land Parcel map point. Drag it to the exact planting spot.",
        );
        return;
      }
      void resolvePlantingMapCenter({
        landId: value,
        land,
        state: land?.state || formData.state,
        district: land?.district || formData.district,
        vidhanSabha: land?.vidhanSabha || formData.vidhanSabha,
      });
    }
  };

  // Edit mode: load vehicles list for dropdown without overwriting saved fields
  useEffect(() => {
    if (!isEditing || !editTree?.personId) return;
    const personMongoId = String(editTree.personId);
    let cancelled = false;
    (async () => {
      setLoadingOwnerVehicles(true);
      try {
        const data = await apiFetch<{ vehicles?: OwnerVehicle[] }>(
          `/api/v1/persons/${personMongoId}/vehicles`,
        );
        if (cancelled) return;
        setOwnerVehicles(Array.isArray(data?.vehicles) ? data.vehicles : []);
      } catch {
        if (!cancelled) setOwnerVehicles([]);
      } finally {
        if (!cancelled) setLoadingOwnerVehicles(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [isEditing, editTree?.personId]);

  const handleCreateMitra = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = newMitra.name.trim();
    const mobile = newMitra.mobile.trim();
    if (!name) {
      setAddMitraError("Mitra name is required");
      return;
    }
    if (mobile.length < 10) {
      setAddMitraError("Enter a valid 10-digit mobile number");
      return;
    }

    setAddingMitra(true);
    setAddMitraError("");
    try {
      const created = await apiFetch<MitraOption>("/api/v1/mitras", {
        method: "POST",
        body: JSON.stringify({
          name,
          mobile,
          status: "Approved",
          state: formData.state || undefined,
          district: formData.district || undefined,
          vidhanSabha: formData.vidhanSabha || undefined,
        }),
      });
      await loadMitras();
      setFormData((prev) => ({
        ...prev,
        assignedMitraId: created._id,
        plantedBy: created.name || name,
      }));
      setShowAddMitra(false);
      setNewMitra({ name: "", mobile: "" });
    } catch (err: any) {
      setAddMitraError(err.message || "Failed to create Mitra");
    } finally {
      setAddingMitra(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!formData.personId.trim()) {
      setError("Please select an Owner (Person)");
      return;
    }
    if (!formData.mobile.trim() || !formData.userName.trim()) {
      setError("Selected person is missing name or mobile");
      return;
    }
    if (ownerVehicles.length > 0 && !formData.vehicleNumber.trim()) {
      setError("Select a vehicle from the owner’s vehicle list");
      return;
    }
    if (!formData.species.trim()) {
      setError("Species is required for oxygen estimation");
      return;
    }
    if (!formData.plantedDate) {
      setError("Plantation date is required");
      return;
    }
    if (!formData.state || !formData.district) {
      setError("Please select State and District");
      return;
    }
    if (!formData.vidhanSabha) {
      setError("Please select Vidhan Sabha");
      return;
    }
    if (!formData.landId) {
      setError("Please select a Land parcel");
      return;
    }
    if (formData.latitude === "" || formData.longitude === "") {
      setError(
        "Set Exact Planting Spot on the map (click the pin on the land). Land acres alone are not a map location.",
      );
      return;
    }

    setSubmitting(true);

    const {
      _id,
      treeId,
      treeAgeYears: _age,
      annualOxygenProductionKg: _o2,
      landSearch: _landSearch,
      assignedMitraId,
      ...rest
    } = formData as any;

    // Never send O₂ / age — backend calculates them
    const payload = {
      ...rest,
      latitude: Number(formData.latitude),
      longitude: Number(formData.longitude),
      height: formData.height === "" ? undefined : Number(formData.height),
      dbh: formData.dbh === "" ? undefined : Number(formData.dbh),
      vidhanSabha: formData.vidhanSabha || undefined,
      plantedBy: formData.plantedBy || undefined,
      assignedMitraId: assignedMitraId || undefined,
      personId: formData.personId || undefined,
      userId: formData.userId || formData.personId || undefined,
      userName: formData.userName || undefined,
      mobile: formData.mobile || undefined,
      landId: formData.landId || undefined,
      landName: formData.landName || undefined,
      plantationMethod: formData.plantationMethod || undefined,
      responsibleOrganization:
        formData.responsibleOrganization || undefined,
    };

    try {
      if (isEditing && editTree._id) {
        await apiFetch(`/api/v1/trees/${editTree._id}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
      } else {
        await apiFetch("/api/v1/trees", {
          method: "POST",
          body: JSON.stringify(payload),
        });
      }
      navigate("/trees");
    } catch (err: any) {
      setError(err.message || "Failed to save tree");
    } finally {
      setSubmitting(false);
    }
  };

  const sections: FormSectionConfig[] = [
    {
      title: "Tree Details",
      description:
        "O₂ is calculated automatically from species, age, height and DBH — do not enter it manually.",
      icon: Leaf,
      fields: [
        {
          name: "treeName",
          label: "Tree Name",
          type: "text",
          icon: Leaf,
          required: true,
          placeholder: "e.g., Neem",
        },
        {
          name: "species",
          label: "Species",
          type: "select",
          icon: Sprout,
          required: true,
          options: speciesOptions,
          helpText: "From Tree Master Catalog (fallback list if empty)",
        },
        {
          name: "scientificName",
          label: "Scientific Name",
          type: "text",
          icon: Sprout,
          placeholder: "e.g., Azadirachta indica",
        },
        {
          name: "plantedDate",
          label: "Plantation Date",
          type: "date",
          icon: Hash,
          required: true,
        },
        {
          name: "status",
          label: "Status",
          type: "select",
          icon: Sprout,
          options: [
            { label: "Planted", value: "PLANTED" },
            { label: "Healthy", value: "HEALTHY" },
            { label: "Growing", value: "GROWING" },
            { label: "Damaged", value: "DAMAGED" },
            { label: "Dead", value: "DEAD" },
          ],
        },
        {
          name: "height",
          label: "Height (m)",
          type: "number",
          icon: Ruler,
          helpText: "Used for O₂ size factor",
        },
        {
          name: "dbh",
          label: "DBH / Trunk Diameter (cm)",
          type: "number",
          icon: Ruler,
          helpText: "Optional — improves O₂ accuracy",
        },
        {
          name: "image",
          label: "Tree Image",
          type: "image",
          icon: Leaf,
          uploadCategory: "trees",
          span: 2,
        },
        {
          name: "remarks",
          label: "Remarks",
          type: "textarea",
          icon: StickyNote,
          span: 2,
          placeholder: "Any additional details or observations...",
        },
      ],
    },
    {
      title: "Owner Details",
      description:
        "1) Select owner → 2) pick a vehicle from their list → 3) then choose plantation land.",
      icon: User,
      fields: [
        {
          name: "personId",
          label: "Owner (Person)",
          type: "select",
          icon: User,
          required: true,
          options: personSelectOptions,
          helpText: loadingPersons
            ? "Loading persons…"
            : persons.length
              ? "From Person Management. Mobile & name fill automatically."
              : "No active persons yet — choose “+ Add new Person”.",
        },
        {
          name: "userName",
          label: "Owner Name",
          type: "text",
          icon: User,
          disabled: true,
        },
        {
          name: "mobile",
          label: "Owner Mobile",
          type: "tel",
          icon: Phone,
          disabled: true,
        },
      ],
    },
    {
      title: "Vehicle & Insurance",
      description:
        "All vehicles linked to this owner’s mobile. Select one, then plant the tree.",
      icon: Car,
      fields: [
        {
          name: "policyNumber",
          label: "Policy Number",
          type: "text",
          icon: ShieldCheck,
          disabled: true,
          helpText: "From selected vehicle",
        },
        {
          name: "insuranceStatus",
          label: "Insurance Status",
          type: "select",
          icon: ShieldCheck,
          disabled: true,
          options: [
            { label: "Active", value: "ACTIVE" },
            { label: "Expired", value: "EXPIRED" },
            { label: "Not Insured", value: "NOT_INSURED" },
          ],
        },
        {
          name: "vehicleNumber",
          label: "Selected Vehicle Number",
          type: "text",
          icon: Car,
          disabled: true,
          helpText: formData.vehicleNumber
            ? "Selected from list below"
            : "Pick a vehicle from the list below",
        },
      ],
      customContent: (
        <div style={{ marginTop: 8 }}>
          {!formData.personId ? (
            <p style={{ margin: 0, fontSize: 13, color: "var(--text-secondary)" }}>
              Select an Owner first to load their vehicles.
            </p>
          ) : loadingOwnerVehicles ? (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                fontSize: 13,
                color: "var(--text-secondary)",
              }}
            >
              <Loader2 size={16} className="spin" /> Loading vehicles…
            </div>
          ) : ownerVehicles.length === 0 ? (
            <div
              style={{
                padding: 12,
                borderRadius: 8,
                background: "rgba(255, 61, 0, 0.08)",
                color: "#c2410c",
                fontSize: 13,
              }}
            >
              {vehicleLoadMessage ||
                "No vehicle found for this owner’s mobile in insurance system."}
            </div>
          ) : (
            <>
              <p
                style={{
                  margin: "0 0 10px",
                  fontSize: 13,
                  color: "var(--text-secondary)",
                }}
              >
                {vehicleLoadMessage ||
                  `${ownerVehicles.length} vehicle(s) — select one`}
              </p>
              <div
                style={{
                  display: "grid",
                  gap: 8,
                  maxHeight: 280,
                  overflowY: "auto",
                }}
              >
                {ownerVehicles.map((v) => {
                  const selected =
                    formData.vehicleNumber === v.registrationNumber;
                  const status = String(
                    v.policyStatus || "NOT_INSURED",
                  ).toUpperCase();
                  return (
                    <button
                      key={v.registrationNumber}
                      type="button"
                      onClick={() =>
                        selectOwnerVehicle(String(v.registrationNumber))
                      }
                      style={{
                        textAlign: "left",
                        padding: "12px 14px",
                        borderRadius: 10,
                        border: selected
                          ? "2px solid #166534"
                          : "1px solid var(--border-color)",
                        background: selected
                          ? "rgba(22, 101, 52, 0.08)"
                          : "var(--card-bg, #fff)",
                        cursor: "pointer",
                        display: "grid",
                        gap: 4,
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          gap: 8,
                          alignItems: "center",
                        }}
                      >
                        <strong style={{ fontSize: 14 }}>
                          {v.registrationNumber}
                        </strong>
                        <span
                          style={{
                            fontSize: 11,
                            fontWeight: 700,
                            padding: "2px 8px",
                            borderRadius: 999,
                            background:
                              status === "ACTIVE"
                                ? "rgba(22,101,52,0.12)"
                                : status === "EXPIRED"
                                  ? "rgba(202,138,4,0.15)"
                                  : "rgba(100,116,139,0.12)",
                            color:
                              status === "ACTIVE"
                                ? "#166534"
                                : status === "EXPIRED"
                                  ? "#a16207"
                                  : "#475569",
                          }}
                        >
                          {status}
                        </span>
                      </div>
                      <div
                        style={{
                          fontSize: 12,
                          color: "var(--text-secondary)",
                        }}
                      >
                        {[v.vehicleType, v.vehicleModel, v.policyNumber]
                          .filter(Boolean)
                          .join(" · ") || "No policy details"}
                      </div>
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>
      ),
    },
    {
      title: "Plantation Land",
      description:
        "Select State → District → Vidhan Sabha, then pick a land created under that constituency.",
      icon: Landmark,
      fields: [
        {
          name: "state",
          label: "State",
          type: "select",
          icon: Building2,
          required: true,
          options: getStateOptions(),
        },
        {
          name: "district",
          label: "District",
          type: "select",
          icon: Landmark,
          required: true,
          optionsFor: (data) => getDistrictOptions(data.state),
        },
        {
          name: "vidhanSabha",
          label: "Vidhan Sabha",
          type: "select",
          icon: Landmark,
          required: true,
          options: vsOptions,
          helpText: loadingVs
            ? "Loading Vidhan Sabhas…"
            : formData.state && formData.district
              ? vsOptions.length
                ? `${vsOptions.length} registered VS in ${formData.district}`
                : "No Vidhan Sabha created for this district yet"
              : "Pick State and District first",
        },
        {
          name: "landSearch",
          label: "Search Land",
          type: "text",
          icon: Search,
          placeholder: "Green Park, khasra, village...",
          helpText: loadingLands
            ? "Loading lands…"
            : formData.vidhanSabha
              ? `${landOptions.length} land(s) in ${formData.vidhanSabha}`
              : "Pick Vidhan Sabha first",
        },
        {
          name: "landId",
          label: "Land Parcel",
          type: "select",
          icon: Landmark,
          options: landOptions,
          required: true,
          helpText:
            "Only lands linked to the selected Vidhan Sabha. Shows ownership, area, remaining capacity.",
        },
        {
          name: "landName",
          label: "Land Name",
          type: "text",
          icon: Landmark,
          disabled: true,
        },
        {
          name: "plantationMethod",
          label: "Plantation Method",
          type: "select",
          icon: Sprout,
          options: [
            { label: "Individual", value: "INDIVIDUAL" },
            { label: "Plantation Drive", value: "PLANTATION_DRIVE" },
            { label: "CSR", value: "CSR" },
            { label: "Government Scheme", value: "GOVERNMENT_SCHEME" },
          ],
        },
        {
          name: "responsibleOrganization",
          label: "Responsible Organization",
          type: "text",
          icon: Building2,
          placeholder: "Dept / NGO / CSR partner",
        },
        {
          name: "assignedMitraId",
          label: "Plantation By (Mitra)",
          type: "select",
          icon: User,
          options: mitraSelectOptions,
          helpText: loadingMitras
            ? "Loading Mitras…"
            : mitras.length
              ? "Approved Paryavaran Mitras. Choose “+ Add new Mitra” to create one here."
              : "No approved Mitras yet — choose “+ Add new Mitra”.",
        },
      ],
    },
    {
      title: "Exact Planting Spot",
      description:
        "Village / City and starting pin come from the Land Parcel. Move the pin to where this tree was planted.",
      icon: MapPin,
      headerAction: (
        <button
          type="button"
          className="btn-primary"
          onClick={() => setMapOpen(true)}
          disabled={!formData.landId}
          title={
            formData.landId
              ? "Open full-screen map picker"
              : "Select a Land Parcel first"
          }
        >
          <MapPin size={16} style={{ marginRight: 6 }} />
          Pick on Map
        </button>
      ),
      fields: [
        {
          name: "city",
          label: "Village / City",
          type: "text",
          icon: Building2,
          helpText: formData.landId
            ? "Auto-filled from selected Land Parcel — editable"
            : "Select Land Parcel above to auto-fill",
        },
        {
          name: "location",
          label: "Address / Location",
          type: "text",
          icon: MapPin,
          span: 2,
          helpText: "Auto-filled from land address when available",
        },
        {
          name: "latitude",
          label: "Latitude",
          type: "number",
          icon: Navigation,
          helpText: "Starts at land parcel — adjust via map",
        },
        {
          name: "longitude",
          label: "Longitude",
          type: "number",
          icon: Navigation,
        },
      ],
      customContent: (
        <InlineLocationPicker
          latitude={formData.latitude}
          longitude={formData.longitude}
          landLatitude={landCoords.latitude}
          landLongitude={landCoords.longitude}
          viewLatitude={mapViewCenter?.lat ?? ""}
          viewLongitude={mapViewCenter?.lng ?? ""}
          landId={formData.landId}
          boundary={vsBoundary}
          loading={resolvingMap}
          statusNote={mapStatusNote}
          onChange={({ lat, lng }) => {
            setFormData((prev) => ({
              ...prev,
              latitude: Number(lat.toFixed(6)),
              longitude: Number(lng.toFixed(6)),
            }));
            setMapViewCenter({ lat, lng });
            setMapStatusNote(
              "Planting pin set on map. Confirm it is on the land parcel, then Register.",
            );
          }}
        />
      ),
    },
  ];

  return (
    <div className="dashboard-area">
      <FormPageHeader
        icon={Leaf}
        title={isEditing ? "Edit Tree" : "Register Tree"}
        subtitle="O₂ production is estimated automatically from species, age and size."
        onBack={() => navigate("/trees")}
      />

      <div
        className="card"
        style={{
          padding: "16px 20px",
          marginBottom: "16px",
          display: "flex",
          flexWrap: "wrap",
          gap: 20,
          alignItems: "center",
          background:
            "linear-gradient(135deg, rgba(43,150,79,0.1), rgba(255,255,255,0.9))",
          border: "1px solid var(--border-color)",
        }}
      >
        <Wind size={22} color="var(--accent-color)" />
        <div>
          <div
            style={{
              fontSize: 12,
              color: "var(--text-secondary)",
              textTransform: "uppercase",
              letterSpacing: "0.04em",
            }}
          >
            Auto-calculated (not editable)
          </div>
          <div style={{ fontWeight: 700, fontSize: 18, marginTop: 2 }}>
            Age: {oxygenPreview.treeAgeYears} yrs · Est. O₂:{" "}
            {formatOxygenDisplay(oxygenPreview.annualOxygenProductionKg)}
          </div>
          <div style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 4 }}>
            Based on species, plantation date, height
            {formData.dbh !== "" ? " and DBH" : ""}. Different species at the
            same age produce different O₂.
          </div>
        </div>
      </div>

      <div className="card">
        <SmartForm
          sections={sections}
          formData={formData}
          onFieldChange={handleFieldChange}
          onSubmit={handleSubmit}
          submitting={submitting}
          error={error}
          submitLabel={isEditing ? "Update Tree" : "Register Tree"}
          cancelLabel="Cancel"
          onCancel={() => navigate("/trees")}
        />
      </div>

      <LocationPickerModal
        open={mapOpen}
        initialLat={mapInitialLat}
        initialLng={mapInitialLng}
        onClose={() => setMapOpen(false)}
        onConfirm={({ lat, lng }) => {
          setFormData((prev) => ({
            ...prev,
            latitude: Number(lat.toFixed(6)),
            longitude: Number(lng.toFixed(6)),
          }));
          setMapOpen(false);
        }}
      />

      {showAddMitra && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 1200,
            background: "rgba(12, 28, 18, 0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 16,
          }}
          onClick={() => !addingMitra && setShowAddMitra(false)}
        >
          <div
            className="card"
            style={{
              width: "min(440px, 100%)",
              padding: 20,
              boxShadow: "0 20px 50px rgba(0,0,0,0.25)",
            }}
            onClick={(ev) => ev.stopPropagation()}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                marginBottom: 14,
              }}
            >
              <div>
                <h3 style={{ margin: 0, fontSize: 18 }}>Add Paryavaran Mitra</h3>
                <p
                  style={{
                    margin: "4px 0 0",
                    fontSize: 13,
                    color: "var(--text-secondary)",
                  }}
                >
                  Quick create — saved as Approved and selected as Plantation By.
                </p>
              </div>
              <button
                type="button"
                className="icon-btn"
                onClick={() => setShowAddMitra(false)}
                disabled={addingMitra}
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            <form
              onSubmit={handleCreateMitra}
              style={{ display: "grid", gap: 12 }}
            >
              <label style={{ display: "grid", gap: 6, fontSize: 13 }}>
                Full Name *
                <div style={{ position: "relative" }}>
                  <User
                    size={16}
                    style={{
                      position: "absolute",
                      left: 10,
                      top: "50%",
                      transform: "translateY(-50%)",
                      opacity: 0.5,
                    }}
                  />
                  <input
                    required
                    value={newMitra.name}
                    onChange={(e) =>
                      setNewMitra((p) => ({ ...p, name: e.target.value }))
                    }
                    placeholder="Mitra name"
                    style={{
                      width: "100%",
                      height: 40,
                      padding: "0 12px 0 34px",
                      borderRadius: 8,
                      border: "1px solid var(--border-color)",
                    }}
                  />
                </div>
              </label>
              <label style={{ display: "grid", gap: 6, fontSize: 13 }}>
                Mobile *
                <div style={{ position: "relative" }}>
                  <Phone
                    size={16}
                    style={{
                      position: "absolute",
                      left: 10,
                      top: "50%",
                      transform: "translateY(-50%)",
                      opacity: 0.5,
                    }}
                  />
                  <input
                    required
                    type="tel"
                    value={newMitra.mobile}
                    onChange={(e) =>
                      setNewMitra((p) => ({ ...p, mobile: e.target.value }))
                    }
                    placeholder="10-digit mobile"
                    style={{
                      width: "100%",
                      height: 40,
                      padding: "0 12px 0 34px",
                      borderRadius: 8,
                      border: "1px solid var(--border-color)",
                    }}
                  />
                </div>
              </label>

              {(formData.district || formData.vidhanSabha) && (
                <p style={{ margin: 0, fontSize: 12, color: "var(--text-secondary)" }}>
                  Will also save:{" "}
                  {[formData.state, formData.district, formData.vidhanSabha]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
              )}

              {addMitraError && (
                <div
                  style={{
                    background: "rgba(255, 61, 0, 0.1)",
                    color: "#ff3d00",
                    padding: 10,
                    borderRadius: 8,
                    fontSize: 13,
                  }}
                >
                  {addMitraError}
                </div>
              )}

              <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setShowAddMitra(false)}
                  disabled={addingMitra}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={addingMitra}
                >
                  {addingMitra ? (
                    <Loader2 size={16} className="spin" />
                  ) : (
                    <Plus size={16} />
                  )}
                  Create & Select
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TreeForm;
