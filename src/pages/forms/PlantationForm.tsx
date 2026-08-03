import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Hash,
  Landmark,
  Leaf,
  MapPin,
  Phone,
  Search,
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

const emptyForm: PlantationFormData = {
  treeMasterId: "",
  landId: "",
  personId: "",
  personSearch: "",
  userId: "",
  userName: "",
  mobile: "",
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

  // Normalize ObjectId fields if edit payload nested them
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
          return {
            ...prev,
            personId: value,
            userId: "",
            userName: "",
            mobile: "",
          };
        }
        return {
          ...prev,
          personId: value,
          userId: person.personId || person._id,
          userName: person.name || "",
          mobile: person.mobile || "",
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

    setSubmitting(true);
    const payload = {
      treeMasterId: formData.treeMasterId,
      landId: formData.landId,
      personId: formData.personId || undefined,
      userId: formData.userId || undefined,
      userName: formData.userName || undefined,
      mobile: formData.mobile || undefined,
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
        "Select a person already registered in Person Management (Admin / App).",
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
          helpText: "Auto-fills name, mobile and Person ID",
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
    },
  ];

  return (
    <div className="dashboard-area">
      <FormPageHeader
        icon={Sprout}
        title={isEditing ? "Edit Plantation Request" : "New Plantation Request"}
        subtitle="Tree Master → Land → Count → Submit (Pending Approval)"
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
