import { useState } from "react";

import {
    Link,
    NavLink,
    Outlet,
    useNavigate,
} from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import Avatar from "./Avatar";


const navItems = [
    ["/", "Discover"],
    ["/subscriptions", "Subscriptions"],
    ["/history", "History"],
    ["/liked", "Liked videos"],
    ["/playlists", "Playlists"],
];


const navIcon = (path) => {
    if (path === "/") return "⌂";
    if (path === "/subscriptions") return "◉";
    if (path === "/history") return "◷";
    if (path === "/liked") return "♡";

    return "▱";
};


const sideLinkClass = ({ isActive }) =>
    `side-link${isActive ? " active" : ""}`;


const mobileLinkClass = ({ isActive }) =>
    isActive ? "active" : "";


const AppShell = () => {
    const { user, logout } = useAuth();

    const [menuOpen, setMenuOpen] =
        useState(false);

    const [collapsed, setCollapsed] =
        useState(false);

    const [search, setSearch] =
        useState("");

    const navigate = useNavigate();


    /* =====================================================
       SEARCH
       ===================================================== */

    const submit = (event) => {
        event.preventDefault();

        const trimmedSearch = search.trim();

        if (!trimmedSearch) {
            navigate("/");
            return;
        }

        navigate(
            `/?query=${encodeURIComponent(
                trimmedSearch
            )}`
        );
    };


    const clearSearch = () => {
        setSearch("");
        navigate("/");
    };


    /* =====================================================
       LOGOUT
       ===================================================== */

    const handleLogout = async () => {
        setMenuOpen(false);

        try {
            await logout();
        } finally {
            navigate("/");
        }
    };


    /* =====================================================
       RENDER
       ===================================================== */

    return (
        <div
            className={`app-frame ${
                collapsed
                    ? "sidebar-collapsed"
                    : ""
            }`}
        >

            <AppShellStyles />


            {/* =================================================
                TOP BAR
            ================================================= */}

            <header className="topbar">

                {/* Menu */}

                <button
                    type="button"
                    className="icon-button menu-toggle"
                    onClick={() =>
                        setCollapsed(
                            (value) => !value
                        )
                    }
                    aria-label={
                        collapsed
                            ? "Expand navigation"
                            : "Collapse navigation"
                    }
                    aria-expanded={!collapsed}
                    title={
                        collapsed
                            ? "Expand navigation"
                            : "Collapse navigation"
                    }
                >
                    ☰
                </button>


                {/* Brand */}

                <Link
                    className="brand"
                    to="/"
                    aria-label="Videoly home"
                >
                    <span className="brand-mark">
                        V
                    </span>

                    <span className="brand-name">
                        Videoly
                    </span>
                </Link>


                {/* Search */}

                <form
                    className="search"
                    onSubmit={submit}
                    role="search"
                >
                    <span
                        className="search-icon"
                        aria-hidden="true"
                    >
                        ⌕
                    </span>

                    <input
                        value={search}
                        onChange={(event) =>
                            setSearch(
                                event.target.value
                            )
                        }
                        placeholder="Search videos, channels..."
                        aria-label="Search videos"
                    />

                    {search && (
                        <button
                            type="button"
                            className="search-clear"
                            onClick={clearSearch}
                            aria-label="Clear search"
                            title="Clear search"
                        >
                            ×
                        </button>
                    )}

                    <button
                        type="submit"
                        className="search-submit"
                        aria-label="Search"
                    >
                        Search
                    </button>
                </form>


                {/* User actions */}

                <div className="nav-actions">

                    {user ? (
                        <>
                            {/* Upload */}

                            <Link
                                className="upload-link"
                                to="/upload"
                            >
                                <span>＋</span>
                                <span>Upload</span>
                            </Link>


                            {/* Profile */}

                            <button
                                type="button"
                                className="profile-trigger"
                                onClick={() =>
                                    setMenuOpen(
                                        (value) =>
                                            !value
                                    )
                                }
                                aria-label="Open account menu"
                                aria-expanded={
                                    menuOpen
                                }
                                title="Account menu"
                            >
                                <Avatar
                                    user={user}
                                    size="small"
                                />

                                <span className="profile-chevron">
                                    {menuOpen
                                        ? "⌃"
                                        : "⌄"}
                                </span>
                            </button>


                            {/* Profile menu */}

                            {menuOpen && (
                                <>
                                    <button
                                        type="button"
                                        className="profile-overlay"
                                        onClick={() =>
                                            setMenuOpen(
                                                false
                                            )
                                        }
                                        aria-label="Close account menu"
                                    />

                                    <div className="profile-menu">

                                        <div className="profile-menu-header">

                                            <Avatar
                                                user={user}
                                                size="medium"
                                            />

                                            <div>
                                                <strong>
                                                    {user.fullName ||
                                                        user.username}
                                                </strong>

                                                <span>
                                                    @{user.username}
                                                </span>
                                            </div>

                                        </div>


                                        <div className="profile-menu-divider" />


                                        <Link
                                            to={`/channel/${user.username}`}
                                            onClick={() =>
                                                setMenuOpen(
                                                    false
                                                )
                                            }
                                        >
                                            <span>
                                                ◉
                                            </span>

                                            Profile
                                        </Link>


                                        <Link
                                            to="/dashboard"
                                            onClick={() =>
                                                setMenuOpen(
                                                    false
                                                )
                                            }
                                        >
                                            <span>
                                                ▦
                                            </span>

                                            Dashboard
                                        </Link>


                                        <Link
                                            to="/settings"
                                            onClick={() =>
                                                setMenuOpen(
                                                    false
                                                )
                                            }
                                        >
                                            <span>
                                                ⚙
                                            </span>

                                            Settings
                                        </Link>


                                        <div className="profile-menu-divider" />


                                        <button
                                            type="button"
                                            className="logout-button"
                                            onClick={
                                                handleLogout
                                            }
                                        >
                                            <span>
                                                ↪
                                            </span>

                                            Log out
                                        </button>

                                    </div>
                                </>
                            )}
                        </>
                    ) : (
                        <>
                            <Link
                                className="button button-ghost"
                                to="/login"
                            >
                                Log in
                            </Link>

                            <Link
                                className="button"
                                to="/register"
                            >
                                Join
                            </Link>
                        </>
                    )}

                </div>

            </header>


            {/* =================================================
                SIDEBAR
            ================================================= */}

            <aside className="sidebar">

                <div className="sidebar-section">

                    <p className="sidebar-label">
                        Browse
                    </p>


                    {navItems.map(
                        ([path, label]) => (
                            <NavLink
                                key={path}
                                className={
                                    sideLinkClass
                                }
                                to={path}
                                end={
                                    path === "/"
                                }
                                title={label}
                            >
                                <span className="side-link-icon">
                                    {navIcon(path)}
                                </span>

                                <span className="side-link-label">
                                    {label}
                                </span>
                            </NavLink>
                        )
                    )}

                </div>


                {/* Creator navigation */}

                {user && (
                    <div className="sidebar-section">

                        <p className="sidebar-label">
                            Create
                        </p>


                        <NavLink
                            className={
                                sideLinkClass
                            }
                            to="/dashboard"
                            title="Studio"
                        >
                            <span className="side-link-icon">
                                ◈
                            </span>

                            <span className="side-link-label">
                                Studio
                            </span>
                        </NavLink>


                        <NavLink
                            className={
                                sideLinkClass
                            }
                            to="/upload"
                            title="Upload"
                        >
                            <span className="side-link-icon">
                                ＋
                            </span>

                            <span className="side-link-label">
                                Upload
                            </span>
                        </NavLink>

                    </div>
                )}


                {/* Sidebar footer */}

                <div className="sidebar-footer">
                    <span className="brand-accent">
                        Videoly
                    </span>
                </div>

            </aside>


            {/* =================================================
                MAIN CONTENT
            ================================================= */}

            <main className="shell-content">
                <Outlet />
            </main>


            {/* =================================================
                MOBILE NAVIGATION
            ================================================= */}

            <nav
                className="mobile-nav"
                aria-label="Mobile navigation"
            >
                {navItems
                    .slice(0, 4)
                    .map(
                        ([path, label]) => (
                            <NavLink
                                key={path}
                                to={path}
                                end={
                                    path === "/"
                                }
                                className={
                                    mobileLinkClass
                                }
                            >
                                <span className="mobile-nav-icon">
                                    {navIcon(path)}
                                </span>

                                <span>
                                    {label}
                                </span>
                            </NavLink>
                        )
                    )}
            </nav>

        </div>
    );
};


