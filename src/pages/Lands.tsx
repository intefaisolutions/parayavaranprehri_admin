import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  Loader2,
  MapPinned,
  CheckCircle,
  Clock,
  XCircle,
  Filter,
  RefreshCw,
  FileSpreadsheet,
} from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";
import DataTable from "../components/DataTable";
import DeleteConfirmModal from "./modals/DeleteConfirmModal";
import LandOfferViewModal from "./modals/LandOfferViewModal";
import type { LandOfferItem } from "./modals/LandOfferViewModal";
import { apiFetch } from "../utils/apiConfig";
import { OWNERSHIP_LABELS, STATUS_LABELS } from "../utils/landCapacity";

export interface LandRow {
  _id: string;
  landId: string;
  landName: string;
  ownershipType: string;
  totalArea: number;
  areaUnit: string;
  totalAreaAcres?: number;
  maxTreeCapacity: number;
  plantedTrees: number;
  availableCapacity: number;
  vidhanSabha?: string;
  district?: string;
  status: string;
  khasraNumber?: string;
}

interface OwnershipCard {
  ownershipType: string;
  totalLand: number;
  totalAreaAcres: number;
  treeCapacity: number;
  treesPlanted: number;
  remainingCapacity: number;
}

export const LandsView = () => {
  const navigate = useNavigate();
  const [mainTab, setMainTab] = useState<"offers" | "parcels">("offers");

  // State for Land Offer Inquiries (APK)
  const [offers, setOffers] = useState<LandOfferItem[]>([]);
  const [loadingOffers, setLoadingOffers] = useState(true);
  const [offerStatusFilter, setOfferStatusFilter] = useState<string>("ALL");
  const [selectedOffer, setSelectedOffer] = useState<LandOfferItem | null>(null);
  const [updatingOfferId, setUpdatingOfferId] = useState<string | null>(null);

  // State for Registered Land Parcels
  const [lands, setLands] = useState<LandRow[]>([]);
  const [dashboard, setDashboard] = useState<OwnershipCard[]>([]);
  const [loadingLands, setLoadingLands] = useState(true);

  const [error, setError] = useState("");
  const [deleteItem, setDeleteItem] = useState<LandRow | null>(null);

  const loadOffers = async () => {
    setLoadingOffers(true);
    try {
      const list = await apiFetch<LandOfferItem[]>("/api/v1/land-offers");
      setOffers(Array.isArray(list) ? list : []);
    } catch (err: any) {
      console.error("Failed to load land offer inquiries:", err);
      setOffers([]);
    } finally {
      setLoadingOffers(false);
    }
  };

  const loadLands = async () => {
    setLoadingLands(true);
    try {
      const [list, cards] = await Promise.all([
        apiFetch<LandRow[]>("/api/v1/lands"),
        apiFetch<OwnershipCard[]>("/api/v1/lands/dashboard/ownership"),
      ]);
      setLands(Array.isArray(list) ? list : []);
      setDashboard(Array.isArray(cards) ? cards : []);
    } catch (err: any) {
      console.error("Failed to load registered lands:", err);
    } finally {
      setLoadingLands(false);
    }
  };

  const loadAll = async () => {
    setError("");
    await Promise.all([loadOffers(), loadLands()]);
  };

  useEffect(() => {
    loadAll();
  }, []);

  const handleUpdateOfferStatus = async (id: string, status: string) => {
    setUpdatingOfferId(id);
    try {
      const updated = await apiFetch<LandOfferItem>(`/api/v1/land-offers/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });

      // Update state locally
      setOffers((prev) =>
        prev.map((item) => (item._id === id ? { ...item, status } : item))
      );

      if (selectedOffer && selectedOffer._id === id) {
        setSelectedOffer((prev) => (prev ? { ...prev, status } : null));
      }
    } catch (err: any) {
      alert(err.message || "Failed to update inquiry status");
    } finally {
      setUpdatingOfferId(null);
    }
  };

  const handleDeleteLand = async () => {
    if (!deleteItem) return;
    try {
      await apiFetch(`/api/v1/lands/${deleteItem._id}`, { method: "DELETE" });
      await loadLands();
    } catch (err: any) {
      setError(err.message || "Failed to delete land");
    } finally {
      setDeleteItem(null);
    }
  };

  // Filtered Land Offer Inquiries
  const filteredOffers = offers.filter((o) => {
    if (offerStatusFilter === "ALL") return true;
    const st = (o.status || "Pending").toLowerCase();
    return st === offerStatusFilter.toLowerCase();
  });

  const offerCounts = {
    total: offers.length,
    pending: offers.filter((o) => (o.status || "Pending").toLowerCase() === "pending").length,
    selected: offers.filter((o) => (o.status || "").toLowerCase() === "selected").length,
    rejected: offers.filter((o) => (o.status || "").toLowerCase() === "rejected").length,
  };

  // Columns for Land Offer Inquiries Table
  const offerColumns: ColumnDef<LandOfferItem>[] = [
    {
      accessorKey: "fullName",
      header: "User Details",
      cell: ({ row }) => (
        <div>
          <div style={{ fontWeight: 700, color: "var(--text-primary)" }}>
            {row.original.fullName}
          </div>
          <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>
            📞 {row.original.mobile}
          </div>
        </div>
      ),
      enableSorting: true,
    },
    {
      accessorKey: "address",
      header: "Land Location",
      cell: ({ row }) => (
        <div>
          <div style={{ fontWeight: 600, color: "var(--text-primary)" }}>
            {row.original.address}
          </div>
          {row.original.landmark && (
            <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>
              📍 Near: {row.original.landmark}
            </div>
          )}
        </div>
      ),
      enableSorting: true,
    },
    {
      id: "landSpecs",
      header: "Land Area & Size",
      cell: ({ row }) => (
        <div>
          <div>
            Size: <strong>{row.original.landSize}</strong>
          </div>
          <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>
            Area: {row.original.availableArea}
          </div>
        </div>
      ),
      enableSorting: false,
    },
    {
      accessorKey: "createdAt",
      header: "Submitted Date",
      cell: ({ row }) =>
        row.original.createdAt
          ? new Date(row.original.createdAt).toLocaleDateString("en-GB", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })
          : "—",
      enableSorting: true,
    },
    {
      accessorKey: "status",
      header: "Inquiry Status",
      cell: ({ row }) => {
        const s = (row.original.status || "Pending").toLowerCase();
        const isSel = s === "selected";
        const isRej = s === "rejected";
        const tone = isSel
          ? "status-active"
          : isRej
          ? "status-inactive"
          : "status-warning";
        return (
          <span className={`status-badge ${tone}`}>
            {isSel ? "✓ Selected" : isRej ? "✕ Rejected" : "⏳ Pending"}
          </span>
        );
      },
      enableSorting: true,
    },
    {
      header: "Actions",
      cell: ({ row }) => {
        const s = (row.original.status || "Pending").toLowerCase();
        const isSel = s === "selected";
        const isRej = s === "rejected";
        const isUpdating = updatingOfferId === row.original._id;
        return (
          <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
            <button
              className="icon-btn"
              style={{ width: 30, height: 30 }}
              title="View Details"
              onClick={() => setSelectedOffer(row.original)}
            >
              <Eye size={15} />
            </button>

            <button
              className="btn-primary"
              style={{
                padding: "4px 10px",
                fontSize: 12,
                background: isSel ? "#9ca3af" : "#10b981",
                borderColor: isSel ? "#9ca3af" : "#10b981",
              }}
              disabled={isUpdating || isSel}
              onClick={() => handleUpdateOfferStatus(row.original._id, "Selected")}
              title="Select this land offer for plantation"
            >
              {isUpdating ? <Loader2 size={13} className="spin" /> : "Select Land"}
            </button>

            {!isRej && (
              <button
                className="btn-danger"
                style={{ padding: "4px 8px", fontSize: 12 }}
                disabled={isUpdating}
                onClick={() => handleUpdateOfferStatus(row.original._id, "Rejected")}
                title="Reject Offer"
              >
                Reject
              </button>
            )}
          </div>
        );
      },
      enableSorting: false,
    },
  ];

  // Columns for Registered Land Parcels Table
  const parcelColumns: ColumnDef<LandRow>[] = [
    { accessorKey: "landId", header: "Land ID", enableSorting: true },
    { accessorKey: "landName", header: "Land Name", enableSorting: true },
    {
      accessorKey: "ownershipType",
      header: "Ownership",
      cell: ({ row }) =>
        OWNERSHIP_LABELS[row.original.ownershipType] ||
        row.original.ownershipType,
      enableSorting: true,
    },
    {
      id: "area",
      header: "Area",
      cell: ({ row }) =>
        `${row.original.totalArea} ${row.original.areaUnit?.replace("_", " ")}`,
      enableSorting: false,
    },
    { accessorKey: "maxTreeCapacity", header: "Capacity", enableSorting: true },
    { accessorKey: "plantedTrees", header: "Planted", enableSorting: true },
    { accessorKey: "availableCapacity", header: "Remaining", enableSorting: true },
    {
      accessorKey: "vidhanSabha",
      header: "Vidhan Sabha",
      cell: ({ row }) => row.original.vidhanSabha || "—",
      enableSorting: true,
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const full =
          STATUS_LABELS[row.original.status] || row.original.status || "—";
        const tone =
          row.original.status === "AVAILABLE"
            ? "status-active"
            : row.original.status === "FULLY_OCCUPIED" ||
              row.original.status === "RESTRICTED"
            ? "status-inactive"
            : "status-warning";
        return <span className={`status-badge ${tone}`}>{full}</span>;
      },
      enableSorting: false,
    },
    {
      header: "Actions",
      cell: ({ row }) => (
        <div style={{ display: "flex", gap: 8 }}>
          <button
            className="icon-btn"
            style={{ width: 28, height: 28 }}
            title="View"
            onClick={() =>
              navigate("/lands/view", { state: { land: row.original } })
            }
          >
            <Eye size={14} />
          </button>
          <button
            className="icon-btn"
            style={{ width: 28, height: 28 }}
            title="Edit"
            onClick={() =>
              navigate("/lands/edit", { state: { land: row.original } })
            }
          >
            <Edit size={14} />
          </button>
          <button
            className="icon-btn"
            style={{ width: 28, height: 28 }}
            title="Delete"
            onClick={() => setDeleteItem(row.original)}
          >
            <Trash2 size={14} />
          </button>
        </div>
      ),
      enableSorting: false,
    },
  ];

  return (
    <>
      <div className="dashboard-area">
        {/* PAGE HEADER */}
        <div className="page-header">
          <div className="page-title">
            <h1>Land Management</h1>
            <p>
              Manage land offer inquiries submitted from APK and registered plantation land parcels.
            </p>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button
              className="btn-secondary"
              onClick={loadAll}
              title="Refresh Data"
              style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
            >
              <RefreshCw size={16} /> Refresh
            </button>
            <button
              className="btn-primary"
              onClick={() => navigate("/lands/add")}
              style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
            >
              <Plus size={18} /> Add Land Parcel
            </button>
          </div>
        </div>

        {error && (
          <div
            style={{
              background: "rgba(255, 61, 0, 0.1)",
              color: "#ff3d00",
              padding: 12,
              borderRadius: 8,
              marginBottom: 16,
            }}
          >
            {error}
          </div>
        )}

        {/* TABS HEADER */}
        <div
          style={{
            display: "flex",
            gap: 12,
            marginBottom: 20,
            borderBottom: "2px solid var(--border-color, #e5e7eb)",
            paddingBottom: 2,
          }}
        >
          <button
            type="button"
            style={{
              padding: "10px 18px",
              fontWeight: 700,
              fontSize: 14,
              border: "none",
              background: "none",
              cursor: "pointer",
              borderBottom:
                mainTab === "offers"
                  ? "3px solid var(--accent-color, #10b981)"
                  : "3px solid transparent",
              color:
                mainTab === "offers"
                  ? "var(--accent-color, #10b981)"
                  : "var(--text-secondary)",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
            onClick={() => setMainTab("offers")}
          >
            <FileSpreadsheet size={18} /> Land Offer Inquiries (APK)
            <span
              style={{
                background:
                  mainTab === "offers"
                    ? "var(--accent-color, #10b981)"
                    : "#e5e7eb",
                color: mainTab === "offers" ? "#fff" : "#374151",
                fontSize: 12,
                borderRadius: 10,
                padding: "2px 8px",
              }}
            >
              {offers.length}
            </span>
          </button>

          <button
            type="button"
            style={{
              padding: "10px 18px",
              fontWeight: 700,
              fontSize: 14,
              border: "none",
              background: "none",
              cursor: "pointer",
              borderBottom:
                mainTab === "parcels"
                  ? "3px solid var(--accent-color, #10b981)"
                  : "3px solid transparent",
              color:
                mainTab === "parcels"
                  ? "var(--accent-color, #10b981)"
                  : "var(--text-secondary)",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
            onClick={() => setMainTab("parcels")}
          >
            <MapPinned size={18} /> Registered Land Parcels
            <span
              style={{
                background:
                  mainTab === "parcels"
                    ? "var(--accent-color, #10b981)"
                    : "#e5e7eb",
                color: mainTab === "parcels" ? "#fff" : "#374151",
                fontSize: 12,
                borderRadius: 10,
                padding: "2px 8px",
              }}
            >
              {lands.length}
            </span>
          </button>
        </div>

        {/* TAB 1: LAND OFFER INQUIRIES FROM APK */}
        {mainTab === "offers" && (
          <>
            {/* STAT CARDS FOR INQUIRIES */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
                gap: 12,
                marginBottom: 20,
              }}
            >
              <div className="card" style={{ padding: 16 }}>
                <div style={{ fontSize: 12, color: "var(--text-secondary)", fontWeight: 600 }}>
                  Total Inquiries
                </div>
                <div style={{ fontSize: 24, fontWeight: 800, color: "var(--text-primary)", marginTop: 4 }}>
                  {offerCounts.total}
                </div>
              </div>
              <div className="card" style={{ padding: 16, borderLeft: "4px solid #f59e0b" }}>
                <div style={{ fontSize: 12, color: "#d97706", fontWeight: 600, display: "flex", alignItems: "center", gap: 4 }}>
                  <Clock size={14} /> Pending Inquiries
                </div>
                <div style={{ fontSize: 24, fontWeight: 800, color: "#d97706", marginTop: 4 }}>
                  {offerCounts.pending}
                </div>
              </div>
              <div className="card" style={{ padding: 16, borderLeft: "4px solid #10b981" }}>
                <div style={{ fontSize: 12, color: "#059669", fontWeight: 600, display: "flex", alignItems: "center", gap: 4 }}>
                  <CheckCircle size={14} /> Selected Lands
                </div>
                <div style={{ fontSize: 24, fontWeight: 800, color: "#059669", marginTop: 4 }}>
                  {offerCounts.selected}
                </div>
              </div>
              <div className="card" style={{ padding: 16, borderLeft: "4px solid #ef4444" }}>
                <div style={{ fontSize: 12, color: "#dc2626", fontWeight: 600, display: "flex", alignItems: "center", gap: 4 }}>
                  <XCircle size={14} /> Rejected Inquiries
                </div>
                <div style={{ fontSize: 24, fontWeight: 800, color: "#dc2626", marginTop: 4 }}>
                  {offerCounts.rejected}
                </div>
              </div>
            </div>

            {/* STATUS FILTER PILLS */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginBottom: 16,
              }}
            >
              <Filter size={16} color="var(--text-secondary)" />
              <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-secondary)" }}>
                Filter Status:
              </span>
              {["ALL", "Pending", "Selected", "Rejected"].map((statusKey) => (
                <button
                  key={statusKey}
                  type="button"
                  onClick={() => setOfferStatusFilter(statusKey)}
                  style={{
                    padding: "5px 12px",
                    borderRadius: 20,
                    fontSize: 12,
                    fontWeight: 600,
                    border: "1px solid",
                    cursor: "pointer",
                    borderColor:
                      offerStatusFilter === statusKey
                        ? "var(--accent-color, #10b981)"
                        : "var(--border-color, #e5e7eb)",
                    background:
                      offerStatusFilter === statusKey
                        ? "var(--accent-color, #10b981)"
                        : "#fff",
                    color: offerStatusFilter === statusKey ? "#fff" : "#374151",
                  }}
                >
                  {statusKey === "ALL" ? "All Inquiries" : statusKey}
                </button>
              ))}
            </div>

            {/* OFFERS TABLE */}
            <div className="card">
              {loadingOffers ? (
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    padding: 40,
                  }}
                >
                  <Loader2 size={24} className="spin" />
                </div>
              ) : filteredOffers.length === 0 ? (
                <div
                  style={{
                    textAlign: "center",
                    padding: 48,
                    color: "var(--text-secondary)",
                  }}
                >
                  <FileSpreadsheet size={32} style={{ marginBottom: 8 }} />
                  <p style={{ fontWeight: 600 }}>No land offer inquiries found.</p>
                  <p style={{ fontSize: 13 }}>
                    Submissions from users via the APK "Offer Land" form will appear here.
                  </p>
                </div>
              ) : (
                <DataTable
                  data={filteredOffers}
                  columns={offerColumns}
                  searchPlaceholder="Search user name, mobile, address, landmark..."
                />
              )}
            </div>
          </>
        )}

        {/* TAB 2: REGISTERED LAND PARCELS */}
        {mainTab === "parcels" && (
          <>
            {dashboard.length > 0 && (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
                  gap: 12,
                  marginBottom: 16,
                }}
              >
                {dashboard.map((card) => (
                  <div
                    key={card.ownershipType}
                    className="card"
                    style={{ padding: 16 }}
                  >
                    <div
                      style={{
                        fontWeight: 700,
                        marginBottom: 10,
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                      }}
                    >
                      <MapPinned size={16} color="var(--accent-color)" />
                      {OWNERSHIP_LABELS[card.ownershipType] || card.ownershipType}
                    </div>
                    <div style={{ fontSize: 13, color: "var(--text-secondary)", display: "grid", gap: 4 }}>
                      <div>
                        Total Land:{" "}
                        <strong style={{ color: "var(--text-primary)" }}>
                          {card.totalLand.toLocaleString()}
                        </strong>
                      </div>
                      <div>
                        Total Area:{" "}
                        <strong style={{ color: "var(--text-primary)" }}>
                          {card.totalAreaAcres.toLocaleString()} Acres
                        </strong>
                      </div>
                      <div>
                        Tree Capacity:{" "}
                        <strong style={{ color: "var(--text-primary)" }}>
                          {card.treeCapacity.toLocaleString()}
                        </strong>
                      </div>
                      <div>
                        Trees Planted:{" "}
                        <strong style={{ color: "var(--text-primary)" }}>
                          {card.treesPlanted.toLocaleString()}
                        </strong>
                      </div>
                      <div>
                        Remaining:{" "}
                        <strong style={{ color: "var(--accent-color)" }}>
                          {card.remainingCapacity.toLocaleString()}
                        </strong>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="card">
              {loadingLands ? (
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    padding: 40,
                  }}
                >
                  <Loader2 size={24} className="spin" />
                </div>
              ) : lands.length === 0 ? (
                <div
                  style={{
                    textAlign: "center",
                    padding: 48,
                    color: "var(--text-secondary)",
                  }}
                >
                  <MapPinned size={28} style={{ marginBottom: 8 }} />
                  <p>No land parcels yet. Add government or private land to start planning plantations.</p>
                  <button
                    className="btn-primary"
                    style={{ marginTop: 12 }}
                    onClick={() => navigate("/lands/add")}
                  >
                    <Plus size={16} /> Add Land Parcel
                  </button>
                </div>
              ) : (
                <DataTable
                  data={lands}
                  columns={parcelColumns}
                  searchPlaceholder="Search land name, ID, khasra, address, PIN..."
                />
              )}
            </div>
          </>
        )}
      </div>

      {/* VIEW OFFER INQUIRY MODAL */}
      <LandOfferViewModal
        isOpen={!!selectedOffer}
        onClose={() => setSelectedOffer(null)}
        offer={selectedOffer}
        onStatusChange={handleUpdateOfferStatus}
        updating={!!updatingOfferId}
      />

      {/* DELETE PARCEL CONFIRM MODAL */}
      <DeleteConfirmModal
        isOpen={!!deleteItem}
        onClose={() => setDeleteItem(null)}
        onConfirm={handleDeleteLand}
        personName={deleteItem?.landName}
        title="Delete Land Parcel"
      />
    </>
  );
};

export default LandsView;
