import React from "react";
import { X, Bell, MessageSquare, Users, MapPinned, ShieldCheck, CalendarClock, UserCog, Hash } from "lucide-react";
import { SmartForm } from "../../components/form/SmartForm";
import type { FormSectionConfig } from "../../components/form/SmartForm";

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

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  editing: boolean;
  formData: NotificationFormData;
  submitting?: boolean;
  error?: string;
  onFieldChange: (name: string, value: any) => void;
  handleSubmit: (e: React.FormEvent) => void;
}

const NotificationModal: React.FC<NotificationModalProps> = ({
  isOpen,
  onClose,
  editing,
  formData,
  submitting,
  error,
  onFieldChange,
  handleSubmit,
}) => {
  if (!isOpen) return null;

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
    <div className="modal-overlay">
      <div className="modal" style={{ width: 640 }}>
        <div className="modal-header">
          <h2>{editing ? "Edit Notification" : "Compose Notification"}</h2>
          <button className="icon-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <SmartForm
          sections={sections}
          formData={formData}
          onFieldChange={onFieldChange}
          onSubmit={handleSubmit}
          submitting={submitting}
          error={error}
          submitLabel={editing ? "Update Notification" : "Add Notification"}
          cancelLabel="Cancel"
          onCancel={onClose}
        />
      </div>
    </div>
  );
};

export default NotificationModal;
