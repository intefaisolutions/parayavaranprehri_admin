import React, { useEffect, useState } from "react";
import {
  Play,
  Save,
  Image as ImageIcon,
  Video,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  X,
} from "lucide-react";
import { apiFetch } from "../utils/apiConfig";

export const YOUTUBE_URL_REGEX =
  /^(?:https?:\/\/)?(?:www\.|m\.)?(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|v\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})(?:[?&/]\S*)?$/;

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
  const [isPlayerOpen, setIsPlayerOpen] = useState(false);
  const [playHovered, setPlayHovered] = useState(false);

  const extractYoutubeId = (url: string): string => {
    if (!url) return "";
    const match = url.trim().match(YOUTUBE_URL_REGEX);
    return match && match[1] ? match[1] : "";
  };

  const currentYtId = extractYoutubeId(videoData.videoUrl);
  const hasUrlInput = Boolean(videoData.videoUrl.trim());
  const isUrlValid = Boolean(currentYtId);

  // Close player modal on Esc key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isPlayerOpen) {
        setIsPlayerOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isPlayerOpen]);

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
    setVideoData((prev) => ({
      ...prev,
      videoUrl: newUrl,
      youtubeId: ytId || prev.youtubeId,
    }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg("");
    setErrorMsg("");

    const ytId = extractYoutubeId(videoData.videoUrl);
    if (!ytId) {
      setErrorMsg(
        "Invalid YouTube URL. Please provide a valid watch, youtu.be, or shorts link before saving."
      );
      setSaving(false);
      return;
    }

    try {
      const updated = await apiFetch<ConceptVideoData>("/api/v1/concept-video", {
        method: "POST",
        body: JSON.stringify({
          ...videoData,
          youtubeId: ytId,
        }),
      });

      if (updated) {
        setVideoData(updated);
        setSuccessMsg(
          "Concept Video configuration updated successfully! This will immediately reflect on the Mobile App Dashboard."
        );
        setTimeout(() => setSuccessMsg(""), 5000);
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to save Concept Video settings");
    } finally {
      setSaving(false);
    }
  };

  const handlePlayClick = () => {
    if (!isUrlValid) {
      setErrorMsg(
        "Cannot play preview: Please enter a valid YouTube URL (e.g. watch, youtu.be, or shorts link)."
      );
      return;
    }
    setIsPlayerOpen(true);
  };

  // Determine thumbnail to display: custom url, or youtube thumbnail with fallback
  const effectiveThumbnail =
    videoData.thumbnailUrl.trim() ||
    (currentYtId
      ? `https://img.youtube.com/vi/${currentYtId}/maxresdefault.jpg`
      : "https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg");

  return (
    <div className="dashboard-area" style={{ paddingBottom: 40 }}>
      {/* HEADER */}
      <div className="page-header" style={{ marginBottom: 24 }}>
        <div className="page-title">
          <h1
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              fontSize: 24,
              fontWeight: 700,
            }}
          >
            <Video size={26} color="var(--accent-color, #10b981)" /> Concept Video
            Settings
          </h1>
          <p style={{ color: "var(--text-secondary)", marginTop: 4 }}>
            Manage the main educational Concept Video displayed on the Mobile
            App Dashboard.
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

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 420px",
          gap: 24,
          alignItems: "start",
        }}
      >
        {/* FORM CARD */}
        <div className="card" style={{ padding: 24, borderRadius: 16 }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 18,
            }}
          >
            <h3
              style={{
                fontSize: 18,
                fontWeight: 700,
                margin: 0,
                color: "var(--text-primary)",
              }}
            >
              Update Video Details
            </h3>
            {loading && (
              <span
                style={{
                  fontSize: 12,
                  color: "var(--text-secondary)",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <RefreshCw size={14} className="spin" /> Loading...
              </span>
            )}
          </div>

          <form onSubmit={handleSave} style={{ display: "grid", gap: 18 }}>
            {/* YOUTUBE URL */}
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: 13,
                  fontWeight: 600,
                  marginBottom: 6,
                  color: "var(--text-primary)",
                }}
              >
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
                    border:
                      hasUrlInput && !isUrlValid
                        ? "1px solid #ef4444"
                        : "1px solid var(--border-color, #e5e7eb)",
                    fontSize: 14,
                    outline: "none",
                  }}
                />
                <Video
                  size={18}
                  color="#ff0000"
                  style={{ position: "absolute", left: 12, top: 12 }}
                />
              </div>

              {/* URL HELPER & VALIDATION FEEDBACK */}
              {hasUrlInput && !isUrlValid ? (
                <span
                  style={{
                    fontSize: 12,
                    color: "#dc2626",
                    marginTop: 6,
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    fontWeight: 500,
                  }}
                >
                  <AlertCircle size={14} /> Invalid YouTube link. Supported:
                  watch?v=..., youtu.be/..., shorts/...
                </span>
              ) : (
                <span
                  style={{
                    fontSize: 12,
                    color: "var(--text-secondary)",
                    marginTop: 4,
                    display: "block",
                  }}
                >
                  Supports YouTube standard (watch?v=...), Short URLs (youtu.be/...),
                  or YouTube Shorts (/shorts/...)
                </span>
              )}
            </div>

            {/* TITLE */}
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: 13,
                  fontWeight: 600,
                  marginBottom: 6,
                  color: "var(--text-primary)",
                }}
              >
                Video Title <span style={{ color: "#ef4444" }}>*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. What is Paryavaran Prahri?"
                value={videoData.title}
                onChange={(e) =>
                  setVideoData({ ...videoData, title: e.target.value })
                }
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
              <label
                style={{
                  display: "block",
                  fontSize: 13,
                  fontWeight: 600,
                  marginBottom: 6,
                  color: "var(--text-primary)",
                }}
              >
                Video Subtitle / Description <span style={{ color: "#ef4444" }}>*</span>
              </label>
              <textarea
                required
                rows={3}
                placeholder="Brief description explaining the video concept..."
                value={videoData.subtitle}
                onChange={(e) =>
                  setVideoData({ ...videoData, subtitle: e.target.value })
                }
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
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 6,
                }}
              >
                <label
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: "var(--text-primary)",
                    margin: 0,
                  }}
                >
                  Thumbnail Image URL{" "}
                  <span style={{ fontSize: 11, fontWeight: 400, color: "#6b7280" }}>
                    (Optional — leave blank to auto-use YouTube thumbnail)
                  </span>
                </label>
                {currentYtId && (
                  <button
                    type="button"
                    className="btn-secondary"
                    style={{ fontSize: 12, padding: "2px 8px" }}
                    onClick={() =>
                      setVideoData({
                        ...videoData,
                        thumbnailUrl: `https://img.youtube.com/vi/${currentYtId}/maxresdefault.jpg`,
                      })
                    }
                  >
                    <RefreshCw size={12} style={{ marginRight: 4 }} /> Auto
                    YouTube Thumbnail
                  </button>
                )}
              </div>
              <div style={{ position: "relative" }}>
                <input
                  type="url"
                  placeholder="https://img.youtube.com/vi/.../maxresdefault.jpg"
                  value={videoData.thumbnailUrl}
                  onChange={(e) =>
                    setVideoData({ ...videoData, thumbnailUrl: e.target.value })
                  }
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
                disabled={saving || (hasUrlInput && !isUrlValid)}
                style={{
                  padding: "12px 24px",
                  fontSize: 15,
                  fontWeight: 700,
                  borderRadius: 12,
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  opacity: saving || (hasUrlInput && !isUrlValid) ? 0.6 : 1,
                  cursor:
                    saving || (hasUrlInput && !isUrlValid)
                      ? "not-allowed"
                      : "pointer",
                }}
              >
                <Save size={18} />{" "}
                {saving ? "Saving Changes..." : "Save Concept Video Settings"}
              </button>
            </div>
          </form>
        </div>

        {/* MOBILE APP LIVE PREVIEW CARD */}
        <div
          className="card"
          style={{
            padding: 20,
            borderRadius: 16,
            background: "#0a0f1d",
            color: "#fff",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              margin: "0 0 14px 0",
            }}
          >
            <h4
              style={{
                fontSize: 14,
                fontWeight: 700,
                margin: 0,
                color: "#9ca3af",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
              }}
            >
              📱 Mobile App Live Preview
            </h4>
            {isUrlValid && (
              <span
                style={{
                  fontSize: 11,
                  background: "rgba(16, 185, 129, 0.15)",
                  color: "#10b981",
                  padding: "2px 8px",
                  borderRadius: 6,
                  fontWeight: 600,
                }}
              >
                Ready to Play
              </span>
            )}
          </div>

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
                  background:
                    "linear-gradient(90deg, #f27e20 0%, #2bb373 100%)",
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
              <div
                style={{
                  position: "relative",
                  height: 180,
                  width: "100%",
                  background: "#1f2937",
                  cursor: isUrlValid ? "pointer" : "default",
                }}
                onClick={handlePlayClick}
                title={
                  isUrlValid
                    ? "Click to preview YouTube video in player modal"
                    : "Enter a valid YouTube URL to preview"
                }
              >
                <img
                  src={effectiveThumbnail}
                  alt="Thumbnail"
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  onError={(e) => {
                    // Fallback thumbnail to hqdefault if maxres fails
                    if (currentYtId) {
                      e.currentTarget.src = `https://img.youtube.com/vi/${currentYtId}/hqdefault.jpg`;
                    }
                  }}
                />

                {/* OVERLAY WITH PLAY BUTTON */}
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    background: "rgba(0, 0, 0, 0.38)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePlayClick();
                    }}
                    onMouseEnter={() => setPlayHovered(true)}
                    onMouseLeave={() => setPlayHovered(false)}
                    aria-label="Play Concept Video Preview"
                    style={{
                      width: 54,
                      height: 54,
                      borderRadius: 27,
                      border: "none",
                      background: isUrlValid
                        ? playHovered
                          ? "#10b981"
                          : "rgba(255, 255, 255, 0.95)"
                        : "rgba(107, 114, 128, 0.8)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      boxShadow: "0 4px 18px rgba(0,0,0,0.5)",
                      cursor: isUrlValid ? "pointer" : "not-allowed",
                      transform:
                        isUrlValid && playHovered ? "scale(1.12)" : "scale(1)",
                      transition: "all 0.2s ease-in-out",
                    }}
                  >
                    <Play
                      size={24}
                      color={
                        isUrlValid
                          ? playHovered
                            ? "#ffffff"
                            : "#10b981"
                          : "#d1d5db"
                      }
                      style={{ marginLeft: 3 }}
                    />
                  </button>
                </div>

                {/* GRADIENT SHADOW AT BOTTOM */}
                <div
                  style={{
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: 90,
                    background:
                      "linear-gradient(to top, rgba(0,0,0,0.92), transparent)",
                    pointerEvents: "none",
                  }}
                />

                {/* TITLE & DESCRIPTION */}
                <div
                  style={{
                    position: "absolute",
                    bottom: 12,
                    left: 12,
                    right: 12,
                    pointerEvents: "none",
                  }}
                >
                  <div
                    style={{
                      fontWeight: 800,
                      fontSize: 14,
                      color: "#fff",
                      textShadow: "0 1px 3px rgba(0,0,0,0.8)",
                    }}
                  >
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
                      textShadow: "0 1px 2px rgba(0,0,0,0.8)",
                    }}
                  >
                    {videoData.subtitle ||
                      "Learn how vehicles, citizens, plantation..."}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div
            style={{
              fontSize: 12,
              color: "#9ca3af",
              marginTop: 12,
              textAlign: "center",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
            }}
          >
            <span>▶ Click the play button to preview the video inside the Admin Panel.</span>
          </div>
        </div>
      </div>

      {/* EMBEDDED YOUTUBE VIDEO PLAYER MODAL */}
      {isPlayerOpen && currentYtId && (
        <div
          className="modal-overlay"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setIsPlayerOpen(false);
            }
          }}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0, 0, 0, 0.78)",
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1200,
            padding: 16,
          }}
        >
          <div
            className="video-player-modal"
            style={{
              width: "min(880px, 96vw)",
              background: "#0f172a",
              border: "1px solid rgba(255, 255, 255, 0.12)",
              borderRadius: 18,
              boxShadow: "0 25px 60px -15px rgba(0, 0, 0, 0.85)",
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
              animation: "fadeInScale 0.2s ease-out",
            }}
          >
            {/* MODAL HEADER */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "16px 20px",
                borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
                background: "#111827",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  overflow: "hidden",
                }}
              >
                <span
                  style={{
                    background:
                      "linear-gradient(90deg, #f27e20 0%, #2bb373 100%)",
                    color: "#000",
                    fontWeight: 800,
                    fontSize: 10,
                    padding: "3px 8px",
                    borderRadius: 6,
                    letterSpacing: "0.5px",
                    textTransform: "uppercase",
                    flexShrink: 0,
                  }}
                >
                  LIVE PREVIEW
                </span>
                <span
                  style={{
                    fontWeight: 700,
                    fontSize: 15,
                    color: "#f3f4f6",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                  title={videoData.title}
                >
                  {videoData.title || "Concept Video Preview"}
                </span>
              </div>

              <button
                type="button"
                onClick={() => setIsPlayerOpen(false)}
                aria-label="Close preview"
                style={{
                  background: "rgba(255, 255, 255, 0.08)",
                  border: "none",
                  borderRadius: 8,
                  width: 32,
                  height: 32,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#9ca3af",
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                  flexShrink: 0,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(239, 68, 68, 0.2)";
                  e.currentTarget.style.color = "#ef4444";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background =
                    "rgba(255, 255, 255, 0.08)";
                  e.currentTarget.style.color = "#9ca3af";
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* 16:9 RESPONSIVE YOUTUBE IFRAME PLAYER */}
            <div
              style={{
                position: "relative",
                width: "100%",
                aspectRatio: "16 / 9",
                background: "#000",
              }}
            >
              <iframe
                src={`https://www.youtube.com/embed/${currentYtId}?autoplay=1&enablejsapi=1&rel=0&modestbranding=1`}
                title={videoData.title || "YouTube video player"}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "100%",
                  border: 0,
                }}
              />
            </div>

            {/* MODAL FOOTER INFO */}
            <div
              style={{
                padding: "14px 20px",
                borderTop: "1px solid rgba(255, 255, 255, 0.08)",
                background: "#111827",
                display: "flex",
                flexDirection: "column",
                gap: 6,
              }}
            >
              <div
                style={{
                  fontSize: 13,
                  color: "#d1d5db",
                  lineHeight: 1.4,
                }}
              >
                {videoData.subtitle}
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  fontSize: 11,
                  color: "#6b7280",
                  marginTop: 2,
                }}
              >
                <span>
                  YouTube IFrame Player • Play, pause, seek, volume, mute, fullscreen enabled
                </span>
                <span style={{ fontStyle: "italic" }}>Press ESC or click outside to close</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConceptVideoManagementView;

