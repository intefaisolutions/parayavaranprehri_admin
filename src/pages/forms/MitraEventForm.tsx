 import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  CalendarDays,
  Clock,
  MapPin,
  Users,
  AlignLeft,
  ToggleLeft,
  Video,
  Globe,
  Link,
  Lock,
  Building,
  Hash,
} from "lucide-react";
import { apiFetch } from "../../utils/apiConfig";
import { SmartForm } from "../../components/form/SmartForm";
import type { FormSectionConfig } from "../../components/form/SmartForm";
import { FormPageHeader } from "../../components/form/FormPageHeader";

export interface MitraEventFormData {
  _id?: string;
  eventType: "Offline" | "Online" | "Hybrid";
  title: string;
  date: string;
  time?: string;
  endTime?: string;
  location?: string;
  organizer?: string;
  description?: string;
  offlineDetails_venue?: string;
  offlineDetails_address?: string;
  offlineDetails_city?: string;
  onlineDetails_platform?: string;
  onlineDetails_meetingUrl?: string;
  onlineDetails_meetingId?: string;
  onlineDetails_passcode?: string;
  registrationRequired?: boolean;
  registrationDeadline?: string;
  bannerImage?: string;
  isActive?: boolean;
}

const emptyForm: MitraEventFormData = {
  eventType: "Offline",
  title: "",
  date: "",
  time: "",
  endTime: "",
  location: "",
  organizer: "Paryavaran Prahri",
  description: "",
  offlineDetails_venue: "",
  offlineDetails_address: "",
  offlineDetails_city: "",
  onlineDetails_platform: "Google Meet",
  onlineDetails_meetingUrl: "",
  onlineDetails_meetingId: "",
  onlineDetails_passcode: "",
  registrationRequired: false,
  registrationDeadline: "",
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
          eventType: editEvent.eventType || "Offline",
          date: toDateInputValue(editEvent.date),
          registrationDeadline: toDateInputValue(editEvent.registrationDeadline),
          isActive: editEvent.isActive !== false,
          offlineDetails_venue: editEvent.offlineDetails?.venue || "",
          offlineDetails_address: editEvent.offlineDetails?.address || "",
          offlineDetails_city: editEvent.offlineDetails?.city || "",
          onlineDetails_platform: editEvent.onlineDetails?.platform || "Google Meet",
          onlineDetails_meetingUrl: editEvent.onlineDetails?.meetingUrl || "",
          onlineDetails_meetingId: editEvent.onlineDetails?.meetingId || "",
          onlineDetails_passcode: editEvent.onlineDetails?.passcode || "",
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

    const { 
      _id, 
      offlineDetails_venue,
      offlineDetails_address,
      offlineDetails_city,
      onlineDetails_platform,
      onlineDetails_meetingUrl,
      onlineDetails_meetingId,
      onlineDetails_passcode,
      ...rest 
    } = formData;
    
    const isOffline = rest.eventType === "Offline" || rest.eventType === "Hybrid";
    const isOnline = rest.eventType === "Online" || rest.eventType === "Hybrid";

    const payload = {
      ...rest,
      time: rest.time || undefined,
      endTime: rest.endTime || undefined,
      organizer: rest.organizer || undefined,
      description: rest.description || undefined,
      offlineDetails: isOffline ? {
        venue: offlineDetails_venue,
        address: offlineDetails_address,
        city: offlineDetails_city,
      } : undefined,
      onlineDetails: isOnline ? {
        platform: onlineDetails_platform,
        meetingUrl: onlineDetails_meetingUrl,
        meetingId: onlineDetails_meetingId,
        passcode: onlineDetails_passcode,
      } : undefined,
      registrationDeadline: rest.registrationRequired && rest.registrationDeadline ? rest.registrationDeadline : undefined,
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
      title: "Event Basics",
      icon: CalendarDays,
      fields: [
        {
          name: "eventType",
          label: "Event Type",
          type: "select",
          icon: Globe,
          required: true,
          options: [
            { label: "Offline", value: "Offline" },
            { label: "Online", value: "Online" },
            { label: "Hybrid", value: "Hybrid" },
          ],
          span: 2,
        },
        {
          name: "title",
          label: "Event Title",
          type: "text",
          icon: CalendarDays,
          required: true,
          span: 2,
        },
        { name: "date", label: "Date", type: "date", icon: CalendarDays, required: true },
        { name: "time", label: "Start Time", type: "text", icon: Clock, placeholder: "07:00" },
        { name: "endTime", label: "End Time", type: "text", icon: Clock, placeholder: "10:00" },
        { name: "organizer", label: "Organizer", type: "text", icon: Users },
        {
          name: "description",
          label: "Description",
          type: "textarea",
          icon: AlignLeft,
          span: 2,
          rows: 4,
        },
      ],
    },
  ];

  if (formData.eventType === "Offline" || formData.eventType === "Hybrid") {
    sections.push({
      title: "Offline Details",
      icon: MapPin,
      fields: [
        {
          name: "offlineDetails_venue",
          label: "Venue / Location Name",
          type: "text",
          icon: Building,
          required: formData.eventType === "Offline" || formData.eventType === "Hybrid",
        },
        {
          name: "offlineDetails_city",
          label: "City / District",
          type: "text",
          icon: MapPin,
        },
        {
          name: "offlineDetails_address",
          label: "Full Address",
          type: "text",
          icon: MapPin,
          span: 2,
        },
      ],
    });
  }

  if (formData.eventType === "Online" || formData.eventType === "Hybrid") {
    sections.push({
      title: "Online Details",
      icon: Video,
      fields: [
        {
          name: "onlineDetails_platform",
          label: "Meeting Platform",
          type: "select",
          icon: Video,
          options: [
            { label: "Google Meet", value: "Google Meet" },
            { label: "Zoom", value: "Zoom" },
            { label: "Microsoft Teams", value: "Microsoft Teams" },
            { label: "Other", value: "Other" },
          ],
        },
        {
          name: "onlineDetails_meetingUrl",
          label: "Meeting Link",
          type: "text",
          icon: Link,
          required: formData.eventType === "Online" || formData.eventType === "Hybrid",
          span: 2,
        },
        {
          name: "onlineDetails_meetingId",
          label: "Meeting ID (Optional)",
          type: "text",
          icon: Hash,
        },
        {
          name: "onlineDetails_passcode",
          label: "Passcode (Optional)",
          type: "text",
          icon: Lock,
        },
      ],
    });
  }

  sections.push({
    title: "Registration & Settings",
    icon: ToggleLeft,
    fields: [
      {
        name: "registrationRequired",
        label: "Registration Required?",
        type: "boolean",
        icon: ToggleLeft,
      },
      ...(formData.registrationRequired
        ? [
            {
              name: "registrationDeadline",
              label: "Registration Deadline",
              type: "date",
              icon: CalendarDays,
            } as any, // Type cast to any because conditional spreading might mess up TS inference of exact FormField type
          ]
        : []),
      {
        name: "isActive",
        label: "Event Active",
        type: "boolean",
        icon: ToggleLeft,
      },
    ],
  });

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
