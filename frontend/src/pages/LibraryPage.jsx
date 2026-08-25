import { useCallback, useEffect, useRef, useState } from "react";

import { Link, Navigate } from "react-router-dom";

import {
    getLikedVideos,
    getSubscriptions,
    getUserPlaylists,
    getWatchHistory,
} from "../services/api";

import VideoCard from "../components/VideoCard";

import { useAuth } from "../context/AuthContext";

const libraryConfig = {
    history: {
        eyebrow: "Your library",
        title: "Watch history",
        description:
            "Pick up where you left off and revisit videos you've watched.",
        emptyTitle: "Your history is empty",
        emptyDescription:
            "Videos you watch will appear here so you can easily find them again.",
        icon: "◷",
    },

    liked: {
        eyebrow: "Your library",
        title: "Liked videos",
        description:
            "A collection of videos you've enjoyed and saved with a like.",
        emptyTitle: "No liked videos yet",
        emptyDescription:
            "When you like a video, it'll appear here for easy access later.",
        icon: "♡",
    },

    subscriptions: {
        eyebrow: "Your library",
        title: "Subscriptions",
        description:
            "Keep up with the creators you choose to follow.",
        emptyTitle: "No subscriptions yet",
        emptyDescription:
            "Subscribe to creators you enjoy and their videos will appear here.",
        icon: "◉",
    },

    playlists: {
        eyebrow: "Your library",
        title: "Your playlists",
        description:
            "Organize the videos you want to come back to.",
        emptyTitle: "No playlists yet",
        emptyDescription:
            "Create playlists to organize your favorite videos.",
        icon: "▱",
    },
};

const LibrarySkeleton = () => {
    return (
        <section className="video-grid library-grid library-skeleton-grid">
            {Array.from({ length: 8 }).map((_, index) => (
                <div
                    className="library-card-skeleton"
                    key={index}
                >
                    <div className="skeleton" />

                    <div className="library-skeleton-meta">
                        <span />
                        <div>
                            <span />
                            <span />
                            <span />
                        </div>
                    </div>
                </div>
            ))}
        </section>
    );
};

const LibraryPage = ({ view }) => {
    // `view` comes from the route in App.jsx (e.g. "history", "liked",
    // "subscriptions", "playlists") — each of those is a literal path,
    // not a `:type` URL param, so this must be a prop, not useParams().
    const type = view;

    const { user, loading: authLoading } = useAuth();

    const [items, setItems] = useState([]);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);

    // Stamps every fetch so a response that's no longer the latest
    // (superseded by a fast tab switch between library sections, or
    // the component unmounting) can never overwrite state after
    // the fact — a plain `mounted` boolean only guards the unmount
    // case, not two overlapping in-flight requests racing.
    const requestIdRef = useRef(0);

    const config =
        libraryConfig[type] || {
            eyebrow: "Your library",
            title: "Library",
            description:
                "Your saved videos and activity.",
            emptyTitle: "Nothing here yet",
            emptyDescription:
                "Videos you interact with will appear in this space.",
            icon: "◌",
        };
    const title = config.title;

    const load = useCallback(async () => {
        // Auth is still resolving — wait rather than treating "no
        // user yet" as "no library items". Without this check the
        // page briefly flashes its empty state for signed-in users
        // whose auth simply hasn't finished loading.
        if (authLoading) return;

        if (!user?._id) {
            setLoading(false);
            return;
        }

        const requestId = ++requestIdRef.current;

        try {
            setLoading(true);
            setError("");

            let response;

            if (type === "history") {
                response = await getWatchHistory();
            } else if (type === "liked") {
                response = await getLikedVideos();
            } else if (type === "subscriptions") {
                response =
                    await getSubscriptions(user._id);
            } else if (type === "playlists") {
                response =
                    await getUserPlaylists(user._id);
            } else {
                throw new Error(
                    "Unknown library section."
                );
            }

            if (requestIdRef.current !== requestId) return;

            setItems(
                Array.isArray(response?.data?.data)
                    ? response.data.data
                    : []
            );
        } catch (requestError) {
            if (requestIdRef.current !== requestId) return;

            setItems([]);

            setError(
                requestError?.response?.data
                    ?.message ||
                    `Unable to load ${title.toLowerCase()}.`
            );
        } finally {
            if (requestIdRef.current === requestId) {
                setLoading(false);
            }
        }
    }, [type, user, authLoading, title]);

    useEffect(() => {
        // Load the selected library section whenever its route/auth inputs change.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        load();
    }, [load]);

    useEffect(() => {
        // Invalidate any in-flight request on unmount.
        return () => {
            requestIdRef.current += 1;
        };
    }, []);

    if (!authLoading && !user) {
        return (
            <Navigate
                to="/login"
                replace
            />
        );
    }

    return (
        <main className="page-content library-page">
            <LibraryStyles />

            {/* ───────────────── HEADER ───────────────── */}
            <section className="library-header">
                <div>
                    <p className="eyebrow">
                        {config.eyebrow}
                    </p>

                    <h1>{config.title}</h1>

                    <p className="lede">
                        {config.description}
                    </p>
                </div>

                {!loading && !error && items.length > 0 && (
                    <div className="library-count">
                        <strong>
                            {items.length}
                        </strong>

                        <span>
                            {items.length === 1
                                ? "item"
                                : "items"}
                        </span>
                    </div>
                )}
            </section>

            {/* ───────────────── ERROR ───────────────── */}
            {error && (
                <div className="notice error library-error">
                    <div>
                        <strong>
                            Couldn't load your library
                        </strong>

                        <p>{error}</p>
                    </div>

                    <button
                        type="button"
                        className="button button-muted"
                        onClick={load}
                        disabled={loading}
                    >
                        Try again
                    </button>
                </div>
            )}

            {/* ───────────────── CONTENT ───────────────── */}
            {!error && loading && (
                <LibrarySkeleton />
            )}

            {!error &&
                !loading &&
                items.length > 0 && (
                    <section
                        className="video-grid library-grid"
                        aria-label={config.title}
                    >
                        {items.map((item) => {
                            const video =
                                item.video || item;

                            if (!video?._id) {
                                return null;
                            }

                            return (
                                <VideoCard
                                    key={video._id}
                                    video={video}
                                />
                            );
                        })}
                    </section>
                )}

            {/* ───────────────── EMPTY ───────────────── */}
            {!error &&
                !loading &&
                items.length === 0 && (
                    <div className="empty library-empty">
                        <div className="empty-icon" aria-hidden="true">
                            {config.icon}
                        </div>

                        <h2>
                            {config.emptyTitle}
                        </h2>

                        <p>
                            {config.emptyDescription}
                        </p>

                        <Link
                            className="button"
                            to="/"
                        >
                            Discover videos
                        </Link>
                    </div>
                )}
        </main>
    );
};

