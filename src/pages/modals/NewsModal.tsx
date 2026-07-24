import React from "react";
import { X, Newspaper, Tag, Image as ImageIcon, User, CalendarDays, ShieldCheck, Hash } from "lucide-react";
import { SmartForm } from "../../components/form/SmartForm";
import type { FormSectionConfig } from "../../components/form/SmartForm";

export interface NewsFormData {
  _id?: string;
  title: string;
  content: string;
  category: string;
  image?: string;
  author: string;
  publishedDate?: string;
  views?: string | number;
  tags?: string[];
  status: string;
}

interface NewsModalProps {
  isOpen: boolean;
  onClose: () => void;
  editing: boolean;
  formData: NewsFormData;
  submitting?: boolean;
  error?: string;
  onFieldChange: (name: string, value: any) => void;
  handleSubmit: (e: React.FormEvent) => void;
}

const NewsModal: React.FC<NewsModalProps> = ({
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
      title: "Article Details",
      description: "Core content of this news article.",
      icon: Newspaper,
      fields: [
        { name: "title", label: "News Title", type: "text", icon: Newspaper, required: true, span: 2 },
        { name: "content", label: "Content", type: "textarea", icon: Newspaper, required: true, span: 2, rows: 6 },
        {
          name: "category",
          label: "Category",
          type: "select",
          icon: Tag,
          required: true,
          options: [
            { label: "Environment", value: "Environment" },
            { label: "Events", value: "Events" },
            { label: "Government", value: "Government" },
            { label: "Awareness", value: "Awareness" },
          ],
        },
        { name: "tags", label: "Tags", type: "tags", icon: Hash, placeholder: "Type and press Enter..." },
        { name: "image", label: "Cover Image", type: "image", icon: ImageIcon, uploadCategory: "general", span: 2 },
      ],
    },
    {
      title: "Publication",
      icon: CalendarDays,
      fields: [
        { name: "author", label: "Author", type: "text", icon: User, required: true },
        { name: "publishedDate", label: "Published Date", type: "date", icon: CalendarDays },
        {
          name: "status",
          label: "Publish Status",
          type: "select",
          icon: ShieldCheck,
          required: true,
          options: [
            { label: "Draft", value: "Draft" },
            { label: "Published", value: "Published" },
            { label: "Archived", value: "Archived" },
          ],
        },
      ],
    },
  ];

  return (
    <div className="modal-overlay">
      <div className="modal" style={{ width: 680 }}>
        <div className="modal-header">
          <h2>{editing ? "Edit News" : "Add News"}</h2>
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
          submitLabel={editing ? "Update News" : "Add News"}
          cancelLabel="Cancel"
          onCancel={onClose}
        />
      </div>
    </div>
  );
};

export default NewsModal;
