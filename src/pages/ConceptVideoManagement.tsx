import React, { useEffect, useState, useRef } from "react";
import {
  Play,
  Save,
  Image as ImageIcon,
  Video,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  X,
  UploadCloud,
  FileVideo,
  Link as LinkIcon,
  Trash2,
  FolderOpen,
} from "lucide-react";
import { apiFetch, apiUpload } from "../utils/apiConfig";

export const YOUTUBE_URL_REGEX =
  /^(?:https?:\/\/)?(?:www\.|m\.)?(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|v\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})(?:[?&/]\S*)?$/;

export const isDirectVideoUrl = (url: string): boolean => {
  if (!url) return false;
  const clean = url.trim().toLowerCase();
  return (
    clean.endsWith(".mp4") ||
    clean.endsWith(".m3u8") ||
    clean.endsWith(".webm") ||
    clean.endsWith(".mov") ||
    clean.includes("s3.amazonaws.com") ||
    clean.includes("storage.googleapis.com") ||
    clean.includes("/uploads/")
  );
};

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
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [uploadingThumbnail, setUploadingThumbnail] = useState(false);

  const [videoSourceMode, setVideoSourceMode] = useState<"youtube" | "upload">("youtube");
  const [videoDragActive, setVideoDragActive] = useState(false);
  const [thumbnailDragActive, setThumbnailDragActive] = useState(false);

  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [isPlayerOpen, setIsPlayerOpen] = useState(false);
  const [playHovered, setPlayHovered] = useState(false);

  const videoFileInputRef = useRef<HTMLInputElement>(null);
  const thumbnailFileInputRef = useRef<HTMLInputElement>(null);

  const extractYoutubeId = (url: string): string => {
    if (!url) return "";
    const match = url.trim().match(YOUTUBE_URL_REGEX);
    return match && match[1] ? match[1] : "";
  };

  const currentYtId = extractYoutubeId(videoData.videoUrl);
  const isDirectVideo = isDirectVideoUrl(videoData.videoUrl);
  const hasUrlInput = Boolean(videoData.videoUrl.trim());
  const isUrlValid = Boolean(currentYtId || isDirectVideo);

  // Sync mode based on loaded videoUrl
  useEffect(() => {
    if (isDirectVideo) {
      setVideoSourceMode("upload");
    } else if (currentYtId) {
      setVideoSourceMode("youtube");
    }
  }, [videoData.videoUrl]);

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

  // Upload Video File Handler
  const handleVideoFileUpload = async (file: File) => {
    if (!file) return;
    if (!file.type.startsWith("video/") && !file.name.match(/\.(mp4|mov|webm|m3u8)$/i)) {
      setErrorMsg("Selected file is not a valid video format. Please upload MP4, MOV, or WEBM.");
      return;
    }
    setUploadingVideo(true);
    setErrorMsg("");
    try {
      const res = await apiUpload(file, "general");
      if (res && res.url) {
        setVideoData((prev) => ({
          ...prev,
          videoUrl: res.url,
          youtubeId: "",
        }));
        setSuccessMsg("Video file uploaded successfully from gallery!");
        setTimeout(() => setSuccessMsg(""), 4000);
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to upload video file");
    } finally {
      setUploadingVideo(false);
    }
  };

  // Upload Thumbnail File Handler
  const handleThumbnailFileUpload = async (file: File) => {
    if (!file) return;
    if (!file.type.startsWith("image/") && !file.name.match(/\.(jpg|jpeg|png|webp|gif)$/i)) {
      setErrorMsg("Selected file is not a valid image format. Please upload JPG, PNG, or WEBP.");
      return;
    }
    setUploadingThumbnail(true);
    setErrorMsg("");
    try {
      const res = await apiUpload(file, "general");
      if (res && res.url) {
        setVideoData((prev) => ({
          ...prev,
          thumbnailUrl: res.url,
        }));
        setSuccessMsg("Thumbnail image uploaded successfully from gallery!");
        setTimeout(() => setSuccessMsg(""), 4000);
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to upload thumbnail image");
    } finally {
      setUploadingThumbnail(false);
    }
  };

  // Drag & Drop Handlers for Video
  const handleVideoDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setVideoDragActive(true);
    } else if (e.type === "dragleave") {
      setVideoDragActive(false);
    }
  };

  const handleVideoDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setVideoDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setVideoSourceMode("upload");
      handleVideoFileUpload(e.dataTransfer.files[0]);
    }
  };

  // Drag & Drop Handlers for Thumbnail
  const handleThumbnailDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setThumbnailDragActive(true);
    } else if (e.type === "dragleave") {
      setThumbnailDragActive(false);
    }
  };

  const handleThumbnailDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setThumbnailDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleThumbnailFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg("");
    setErrorMsg("");

    const ytId = extractYoutubeId(videoData.videoUrl);
    if (!videoData.videoUrl.trim()) {
      setErrorMsg("Please enter a YouTube video URL or upload a video file.");
      setSaving(false);
      return;
    }

    if (!ytId && !isDirectVideoUrl(videoData.videoUrl)) {
      setErrorMsg(
        "Invalid video URL. Please enter a valid YouTube link or upload a video file."
      );
      setSaving(false);
      return;
    }

    try {
      const updated = await apiFetch<ConceptVideoData>("/api/v1/concept-video", {
        method: "POST",
        body: JSON.stringify({
          ...videoData,
          youtubeId: ytId || "",
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
        "Cannot play preview: Please enter a valid YouTube URL or upload a video file."
      );
      return;
    }
    setIsPlayerOpen(true);
  };

  // Effective thumbnail image
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
            <Video size={26} color="var(--accent-color, #10b981)" /> Concept Video Settings
          </h1>
          <p style={{ color: "var(--text-secondary)", marginTop: 4 }}>
            Manage the main educational Concept Video displayed on the Mobile App Dashboard (YouTube Link or Gallery/File Upload).
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

          <form onSubmit={handleSave} style={{ display: "grid", gap: 20 }}>
            {/* VIDEO SOURCE MODE SELECTOR TABS */}
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: 13,
                  fontWeight: 600,
                  marginBottom: 8,
                  color: "var(--text-primary)",
                }}
              >
                Choose Video Input Method <span style={{ color: "#ef4444" }}>*</span>
              </label>

              <div
                style={{
                  display: "flex",
                  gap: 10,
                  marginBottom: 14,
                  background: "#f1f5f9",
                  padding: 4,
                  borderRadius: 10,
                }}
              >
                <button
                  type="button"
                  onClick={() => setVideoSourceMode("youtube")}
                  style={{
                    flex: 1,
                    padding: "8px 14px",
                    borderRadius: 8,
                    border: "none",
                    background: videoSourceMode === "youtube" ? "#ffffff" : "transparent",
                    color: videoSourceMode === "youtube" ? "#0f172a" : "#64748b",
                    fontWeight: 700,
                    fontSize: 13,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                    boxShadow: videoSourceMode === "youtube" ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                  }}
                >
                  <Video size={16} color={videoSourceMode === "youtube" ? "#ff0000" : "#64748b"} />
                  YouTube URL
                </button>

                <button
                  type="button"
                  onClick={() => setVideoSourceMode("upload")}
                  style={{
                    flex: 1,
                    padding: "8px 14px",
                    borderRadius: 8,
                    border: "none",
                    background: videoSourceMode === "upload" ? "#ffffff" : "transparent",
                    color: videoSourceMode === "upload" ? "#0f172a" : "#64748b",
                    fontWeight: 700,
                    fontSize: 13,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                    boxShadow: videoSourceMode === "upload" ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                  }}
                >
                  <FolderOpen size={16} color={videoSourceMode === "upload" ? "#10b981" : "#64748b"} />
                  Gallery / Drag & Drop
                </button>
              </div>

              {/* YOUTUBE URL INPUT MODE */}
              {videoSourceMode === "youtube" && (
                <div>
                  <div style={{ position: "relative" }}>
                    <input
                      type="url"
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
                      <AlertCircle size={14} /> Invalid YouTube link. Supported: watch?v=..., youtu.be/..., shorts/...
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
                      Supports YouTube standard (watch?v=...), Short URLs (youtu.be/...), or YouTube Shorts (/shorts/...)
                    </span>
                  )}
                </div>
              )}

              {/* GALLERY / FILE UPLOAD & DRAG & DROP MODE */}
              {videoSourceMode === "upload" && (
                <div>
                  <input
                    type="file"
                    ref={videoFileInputRef}
                    accept="video/mp4,video/mov,video/webm,video/*"
                    style={{ display: "none" }}
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        handleVideoFileUpload(e.target.files[0]);
                      }
                    }}
                  />

                  <div
                    onDragEnter={handleVideoDrag}
                    onDragLeave={handleVideoDrag}
                    onDragOver={handleVideoDrag}
                    onDrop={handleVideoDrop}
                    onClick={() => videoFileInputRef.current?.click()}
                    style={{
                      border: videoDragActive
                        ? "2px dashed #10b981"
                        : "2px dashed #cbd5e1",
                      background: videoDragActive ? "#ecfdf5" : "#f8fafc",
                      borderRadius: 12,
                      padding: "24px 16px",
                      textAlign: "center",
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 8,
                    }}
                  >
                    {uploadingVideo ? (
                      <>
                        <RefreshCw size={28} color="#10b981" className="spin" />
                        <span style={{ fontSize: 14, fontWeight: 700, color: "#10b981" }}>
                          Uploading video file to cloud...
                        </span>
                        <span style={{ fontSize: 12, color: "#64748b" }}>
                          Please wait while your video file is processed
                        </span>
                      </>
                    ) : (
                      <>
                        <div
                          style={{
                            width: 48,
                            height: 48,
                            borderRadius: 24,
                            background: "#e0f2fe",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            marginBottom: 4,
                          }}
                        >
                          <UploadCloud size={24} color="#0284c7" />
                        </div>
                        <span style={{ fontSize: 14, fontWeight: 700, color: "#1e293b" }}>
                          Drag & Drop video file here
                        </span>
                        <span style={{ fontSize: 12, color: "#64748b" }}>
                          or <strong style={{ color: "#0284c7" }}>click to browse from Gallery / Device</strong>
                        </span>
                        <span style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>
                          Supports MP4, MOV, WEBM (Max 100MB)
                        </span>
                      </>
                    )}
                  </div>

                  {isDirectVideo && (
                    <div
                      style={{
                        marginTop: 10,
                        padding: "8px 12px",
                        background: "#f1f5f9",
                        borderRadius: 8,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        fontSize: 12,
                      }}
                    >
                      <span
                        style={{
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          maxWidth: "80%",
                          color: "#334155",
                          fontWeight: 600,
                        }}
                      >
                        📹 Uploaded Video: {videoData.videoUrl.split("/").pop()}
                      </span>
                      <button
                        type="button"
                        onClick={() => videoFileInputRef.current?.click()}
                        style={{
                          background: "none",
                          border: "none",
                          color: "#0284c7",
                          fontWeight: 700,
                          cursor: "pointer",
                        }}
                      >
                        Change File
                      </button>
                    </div>
                  )}
                </div>
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
                Video Title{" "}
                <span style={{ fontSize: 11, fontWeight: 400, color: "#6b7280" }}>
                  (Optional)
                </span>
              </label>
              <input
                type="text"
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
                Video Subtitle / Description{" "}
                <span style={{ fontSize: 11, fontWeight: 400, color: "#6b7280" }}>
                  (Optional)
                </span>
              </label>
              <textarea
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

            {/* THUMBNAIL UPLOAD & DRAG & DROP SECTION */}
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
                  Thumbnail Image{" "}
                  <span style={{ fontSize: 11, fontWeight: 400, color: "#6b7280" }}>
                    (Upload from Gallery or YouTube thumbnail)
                  </span>
                </label>
                {currentYtId && (
                  <button
                    type="button"
                    className="btn-secondary"
                    style={{ fontSize: 12, padding: "3px 10px", display: "flex", alignItems: "center", gap: 4 }}
                    onClick={() =>
                      setVideoData({
                        ...videoData,
                        thumbnailUrl: `https://img.youtube.com/vi/${currentYtId}/maxresdefault.jpg`,
                      })
                    }
                  >
                    <RefreshCw size={12} /> Auto YouTube Thumbnail
                  </button>
                )}
              </div>

              {/* THUMBNAIL DRAG & DROP ZONE */}
              <input
                type="file"
                ref={thumbnailFileInputRef}
                accept="image/png,image/jpeg,image/jpg,image/webp,image/*"
                style={{ display: "none" }}
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleThumbnailFileUpload(e.target.files[0]);
                  }
                }}
              />

              <div
                onDragEnter={handleThumbnailDrag}
                onDragLeave={handleThumbnailDrag}
                onDragOver={handleThumbnailDrag}
                onDrop={handleThumbnailDrop}
                onClick={() => thumbnailFileInputRef.current?.click()}
                style={{
                  border: thumbnailDragActive
                    ? "2px dashed #10b981"
                    : "1px dashed var(--border-color, #cbd5e1)",
                  background: thumbnailDragActive ? "#ecfdf5" : "#fafafa",
                  borderRadius: 10,
                  padding: "16px",
                  textAlign: "center",
                  cursor: "pointer",
                  marginBottom: 8,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 12,
                  transition: "all 0.2s ease",
                }}
              >
                {uploadingThumbnail ? (
                  <>
                    <RefreshCw size={20} color="#10b981" className="spin" />
                    <span style={{ fontSize: 13, fontWeight: 600, color: "#10b981" }}>
                      Uploading thumbnail image...
                    </span>
                  </>
                ) : (
                  <>
                    <ImageIcon size={22} color="#10b981" />
                    <div style={{ textAlign: "left" }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: "#1e293b", display: "block" }}>
                        Drag & Drop thumbnail image here or <span style={{ color: "#10b981" }}>browse Gallery</span>
                      </span>
                      <span style={{ fontSize: 11, color: "#64748b" }}>
                        PNG, JPG, WEBP recommended
                      </span>
                    </div>
                  </>
                )}
              </div>

              {/* THUMBNAIL URL INPUT FALLBACK */}
              <div style={{ position: "relative" }}>
                <input
                  type="url"
                  placeholder="Or paste direct image URL (https://...)"
                  value={videoData.thumbnailUrl}
                  onChange={(e) =>
                    setVideoData({ ...videoData, thumbnailUrl: e.target.value })
                  }
                  style={{
                    width: "100%",
                    padding: "8px 12px 8px 36px",
                    borderRadius: 8,
                    border: "1px solid var(--border-color, #e5e7eb)",
                    fontSize: 13,
                  }}
                />
                <LinkIcon
                  size={16}
                  color="var(--text-secondary)"
                  style={{ position: "absolute", left: 12, top: 10 }}
                />
              </div>
            </div>

            {/* SAVE BUTTON */}
            <div style={{ marginTop: 12 }}>
              <button
                type="submit"
                className="btn-primary"
                disabled={saving || uploadingVideo || uploadingThumbnail || (hasUrlInput && !isUrlValid)}
                style={{
                  padding: "12px 24px",
                  fontSize: 15,
                  fontWeight: 700,
                  borderRadius: 12,
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  opacity: saving || uploadingVideo || uploadingThumbnail || (hasUrlInput && !isUrlValid) ? 0.6 : 1,
                  cursor:
                    saving || uploadingVideo || uploadingThumbnail || (hasUrlInput && !isUrlValid)
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
                    ? "Click to preview video in player modal"
                    : "Enter a valid video URL or upload a video file to preview"
                }
              >
                <img
                  src={effectiveThumbnail}
                  alt="Thumbnail"
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  onError={(e) => {
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

      {/* EMBEDDED VIDEO PLAYER MODAL (SUPPORTS BOTH YOUTUBE AND DIRECT VIDEO FILES) */}
      {isPlayerOpen && (
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

            {/* RESPONSIVE VIDEO PLAYER CONTAINER */}
            <div
              style={{
                position: "relative",
                width: "100%",
                aspectRatio: "16 / 9",
                background: "#000",
              }}
            >
              {isDirectVideo ? (
                <video
                  src={videoData.videoUrl}
                  controls
                  autoPlay
                  style={{ width: "100%", height: "100%", objectFit: "contain" }}
                />
              ) : currentYtId ? (
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
              ) : (
                <div style={{ color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", height: "100%" }}>
                  No playable video stream available.
                </div>
              )}
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
                  {isDirectVideo ? "Direct Video File Stream" : "YouTube IFrame Player"} • Play, pause, seek, volume enabled
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
