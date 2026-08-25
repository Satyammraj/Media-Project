import { useCallback, useEffect, useRef, useState } from "react";
import { Link, Navigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

import {
    getDashboard,
    getDashboardVideos,
} from "../services/api";

import VideoCard from "../components/VideoCard";
import Avatar from "../components/Avatar";

const formatNumber = (value = 0) => {
    return Number(value || 0).toLocaleString();
};

const DashboardSkeleton = () => {
    return (
        <main className="content dashboard">
            <DashboardStyles />

            <div className="dashboard-heading-skeleton">
                <span />
                <span />
                <span />
            </div>

            <section className="stats stats-skeleton">
                {Array.from({ length: 4 }).map(
                    (_, index) => (
                        <div
                            className="stat-skeleton"
                            key={index}
                        >
                            <span />
                            <span />
                        </div>
                    )
                )}
            </section>

            <div className="dashboard-section-skeleton">
                <span />
                <span />
            </div>

            <div className="skeleton-grid">
                {Array.from({ length: 8 }).map(
                    (_, index) => (
                        <div
                            className="dashboard-video-skeleton"
                            key={index}
                        >
                            <div className="skeleton" />

                            <div className="dashboard-lines">
                                <span />
                                <span />
                                <span />
                            </div>
                        </div>
                    )
                )}
            </div>
        </main>
    );
};

const Dashboard = () => {
    const { user, loading } = useAuth();

    const [stats, setStats] = useState(null);
    const [videos, setVideos] = useState([]);
    const [error, setError] = useState("");
    const [refreshing, setRefreshing] = useState(false);

    // Tracks whether the FIRST data load has finished (success or
    // failure). Without this, the page briefly renders zero stats
    // and an empty-state message for creators who actually have
    // content, because `stats`/`videos` start out empty/null.
    const [hasLoaded, setHasLoaded] = useState(false);

    // Guards against stale responses: if `user` changes (or the
    // component unmounts) while a request is still in flight, a
    // late-arriving response for the OLD user must not overwrite
    // state for the current one. Each call to loadDashboard gets
    // its own id; only the most recent id is allowed to commit.
    const requestIdRef = useRef(0);

    const loadDashboard = useCallback(async () => {
        if (!user?._id) return;

        const requestId = ++requestIdRef.current;

        try {
            setError("");
            setRefreshing(true);

            const [
                statsResponse,
                videosResponse,
            ] = await Promise.all([
                getDashboard(user._id),
                getDashboardVideos(user._id),
            ]);

            if (requestIdRef.current !== requestId) return;

            setStats(statsResponse.data.data);

            setVideos(
                videosResponse.data.data || []
            );
        } catch (requestError) {
            if (requestIdRef.current !== requestId) return;

            setError(
                requestError?.response?.data?.message ||
                    "Unable to load dashboard."
            );
        } finally {
            if (requestIdRef.current === requestId) {
                setRefreshing(false);
                setHasLoaded(true);
            }
        }
    }, [user]);

    useEffect(() => {
        if (!user) return;

        // The loader owns the async state lifecycle for this effect.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        loadDashboard();
    }, [user, loadDashboard]);

    useEffect(() => {
        // Invalidate any in-flight request on unmount so a
        // late-arriving response never touches state after the
        // component is gone.
        return () => {
            requestIdRef.current += 1;
        };
    }, []);

    if (loading || (user && !hasLoaded)) {
        return <DashboardSkeleton />;
    }

    if (!user) {
        return (
            <Navigate
                to="/login"
                replace
            />
        );
    }

    const firstName =
        user.fullName?.split(" ")[0] ||
        user.username ||
        "Creator";

    return (
        <main className="content dashboard">
            <DashboardStyles />

            {/* ───────────────── HEADER ───────────────── */}
            <header className="dashboard-header">
                <div className="dashboard-heading">
                    <p className="eyebrow">
                        Creator studio
                    </p>

                    <h1>
                        Good to see you, {firstName}.
                    </h1>

                    <p className="lede">
                        A quick read on how your channel
                        is doing.
                    </p>
                </div>

                <div className="dashboard-header-actions">
                    <button
                        type="button"
                        className="button button-muted"
                        onClick={loadDashboard}
                        disabled={refreshing}
                    >
                        <span aria-hidden="true">
                            {refreshing ? "↻" : "⟳"}
                        </span>

                        {refreshing
                            ? "Refreshing..."
                            : "Refresh"}
                    </button>

                    <Link
                        className="button"
                        to="/upload"
                    >
                        <span aria-hidden="true">＋</span>
                        Upload video
                    </Link>
                </div>
            </header>

            {/* ───────────────── PROFILE STRIP ───────────────── */}
            <section className="dashboard-profile">
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

                <Link
                    className="dashboard-channel-link"
                    to={`/channel/${user.username}`}
                >
                    View channel
                    <span aria-hidden="true">→</span>
                </Link>
            </section>

            {error && (
                <div className="notice error dashboard-error">
                    <div>
                        <strong>
                            Something went wrong
                        </strong>

                        <p>{error}</p>
                    </div>

                    <button
                        type="button"
                        className="button button-muted"
                        onClick={loadDashboard}
                        disabled={refreshing}
                    >
                        Try again
                    </button>
                </div>
            )}

            {/* ───────────────── STATS ───────────────── */}
            <section
                className="stats"
                aria-label="Channel statistics"
            >
                {[
                    [
                        "Views",
                        stats?.totalViews || 0,
                        "◉",
                    ],
                    [
                        "Subscribers",
                        stats?.totalSubscribers ||
                            0,
                        "◎",
                    ],
                    [
                        "Videos",
                        stats?.totalVideos || 0,
                        "▣",
                    ],
                    [
                        "Likes",
                        stats?.totalLikes || 0,
                        "♡",
                    ],
                ].map(
                    ([label, value, icon]) => (
                        <div
                            className="stat"
                            key={label}
                        >
                            <div className="stat-top">
                                <span aria-hidden="true">
                                    {icon}
                                </span>

                                <small>
                                    Total
                                </small>
                            </div>

                            <strong>
                                {formatNumber(value)}
                            </strong>

                            <p>{label}</p>
                        </div>
                    )
                )}
            </section>

            {/* ───────────────── VIDEO SECTION ───────────────── */}
            <section className="dashboard-videos">
                <div className="section-heading">
                    <div>
                        <p className="eyebrow">
                            Content
                        </p>

                        <h2>Your videos</h2>
                    </div>

                    <div className="dashboard-video-actions">
                        <span>
                            {videos.length}{" "}
                            {videos.length === 1
                                ? "published video"
                                : "published videos"}
                        </span>

                        {videos.length > 0 && (
                            <Link to="/upload">
                                + New upload
                            </Link>
                        )}
                    </div>
                </div>

                {videos.length === 0 ? (
                    <div className="empty dashboard-empty">
                        <div className="empty-icon" aria-hidden="true">
                            +
                        </div>

                        <h3>
                            Your studio is waiting
                        </h3>

                        <p>
                            Publish your first video
                            and start building your
                            audience.
                        </p>

                        <Link
                            className="button"
                            to="/upload"
                        >
                            Upload your first video
                        </Link>
                    </div>
                ) : (
                    <div className="video-grid">
                        {videos.map((video) => (
                            <VideoCard
                                key={video._id}
                                video={video}
                            />
                        ))}
                    </div>
                )}
            </section>
        </main>
    );
};

/* =================================================================
   STYLES — matches the AppShell / Channel "editing studio" theme.
   Reads the same --accent / --surface variables set at :root by
   AppShell, with inline fallbacks. Skeleton pieces share the same
   shimmer animation used on the Channel page.
   ================================================================= */

const DashboardStyles = () => (
    <style>{`
        .dashboard {
            max-width: 1200px;
            margin: 0 auto;
            display: flex;
            flex-direction: column;
            gap: 28px;
        }

        .dashboard-header {
            display: flex;
            align-items: flex-start;
            justify-content: space-between;
            gap: 20px;
            flex-wrap: wrap;
        }

        .eyebrow {
            margin: 0 0 4px;
            font-size: 11px;
            font-weight: 700;
            letter-spacing: 0.08em;
            text-transform: uppercase;
            color: var(--accent, #cf9d56);
        }

        .dashboard-heading h1 {
            margin: 0;
            font-size: 24px;
            color: var(--text, #f1efe9);
        }

        .lede {
            margin: 4px 0 0;
            font-size: 13.5px;
            color: var(--text-muted, #9a9ba6);
        }

        .dashboard-header-actions {
            display: flex;
            gap: 10px;
            flex-shrink: 0;
        }

        .button {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            height: 38px;
            padding: 0 18px;
            border-radius: 999px;
            background: var(--accent, #cf9d56);
            color: #14151a;
            font-size: 13px;
            font-weight: 600;
            border: none;
            transition: filter 0.15s var(--ease, ease);
        }

        .button:hover:not(:disabled) {
            filter: brightness(1.08);
        }

        .button-muted {
            background: var(--surface-raised, #23252e);
            color: var(--text, #f1efe9);
            border: 1px solid var(--border, rgba(255, 255, 255, 0.08));
        }

        .button:disabled {
            opacity: 0.6;
            cursor: not-allowed;
        }

        /* ---- Profile strip ---- */

        .dashboard-profile {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 14px 16px;
            border-radius: var(--radius-md, 12px);
            background: var(--surface, #1b1d24);
            border: 1px solid var(--border, rgba(255, 255, 255, 0.08));
        }

        .dashboard-profile strong {
            display: block;
            font-size: 14px;
            color: var(--text, #f1efe9);
        }

        .dashboard-profile span {
            display: block;
            font-size: 12px;
            color: var(--text-muted, #9a9ba6);
            margin-top: 2px;
        }

        .dashboard-channel-link {
            margin-left: auto;
            display: inline-flex;
            align-items: center;
            gap: 6px;
            font-size: 13px;
            font-weight: 600;
            color: var(--accent, #cf9d56);
        }

        .dashboard-channel-link:hover {
            text-decoration: underline;
        }

        /* ---- Error notice ---- */

        .notice.error.dashboard-error {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 16px;
            padding: 14px 16px;
            border-radius: var(--radius-md, 12px);
            background: rgba(226, 104, 92, 0.12);
            border: 1px solid rgba(226, 104, 92, 0.3);
        }

        .dashboard-error strong {
            display: block;
            font-size: 13.5px;
            color: var(--danger, #e2685c);
        }

        .dashboard-error p {
            margin: 2px 0 0;
            font-size: 13px;
            color: var(--text-muted, #9a9ba6);
        }

        /* ---- Stats ---- */

        .stats {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
            gap: 14px;
        }

        .stat {
            padding: 16px;
            border-radius: var(--radius-md, 12px);
            background: var(--surface, #1b1d24);
            border: 1px solid var(--border, rgba(255, 255, 255, 0.08));
        }

        .stat-top {
            display: flex;
            align-items: center;
            justify-content: space-between;
            color: var(--accent, #cf9d56);
            font-size: 16px;
            margin-bottom: 10px;
        }

        .stat-top small {
            font-size: 10.5px;
            font-weight: 700;
            letter-spacing: 0.06em;
            text-transform: uppercase;
            color: var(--text-muted, #9a9ba6);
        }

        .stat strong {
            display: block;
            font-size: 22px;
            color: var(--text, #f1efe9);
        }

        .stat p {
            margin: 2px 0 0;
            font-size: 12.5px;
            color: var(--text-muted, #9a9ba6);
        }

        /* ---- Video section ---- */

        .section-heading {
            display: flex;
            align-items: flex-end;
            justify-content: space-between;
            flex-wrap: wrap;
            gap: 10px;
        }

        .section-heading h2 {
            margin: 0;
            font-size: 17px;
            color: var(--text, #f1efe9);
        }

        .dashboard-video-actions {
            display: flex;
            align-items: center;
            gap: 14px;
            font-size: 13px;
            color: var(--text-muted, #9a9ba6);
        }

        .dashboard-video-actions a {
            color: var(--accent, #cf9d56);
            font-weight: 600;
        }

        .dashboard-video-actions a:hover {
            text-decoration: underline;
        }

        .video-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
            gap: 20px;
        }

        .empty {
            display: flex;
            flex-direction: column;
            align-items: center;
            text-align: center;
            gap: 8px;
            padding: 50px 20px;
            border-radius: var(--radius-md, 12px);
            background: var(--surface, #1b1d24);
            border: 1px dashed var(--border, rgba(255, 255, 255, 0.08));
        }

        .empty-icon {
            width: 40px;
            height: 40px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 50%;
            background: var(--accent-soft, rgba(207, 157, 86, 0.14));
            color: var(--accent, #cf9d56);
            font-size: 18px;
        }

        .empty h3 {
            margin: 0;
            color: var(--text, #f1efe9);
            font-size: 15px;
        }

        .empty p {
            margin: 0 0 6px;
            font-size: 13.5px;
            color: var(--text-muted, #9a9ba6);
        }

        /* ---- Skeleton ---- */

        @keyframes shimmer {
            0% { background-position: -400px 0; }
            100% { background-position: 400px 0; }
        }

        .dashboard-heading-skeleton span,
        .stat-skeleton span,
        .dashboard-section-skeleton span,
        .dashboard-video-skeleton .skeleton,
        .dashboard-lines span {
            background: linear-gradient(
                90deg,
                var(--surface, #1b1d24) 25%,
                var(--surface-raised, #23252e) 37%,
                var(--surface, #1b1d24) 63%
            );
            background-size: 800px 100%;
            animation: shimmer 1.4s ease-in-out infinite;
            border-radius: var(--radius-sm, 8px);
            display: block;
        }

        .dashboard-heading-skeleton {
            display: flex;
            flex-direction: column;
            gap: 8px;
        }

        .dashboard-heading-skeleton span:first-child { width: 120px; height: 10px; }
        .dashboard-heading-skeleton span:nth-child(2) { width: 260px; height: 20px; }
        .dashboard-heading-skeleton span:nth-child(3) { width: 320px; height: 12px; }

        .stats-skeleton {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
            gap: 14px;
        }

        .stat-skeleton {
            padding: 16px;
            border-radius: var(--radius-md, 12px);
            background: var(--surface, #1b1d24);
            border: 1px solid var(--border, rgba(255, 255, 255, 0.08));
            display: flex;
            flex-direction: column;
            gap: 10px;
        }

        .stat-skeleton span:first-child { height: 24px; width: 60%; }
        .stat-skeleton span:nth-child(2) { height: 10px; width: 40%; }

        .dashboard-section-skeleton {
            display: flex;
            justify-content: space-between;
        }

        .dashboard-section-skeleton span:first-child { width: 140px; height: 16px; }
        .dashboard-section-skeleton span:nth-child(2) { width: 90px; height: 16px; }

        .skeleton-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
            gap: 20px;
        }

        .dashboard-video-skeleton .skeleton {
            aspect-ratio: 16 / 9;
        }

        .dashboard-lines {
            display: flex;
            flex-direction: column;
            gap: 6px;
            margin-top: 10px;
        }

        .dashboard-lines span { height: 10px; }
        .dashboard-lines span:nth-child(2) { width: 60%; }

        @media (prefers-reduced-motion: reduce) {
            .dashboard-heading-skeleton span,
            .stat-skeleton span,
            .dashboard-section-skeleton span,
            .dashboard-video-skeleton .skeleton,
            .dashboard-lines span {
                animation: none;
            }
        }

        @media (max-width: 640px) {
            .dashboard-header {
                flex-direction: column;
                align-items: stretch;
            }

            .dashboard-header-actions {
                width: 100%;
            }

            .dashboard-header-actions .button {
                flex: 1;
                justify-content: center;
            }

            .dashboard-channel-link {
                margin-left: 0;
                width: 100%;
                justify-content: flex-end;
            }
        }
    `}</style>
);

export default Dashboard;