import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { AlignLeft, Leaf, Sparkles, User } from "lucide-react";
import { apiFetch } from "../../utils/apiConfig";
import { SmartForm } from "../../components/form/SmartForm";
import type { FormSectionConfig } from "../../components/form/SmartForm";
import { FormPageHeader } from "../../components/form/FormPageHeader";

interface ReviewFormData {
  _id?: string;
  requestId?: string;
  userName?: string;
  mobile?: string;
  email?: string;
  district?: string;
  state?: string;
  rashiName?: string;
  rashiNameHindi?: string;
  recommendedTree?: string;
  scientificName?: string;
  localName?: string;
  treeDescription?: string;
  status: string;
  rejectionReason?: string;
  remarks?: string;
}

export const RashiPlantRequestReviewForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const request = location.state?.request as ReviewFormData | undefined;

  const [formData, setFormData] = useState<ReviewFormData>({
    ...request,
    status: request?.status || "PENDING",
    rejectionReason: request?.rejectionReason || "",
    remarks: request?.remarks || "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!request?._id) navigate("/rashi-plant-requests");
  }, [request?._id, navigate]);

  if (!request?._id) return null;

  const handleFieldChange = (name: string, value: any) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.status === "PENDING") {
      setError("Select Approve, Reject, or Completed to update.");
      return;
    }
    if (formData.status === "REJECTED" && !formData.rejectionReason?.trim()) {
      setError("Rejection reason is required.");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      await apiFetch(`/api/v1/rashi-plant-requests/${request._id}/review`, {
        method: "PATCH",
        body: JSON.stringify({
          status: formData.status,
          rejectionReason: formData.rejectionReason || undefined,
          remarks: formData.remarks || undefined,
        }),
      });
      navigate("/rashi-plant-requests");
    } catch (err: any) {
      setError(err.message || "Failed to update request");
    } finally {
      setSubmitting(false);
    }
  };

  const sections: FormSectionConfig[] = [
    {
      title: "User Details",
      icon: User,
      fields: [
        {
          name: "userName",
          label: "Name",
          type: "text",
          icon: User,
          disabled: true,
        },
        {
          name: "mobile",
          label: "Mobile",
          type: "text",
          icon: AlignLeft,
          disabled: true,
        },
        {
          name: "email",
          label: "Email",
          type: "text",
          icon: AlignLeft,
          disabled: true,
        },
        {
          name: "district",
          label: "District",
          type: "text",
          icon: AlignLeft,
          disabled: true,
        },
        {
          name: "state",
          label: "State",
          type: "text",
          icon: AlignLeft,
          disabled: true,
        },
      ],
    },
    {
      title: "Rashi & Sacred Tree",
      icon: Sparkles,
      fields: [
        {
          name: "rashiName",
          label: "Rashi",
          type: "text",
          icon: Sparkles,
          disabled: true,
        },
        {
          name: "rashiNameHindi",
          label: "Rashi (Hindi)",
          type: "text",
          icon: Sparkles,
          disabled: true,
        },
        {
          name: "recommendedTree",
          label: "Sacred Tree",
          type: "text",
          icon: Leaf,
          disabled: true,
        },
        {
          name: "scientificName",
          label: "Scientific Name",
          type: "text",
          icon: Leaf,
          disabled: true,
        },
        {
          name: "localName",
          label: "Local Name",
          type: "text",
          icon: Leaf,
          disabled: true,
        },
        {
          name: "treeDescription",
          label: "Tree Description",
          type: "textarea",
          icon: AlignLeft,
          disabled: true,
          span: 2,
        },
      ],
    },
    {
      title: "Review",
      icon: AlignLeft,
      fields: [
        {
          name: "status",
          label: "Status",
          type: "select",
          icon: AlignLeft,
          required: true,
          options: [
            { label: "Pending", value: "PENDING" },
            { label: "Approved", value: "APPROVED" },
            { label: "Rejected", value: "REJECTED" },
            { label: "Completed", value: "COMPLETED" },
          ],
        },
        {
          name: "rejectionReason",
          label: "Rejection Reason",
          type: "textarea",
          icon: AlignLeft,
          span: 2,
        },
        {
          name: "remarks",
          label: "Admin Remarks",
          type: "textarea",
          icon: AlignLeft,
          span: 2,
        },
      ],
    },
  ];

  return (
    <div className="dashboard-area">
      <FormPageHeader
        icon={Sparkles}
        title={`Review Request ${request.requestId || ""}`}
        subtitle="User, Rashi and sacred tree from the mobile app"
        onBack={() => navigate("/rashi-plant-requests")}
      />
      <div className="card">
        <SmartForm
          sections={sections}
          formData={formData}
          onFieldChange={handleFieldChange}
          onSubmit={handleSubmit}
          submitting={submitting}
          error={error}
          submitLabel="Save Review"
          cancelLabel="Cancel"
          onCancel={() => navigate("/rashi-plant-requests")}
        />
      </div>
    </div>
  );
};

export default RashiPlantRequestReviewForm;
