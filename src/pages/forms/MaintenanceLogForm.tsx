import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Wrench, TreePine, AlignLeft, CalendarDays, User } from "lucide-react";
import { apiFetch } from "../../utils/apiConfig";
import { SmartForm } from "../../components/form/SmartForm";
import type { FormSectionConfig } from "../../components/form/SmartForm";
import { FormPageHeader } from "../../components/form/FormPageHeader";
import { DetailView } from "../../components/view/DetailView";

interface TreeRow {
  _id: string;
  treeId: string;
  treeName?: string;
  species?: string;
}

interface MaintenanceLogFormData {
  _id?: string;
  treeCode: string;
  activity: string;
  remarks?: string;
  loggedAt?: string;
  mitraId?: string;
  createdByName?: string;
  photoUrls?: string[];
  createdAt?: string;
}

const ACTIVITY_OPTIONS = [
  { label: "Watering", value: "Watering" },
  { label: "Fertilizer", value: "Fertilizer" },
  { label: "Pruning", value: "Pruning" },
  { label: "Weeding", value: "Weeding" },
  { label: "Pest Control", value: "Pest Control" },
  { label: "Mulching", value: "Mulching" },
  { label: "Inspection", value: "Inspection" },
  { label: "Other", value: "Other" },
];

const todayLocalDate = () => {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

const emptyForm: MaintenanceLogFormData = {
  treeCode: "",
  activity: "Watering",
  remarks: "",
  loggedAt: todayLocalDate(),
};

const toDateInput = (value?: string) => {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

const formatDateTime = (value?: string) => {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString();
};

const treeLabel = (t: TreeRow) => {
  const name = t.treeName || t.species || "Tree";
  return `${t.treeId} - ${name}`;
};

export const MaintenanceLogForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const viewLog = location.state?.log as MaintenanceLogFormData | undefined;
  const isView =
    location.pathname.includes("/maintenance-logs/view") || !!viewLog;

  const [formData, setFormData] = useState<MaintenanceLogFormData>(
    viewLog
      ? {
          ...emptyForm,
          ...viewLog,
          loggedAt: toDateInput(viewLog.loggedAt || viewLog.createdAt),
        }
      : emptyForm,
  );
  const [trees, setTrees] = useState<TreeRow[]>([]);
  const [loadingTrees, setLoadingTrees] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isView) return;
    setLoadingTrees(true);
    apiFetch<TreeRow[]>("/api/v1/trees")
      .then((list) => {
        const items = (Array.isArray(list) ? list : []).filter((t) => t.treeId);
        items.sort((a, b) =>
          String(a.treeId).localeCompare(String(b.treeId), undefined, {
            numeric: true,
          }),
        );
        setTrees(items);
      })
      .catch(() => setTrees([]))
      .finally(() => setLoadingTrees(false));
  }, [isView]);

  const treeOptions = useMemo(() => {
    const opts = trees.map((t) => ({
      label: treeLabel(t),
      value: t.treeId,
    }));
    if (
      formData.treeCode &&
      !opts.some((o) => o.value === formData.treeCode)
    ) {
      opts.unshift({
        label: formData.treeCode,
        value: formData.treeCode,
      });
    }
    return opts;
  }, [trees, formData.treeCode]);

  const handleFieldChange = (name: string, value: any) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      await apiFetch("/api/v1/maintenance-logs", {
        method: "POST",
        body: JSON.stringify({
          treeCode: formData.treeCode,
          activity: formData.activity,
          remarks: formData.remarks || undefined,
          loggedAt: formData.loggedAt
            ? new Date(formData.loggedAt).toISOString()
            : undefined,
        }),
      });
      navigate("/maintenance-logs");
    } catch (err: any) {
      setError(err.message || "Failed to save maintenance log");
    } finally {
      setSubmitting(false);
    }
  };

  if (isView) {
    return (
      <div className="dashboard-area">
        <DetailView
          title="Maintenance Log"
          subtitle="Field activity details"
          onBack={() => navigate("/maintenance-logs")}
          headline={formData.activity || "Maintenance"}
          subheadline={
            formData.treeCode
              ? `Tree ${formData.treeCode}`
              : "Tree care activity from the field"
          }
          badges={[
            { label: formData.activity || "Activity", tone: "info" },
          ]}
          meta={[
            {
              label: "Tree Code",
              value: formData.treeCode,
              icon: TreePine,
            },
            {
              label: "Logged At",
              value: formatDateTime(formData.loggedAt || formData.createdAt),
              icon: CalendarDays,
            },
            {
              label: "Logged By",
              value: formData.createdByName || "—",
              icon: User,
            },
            {
              label: "Mitra ID",
              value: formData.mitraId || "—",
              icon: AlignLeft,
            },
          ]}
          sections={[
            {
              title: "Activity Details",
              icon: Wrench,
              fields: [
                {
                  label: "Activity",
                  value: formData.activity,
                  icon: Wrench,
                },
                {
                  label: "Tree Code",
                  value: formData.treeCode,
                  icon: TreePine,
                },
                {
                  label: "Remarks",
                  value: formData.remarks || "—",
                  icon: AlignLeft,
                  span: 2,
                },
              ],
            },
          ]}
        >
          {formData.photoUrls && formData.photoUrls.length > 0 && (
            <div className="detail-panel">
              <div className="detail-panel__head">
                <h3 className="detail-panel__title">Photos</h3>
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))",
                  gap: 10,
                }}
              >
                {formData.photoUrls.map((url) => (
                  <a
                    key={url}
                    href={url}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      display: "block",
                      borderRadius: 12,
                      overflow: "hidden",
                      border: "1px solid var(--border-color)",
                      aspectRatio: "1",
                    }}
                  >
                    <img
                      src={url}
                      alt="Log photo"
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                  </a>
                ))}
              </div>
            </div>
          )}
        </DetailView>
      </div>
    );
  }

  const sections: FormSectionConfig[] = [
    {
      title: "Maintenance Log",
      icon: Wrench,
      fields: [
        {
          name: "treeCode",
          label: loadingTrees ? "Tree Code (loading…)" : "Tree Code",
          type: "select",
          icon: TreePine,
          required: true,
          disabled: loadingTrees || treeOptions.length === 0,
          options: treeOptions,
        },
        {
          name: "activity",
          label: "Activity",
          type: "select",
          icon: Wrench,
          required: true,
          options: ACTIVITY_OPTIONS,
        },
        {
          name: "remarks",
          label: "Remarks",
          type: "textarea",
          icon: AlignLeft,
          span: 2,
          rows: 4,
        },
        {
          name: "loggedAt",
          label: "Logged At (optional)",
          type: "date",
          icon: CalendarDays,
        },
      ],
    },
  ];

  return (
    <div className="dashboard-area">
      <FormPageHeader
        icon={Wrench}
        title="Add Maintenance Log"
        subtitle="Tree care activity from the field"
        onBack={() => navigate("/maintenance-logs")}
      />
      <div className="card">
        <SmartForm
          sections={sections}
          formData={formData}
          onFieldChange={handleFieldChange}
          onSubmit={handleSubmit}
          submitting={submitting}
          error={error}
          submitLabel="Save Log"
          cancelLabel="Cancel"
          onCancel={() => navigate("/maintenance-logs")}
        />
      </div>
    </div>
  );
};

export default MaintenanceLogForm;