/* =================================================================
   STYLES — matches the AppShell theme. Shared class names (.button,
   .empty, .notice.error, .video-grid, .eyebrow, .lede, .skeleton,
   shimmer keyframe) are redefined here with the same values used
   elsewhere (Dashboard, Home) so this page looks correct on its own.
   ================================================================= */

const LibraryStyles = () => (
    <style>{`
        .library-page {
            max-width: 1200px;
            margin: 0 auto;
            display: flex;
            flex-direction: column;
            gap: 24px;
        }

        .eyebrow {
            margin: 0 0 4px;
            font-size: 11px;
            font-weight: 700;
            letter-spacing: 0.08em;
            text-transform: uppercase;
            color: var(--accent, #cf9d56);
        }

        .lede {
            margin: 6px 0 0;
            font-size: 13.5px;
            color: var(--text-muted, #9a9ba6);
            max-width: 520px;
        }

        /* ---- Header ---- */

        .library-header {
            display: flex;
            align-items: flex-end;
            justify-content: space-between;
            flex-wrap: wrap;
            gap: 20px;
        }

        .library-header h1 {
            margin: 0;
            font-size: 26px;
            color: var(--text, #f1efe9);
        }

        .library-count {
            display: flex;
            align-items: baseline;
            gap: 6px;
            padding: 8px 16px;
            border-radius: var(--radius-md, 12px);
            background: var(--surface, #1b1d24);
            border: 1px solid var(--border, rgba(255, 255, 255, 0.08));
            flex-shrink: 0;
        }

        .library-count strong {
            font-size: 18px;
            color: var(--text, #f1efe9);
        }

        .library-count span {
            font-size: 12.5px;
            color: var(--text-muted, #9a9ba6);
        }

        /* ---- Buttons (shared) ---- */

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

        /* ---- Error notice (shared) ---- */

        .notice.error.library-error {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 16px;
            padding: 14px 16px;
            border-radius: var(--radius-md, 12px);
            background: rgba(226, 104, 92, 0.12);
            border: 1px solid rgba(226, 104, 92, 0.3);
        }

        .library-error strong {
            display: block;
            font-size: 13.5px;
            color: var(--danger, #e2685c);
        }

        .library-error p {
            margin: 2px 0 0;
            font-size: 13px;
            color: var(--text-muted, #9a9ba6);
        }

        /* ---- Video grid (shared) ---- */

        .video-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
            gap: 20px;
        }

        /* ---- Empty state (shared) ---- */

        .empty {
            display: flex;
            flex-direction: column;
            align-items: center;
            text-align: center;
            gap: 8px;
            padding: 60px 20px;
            border-radius: var(--radius-md, 12px);
            background: var(--surface, #1b1d24);
            border: 1px dashed var(--border, rgba(255, 255, 255, 0.08));
        }

        .empty-icon {
            width: 44px;
            height: 44px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 50%;
            background: var(--accent-soft, rgba(207, 157, 86, 0.14));
            color: var(--accent, #cf9d56);
            font-size: 20px;
        }

        .empty h2 {
            margin: 0;
            color: var(--text, #f1efe9);
            font-size: 16px;
        }

        .empty p {
            margin: 0 0 6px;
            font-size: 13.5px;
            color: var(--text-muted, #9a9ba6);
            max-width: 360px;
        }

        /* ---- Skeleton ---- */

        @keyframes shimmer {
            0% { background-position: -400px 0; }
            100% { background-position: 400px 0; }
        }

        .skeleton,
        .library-skeleton-meta span {
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

        .library-card-skeleton {
            display: flex;
            flex-direction: column;
            gap: 10px;
        }

        .library-card-skeleton .skeleton {
            aspect-ratio: 16 / 9;
        }

        .library-skeleton-meta {
            display: flex;
            gap: 10px;
        }

        .library-skeleton-meta > span {
            width: 36px;
            height: 36px;
            border-radius: 50%;
            flex-shrink: 0;
        }

        .library-skeleton-meta > div {
            flex: 1;
            display: flex;
            flex-direction: column;
            gap: 6px;
        }

        .library-skeleton-meta > div span {
            height: 10px;
        }

        .library-skeleton-meta > div span:nth-child(1) { width: 90%; }
        .library-skeleton-meta > div span:nth-child(2) { width: 60%; }
        .library-skeleton-meta > div span:nth-child(3) { width: 40%; }

        @media (prefers-reduced-motion: reduce) {
            .skeleton,
            .library-skeleton-meta span {
                animation: none;
            }
        }

        @media (max-width: 640px) {
            .library-header {
                flex-direction: column;
                align-items: stretch;
            }
        }
    `}</style>
);

export default LibraryPage;