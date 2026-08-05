import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Car,
  Hash,
  Landmark,
  Leaf,
  Loader2,
  MapPin,
  Phone,
  Search,
  ShieldCheck,
  Sprout,
  User,
} from "lucide-react";
import { apiFetch } from "../../utils/apiConfig";
import {
  getDistrictOptions,
  getStateOptions,
} from "../../utils/indiaLocations";
import { SmartForm } from "../../components/form/SmartForm";
import type { FormSectionConfig } from "../../components/form/SmartForm";
import { FormPageHeader } from "../../components/form/FormPageHeader";

interface PlantationFormData {
  _id?: string;
  treeMasterId: string;
  landId: string;
  personId: string;
  personSearch: string;
  userId: string;
  userName: string;
  mobile: string;
  vehicleNumber: string;
  policyNumber: string;
  insuranceStatus: string;
  plantationDate: string;
  count: number | "";
  images: string[];
  state: string;
  district: string;
  latitude: number | "";
  longitude: number | "";
  remarks: string;
  status?: string;
  treeMasterName?: string;
  landName?: string;
}

type OwnerVehicle = {
  registrationNumber?: string;
  vehicleType?: string;
  vehicleModel?: string;
  isInsured?: boolean;
  policyStatus?: string;
  policyNumber?: string | null;
};

const emptyForm: PlantationFormData = {
  treeMasterId: "",
  landId: "",
  personId: "",
  personSearch: "",
  userId: "",
  userName: "",
  mobile: "",
  vehicleNumber: "",
  policyNumber: "",
  insuranceStatus: "NOT_INSURED",
  plantationDate: new Date().toISOString().split("T")[0],
  count: 1,
  images: [],
  state: "Madhya Pradesh",
  district: "",
  latitude: "",
  longitude: "",
  remarks: "",
};

function normalizePersonsResponse(data: any): any[] {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.items)) return data.items;
  return [];
}

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

