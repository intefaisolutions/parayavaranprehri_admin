import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Building2,
  Car,
  Hash,
  Landmark,
  Leaf,
  MapPin,
  Navigation,
  Ruler,
  Search,
  ShieldCheck,
  Sprout,
  StickyNote,
  User,
  Wind,
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
  userId: string;
  userName: string;
  mobile: string;
  vehicleNumber: string;
  policyNumber: string;
  insuranceStatus: string;
  plantedDate: string;
  plantedBy: string;
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

const emptyForm: TreesFormData = {
  treeName: "",
  species: "",
  scientificName: "",
  userId: "",
  userName: "",
  mobile: "",
  vehicleNumber: "",
  policyNumber: "",
  insuranceStatus: "NOT_INSURED",
  plantedDate: new Date().toISOString().split("T")[0],
  plantedBy: "",
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
        }
      : emptyForm,
  );

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [searching, setSearching] = useState(false);
  const [searchMessage, setSearchMessage] = useState("");
  const [landOptions, setLandOptions] = useState<
    { label: string; value: string; meta?: any }[]
  >([]);
  const [loadingLands, setLoadingLands] = useState(false);
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

  useEffect(() => {
    if (!formData.state || !formData.district) {
      setLandOptions([]);
      return;
    }

    const timer = setTimeout(() => {
      setLoadingLands(true);
      const params = new URLSearchParams({
        state: formData.state,
        district: formData.district,
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
  }, [formData.state, formData.district, formData.landSearch]);

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

  const handleFieldChange = (name: string, value: any) => {
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
          landId: "",
          landName: "",
          vidhanSabha: "",
        };
      }
      if (name === "district") {
        return {
          ...prev,
          district: value,
          landId: "",
          landName: "",
          vidhanSabha: "",
        };
      }
      if (name === "landId") {
        const land = landOptions.find((l) => l.value === value)?.meta;
        return {
          ...prev,
          landId: value,
          landName: land?.landName || "",
          vidhanSabha: land?.vidhanSabha || "",
          state: land?.state || prev.state,
          district: land?.district || prev.district,
          city: land?.villageOrCity || land?.village || prev.city,
        };
      }
      return { ...prev, [name]: value };
    });
  };

  const handleSearchUser = async () => {
    const mobile = formData.mobile.trim();
    if (mobile.length < 10) {
      setSearchMessage("Enter a valid 10-digit mobile number to search.");
      return;
    }
    setSearching(true);
    setSearchMessage("");
    try {
      const result = await apiFetch<{ items: any[] }>(
        `/api/v1/users?search=${encodeURIComponent(mobile)}&limit=5`,
      );
      const items = result?.items || [];
      const match = items.find((u: any) => u.phone === mobile) || items[0];
      if (match) {
        const fullName = [match.firstName, match.lastName]
          .filter(Boolean)
          .join(" ");
        setFormData((prev) => ({
          ...prev,
          userId: match._id,
          userName: fullName || prev.userName,
        }));
        setSearchMessage(
          `Matched user: ${fullName || match.email || match._id}`,
        );
      } else {
        setSearchMessage(
          "No matching user found. Enter User ID and Name manually below.",
        );
      }
    } catch (err: any) {
      setSearchMessage(
        err.message ||
          "Search failed. Enter User ID and Name manually below.",
      );
    } finally {
      setSearching(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!formData.mobile.trim()) {
      setError("Owner mobile number is required");
      return;
    }
    if (!formData.userId.trim() || !formData.userName.trim()) {
      setError(
        "User ID and User Name are required — search by mobile or enter manually",
      );
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
    if (!formData.landId) {
      setError("Please select a Land parcel");
      return;
    }

    setSubmitting(true);

    const {
      _id,
      treeId,
      treeAgeYears: _age,
      annualOxygenProductionKg: _o2,
      landSearch: _landSearch,
      ...rest
    } = formData as any;

    // Never send O₂ / age — backend calculates them
    const payload = {
      ...rest,
      latitude:
        formData.latitude === "" ? undefined : Number(formData.latitude),
      longitude:
        formData.longitude === "" ? undefined : Number(formData.longitude),
      height: formData.height === "" ? undefined : Number(formData.height),
      dbh: formData.dbh === "" ? undefined : Number(formData.dbh),
      vidhanSabha: formData.vidhanSabha || undefined,
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
      title: "Plantation Land",
      description:
        "Select State → District, search land, then pick a parcel. District / Vidhan Sabha inherit from the land.",
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
          name: "landSearch",
          label: "Search Land",
          type: "text",
          icon: Search,
          placeholder: "Green Park, khasra, village...",
          helpText: loadingLands
            ? "Loading lands…"
            : formData.state && formData.district
              ? `${landOptions.length} land(s) in ${formData.district}`
              : "Pick State and District first",
        },
        {
          name: "landId",
          label: "Land Parcel",
          type: "select",
          icon: Landmark,
          options: landOptions,
          required: true,
          helpText:
            "Shows ownership, area, district, remaining capacity. Updates planted count on save.",
        },
        {
          name: "landName",
          label: "Land Name",
          type: "text",
          icon: Landmark,
          disabled: true,
        },
        {
          name: "vidhanSabha",
          label: "Vidhan Sabha (via land)",
          type: "text",
          icon: Landmark,
          disabled: true,
          helpText: "Auto from land’s mapped constituency — not selected manually",
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
          name: "plantedBy",
          label: "Plantation By",
          type: "text",
          icon: User,
          placeholder: "Mitra / volunteer / team name",
        },
      ],
    },
    {
      title: "Owner Details",
      description: "Who this tree is registered to.",
      icon: User,
      fields: [
        {
          name: "userId",
          label: "User ID",
          type: "text",
          icon: Hash,
          required: true,
          helpText:
            "Auto-filled when a matching user is found by mobile search.",
        },
        {
          name: "userName",
          label: "User Name",
          type: "text",
          icon: User,
          required: true,
        },
      ],
    },
    {
      title: "Vehicle & Insurance",
      description:
        "Optional vehicle and insurance linkage for this plantation record.",
      icon: Car,
      fields: [
        {
          name: "vehicleNumber",
          label: "Vehicle Number",
          type: "text",
          icon: Car,
          placeholder: "e.g., MP09ZK5863",
        },
        {
          name: "policyNumber",
          label: "Policy Number",
          type: "text",
          icon: ShieldCheck,
        },
        {
          name: "insuranceStatus",
          label: "Insurance Status",
          type: "select",
          icon: ShieldCheck,
          options: [
            { label: "Active", value: "ACTIVE" },
            { label: "Expired", value: "EXPIRED" },
            { label: "Not Insured", value: "NOT_INSURED" },
          ],
        },
      ],
    },
    {
      title: "Exact Planting Spot",
      description:
        "Optional pin for the tree itself. State/District come from the selected land.",
      icon: MapPin,
      fields: [
        {
          name: "city",
          label: "Village / City",
          type: "text",
          icon: Building2,
          helpText: "Auto-filled from land locality when available",
        },
        {
          name: "location",
          label: "Address / Location",
          type: "text",
          icon: MapPin,
          span: 2,
        },
        {
          name: "latitude",
          label: "Latitude",
          type: "number",
          icon: Navigation,
        },
        {
          name: "longitude",
          label: "Longitude",
          type: "number",
          icon: Navigation,
        },
      ],
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

      <div className="card" style={{ padding: "20px", marginBottom: "16px" }}>
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label>
            Search Owner by Mobile Number{" "}
            <span style={{ color: "red" }}>*</span>
          </label>
          <div style={{ display: "flex", gap: "8px" }}>
            <input
              type="text"
              value={formData.mobile}
              onChange={(e) => handleFieldChange("mobile", e.target.value)}
              placeholder="Enter owner's 10-digit mobile number"
              style={{ flex: 1 }}
            />
            <button
              type="button"
              className="btn-secondary"
              onClick={handleSearchUser}
              disabled={searching}
            >
              <Search size={16} /> {searching ? "Searching..." : "Search"}
            </button>
          </div>
          {searchMessage && <span className="ff-help">{searchMessage}</span>}
        </div>
      </div>

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
    </div>
  );
};

export default TreeForm;
