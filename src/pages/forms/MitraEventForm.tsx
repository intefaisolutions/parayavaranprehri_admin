import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  CalendarDays,
  Clock,
  MapPin,
  Users,
  AlignLeft,
  ToggleLeft,
} from "lucide-react";
import { apiFetch } from "../../utils/apiConfig";
import { SmartForm } from "../../components/form/SmartForm";
import type { FormSectionConfig } from "../../components/form/SmartForm";
import { FormPageHeader } from "../../components/form/FormPageHeader";

export interface MitraEventFormData {
  _id?: string;
  title: string;
  date: string;
  time?: string;
  location: string;
  organizer?: string;
  description?: string;
  isActive?: boolean;
}

const emptyForm: MitraEventFormData = {
  title: "",
  date: "",
  time: "",
  location: "",
  organizer: "Paryavaran Prahri",
  description: "",
  isActive: true,
};

const toDateInputValue = (value?: string) => (value ? value.slice(0, 10) : "");

export const MitraEventForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const editEvent = location.state?.event;
  const isEditing = !!editEvent;

  const [formData, setFormData] = useState<MitraEventFormData>(
    editEvent
      ? {
          ...emptyForm,
          ...editEvent,
          date: toDateInputValue(editEvent.date),
          isActive: editEvent.isActive !== false,
        }
      : emptyForm,
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
    const payload = {
      ...rest,
      time: rest.time || undefined,
      organizer: rest.organizer || undefined,
      description: rest.description || undefined,
      isActive: rest.isActive !== false,
    };

    try {
      if (isEditing && _id) {
        await apiFetch(`/api/v1/mitra-events/${_id}`, {
          method: "PATCH",
          body: JSON.stringify(payload),
        });
      } else {
        await apiFetch("/api/v1/mitra-events", {
          method: "POST",
          body: JSON.stringify(payload),
        });
      }
      navigate("/mitra-events");
    } catch (err: any) {
      setError(err.message || "Failed to save event");
    } finally {
      setSubmitting(false);
    }
  };

  const sections: FormSectionConfig[] = [
    {
      title: "Event Details",
      icon: CalendarDays,
      fields: [
        {
          name: "title",
          label: "Title",
          type: "text",
          icon: CalendarDays,
          required: true,
          span: 2,
        },
        { name: "date", label: "Date", type: "date", icon: CalendarDays, required: true },
        { name: "time", label: "Time", type: "text", icon: Clock, placeholder: "07:00" },
        {
          name: "location",
          label: "Location",
          type: "text",
          icon: MapPin,
          required: true,
          span: 2,
        },
        { name: "organizer", label: "Organizer", type: "text", icon: Users },
        {
          name: "description",
          label: "Description",
          type: "textarea",
          icon: AlignLeft,
          span: 2,
          rows: 4,
        },
        {
          name: "isActive",
          label: "Active",
          type: "boolean",
          icon: ToggleLeft,
        },
      ],
    },
  ];

  return (
    <div className="dashboard-area">
      <FormPageHeader
        icon={CalendarDays}
        title={isEditing ? "Edit Mitra Event" : "Add Mitra Event"}
        subtitle="Events visible to Mitras in the mobile app"
        onBack={() => navigate("/mitra-events")}
      />
      <div className="card">
        <SmartForm
          sections={sections}
          formData={formData}
          onFieldChange={handleFieldChange}
          onSubmit={handleSubmit}
          submitting={submitting}
          error={error}
          submitLabel={isEditing ? "Update Event" : "Add Event"}
          cancelLabel="Cancel"
          onCancel={() => navigate("/mitra-events")}
        />
      </div>
    </div>
  );
};

export default MitraEventForm;