export const PlantationForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const editEntry = location.state?.plantation;
  const isEditing = !!editEntry;

  const [formData, setFormData] = useState<PlantationFormData>(
    editEntry
      ? {
          ...emptyForm,
          ...editEntry,
          treeMasterId: editEntry.treeMasterId || "",
          landId: editEntry.landId || "",
          personId:
            typeof editEntry.personId === "object"
              ? editEntry.personId?._id || ""
              : editEntry.personId || "",
          vehicleNumber: editEntry.vehicleNumber || "",
          policyNumber: editEntry.policyNumber || "",
          insuranceStatus: editEntry.insuranceStatus || "NOT_INSURED",
          plantationDate: editEntry.plantationDate
            ? new Date(editEntry.plantationDate).toISOString().split("T")[0]
            : emptyForm.plantationDate,
          count: editEntry.count ?? 1,
          images: editEntry.images || [],
          latitude: editEntry.latitude ?? "",
          longitude: editEntry.longitude ?? "",
        }
      : emptyForm,
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [loadingPersons, setLoadingPersons] = useState(false);
  const [loadingVehicles, setLoadingVehicles] = useState(false);
  const [vehicleMessage, setVehicleMessage] = useState("");
  const [ownerVehicles, setOwnerVehicles] = useState<OwnerVehicle[]>([]);
  const [treeOptions, setTreeOptions] = useState<
    { label: string; value: string; meta?: any }[]
  >([]);
  const [landOptions, setLandOptions] = useState<
    { label: string; value: string; meta?: any }[]
  >([]);
  const [personOptions, setPersonOptions] = useState<
    { label: string; value: string; meta?: any }[]
  >([]);

  useEffect(() => {
    apiFetch<any[]>("/api/v1/tree-masters?isActive=true")
      .then((list) => {
        const items = Array.isArray(list) ? list : [];
        setTreeOptions(
          items.map((t) => ({
            label: `${t.name}${
              t.availability === "OUT_OF_STOCK" ? " (Out of Stock)" : ""
            } · O₂ ${t.oxygenRateKgPerYear ?? 0} kg/yr`,
            value: t._id,
            meta: t,
          })),
        );
      })
      .catch(() => setTreeOptions([]));
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoadingPersons(true);
      const params = new URLSearchParams({
        limit: "100",
        sortBy: "name",
        sortOrder: "asc",
      });
      if (formData.personSearch.trim()) {
        params.set("search", formData.personSearch.trim());
      }
      apiFetch<any>(`/api/v1/persons?${params.toString()}`)
        .then((data) => {
          const items = normalizePersonsResponse(data);
          setPersonOptions(
            items.map((p: any) => ({
              label: `${p.name} · ${p.mobile}${
                p.personId ? ` · ${p.personId}` : ""
              }${p.city ? ` · ${p.city}` : ""}`,
              value: p._id,
              meta: p,
            })),
          );
        })
        .catch(() => setPersonOptions([]))
        .finally(() => setLoadingPersons(false));
    }, 250);
    return () => clearTimeout(timer);
  }, [formData.personSearch]);

  useEffect(() => {
    if (!formData.state || !formData.district) {
      setLandOptions([]);
      return;
    }
    const params = new URLSearchParams({
      state: formData.state,
      district: formData.district,
    });
    apiFetch<any[]>(`/api/v1/lands?${params}`)
      .then((list) => {
        const items = Array.isArray(list) ? list : [];
        setLandOptions(
          items.map((l) => ({
            label: `${l.landName} · rem ${l.availableCapacity ?? 0}`,
            value: l._id,
            meta: l,
          })),
        );
      })
      .catch(() => setLandOptions([]));
  }, [formData.state, formData.district]);

  useEffect(() => {
    if (!editEntry) return;
    setFormData((prev) => ({
      ...prev,
      treeMasterId:
        typeof editEntry.treeMasterId === "object"
          ? editEntry.treeMasterId?._id || prev.treeMasterId
          : String(editEntry.treeMasterId || prev.treeMasterId),
      landId:
        typeof editEntry.landId === "object"
          ? editEntry.landId?._id || prev.landId
          : String(editEntry.landId || prev.landId),
    }));
  }, [editEntry]);

  const loadPersonVehicles = async (
    personMongoId: string,
    { resetSelection }: { resetSelection: boolean },
  ) => {
    if (!personMongoId) {
      setOwnerVehicles([]);
      setVehicleMessage("");
      return;
    }
    setLoadingVehicles(true);
    setVehicleMessage("");
    try {
      const data = await apiFetch<{
        vehicles?: any[];
        message?: string;
      }>(`/api/v1/persons/${personMongoId}/vehicles`);
      const vehicles = (Array.isArray(data?.vehicles) ? data.vehicles : []).map(
        normalizeOwnerVehicle,
      );
      setOwnerVehicles(vehicles);
      setVehicleMessage(
        data?.message ||
          (vehicles.length
            ? `${vehicles.length} vehicle(s) — select one with Active policy`
            : "No vehicles found for this person"),
      );

      if (!resetSelection) return;

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
      setVehicleMessage(
        err?.message || "Failed to load vehicles for this person",
      );
      if (resetSelection) {
        setFormData((prev) => ({
          ...prev,
          ...vehicleFieldsFrom(null),
        }));
      }
    } finally {
      setLoadingVehicles(false);
    }
  };

  // Edit mode: load vehicles without wiping saved selection
  useEffect(() => {
    if (!isEditing || !formData.personId) return;
    void loadPersonVehicles(formData.personId, { resetSelection: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEditing, formData.personId]);

  const selectOwnerVehicle = (registrationNumber: string) => {
    const vehicle =
      ownerVehicles.find((v) => v.registrationNumber === registrationNumber) ||
      null;
    setFormData((prev) => ({
      ...prev,
      ...vehicleFieldsFrom(vehicle),
    }));
  };

  const handleFieldChange = (name: string, value: any) => {
    setFormData((prev) => {
      if (name === "state") {
        return { ...prev, state: value, district: "", landId: "" };
      }
      if (name === "district") {
        return { ...prev, district: value, landId: "" };
      }
      if (name === "landId") {
        const land = landOptions.find((l) => l.value === value)?.meta;
        return {
          ...prev,
          landId: value,
          landName: land?.landName,
          latitude: land?.latitude ?? prev.latitude,
          longitude: land?.longitude ?? prev.longitude,
        };
      }
      if (name === "treeMasterId") {
        const tree = treeOptions.find((t) => t.value === value)?.meta;
        return {
          ...prev,
          treeMasterId: value,
          treeMasterName: tree?.name,
        };
      }
      if (name === "personId") {
        const person = personOptions.find((p) => p.value === value)?.meta;
        if (!person) {
          setOwnerVehicles([]);
          setVehicleMessage("");
          return {
            ...prev,
            personId: value,
            userId: "",
            userName: "",
            mobile: "",
            ...vehicleFieldsFrom(null),
          };
        }
        void loadPersonVehicles(value, { resetSelection: true });
        return {
          ...prev,
          personId: value,
          userId: person.personId || person._id,
          userName: person.name || "",
          mobile: person.mobile || "",
          ...vehicleFieldsFrom(null),
        };
      }
      return { ...prev, [name]: value };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!formData.treeMasterId) {
      setError("Select a tree from the catalog");
      return;
    }
    if (!formData.landId) {
      setError("Select a land parcel");
      return;
    }
    if (!formData.plantationDate) {
      setError("Plantation date is required");
      return;
    }
    if (formData.count === "" || Number(formData.count) < 1) {
      setError("Tree count must be at least 1");
      return;
    }
    if (!formData.personId) {
      setError("Select a registered person from Person Management");
      return;
    }
    if (ownerVehicles.length === 0) {
      setError(
        "No vehicle found for this person. Tree plantation requires a linked vehicle.",
      );
      return;
    }
    if (!formData.vehicleNumber.trim()) {
      setError("Select a vehicle from the person’s vehicle list");
      return;
    }
    if (formData.insuranceStatus !== "ACTIVE") {
      setError(
        "Selected vehicle does not have an Active policy. Only Active-policy vehicles can plant trees.",
      );
      return;
    }

    setSubmitting(true);
    const payload = {
      treeMasterId: formData.treeMasterId,
      landId: formData.landId,
      personId: formData.personId || undefined,
      userId: formData.userId || undefined,
      userName: formData.userName || undefined,
      mobile: formData.mobile || undefined,
      vehicleNumber: formData.vehicleNumber || undefined,
      policyNumber: formData.policyNumber || undefined,
      insuranceStatus: formData.insuranceStatus || undefined,
      plantationDate: formData.plantationDate,
      count: Number(formData.count),
      images: formData.images || [],
      latitude:
        formData.latitude === "" ? undefined : Number(formData.latitude),
      longitude:
        formData.longitude === "" ? undefined : Number(formData.longitude),
      remarks: formData.remarks || undefined,
    };

    try {
      if (isEditing && editEntry._id) {
        await apiFetch(`/api/v1/plantations/${editEntry._id}`, {
          method: "PATCH",
          body: JSON.stringify(payload),
        });
      } else {
        await apiFetch("/api/v1/plantations", {
          method: "POST",
          body: JSON.stringify(payload),
        });
      }
      navigate("/plantations");
    } catch (err: any) {
      setError(err.message || "Failed to save plantation");
    } finally {
      setSubmitting(false);
    }
  };

  const sections: FormSectionConfig[] = [
    {
      title: "Select Tree (Catalog)",
      description: "Pick from Tree Master — unavailable trees cannot be planted.",
      icon: Leaf,
      fields: [
        {
          name: "treeMasterId",
          label: "Tree",
          type: "select",
          icon: Leaf,
          required: true,
          options: treeOptions,
          span: 2,
        },
        {
          name: "count",
          label: "Tree Count",
          type: "number",
          icon: Hash,
          required: true,
          min: 1,
        },
        {
          name: "plantationDate",
          label: "Plantation Date",
          type: "date",
          icon: Sprout,
          required: true,
        },
      ],
    },
    {
      title: "Select Land",
      icon: Landmark,
      fields: [
        {
          name: "state",
          label: "State",
          type: "select",
          icon: MapPin,
          options: getStateOptions(),
          required: true,
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
          name: "landId",
          label: "Land Parcel",
          type: "select",
          icon: Landmark,
          required: true,
          options: landOptions,
          span: 2,
        },
      ],
    },
    {
      title: "Planter / User",
      description:
        "1) Select registered person → 2) pick a vehicle with Active policy → then submit.",
      icon: User,
      fields: [
        {
          name: "personSearch",
          label: "Search Registered Person",
          type: "text",
          icon: Search,
          placeholder: "Name, mobile, Person ID…",
          helpText: loadingPersons
            ? "Loading persons…"
            : `${personOptions.length} registered person(s) shown`,
          span: 2,
        },
        {
          name: "personId",
          label: "Registered Person",
          type: "select",
          icon: User,
          required: true,
          options: personOptions,
          span: 2,
          helpText: "Auto-fills name, mobile and loads vehicles",
        },
        {
          name: "userName",
          label: "User Name",
          type: "text",
          icon: User,
          disabled: true,
        },
        {
          name: "mobile",
          label: "Mobile",
          type: "tel",
          icon: Phone,
          disabled: true,
        },
        {
          name: "userId",
          label: "Person ID",
          type: "text",
          icon: Hash,
          disabled: true,
        },
      ],
    },
    {
      title: "Vehicle & Policy",
      description:
        "Person ke saare vehicles yahan dikhenge. Sirf Active policy wale vehicle se tree plant ho sakta hai. Multiple ho to select karo.",
      icon: Car,
      fields: [
        {
          name: "vehicleNumber",
          label: "Selected Vehicle",
          type: "text",
          icon: Car,
          disabled: true,
          helpText: formData.vehicleNumber
            ? "Selected from list below"
            : "Pick a vehicle from the list below",
        },
        {
          name: "policyNumber",
          label: "Policy Number",
          type: "text",
          icon: ShieldCheck,
          disabled: true,
        },
        {
          name: "insuranceStatus",
          label: "Policy Status",
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
          name: "images",
          label: "Plantation Images",
          type: "gallery",
          icon: Leaf,
          uploadCategory: "trees",
          span: 2,
        },
        {
          name: "remarks",
          label: "Remarks",
          type: "textarea",
          icon: Hash,
          span: 2,
        },
      ],
      customContent: (
        <div style={{ marginTop: 8 }}>
          {!formData.personId ? (
            <p style={{ margin: 0, fontSize: 13, color: "var(--text-secondary)" }}>
              Pehle Registered Person select karo — phir vehicles load honge.
            </p>
          ) : loadingVehicles ? (
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
              {vehicleMessage ||
                "Is person pe koi vehicle nahi mila. Tree plantation ke liye vehicle + Active policy zaroori hai."}
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
                {vehicleMessage ||
                  `${ownerVehicles.length} vehicle(s) — Active policy wala select karo`}
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
                  const status = mapInsuranceStatus(v);
                  const canPlant = status === "ACTIVE";
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
                          ? canPlant
                            ? "2px solid #166534"
                            : "2px solid #c2410c"
                          : "1px solid var(--border-color)",
                        background: selected
                          ? canPlant
                            ? "rgba(22, 101, 52, 0.08)"
                            : "rgba(255, 61, 0, 0.06)"
                          : "var(--card-bg, #fff)",
                        cursor: "pointer",
                        display: "grid",
                        gap: 4,
                        opacity: canPlant ? 1 : 0.92,
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
                          {status === "ACTIVE"
                            ? "ACTIVE POLICY"
                            : status === "EXPIRED"
                              ? "EXPIRED"
                              : "NO POLICY"}
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
                      {!canPlant ? (
                        <div
                          style={{
                            fontSize: 11,
                            color: "#c2410c",
                            fontWeight: 600,
                          }}
                        >
                          Is vehicle se tree plant nahi ho sakta — Active policy
                          chahiye
                        </div>
                      ) : null}
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="dashboard-area">
      <FormPageHeader
        icon={Sprout}
        title={isEditing ? "Edit Plantation Request" : "New Plantation Request"}
        subtitle="Person → Vehicle (Active policy) → Tree → Land → Submit"
        onBack={() => navigate("/plantations")}
      />
      {formData.status && (
        <div className="card" style={{ marginBottom: 16, padding: 12 }}>
          Status: <strong>{formData.status}</strong>
        </div>
      )}
      <div className="card">
        <SmartForm
          sections={sections}
          formData={formData}
          onFieldChange={handleFieldChange}
          onSubmit={handleSubmit}
          submitting={submitting}
          error={error}
          submitLabel={isEditing ? "Update Request" : "Submit for Approval"}
          cancelLabel="Cancel"
          onCancel={() => navigate("/plantations")}
        />
      </div>
    </div>
  );
};

export default PlantationForm;
