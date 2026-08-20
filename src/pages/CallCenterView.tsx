import React, { useEffect, useState } from "react";
import { Loader2, Save, Plus, Trash2, Phone, Mail, MessageCircle } from "lucide-react";
import { apiFetch } from "../utils/apiConfig";

interface FAQ {
  question: string;
  answer: string;
}

interface SupportConfig {
  phone: string;
  whatsapp: string;
  email: string;
  faqs: FAQ[];
}

interface SupportCenterData {
  prahari: SupportConfig;
  mitra: SupportConfig;
}

const DEFAULT_DATA: SupportCenterData = {
  prahari: { phone: "", whatsapp: "", email: "", faqs: [] },
  mitra: { phone: "", whatsapp: "", email: "", faqs: [] },
};

export const CallCenterView = () => {
  const [activeTab, setActiveTab] = useState<"prahari" | "mitra">("prahari");
  const [data, setData] = useState<SupportCenterData>(DEFAULT_DATA);
  const [settingId, setSettingId] = useState<string | null>(null);
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadData = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await apiFetch<any>("/api/v1/settings?search=SUPPORT_CENTER_CONFIG");
      
      const configSetting = response?.data?.find((s: any) => s.settingName === "SUPPORT_CENTER_CONFIG") || 
                            (Array.isArray(response) ? response.find((s: any) => s.settingName === "SUPPORT_CENTER_CONFIG") : null);

      if (configSetting && configSetting.value) {
        setSettingId(configSetting._id);
        try {
          const parsed = JSON.parse(configSetting.value);
          setData({
            prahari: { ...DEFAULT_DATA.prahari, ...(parsed.prahari || {}) },
            mitra: { ...DEFAULT_DATA.mitra, ...(parsed.mitra || {}) },
          });
        } catch (e) {
          console.error("Failed to parse config", e);
          setData(DEFAULT_DATA);
        }
      }
    } catch (err: any) {
      setError(err.message || "Failed to load support center configuration");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const validateSupportConfig = (config: SupportConfig, tabName: string) => {
    if (!config.phone.trim() || !config.whatsapp.trim() || !config.email.trim()) {
      return `Please fill in Phone, WhatsApp, and Email for ${tabName} Support.`;
    }
    const phoneRegex = /^\+?[0-9\-\s()]{7,20}$/;
    if (!phoneRegex.test(config.phone)) {
      return `Invalid Phone Number format for ${tabName} Support.`;
    }
    if (!phoneRegex.test(config.whatsapp)) {
      return `Invalid WhatsApp Number format for ${tabName} Support.`;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(config.email)) {
      return `Invalid Email Address format for ${tabName} Support.`;
    }
    return null;
  };

  const handleSave = async () => {
    setError("");
    setSuccess("");

    const prahariError = validateSupportConfig(data.prahari, "Paryavaran Prahri");
    if (prahariError) {
      setError(prahariError);
      return;
    }
    const mitraError = validateSupportConfig(data.mitra, "Paryavaran Mitra");
    if (mitraError) {
      setError(mitraError);
      return;
    }

    setSaving(true);
    try {
      const payload = {
        settingName: "SUPPORT_CENTER_CONFIG",
        category: "General",
        value: JSON.stringify(data),
        isActive: true,
      };

      if (settingId) {
        await apiFetch(`/api/v1/settings/${settingId}`, {
          method: "PATCH",
          body: JSON.stringify(payload),
        });
      } else {
        const res = await apiFetch<any>(`/api/v1/settings`, {
          method: "POST",
          body: JSON.stringify(payload),
        });
        setSettingId(res._id);
      }
      setSuccess("Support center configuration saved successfully!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      setError(err.message || "Failed to save support center configuration");
    } finally {
      setSaving(false);
    }
  };

  const handleFieldChange = (field: keyof SupportConfig, value: string) => {
    setData((prev) => ({
      ...prev,
      [activeTab]: {
        ...prev[activeTab],
        [field]: value,
      },
    }));
  };

  const addFaq = () => {
    setData((prev) => ({
      ...prev,
      [activeTab]: {
        ...prev[activeTab],
        faqs: [...prev[activeTab].faqs, { question: "", answer: "" }],
      },
    }));
  };

  const updateFaq = (index: number, field: keyof FAQ, value: string) => {
    setData((prev) => {
      const newFaqs = [...prev[activeTab].faqs];
      newFaqs[index] = { ...newFaqs[index], [field]: value };
      return {
        ...prev,
        [activeTab]: {
          ...prev[activeTab],
          faqs: newFaqs,
        },
      };
    });
  };

  const removeFaq = (index: number) => {
    setData((prev) => {
      const newFaqs = [...prev[activeTab].faqs];
      newFaqs.splice(index, 1);
      return {
        ...prev,
        [activeTab]: {
          ...prev[activeTab],
          faqs: newFaqs,
        },
      };
    });
  };

  const renderTabContent = () => {
    const currentData = data[activeTab];

    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
        <div className="card" style={{ padding: "24px" }}>
          <h3 style={{ margin: "0 0 16px 0", fontSize: "16px", color: "var(--text-primary)" }}>
            Contact Channels
          </h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px" }}>
            <div className="form-group">
              <label>
                <Phone size={14} style={{ display: "inline", verticalAlign: "middle", marginRight: "6px" }} />
                Phone Number <span style={{ color: "red" }}>*</span>
              </label>
              <input
                type="text"
                className="form-control"
                placeholder="+91-1800-123-4567"
                value={currentData.phone}
                onChange={(e) => handleFieldChange("phone", e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>
                <MessageCircle size={14} style={{ display: "inline", verticalAlign: "middle", marginRight: "6px" }} />
                WhatsApp Number <span style={{ color: "red" }}>*</span>
              </label>
              <input
                type="text"
                className="form-control"
                placeholder="+918817678133"
                value={currentData.whatsapp}
                onChange={(e) => handleFieldChange("whatsapp", e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>
                <Mail size={14} style={{ display: "inline", verticalAlign: "middle", marginRight: "6px" }} />
                Email Address <span style={{ color: "red" }}>*</span>
              </label>
              <input
                type="email"
                className="form-control"
                placeholder="support@example.com"
                value={currentData.email}
                onChange={(e) => handleFieldChange("email", e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="card" style={{ padding: "24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <h3 style={{ margin: 0, fontSize: "16px", color: "var(--text-primary)" }}>
              Frequently Asked Questions (FAQs)
            </h3>
            <button className="btn-secondary" onClick={addFaq} type="button">
              <Plus size={16} />
              Add FAQ
            </button>
          </div>

          {currentData.faqs.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px", color: "var(--text-secondary)", background: "var(--bg-secondary)", borderRadius: "8px" }}>
              <p style={{ margin: 0 }}>No FAQs added for this support type yet.</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {currentData.faqs.map((faq, index) => (
                <div key={index} style={{ display: "flex", gap: "12px", background: "var(--bg-secondary)", padding: "16px", borderRadius: "8px" }}>
                  <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "12px" }}>
                    <div style={{ width: "100%" }}>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Question (e.g. How are trees assigned?)"
                        value={faq.question}
                        onChange={(e) => updateFaq(index, "question", e.target.value)}
                        style={{ fontWeight: 500, width: "100%", padding: "12px", border: "1px solid var(--border-color)", borderRadius: "6px" }}
                      />
                    </div>
                    <div style={{ width: "100%" }}>
                      <textarea
                        className="form-control"
                        placeholder="Answer"
                        rows={3}
                        value={faq.answer}
                        onChange={(e) => updateFaq(index, "answer", e.target.value)}
                        style={{ resize: "vertical", width: "100%", padding: "12px", border: "1px solid var(--border-color)", borderRadius: "6px", fontFamily: "inherit" }}
                      />
                    </div>
                  </div>
                  <div>
                    <button
                      className="icon-btn"
                      onClick={() => removeFaq(index)}
                      style={{ color: "var(--danger-color)" }}
                      title="Remove FAQ"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="dashboard-area">
      <div className="page-header">
        <div className="page-title">
          <h1>Support Center</h1>
          <p>Manage contact details and FAQs for the mobile app support screens.</p>
        </div>
        <div style={{ display: "flex", gap: "12px" }}>
          <button className="btn-primary" onClick={handleSave} disabled={saving || loading}>
            {saving ? <Loader2 size={18} className="spin" /> : <Save size={18} />}
            {saving ? "Saving..." : "Save Configuration"}
          </button>
        </div>
      </div>

      {error && (
        <div style={{ background: "rgba(255, 61, 0, 0.1)", color: "#ff3d00", padding: "12px", borderRadius: "8px", marginBottom: "16px" }}>
          {error}
        </div>
      )}

      {success && (
        <div style={{ background: "rgba(43, 150, 79, 0.1)", color: "#2b964f", padding: "12px", borderRadius: "8px", marginBottom: "16px" }}>
          {success}
        </div>
      )}

      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: "60px" }}>
          <Loader2 size={32} className="spin" color="var(--primary-color)" />
        </div>
      ) : (
        <>
          <div className="login-tabs" style={{ maxWidth: "500px", marginBottom: "24px" }}>
            <button
              className={`login-tab ${activeTab === "prahari" ? "active" : ""}`}
              onClick={() => setActiveTab("prahari")}
              style={{ padding: "12px 16px" }}
            >
              Paryavaran Prahri Support
            </button>
            <button
              className={`login-tab ${activeTab === "mitra" ? "active" : ""}`}
              onClick={() => setActiveTab("mitra")}
              style={{ padding: "12px 16px" }}
            >
              Paryavaran Mitra Support
            </button>
          </div>

          {renderTabContent()}
        </>
      )}
    </div>
  );
};

export default CallCenterView;
