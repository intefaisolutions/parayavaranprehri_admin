import React, { useEffect, useState } from "react";
import { Play, Save, Image as ImageIcon, Video, CheckCircle2, AlertCircle, RefreshCw } from "lucide-react";
import { apiFetch } from "../utils/apiConfig";

interface ConceptVideoData {
  _id?: string;
  title: string;
  subtitle: string;
  videoUrl: string;
  youtubeId: string;
  thumbnailUrl: string;
  isActive: boolean;
}

export const ConceptVideoManagementView = () => {
  const [videoData, setVideoData] = useState<ConceptVideoData>({
    title: "What is Paryavaran Prahri?",
    subtitle:
      "Learn how vehicles, citizens, plantation and environmental contribution come together under Mission 2047.",
    videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    youtubeId: "dQw4w9WgXcQ",
    thumbnailUrl: "https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg",
    isActive: true,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const extractYoutubeId = (url: string): string => {
    if (!url) return "";
    const regExp =
      /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : "";
  };

  const loadConceptVideo = async () => {
    setLoading(true);
    setErrorMsg("");
    try {
      const data = await apiFetch<ConceptVideoData>("/api/v1/concept-video");
      if (data && data.videoUrl) {
        setVideoData(data);
      }
    } catch (err: any) {
      console.error("Failed to load concept video:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadConceptVideo();
  }, []);

  const handleUrlChange = (newUrl: string) => {
    const ytId = extractYoutubeId(newUrl);
    const autoThumb = ytId
      ? `https://img.youtube.com/vi/${ytId}/maxresdefault.jpg`
      : videoData.thumbnailUrl;

    setVideoData((prev) => ({
      ...prev,
      videoUrl: newUrl,
      youtubeId: ytId || prev.youtubeId,
      thumbnailUrl: autoThumb,
    }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg("");
    setErrorMsg("");

    try {
      const ytId = extractYoutubeId(videoData.videoUrl) || videoData.youtubeId;
      const updated = await apiFetch<ConceptVideoData>("/api/v1/concept-video", {
        method: "POST",
        body: JSON.stringify({
          ...videoData,
          youtubeId: ytId,
        }),
      });

      if (updated) {
        setVideoData(updated);
        setSuccessMsg("Concept Video configuration updated successfully! This will immediately reflect on the Mobile App Dashboard.");
        setTimeout(() => setSuccessMsg(""), 5000);
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to save Concept Video settings");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="dashboard-area" style={{ paddingBottom: 40 }}>
      {/* HEADER */}
      <div className="page-header" style={{ marginBottom: 24 }}>
        <div className="page-title">
          <h1 style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 24, fontWeight: 700 }}>
            <Video size={26} color="var(--accent-color, #10b981)" /> Concept Video Settings
          </h1>
          <p style={{ color: "var(--text-secondary)", marginTop: 4 }}>
            Manage the main educational Concept Video displayed on the Mobile App Dashboard.
          </p>
        </div>
      </div>

      {/* MESSAGES */}
      {successMsg && (
        <div
          style={{
            padding: "14px 18px",
            marginBottom: 20,
            borderRadius: 12,
            background: "#ecfdf5",
            border: "1px solid #a7f3d0",
            color: "#047857",
            display: "flex",
            alignItems: "center",
            gap: 10,
            fontWeight: 600,
            fontSize: 14,
          }}
        >
          <CheckCircle2 size={18} /> {successMsg}
        </div>
      )}

      {errorMsg && (
        <div
          style={{
            padding: "14px 18px",
            marginBottom: 20,
            borderRadius: 12,
            background: "#fef2f2",
            border: "1px solid #fecaca",
            color: "#b91c1c",
            display: "flex",
            alignItems: "center",
            gap: 10,
            fontWeight: 600,
            fontSize: 14,
          }}
        >
          <AlertCircle size={18} /> {errorMsg}
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 420px", gap: 24, alignItems: "start" }}>
        {/* FORM CARD */}
        <div className="card" style={{ padding: 24, borderRadius: 16 }}>
          <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 18, color: "var(--text-primary)" }}>
            Update Video Details
          </h3>

          <form onSubmit={handleSave} style={{ display: "grid", gap: 18 }}>
            {/* YOUTUBE URL */}
            <div>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 6, color: "var(--text-primary)" }}>
                YouTube Video URL <span style={{ color: "#ef4444" }}>*</span>
              </label>
              <div style={{ position: "relative" }}>
                <input
                  type="url"
                  required
                  placeholder="https://www.youtube.com/watch?v=dQw4w9WgXcQ"
                  value={videoData.videoUrl}
                  onChange={(e) => handleUrlChange(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px 12px 10px 38px",
                    borderRadius: 10,
                    border: "1px solid var(--border-color, #e5e7eb)",
                    fontSize: 14,
                  }}
                />
                <Video
                  size={18}
                  color="#ff0000"
                  style={{ position: "absolute", left: 12, top: 12 }}
                />
              </div>
              <span style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 4, display: "block" }}>
                Paste YouTube video link (e.g. https://youtu.be/xxx or https://www.youtube.com/watch?v=xxx)
              </span>
            </div>

            {/* TITLE */}
            <div>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 6, color: "var(--text-primary)" }}>
                Video Title <span style={{ color: "#ef4444" }}>*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. What is Paryavaran Prahri?"
                value={videoData.title}
                onChange={(e) => setVideoData({ ...videoData, title: e.target.value })}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  borderRadius: 10,
                  border: "1px solid var(--border-color, #e5e7eb)",
                  fontSize: 14,
                }}
              />
            </div>

            {/* SUBTITLE */}
            <div>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 6, color: "var(--text-primary)" }}>
                Video Subtitle / Description <span style={{ color: "#ef4444" }}>*</span>
              </label>
              <textarea
                required
                rows={3}
                placeholder="Brief description explaining the video concept..."
                value={videoData.subtitle}
                onChange={(e) => setVideoData({ ...videoData, subtitle: e.target.value })}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  borderRadius: 10,
                  border: "1px solid var(--border-color, #e5e7eb)",
                  fontSize: 14,
                  fontFamily: "inherit",
                }}
              />
            </div>

            {/* THUMBNAIL URL */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                <label style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)", margin: 0 }}>
                  Thumbnail Image URL
                </label>
                {videoData.youtubeId && (
                  <button
                    type="button"
                    className="btn-secondary"
                    style={{ fontSize: 12, padding: "2px 8px" }}
                    onClick={() =>
                      setVideoData({
                        ...videoData,
                        thumbnailUrl: `https://img.youtube.com/vi/${videoData.youtubeId}/maxresdefault.jpg`,
                      })
                    }
                  >
                    <RefreshCw size={12} style={{ marginRight: 4 }} /> Auto YouTube Thumbnail
                  </button>
                )}
              </div>
              <div style={{ position: "relative" }}>
                <input
                  type="url"
                  placeholder="https://img.youtube.com/vi/.../maxresdefault.jpg"
                  value={videoData.thumbnailUrl}
                  onChange={(e) => setVideoData({ ...videoData, thumbnailUrl: e.target.value })}
                  style={{
                    width: "100%",
                    padding: "10px 12px 10px 38px",
                    borderRadius: 10,
                    border: "1px solid var(--border-color, #e5e7eb)",
                    fontSize: 14,
                  }}
                />
                <ImageIcon
                  size={18}
                  color="var(--text-secondary)"
                  style={{ position: "absolute", left: 12, top: 12 }}
                />
              </div>
            </div>

            {/* SAVE BUTTON */}
            <div style={{ marginTop: 12 }}>
              <button
                type="submit"
                className="btn-primary"
                disabled={saving}
                style={{
                  padding: "12px 24px",
                  fontSize: 15,
                  fontWeight: 700,
                  borderRadius: 12,
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <Save size={18} /> {saving ? "Saving Changes..." : "Save Concept Video Settings"}
              </button>
            </div>
          </form>
        </div>

        {/* MOBILE APP LIVE PREVIEW CARD */}
        <div className="card" style={{ padding: 20, borderRadius: 16, background: "#0a0f1d", color: "#fff" }}>
          <h4 style={{ fontSize: 14, fontWeight: 700, margin: "0 0 14px 0", color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.5px" }}>
            📱 Mobile App Live Preview
          </h4>

          <div
            style={{
              borderRadius: 16,
              padding: 2,
              background: "linear-gradient(135deg, #f27e20 0%, #2bb373 100%)",
            }}
          >
            <div
              style={{
                background: "#111827",
                borderRadius: 14,
                overflow: "hidden",
                position: "relative",
              }}
            >
              {/* CONCEPT VIDEO BADGE */}
              <div
                style={{
                  position: "absolute",
                  top: 10,
                  left: 10,
                  zIndex: 10,
                  background: "linear-gradient(90deg, #f27e20 0%, #2bb373 100%)",
                  padding: "3px 8px",
                  borderRadius: 6,
                  fontSize: 10,
                  fontWeight: 900,
                  color: "#000",
                }}
              >
                IN CONCEPT VIDEO
              </div>

              {/* THUMBNAIL + PLAY BUTTON */}
              <div style={{ position: "relative", height: 180, width: "100%", background: "#1f2937" }}>
                <img
                  src={videoData.thumbnailUrl || "https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg"}
                  alt="Thumbnail"
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  onError={(e) => {
                    // Fallback thumbnail if maxres fails
                    if (videoData.youtubeId) {
                      e.currentTarget.src = `https://img.youtube.com/vi/${videoData.youtubeId}/hqdefault.jpg`;
                    }
                  }}
                />
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    background: "rgba(0, 0, 0, 0.35)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <div
                    style={{
                      width: 52,
                      height: 52,
                      borderRadius: 26,
                      background: "rgba(255, 255, 255, 0.9)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      boxShadow: "0 4px 14px rgba(0,0,0,0.4)",
                    }}
                  >
                    <Play size={24} color="#10b981" style={{ marginLeft: 3 }} />
                  </div>
                </div>

                <div
                  style={{
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: 90,
                    background: "linear-gradient(to top, rgba(0,0,0,0.9), transparent)",
                  }}
                />

                <div
                  style={{
                    position: "absolute",
                    bottom: 12,
                    left: 12,
                    right: 12,
                  }}
                >
                  <div style={{ fontWeight: 800, fontSize: 14, color: "#fff" }}>
                    {videoData.title || "What is Paryavaran Prahri?"}
                  </div>
                  <div
                    style={{
                      fontSize: 11,
                      color: "#d1d5db",
                      marginTop: 2,
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                    }}
                  >
                    {videoData.subtitle || "Learn how vehicles, citizens, plantation..."}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div style={{ fontSize: 12, color: "#9ca3af", marginTop: 12, textAlign: "center" }}>
            Tap on video card in Mobile App opens In-App Video Player.
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConceptVideoManagementView;
