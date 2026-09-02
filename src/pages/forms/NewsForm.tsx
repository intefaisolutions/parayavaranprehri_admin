import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Newspaper, Tag, Image as ImageIcon, User, CalendarDays, ShieldCheck, Hash, Link } from "lucide-react";
import { apiFetch } from "../../utils/apiConfig";
import { SmartForm } from "../../components/form/SmartForm";
import type { FormSectionConfig } from "../../components/form/SmartForm";
import { FormPageHeader } from "../../components/form/FormPageHeader";

export interface NewsFormData {
  _id?: string;
  title: string;
  content: string;
  category: string;
  image?: string;
  url?: string;
  author: string;
  publishedDate?: string;
  views?: string | number;
  tags?: string[];
  status: string;
}

const emptyForm: NewsFormData = {
  title: "",
  content: "",
  category: "Environment",
  image: "",
  url: "",
  author: "",
  publishedDate: "",
  views: "",
  tags: [],
  status: "Draft",
};

const toDateInputValue = (value?: string) => (value ? value.slice(0, 10) : "");

export const NewsForm = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const editNews = location.state?.news;
  const isEditing = !!editNews;

  const [formData, setFormData] = useState<NewsFormData>(
    editNews
      ? {
          ...emptyForm,
          ...editNews,
          publishedDate: toDateInputValue(editNews.publishedDate),
          views: editNews.views ?? 0,
          tags: editNews.tags || [],
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
    const payload = {
      ...rest,
      views: rest.views === "" || rest.views === undefined ? undefined : Number(rest.views),
      publishedDate: rest.publishedDate || undefined,
    };

    try {
      if (isEditing && _id) {
        await apiFetch(`/api/v1/news/${_id}`, {
          method: "PATCH",
          body: JSON.stringify(payload),
        });
      } else {
        await apiFetch("/api/v1/news", {
          method: "POST",
          body: JSON.stringify(payload),
        });
      }
      navigate("/news");
    } catch (err: any) {
      setError(err.message || "Failed to save News");
    } finally {
      setSubmitting(false);
    }
  };

  const sections: FormSectionConfig[] = [
    {
      title: "Article Details",
      description: "Core content of this news article.",
      icon: Newspaper,
      fields: [
        { name: "title", label: "News Title", type: "text", icon: Newspaper, required: true, span: 2 },
        { name: "url", label: "Source URL (Link)", type: "text", icon: Link, placeholder: "https://example.com/news", span: 2 },
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
    <div className="dashboard-area">
      <FormPageHeader
        icon={Newspaper}
        title={isEditing ? "Edit News" : "Add News"}
        subtitle="Manage news articles and publication status."
        onBack={() => navigate("/news")}
      />

      <div className="card">
        <SmartForm
          sections={sections}
          formData={formData}
          onFieldChange={handleFieldChange}
          onSubmit={handleSubmit}
          submitting={submitting}
          error={error}
          submitLabel={isEditing ? "Update News" : "Add News"}
          cancelLabel="Cancel"
          onCancel={() => navigate("/news")}
        />
      </div>
    </div>
  );
};

export default NewsForm;