/* =============================================================
   APP SHELL STYLES
   ============================================================= */

const AppShellStyles = () => (
    <style>{`

        /* =====================================================
           VARIABLES
           ===================================================== */

        :root {
            --ink: #14151a;
            --surface: #1b1d24;
            --surface-raised: #23252e;

            --accent: #cf9d56;
            --accent-soft: rgba(207, 157, 86, 0.14);

            --text: #f1efe9;
            --text-muted: #9a9ba6;

            --border: rgba(255, 255, 255, 0.08);

            --danger: #e2685c;

            --radius-sm: 8px;
            --radius-md: 12px;

            --shadow-menu:
                0 16px 40px rgba(0, 0, 0, 0.45);

            --topbar-h: 64px;

            --sidebar-w: 240px;
            --sidebar-w-collapsed: 76px;

            --ease:
                cubic-bezier(0.4, 0, 0.2, 1);
        }


        /* =====================================================
           GLOBAL SHELL RESET
        ===================================================== */

        .app-frame,
        .app-frame * {
            box-sizing: border-box;
        }


        .app-frame {
            width: 100%;
            height: 100vh;
            min-height: 100vh;

            display: grid;

            grid-template-columns:
                var(--sidebar-w)
                minmax(0, 1fr);

            grid-template-rows:
                var(--topbar-h)
                minmax(0, 1fr);

            grid-template-areas:
                "topbar topbar"
                "sidebar content";

            background: var(--ink);

            overflow: hidden;

            transition:
                grid-template-columns
                0.22s
                var(--ease);
        }


        .app-frame.sidebar-collapsed {
            grid-template-columns:
                var(--sidebar-w-collapsed)
                minmax(0, 1fr);
        }


        /* =====================================================
           TOP BAR
        ===================================================== */

        .topbar {
            grid-area: topbar;

            min-width: 0;

            display: flex;
            align-items: center;

            gap: 16px;

            padding: 0 20px;

            background: var(--surface);

            border-bottom:
                1px solid var(--border);

            z-index: 100;
        }


        .icon-button {
            width: 40px;
            height: 40px;

            display: inline-flex;
            align-items: center;
            justify-content: center;

            flex-shrink: 0;

            border: none;
            border-radius: var(--radius-sm);

            background: transparent;

            color: var(--text-muted);

            font-size: 19px;

            cursor: pointer;

            transition:
                background 0.15s var(--ease),
                color 0.15s var(--ease);
        }


        .icon-button:hover {
            background: var(--surface-raised);
            color: var(--text);
        }


        /* =====================================================
           BRAND
        ===================================================== */

        .brand {
            display: flex;
            align-items: center;

            gap: 10px;

            flex-shrink: 0;

            text-decoration: none;
        }


        .brand-mark {
            width: 36px;
            height: 36px;

            display: inline-flex;
            align-items: center;
            justify-content: center;

            border-radius: 10px;

            background:
                linear-gradient(
                    155deg,
                    var(--accent),
                    #a97c3c
                );

            color: #14151a;

            font-size: 16px;
            font-weight: 800;

            box-shadow:
                0 5px 18px
                rgba(207, 157, 86, 0.14);
        }


        .brand-name {
            color: var(--text);

            font-family:
                "Space Grotesk",
                "Inter",
                "Segoe UI",
                system-ui,
                sans-serif;

            font-size: 18px;
            font-weight: 700;

            letter-spacing: -0.035em;
        }


        /* =====================================================
           SEARCH
        ===================================================== */

        .search {
            min-width: 0;

            width: min(620px, 100%);

            height: 44px;

            display: flex;
            align-items: center;

            flex: 1;

            margin: 0 auto;

            padding:
                0
                6px
                0
                16px;

            background: var(--ink);

            border:
                1px solid var(--border);

            border-radius: 999px;

            transition:
                border-color 0.15s var(--ease),
                box-shadow 0.15s var(--ease);
        }


        .search:focus-within {
            border-color: var(--accent);

            box-shadow:
                0 0 0 3px
                var(--accent-soft);
        }


        .search-icon {
            flex-shrink: 0;

            margin-right: 10px;

            color: var(--text-muted);

            font-size: 15px;
        }


        .search input {
            min-width: 0;

            flex: 1;

            height: 100%;

            border: none;
            outline: none;

            background: transparent;

            color: var(--text);

            font-size: 14px;
        }


        .search input::placeholder {
            color: var(--text-muted);
        }


        .search-clear {
            width: 28px;
            height: 28px;

            display: inline-flex;
            align-items: center;
            justify-content: center;

            flex-shrink: 0;

            border: none;
            border-radius: 50%;

            background: transparent;

            color: var(--text-muted);

            font-size: 18px;

            cursor: pointer;
        }


        .search-clear:hover {
            background: var(--surface-raised);
            color: var(--text);
        }


        .search-submit {
            height: 34px;

            flex-shrink: 0;

            padding: 0 18px;

            border: none;
            border-radius: 999px;

            background: var(--surface-raised);

            color: var(--text);

            font-size: 13px;
            font-weight: 600;

            cursor: pointer;

            transition:
                background 0.15s var(--ease),
                color 0.15s var(--ease);
        }


        .search-submit:hover {
            background: var(--accent);
            color: #14151a;
        }


        /* =====================================================
           NAV ACTIONS
        ===================================================== */

        .nav-actions {
            position: relative;

            display: flex;
            align-items: center;

            gap: 10px;

            flex-shrink: 0;
        }


        .upload-link {
            height: 38px;

            display: inline-flex;
            align-items: center;

            gap: 6px;

            padding: 0 16px;

            border-radius: 999px;

            background: var(--accent-soft);

            color: var(--accent);

            font-size: 13px;
            font-weight: 600;

            text-decoration: none;

            transition:
                background 0.15s var(--ease),
                color 0.15s var(--ease);
        }


        .upload-link:hover {
            background: var(--accent);
            color: #14151a;
        }


        .profile-trigger {
            display: flex;
            align-items: center;

            gap: 6px;

            padding:
                4px
                6px
                4px
                4px;

            border: none;
            border-radius: 999px;

            background: transparent;

            cursor: pointer;

            transition:
                background 0.15s var(--ease);
        }


        .profile-trigger:hover {
            background: var(--surface-raised);
        }


        .profile-chevron {
            color: var(--text-muted);
            font-size: 11px;
        }


        /* =====================================================
           PROFILE MENU
        ===================================================== */

        .profile-overlay {
            position: fixed;

            inset: 0;

            width: 100%;
            height: 100%;

            padding: 0;

            border: none;

            background: transparent;

            z-index: 110;

            cursor: default;
        }


        .profile-menu {
            position: absolute;

            top: 52px;
            right: 0;

            width: 260px;

            padding: 6px;

            background: var(--surface);

            border:
                1px solid var(--border);

            border-radius:
                var(--radius-md);

            box-shadow:
                var(--shadow-menu);

            z-index: 120;

            animation:
                menu-in
                0.15s
                var(--ease);
        }


        @keyframes menu-in {
            from {
                opacity: 0;
                transform: translateY(-5px);
            }

            to {
                opacity: 1;
                transform: translateY(0);
            }
        }


        .profile-menu-header {
            display: flex;
            align-items: center;

            gap: 12px;

            padding: 12px 10px;
        }


        .profile-menu-header strong {
            display: block;

            color: var(--text);

            font-size: 14px;
        }


        .profile-menu-header span {
            display: block;

            margin-top: 2px;

            color: var(--text-muted);

            font-size: 12px;
        }


        .profile-menu-divider {
            height: 1px;

            margin: 6px 4px;

            background: var(--border);
        }


        .profile-menu a,
        .profile-menu .logout-button {
            width: 100%;

            display: flex;
            align-items: center;

            gap: 12px;

            padding: 10px;

            border: none;
            border-radius: var(--radius-sm);

            background: transparent;

            color: var(--text);

            font-size: 13.5px;

            text-align: left;

            text-decoration: none;

            cursor: pointer;

            transition:
                background 0.15s var(--ease);
        }


        .profile-menu a:hover,
        .profile-menu .logout-button:hover {
            background: var(--surface-raised);
        }


        .profile-menu a span:first-child,
        .profile-menu .logout-button span:first-child {
            width: 18px;

            flex-shrink: 0;

            text-align: center;

            color: var(--text-muted);
        }


        .profile-menu .logout-button {
            color: var(--danger);
        }


        .profile-menu .logout-button span:first-child {
            color: var(--danger);
        }


        /* =====================================================
           SIDEBAR
        ===================================================== */

        .sidebar {
            grid-area: sidebar;

            min-width: 0;
            min-height: 0;

            display: flex;
            flex-direction: column;

            gap: 22px;

            padding: 18px 12px;

            background: var(--surface);

            border-right:
                1px solid var(--border);

            overflow-x: hidden;
            overflow-y: auto;

            scrollbar-width: thin;
            scrollbar-color:
                rgba(255,255,255,0.12)
                transparent;
        }


        .sidebar::-webkit-scrollbar {
            width: 5px;
        }


        .sidebar::-webkit-scrollbar-track {
            background: transparent;
        }


        .sidebar::-webkit-scrollbar-thumb {
            background:
                rgba(255,255,255,0.12);

            border-radius: 999px;
        }


        .sidebar-section {
            display: flex;
            flex-direction: column;

            gap: 2px;

            flex-shrink: 0;
        }


        .sidebar-label {
            margin:
                4px
                0
                6px;

            padding:
                0
                12px;

            color: var(--text-muted);

            font-size: 11px;
            font-weight: 700;

            letter-spacing: 0.08em;

            text-transform: uppercase;
        }


        .side-link {
            position: relative;

            min-width: 0;

            display: flex;
            align-items: center;

            gap: 14px;

            padding:
                10px
                12px;

            border-radius:
                var(--radius-sm);

            color: var(--text-muted);

            font-size: 14px;

            text-decoration: none;

            transition:
                background 0.15s var(--ease),
                color 0.15s var(--ease);
        }


        .side-link:hover {
            background: var(--surface-raised);
            color: var(--text);
        }


        .side-link.active {
            background: var(--accent-soft);
            color: var(--text);
        }


        .side-link.active::before {
            content: "";

            position: absolute;

            left: -12px;
            top: 8px;
            bottom: 8px;

            width: 3px;

            border-radius:
                0
                3px
                3px
                0;

            background: var(--accent);
        }


        .side-link-icon {
            width: 20px;

            flex-shrink: 0;

            color: currentColor;

            font-size: 16px;

            text-align: center;
        }


        .side-link.active
        .side-link-icon {
            color: var(--accent);
        }


        .side-link-label {
            min-width: 0;

            overflow: hidden;

            white-space: nowrap;

            text-overflow: ellipsis;
        }


        /* =====================================================
           SIDEBAR FOOTER
        ===================================================== */

        .sidebar-footer {
            margin-top: auto;

            flex-shrink: 0;

            padding:
                12px;

            border-top:
                none;
        }


        .brand-accent {
            color: var(--text-muted);

            font-size: 12px;

            letter-spacing: 0.04em;
        }


        /* =====================================================
           COLLAPSED SIDEBAR
        ===================================================== */

        .sidebar-collapsed
        .sidebar-label,

        .sidebar-collapsed
        .side-link-label,

        .sidebar-collapsed
        .brand-accent {
            display: none;
        }


        .sidebar-collapsed
        .sidebar {
            align-items: stretch;
        }


        .sidebar-collapsed
        .side-link {
            justify-content: center;

            padding:
                10px;
        }


        .sidebar-collapsed
        .side-link.active::before {
            left: -12px;
        }


        /* =====================================================
           MAIN CONTENT SCROLL CONTAINER
        ===================================================== */

        .shell-content {
            grid-area: content;

            min-width: 0;
            min-height: 0;

            padding:
                28px
                32px
                96px;

            overflow-x: hidden;
            overflow-y: auto;

            overscroll-behavior:
                contain;

            scrollbar-gutter: stable;

            scrollbar-width: thin;
            scrollbar-color:
                rgba(255,255,255,0.14)
                transparent;
        }


        .shell-content::-webkit-scrollbar {
            width: 8px;
        }


        .shell-content::-webkit-scrollbar-track {
            background: transparent;
        }


        .shell-content::-webkit-scrollbar-thumb {
            background:
                rgba(255,255,255,0.14);

            border-radius: 999px;
        }


        .shell-content::-webkit-scrollbar-thumb:hover {
            background:
                rgba(255,255,255,0.22);
        }


        /* Prevent pages from creating another horizontal scroll */

        .shell-content > * {
            min-width: 0;
            max-width: 100%;
        }


        /* =====================================================
           MOBILE NAV
        ===================================================== */

        .mobile-nav {
            display: none;
        }


        /* =====================================================
           ACCESSIBILITY
        ===================================================== */

        .app-frame
        a:focus-visible,

        .app-frame
        button:focus-visible,

        .app-frame
        input:focus-visible {
            outline:
                2px solid
                var(--accent);

            outline-offset: 2px;
        }


        @media (prefers-reduced-motion: reduce) {
            .app-frame *,
            .app-frame *::before,
            .app-frame *::after {
                animation: none !important;
                transition: none !important;
            }
        }


        /* =====================================================
           TABLET
        ===================================================== */

        @media (max-width: 1100px) {

            .topbar {
                gap: 10px;
                padding: 0 14px;
            }


            .search {
                max-width: 500px;
            }


            .shell-content {
                padding:
                    24px
                    24px
                    90px;
            }

        }


        /* =====================================================
           MOBILE
        ===================================================== */

        @media (max-width: 900px) {

            .app-frame {
                width: 100%;
                height: 100vh;
                min-height: 100vh;

                grid-template-columns: 1fr;

                grid-template-rows:
                    var(--topbar-h)
                    minmax(0, 1fr);

                grid-template-areas:
                    "topbar"
                    "content";
            }


            .sidebar {
                display: none;
            }


            .shell-content {
                min-height: 0;

                padding:
                    20px
                    16px
                    88px;

                overflow-x: hidden;
                overflow-y: auto;
            }


            .search {
                max-width: none;
            }


            .mobile-nav {
                position: fixed;

                left: 0;
                right: 0;
                bottom: 0;

                height: 60px;

                display: flex;
                align-items: center;
                justify-content: space-around;

                padding:
                    4px
                    8px;

                background:
                    rgba(27, 29, 36, 0.96);

                border-top:
                    1px solid var(--border);

                backdrop-filter:
                    blur(14px);

                -webkit-backdrop-filter:
                    blur(14px);

                z-index: 90;
            }


            .mobile-nav a {
                min-width: 0;

                display: flex;
                flex-direction: column;
                align-items: center;

                gap: 3px;

                padding:
                    5px
                    8px;

                color: var(--text-muted);

                font-size: 10.5px;

                text-decoration: none;
            }


            .mobile-nav a.active {
                color: var(--accent);
            }


            .mobile-nav-icon {
                font-size: 18px;
            }


            .profile-menu {
                position: fixed;

                top:
                    calc(var(--topbar-h) - 4px);

                right: 10px;
            }

        }


        /* =====================================================
           SMALL MOBILE
        ===================================================== */

        @media (max-width: 560px) {

            .topbar {
                gap: 8px;
                padding: 0 10px;
            }


            .brand-name {
                display: none;
            }


            .brand-mark {
                width: 34px;
                height: 34px;
            }


            .menu-toggle {
                width: 36px;
                height: 36px;
            }


            .search {
                height: 40px;

                padding-left: 11px;
            }


            .search-icon {
                display: none;
            }


            .search-submit {
                padding:
                    0
                    13px;
            }


            .upload-link {
                width: 38px;
                height: 38px;

                justify-content: center;

                padding: 0;
            }


            .upload-link span:last-child {
                display: none;
            }


            .shell-content {
                padding:
                    18px
                    12px
                    84px;
            }

        }

    `}</style>
);


export default AppShell;