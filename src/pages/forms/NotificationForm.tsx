import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Bell, MessageSquare, Users, MapPinned, ShieldCheck, CalendarClock, UserCog, Hash } from "lucide-react";
import { apiFetch } from "../../utils/apiConfig";
import { SmartForm } from "../../components/form/SmartForm";
import type { FormSectionConfig } from "../../components/form/SmartForm";
import { FormPageHeader } from "../../components/form/FormPageHeader";

export interface NotificationFormData {
  _id?: string;
  notificationTitle: string;
  message: string;
  notificationType: string;
  targetAudience: string;
  locationFilter: string;
  status: string;
  scheduledAt?: string;
  sentBy?: string;
  deliveryCount?: number | "";
}

const emptyForm: NotificationFormData = {
  notificationTitle: "",
  message: "",
  notificationType: "push",
  targetAudience: "All Users",
  locationFilter: "All Locations",
  status: "Draft",
  scheduledAt: "",
  sentBy: "",
  deliveryCount: 0,
};

export const NotificationForm = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const editNotification = location.state?.notification;
  const isEditing = !!editNotification;

  const [formData, setFormData] = useState<NotificationFormData>(
    editNotification
      ? {
          ...emptyForm,
          ...editNotification,
          scheduledAt: editNotification.scheduledAt ? String(editNotification.scheduledAt).slice(0, 10) : "",
          deliveryCount: editNotification.deliveryCount ?? 0,
        }
      : emptyForm
  );

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleFieldChange = (name: string, value: any) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    const { _id, ...rest } = formData;
    const payload: Record<string, any> = { ...rest };
    if (!payload.scheduledAt) delete payload.scheduledAt;
    if (payload.deliveryCount === "" || payload.deliveryCount === undefined) {
      delete payload.deliveryCount;
    }

    try {
      if (isEditing && _id) {
        await apiFetch(`/api/v1/notifications/${_id}`, {
          method: "PATCH",
          body: JSON.stringify(payload),
        });
      } else {
        await apiFetch("/api/v1/notifications", {
          method: "POST",
          body: JSON.stringify(payload),
        });
      }
      navigate("/notifications");
    } catch (err: any) {
      setError(err.message || "Failed to save notification");
    } finally {
      setSubmitting(false);
    }
  };

  const sections: FormSectionConfig[] = [
    {
      title: "Notification Content",
      description: "The message that will be delivered to the target audience.",
      icon: Bell,
      fields: [
        { name: "notificationTitle", label: "Notification Title", type: "text", icon: Bell, required: true, span: 2 },
        { name: "message", label: "Message", type: "textarea", icon: MessageSquare, required: true, span: 2 },
        {
          name: "notificationType",
          label: "Notification Type",
          type: "select",
          icon: Hash,
          options: [
            { label: "Push", value: "push" },
            { label: "SMS", value: "sms" },
            { label: "WhatsApp", value: "whatsapp" },
            { label: "Email", value: "email" },
          ],
          helpText:
            "SMS/WhatsApp go to each recipient's phone number, Email goes to their email address.",
        },
      ],
    },
    {
      title: "Targeting",
      description: "Who should receive this notification, and where.",
      icon: Users,
      fields: [
        {
          name: "targetAudience",
          label: "Target Audience",
          type: "select",
          icon: Users,
          options: [
            { label: "All Users", value: "All Users" },
            { label: "Customers", value: "Customers" },
            { label: "Employees", value: "Employees" },
            { label: "Partners", value: "Partners" },
            { label: "Specific Group", value: "Specific Group" },
          ],
        },
        {
          name: "locationFilter",
          label: "Location Filter",
          type: "select",
          icon: MapPinned,
          options: [
            { label: "All Locations", value: "All Locations" },
            { label: "State Wise", value: "State Wise" },
            { label: "City Wise", value: "City Wise" },
            { label: "Zone Wise", value: "Zone Wise" },
          ],
        },
      ],
    },
    {
      title: "Scheduling & Status",
      icon: CalendarClock,
      fields: [
        {
          name: "status",
          label: "Status",
          type: "select",
          icon: ShieldCheck,
          options: [
            { label: "Draft", value: "Draft" },
            { label: "Scheduled", value: "Scheduled" },
            { label: "Sent", value: "Sent" },
            { label: "Failed", value: "Failed" },
          ],
        },
        {
          name: "scheduledAt",
          label: "Scheduled At",
          type: "date",
          icon: CalendarClock,
          helpText: "Only used when status is Scheduled.",
        },
        { name: "sentBy", label: "Sent By", type: "text", icon: UserCog },
      ],
    },
  ];

  return (
    <div className="dashboard-area">
      <FormPageHeader
        icon={Bell}
        title={isEditing ? "Edit Notification" : "Compose Notification"}
        subtitle="Compose, schedule and send notifications to your audience."
        onBack={() => navigate("/notifications")}
      />

      <div className="card">
        <SmartForm
          sections={sections}
          formData={formData}
          onFieldChange={handleFieldChange}
          onSubmit={handleSubmit}
          submitting={submitting}
          error={error}
          submitLabel={isEditing ? "Update Notification" : "Add Notification"}
          cancelLabel="Cancel"
          onCancel={() => navigate("/notifications")}
        />
      </div>
    </div>
  );
};

export default NotificationForm;
