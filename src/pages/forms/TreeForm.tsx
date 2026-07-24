import React, { useState } from "react";
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
} from "lucide-react";
import { apiFetch } from "../../utils/apiConfig";
import { SmartForm } from "../../components/form/SmartForm";
import type { FormSectionConfig } from "../../components/form/SmartForm";
import { FormPageHeader } from "../../components/form/FormPageHeader";

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
  remarks: "",
  image: "",
};

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
          plantedDate: toDateInputValue(editTree.plantedDate) || emptyForm.plantedDate,
          latitude: editTree.latitude ?? "",
          longitude: editTree.longitude ?? "",
          height: editTree.height ?? "",
        }
      : emptyForm
  );

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [searching, setSearching] = useState(false);
  const [searchMessage, setSearchMessage] = useState("");

  const handleFieldChange = (name: string, value: any) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
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
        `/api/v1/users?search=${encodeURIComponent(mobile)}&limit=5`
      );
      const items = result?.items || [];
      const match = items.find((u: any) => u.phone === mobile) || items[0];
      if (match) {
        const fullName = [match.firstName, match.lastName].filter(Boolean).join(" ");
        setFormData((prev) => ({
          ...prev,
          userId: match._id,
          userName: fullName || prev.userName,
        }));
        setSearchMessage(`Matched user: ${fullName || match.email || match._id}`);
      } else {
        setSearchMessage("No matching user found. Enter User ID and Name manually below.");
      }
    } catch (err: any) {
      setSearchMessage(err.message || "Search failed. Enter User ID and Name manually below.");
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
      setError("User ID and User Name are required — search by mobile or enter manually");
      return;
    }

    setSubmitting(true);

    const { _id, treeId, ...rest } = formData as any;
    const payload = {
      ...rest,
      latitude: formData.latitude === "" ? undefined : Number(formData.latitude),
      longitude: formData.longitude === "" ? undefined : Number(formData.longitude),
      height: formData.height === "" ? undefined : Number(formData.height),
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
      description: "Identity and health information for this tree.",
      icon: Leaf,
      fields: [
        { name: "treeName", label: "Tree Name", type: "text", icon: Leaf, required: true, placeholder: "e.g., Neem" },
        { name: "species", label: "Species", type: "text", icon: Sprout, placeholder: "Local species name" },
        { name: "scientificName", label: "Scientific Name", type: "text", icon: Sprout, placeholder: "e.g., Azadirachta indica" },
        { name: "plantedDate", label: "Plantation Date", type: "date", icon: Hash },
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
        { name: "height", label: "Height (m)", type: "number", icon: Ruler },
        { name: "image", label: "Tree Image", type: "image", icon: Leaf, uploadCategory: "trees", span: 2 },
        { name: "remarks", label: "Remarks", type: "textarea", icon: StickyNote, span: 2, placeholder: "Any additional details or observations..." },
      ],
    },
    {
      title: "Owner Details",
      description: "Who this tree is registered to.",
      icon: User,
      fields: [
        { name: "userId", label: "User ID", type: "text", icon: Hash, required: true, helpText: "Auto-filled when a matching user is found by mobile search." },
        { name: "userName", label: "User Name", type: "text", icon: User, required: true },
        { name: "plantedBy", label: "Planted By", type: "text", icon: User, placeholder: "Mitra / volunteer name" },
      ],
    },
    {
      title: "Vehicle & Insurance",
      description: "Optional vehicle and insurance linkage for this plantation record.",
      icon: Car,
      fields: [
        { name: "vehicleNumber", label: "Vehicle Number", type: "text", icon: Car, placeholder: "e.g., MP09ZK5863" },
        { name: "policyNumber", label: "Policy Number", type: "text", icon: ShieldCheck },
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
      title: "Location",
      description: "Where this tree was planted.",
      icon: MapPin,
      fields: [
        { name: "state", label: "State", type: "text", icon: Building2 },
        { name: "district", label: "District", type: "text", icon: Landmark },
        { name: "city", label: "City", type: "text", icon: Building2 },
        { name: "location", label: "Address / Location", type: "text", icon: MapPin, span: 2 },
        { name: "latitude", label: "Latitude", type: "number", icon: Navigation },
        { name: "longitude", label: "Longitude", type: "number", icon: Navigation },
      ],
    },
  ];

  return (
    <div className="dashboard-area">
      <FormPageHeader
        icon={Leaf}
        title={isEditing ? "Edit Tree" : "Register Tree"}
        subtitle="Provide the details of the tree planted, its owner, and its location."
        onBack={() => navigate("/trees")}
      />

      <div className="card" style={{ padding: "20px", marginBottom: "16px" }}>
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label>
            Search Owner by Mobile Number <span style={{ color: "red" }}>*</span>
          </label>
          <div style={{ display: "flex", gap: "8px" }}>
            <input
              type="text"
              value={formData.mobile}
              onChange={(e) => handleFieldChange("mobile", e.target.value)}
              placeholder="Enter owner's 10-digit mobile number"
              style={{ flex: 1 }}
            />
            <button type="button" className="btn-secondary" onClick={handleSearchUser} disabled={searching}>
              <Search size={16} /> {searching ? "Searching..." : "Search"}
            </button>
          </div>
          {searchMessage && <span className="ff-help">{searchMessage}</span>}
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
