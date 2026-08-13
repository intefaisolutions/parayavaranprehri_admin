import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Bell,
  LogOut,
  Menu,
  PanelLeftClose,
  PanelLeft,
  LayoutDashboard,
  Users,
  Car,
  TreePine,
  FileBadge,
  UserCheck,
  ClipboardList,
  Building,
  Map,
  Newspaper,
  Image as ImageIcon,
  Users2,
  Award,
  Handshake,
  PhoneCall,
  Languages,
  Download,
  Settings,
  ShieldCheck,
  History,
  Leaf,
  Sparkles,
  Sprout,
  Route,
  CalendarDays,
  AlertTriangle,
  Wrench,
  MapPinned,
  Loader2,
  ArrowRight,
  User,
  ChevronDown,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { apiFetch } from "../../utils/apiConfig";

interface HeaderProps {
  onToggleMobileSidebar?: () => void;
  onToggleCollapse?: () => void;
  sidebarCollapsed?: boolean;
}

type SearchResult = {
  id: string;
  label: string;
  subtitle?: string;
  path: string;
  state?: Record<string, unknown>;
  group: "Pages" | "Persons" | "Mitras" | "Lands" | "Vidhan Sabha" | "Certificates";
  icon: LucideIcon;
};

const PAGE_ITEMS: Array<{
  id: string;
  label: string;
  path: string;
  icon: LucideIcon;
  keywords?: string;
}> = [
  { id: "dashboard", label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
  { id: "vidhansabha", label: "Vidhan Sabha", path: "/vidhansabha", icon: Building, keywords: "constituency assembly" },
  { id: "lands", label: "Land Management", path: "/lands", icon: MapPinned, keywords: "plot land" },
  { id: "tree-masters", label: "Tree Master Catalog", path: "/tree-masters", icon: Leaf },
  { id: "map", label: "Plantation Map", path: "/map", icon: Map },
  { id: "persons", label: "Person Management", path: "/persons", icon: Users, keywords: "people citizen" },
  { id: "identity", label: "Person Identity", path: "/identity", icon: FileBadge },
  { id: "vehicles", label: "Vehicle Management", path: "/vehicles", icon: Car },
  { id: "mitras", label: "Paryavaran Mitra", path: "/mitras", icon: UserCheck, keywords: "volunteer mitra" },
  { id: "plantations", label: "Plantation Requests", path: "/plantations", icon: Sprout },
  { id: "trees", label: "Tree Management", path: "/trees", icon: TreePine },
  { id: "rashi-trees", label: "Rashi Tree Recommendations", path: "/rashi-trees", icon: Sparkles },
  { id: "rashi-plant-requests", label: "Sacred Tree Plant Requests", path: "/rashi-plant-requests", icon: Leaf, keywords: "rashi sacred plant request" },
  { id: "tasks", label: "Task Management", path: "/tasks", icon: ClipboardList },
  { id: "mitra-events", label: "Mitra Events", path: "/mitra-events", icon: CalendarDays },
  { id: "field-issues", label: "Field Issues", path: "/field-issues", icon: AlertTriangle },
  { id: "maintenance-logs", label: "Maintenance Logs", path: "/maintenance-logs", icon: Wrench },
  { id: "journey", label: "Journey & Achievements", path: "/journey", icon: Route },
  { id: "certificates", label: "Certificates", path: "/certificates", icon: Award, keywords: "template" },
  { id: "certificates-issued", label: "Issued Certificates", path: "/certificates/issued", icon: FileBadge },
  { id: "news", label: "News Management", path: "/news", icon: Newspaper },
  { id: "media", label: "Media Management", path: "/media", icon: ImageIcon },
  { id: "leaders", label: "Initiative Leaders", path: "/leaders", icon: Users2 },
  { id: "partners", label: "Channel Partners", path: "/partners", icon: Handshake },
  { id: "notifications", label: "Notifications", path: "/notifications", icon: Bell },
  { id: "callcenter", label: "Call Center", path: "/callcenter", icon: PhoneCall },
  { id: "languages", label: "Languages", path: "/languages", icon: Languages },
  { id: "reports", label: "Reports", path: "/reports", icon: Download },
  { id: "settings", label: "System Settings", path: "/settings", icon: Settings },
  { id: "roles", label: "Role & Permissions", path: "/roles", icon: ShieldCheck },
  { id: "audit", label: "Audit Logs", path: "/audit", icon: History },
];

function asArray<T>(data: unknown): T[] {
  if (Array.isArray(data)) return data as T[];
  if (data && typeof data === "object" && Array.isArray((data as any).items)) {
    return (data as any).items as T[];
  }
  return [];
}

const Header: React.FC<HeaderProps> = ({
  onToggleMobileSidebar,
  onToggleCollapse,
  sidebarCollapsed = false,
}) => {
  const navigate = useNavigate();
  const wrapRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [entityResults, setEntityResults] = useState<SearchResult[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const [storedUser, setStoredUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "{}");
    } catch {
      return {};
    }
  });
  const displayName = storedUser.firstName
    ? `${storedUser.firstName} ${storedUser.lastName || ""}`.trim()
    : storedUser.email || storedUser.phone || "Command Center Admin";

  const displayRole = (storedUser.role || "Super Admin")
    .toString()
    .replace(/_/g, " ");

  const headerFallbackAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=0D8ABC&color=fff`;

  const [avatarSrc, setAvatarSrc] = useState(headerFallbackAvatar);

  useEffect(() => {
    const refreshUser = () => {
      try {
        setStoredUser(JSON.parse(localStorage.getItem("user") || "{}"));
      } catch {
        setStoredUser({});
      }
    };
    window.addEventListener("user-updated", refreshUser);
    window.addEventListener("storage", refreshUser);
    return () => {
      window.removeEventListener("user-updated", refreshUser);
      window.removeEventListener("storage", refreshUser);
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    const fallback = `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=0D8ABC&color=fff`;
    const raw = String(
      storedUser.avatarPreview || storedUser.avatar || "",
    ).trim();

    const load = async () => {
      if (!raw) {
        if (!cancelled) setAvatarSrc(fallback);
        return;
      }
      // Prefer permanent S3 URL (strip signed query) — signed GET often 403s
      const permanent =
        /amazonaws\.com|\.s3[.-]/i.test(raw) ? raw.split("?")[0] : raw;
      if (!cancelled) setAvatarSrc(permanent || fallback);
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [storedUser.avatar, storedUser.avatarPreview, displayName]);

  const pageResults = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return PAGE_ITEMS.filter((item) => {
      const hay = `${item.label} ${item.id} ${item.keywords || ""}`.toLowerCase();
      return hay.includes(q);
    })
      .slice(0, 8)
      .map<SearchResult>((item) => ({
        id: `page-${item.id}`,
        label: item.label,
        subtitle: item.path,
        path: item.path,
        group: "Pages",
        icon: item.icon,
      }));
  }, [query]);

  const results = useMemo(
    () => [...pageResults, ...entityResults],
    [pageResults, entityResults],
  );

  useEffect(() => {
    setActiveIndex(0);
  }, [results.length, query]);

  useEffect(() => {
    const q = query.trim();
    if (q.length < 2) {
      setEntityResults([]);
      setLoading(false);
      return;
    }

    let cancelled = false;
    const timer = window.setTimeout(async () => {
      setLoading(true);
      try {
        const enc = encodeURIComponent(q);
        const [persons, mitras, lands, vidhans, templates] = await Promise.all([
          apiFetch(`/api/v1/persons?search=${enc}&limit=5`).catch(() => []),
          apiFetch(`/api/v1/mitras?search=${enc}`).catch(() => []),
          apiFetch(`/api/v1/lands?search=${enc}&limit=5`).catch(() => []),
          apiFetch(`/api/v1/vidhan-sabhas?search=${enc}&limit=5`).catch(() => []),
          apiFetch(`/api/v1/certificates/templates?search=${enc}`).catch(() => []),
        ]);

        if (cancelled) return;

        const next: SearchResult[] = [];

        asArray<any>(persons)
          .slice(0, 5)
          .forEach((row) => {
            next.push({
              id: `person-${row._id}`,
              label: row.name || row.personId || "Person",
              subtitle: [row.mobile, row.personId].filter(Boolean).join(" · "),
              path: "/persons/view",
              state: { person: row },
              group: "Persons",
              icon: Users,
            });
          });

        asArray<any>(mitras)
          .slice(0, 5)
          .forEach((row) => {
            next.push({
              id: `mitra-${row._id}`,
              label: row.name || row.mitraId || "Mitra",
              subtitle: [row.mobile, row.status, row.vidhanSabha]
                .filter(Boolean)
                .join(" · "),
              path: "/mitras/edit",
              state: { mitra: row },
              group: "Mitras",
              icon: UserCheck,
            });
          });

        asArray<any>(lands)
          .slice(0, 5)
          .forEach((row) => {
            next.push({
              id: `land-${row._id}`,
              label: row.name || row.landId || "Land",
              subtitle: [row.district, row.vidhanSabha, row.state]
                .filter(Boolean)
                .join(" · "),
              path: "/lands/view",
              state: { land: row },
              group: "Lands",
              icon: MapPinned,
            });
          });

        asArray<any>(vidhans)
          .slice(0, 5)
          .forEach((row) => {
            next.push({
              id: `vs-${row._id}`,
              label: row.name || row.code || "Vidhan Sabha",
              subtitle: [row.district, row.state].filter(Boolean).join(" · "),
              path: "/vidhansabha/view",
              state: { vidhanSabha: row },
              group: "Vidhan Sabha",
              icon: Building,
            });
          });

        asArray<any>(templates)
          .slice(0, 5)
          .forEach((row) => {
            next.push({
              id: `cert-${row._id}`,
              label: row.title || row.name || "Certificate template",
              subtitle: [row.certificateType, row.status]
                .filter(Boolean)
                .join(" · "),
              path: "/certificates/edit",
              state: { template: row, certificate: row },
              group: "Certificates",
              icon: Award,
            });
          });

        setEntityResults(next);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, 280);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [query]);

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        inputRef.current?.focus();
        setOpen(true);
      }
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  const goTo = (item: SearchResult) => {
    setOpen(false);
    setQuery("");
    setEntityResults([]);
    navigate(item.path, item.state ? { state: item.state } : undefined);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!open && (e.key === "ArrowDown" || e.key === "Enter")) {
      setOpen(true);
    }
    if (!results.length) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => (i + 1) % results.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => (i - 1 + results.length) % results.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      const item = results[activeIndex];
      if (item) goTo(item);
    }
  };

  useEffect(() => {
    if (!profileMenuOpen) return;
    const onDocClick = (e: MouseEvent) => {
      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(e.target as Node)
      ) {
        setProfileMenuOpen(false);
      }
    };
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setProfileMenuOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onEsc);
    };
  }, [profileMenuOpen]);

  const handleLogout = async () => {
    setProfileMenuOpen(false);
    const refreshToken = localStorage.getItem("refreshToken");
    try {
      if (refreshToken) {
        await apiFetch("/api/v1/auth/logout", {
          method: "POST",
          body: JSON.stringify({ refreshToken }),
        });
      }
    } catch {
      // Ignore network/logout errors, clear the session locally regardless
    } finally {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
  };

  const grouped = useMemo(() => {
    const order: SearchResult["group"][] = [
      "Pages",
      "Persons",
      "Mitras",
      "Lands",
      "Vidhan Sabha",
      "Certificates",
    ];
    return order
      .map((group) => ({
        group,
        items: results.filter((r) => r.group === group),
      }))
      .filter((g) => g.items.length > 0);
  }, [results]);

  let flatIndex = -1;

  return (
    <header className="topbar">
      <div className="topbar-left">
        <button
          type="button"
          className="icon-btn menu-toggle-mobile"
          onClick={onToggleMobileSidebar}
          aria-label="Open navigation menu"
        >
          <Menu size={20} />
        </button>

        <button
          type="button"
          className="icon-btn menu-toggle-desktop"
          onClick={onToggleCollapse}
          aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {sidebarCollapsed ? <PanelLeft size={20} /> : <PanelLeftClose size={20} />}
        </button>

        <div className="global-search" ref={wrapRef}>
          <div className={`search-bar${open ? " is-open" : ""}`}>
            <Search size={18} color="var(--text-secondary)" aria-hidden="true" />
            <input
              ref={inputRef}
              type="search"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setOpen(true);
              }}
              onFocus={() => setOpen(true)}
              onKeyDown={onKeyDown}
              placeholder="Global search... (Ctrl+K)"
              aria-label="Global search"
              aria-expanded={open}
              aria-controls="global-search-results"
              autoComplete="off"
            />
            {loading ? (
              <Loader2 size={16} className="spin global-search-spinner" />
            ) : (
              <kbd className="global-search-kbd">⌘K</kbd>
            )}
          </div>

          {open && query.trim() ? (
            <div
              id="global-search-results"
              className="global-search-dropdown"
              role="listbox"
            >
              {!loading && results.length === 0 ? (
                <div className="global-search-empty">
                  No results for “{query.trim()}”
                </div>
              ) : (
                grouped.map(({ group, items }) => (
                  <div key={group} className="global-search-group">
                    <div className="global-search-group-title">{group}</div>
                    {items.map((item) => {
                      flatIndex += 1;
                      const index = flatIndex;
                      const Icon = item.icon;
                      const active = index === activeIndex;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          role="option"
                          aria-selected={active}
                          className={`global-search-item${active ? " is-active" : ""}`}
                          onMouseEnter={() => setActiveIndex(index)}
                          onClick={() => goTo(item)}
                        >
                          <span className="global-search-item-icon">
                            <Icon size={16} />
                          </span>
                          <span className="global-search-item-text">
                            <span className="global-search-item-label">
                              {item.label}
                            </span>
                            {item.subtitle ? (
                              <span className="global-search-item-sub">
                                {item.subtitle}
                              </span>
                            ) : null}
                          </span>
                          <ArrowRight size={14} className="global-search-item-go" />
                        </button>
                      );
                    })}
                  </div>
                ))
              )}
            </div>
          ) : null}
        </div>
      </div>

      <div className="topbar-actions">
        <button type="button" className="icon-btn" aria-label="Notifications">
          <Bell size={20} />
        </button>

        <div className="user-profile-menu" ref={profileMenuRef}>
          <button
            type="button"
            className={`user-profile${profileMenuOpen ? " is-open" : ""}`}
            onClick={() => setProfileMenuOpen((v) => !v)}
            aria-haspopup="menu"
            aria-expanded={profileMenuOpen}
            title="Account menu"
          >
            <div className="user-info">
              <span className="user-name">{displayName}</span>
              <span
                className="user-role"
                style={{ textTransform: "capitalize" }}
              >
                {displayRole}
              </span>
            </div>

            <div className="user-avatar">
              <img
                src={avatarSrc || headerFallbackAvatar}
                alt=""
                referrerPolicy="no-referrer"
                onError={(ev) => {
                  const el = ev.currentTarget;
                  if (el.dataset.fb === "1") return;
                  el.dataset.fb = "1";
                  el.src = headerFallbackAvatar;
                }}
              />
            </div>
            <ChevronDown
              size={16}
              className={`user-profile-caret${profileMenuOpen ? " is-open" : ""}`}
              aria-hidden="true"
            />
          </button>

          {profileMenuOpen ? (
            <div className="user-profile-dropdown" role="menu">
              <div className="user-profile-dropdown-head">
                <span className="user-profile-dropdown-name">{displayName}</span>
                <span
                  className="user-profile-dropdown-role"
                  style={{ textTransform: "capitalize" }}
                >
                  {displayRole}
                </span>
              </div>
              <button
                type="button"
                role="menuitem"
                className="user-profile-dropdown-item"
                onClick={() => {
                  setProfileMenuOpen(false);
                  navigate("/profile");
                }}
              >
                <User size={16} />
                Profile
              </button>
              <button
                type="button"
                role="menuitem"
                className="user-profile-dropdown-item"
                onClick={() => {
                  setProfileMenuOpen(false);
                  navigate("/settings");
                }}
              >
                <Settings size={16} />
                Settings
              </button>
              <div className="user-profile-dropdown-divider" />
              <button
                type="button"
                role="menuitem"
                className="user-profile-dropdown-item is-danger"
                onClick={handleLogout}
              >
                <LogOut size={16} />
                Logout
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
};

export default Header;
