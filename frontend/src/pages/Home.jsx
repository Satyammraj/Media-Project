import { useCallback, useEffect, useRef, useState } from "react";

import {
    Link,
    useSearchParams,
} from "react-router-dom";

import { getVideos } from "../services/api";

import VideoCard from "../components/VideoCard";

const HomeSkeleton = () => {
    return (
        <div className="video-grid home-skeleton-grid">
            {Array.from({ length: 8 }).map((_, index) => (
                <div
                    className="home-card-skeleton"
                    key={index}
                >
                    <div className="skeleton" />

                    <div className="home-skeleton-meta">
                        <span />
                        <div>
                            <span />
                            <span />
                            <span />
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

const Home = () => {
    const [searchParams, setSearchParams] =
        useSearchParams();

    const query = searchParams.get("query") || "";

    const [videos, setVideos] = useState([]);
    const [sort, setSort] = useState("newest");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Stamps every fetch with an id so a response that's no longer
    // the latest (superseded by a newer query/sort, or the component
    // unmounting) can never overwrite state after the fact.
    const requestIdRef = useRef(0);

    const fetchVideos = useCallback(async () => {
        const requestId = ++requestIdRef.current;

        try {
            setLoading(true);
            setError("");

            const response = await getVideos({
                query: query.trim(),
                limit: 20,
                sortBy:
                    sort === "popular"
                        ? "views"
                        : undefined,
            });

            if (requestIdRef.current !== requestId) return;

            setVideos(
                Array.isArray(response.data.data)
                    ? response.data.data
                    : []
            );
        } catch (requestError) {
            if (requestIdRef.current !== requestId) return;

            setVideos([]);

            setError(
                requestError?.response?.data
                    ?.message ||
                    "Could not load videos. Is the backend running?"
            );
        } finally {
            if (requestIdRef.current === requestId) {
                setLoading(false);
            }
        }
    }, [query, sort]);

    useEffect(() => {
        const timer = setTimeout(
            fetchVideos,
            query ? 250 : 0
        );

        return () => clearTimeout(timer);
    }, [query, sort, fetchVideos]);

    useEffect(() => {
        // Invalidate any in-flight request on unmount.
        return () => {
            requestIdRef.current += 1;
        };
    }, []);

    const handleSortChange = (event) => {
        setSort(event.target.value);
    };

    const clearSearch = () => {
        setSearchParams({});
    };

    const hasSearch = Boolean(query.trim());

    return (
        <main className="content home-page">
            <HomeStyles />

            {/* ───────────────── HERO / HEADER ───────────────── */}
            <section className="intro home-intro">
                <div className="home-heading">
                    <p className="eyebrow">
                        {hasSearch
                            ? "Search results"
                            : "Your daily watchlist"}
                    </p>

                    <h1>
                        {hasSearch ? (
                            <>
                                Results for{" "}
                                <span className="search-highlight">
                                    "{query}"
                                </span>
                            </>
                        ) : (
                            "Find something worth watching."
                        )}
                    </h1>

                    <p className="lede">
                        {hasSearch
                            ? "Explore videos matching your search and discover your next rabbit hole."
                            : "Fresh ideas, sharp stories, and useful rabbit holes from independent creators."}
                    </p>
                </div>

                <div className="home-controls">
                    {hasSearch && (
                        <button
                            type="button"
                            className="clear-search"
                            onClick={clearSearch}
                        >
                            <span aria-hidden="true">×</span>
                            Clear search
                        </button>
                    )}

                    <div className="sort-control">
                        <label htmlFor="sort">
                            Sort by
                        </label>

                        <select
                            id="sort"
                            value={sort}
                            onChange={handleSortChange}
                        >
                            <option value="newest">
                                Newest
                            </option>

                            <option value="popular">
                                Most viewed
                            </option>
                        </select>
                    </div>
                </div>
            </section>

            {/* ───────────────── ERROR ───────────────── */}
            {error && (
                <div className="notice error home-error">
                    <div>
                        <strong>
                            Couldn't load videos
                        </strong>

                        <p>{error}</p>
                    </div>

                    <button
                        type="button"
                        className="button button-muted"
                        onClick={fetchVideos}
                        disabled={loading}
                    >
                        Try again
                    </button>
                </div>
            )}

            {/* ───────────────── RESULTS HEADER ───────────────── */}
            {!loading && !error && (
                <div className="results-heading">
                    <span>
                        {videos.length === 0
                            ? "No results"
                            : `${videos.length} ${
                                  videos.length === 1
                                      ? "video"
                                      : "videos"
                              }`}
                    </span>

                    {hasSearch && (
                        <span className="results-query">
                            Search completed
                        </span>
                    )}
                </div>
            )}

            {/* ───────────────── CONTENT ───────────────── */}
            {loading ? (
                <HomeSkeleton />
            ) : videos.length > 0 ? (
                <section
                    className="video-grid home-video-grid"
                    aria-label={
                        hasSearch
                            ? "Search results"
                            : "Latest videos"
                    }
                >
                    {videos.map((video) => (
                        <VideoCard
                            key={video._id}
                            video={video}
                        />
                    ))}
                </section>
            ) : (
                <div className="empty home-empty">
                    <div className="empty-icon" aria-hidden="true">
                        {hasSearch ? "⌕" : "◌"}
                    </div>

                    <h2>
                        {hasSearch
                            ? "Nothing matched your search"
                            : "No videos yet"}
                    </h2>

                    <p>
                        {hasSearch
                            ? "Try a different phrase, creator, or keyword."
                            : "There aren't any videos to show right now. Check back soon."}
                    </p>

                    {hasSearch && (
                        <button
                            type="button"
                            className="button"
                            onClick={clearSearch}
                        >
                            Browse all videos
                        </button>
                    )}

                    {!hasSearch && (
                        <Link
                            className="button"
                            to="/upload"
                        >
                            Upload a video
                        </Link>
                    )}
                </div>
            )}
        </main>
    );
};

/* =================================================================
   STYLES — matches the AppShell theme. Shared class names (.button,
   .empty, .notice.error, .eyebrow, .skeleton, shimmer keyframe) are
   redefined here with the same values used elsewhere (e.g. Dashboard)
   so Home looks correct whether or not another themed component
   happens to also be mounted.

   NOTE: .video-grid is scoped as `.home-page .video-grid` rather than
   a bare `.video-grid` — the global theme stylesheet also defines
   `.video-grid` (with different, incorrect column behavior), and a
   bare selector here would tie in specificity with that rule, making
   the outcome depend on unpredictable style-tag mount order instead
   of always doing the right thing.
   ================================================================= */

const HomeStyles = () => (
    <style>{`
        .home-page {
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

        /* ---- Hero ---- */

        .home-intro {
            display: flex;
            align-items: flex-end;
            justify-content: space-between;
            flex-wrap: wrap;
            gap: 20px;
        }

        .home-heading h1 {
            margin: 0;
            font-size: 26px;
            line-height: 1.25;
            color: var(--text, #f1efe9);
        }

        .search-highlight {
            color: var(--accent, #cf9d56);
        }

        .home-heading .lede {
            margin: 6px 0 0;
            font-size: 13.5px;
            color: var(--text-muted, #9a9ba6);
            max-width: 520px;
        }

        .home-controls {
            display: flex;
            align-items: center;
            gap: 14px;
            flex-shrink: 0;
        }

        .clear-search {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            height: 34px;
            padding: 0 14px;
            border-radius: 999px;
            background: var(--surface-raised, #23252e);
            color: var(--text, #f1efe9);
            border: 1px solid var(--border, rgba(255, 255, 255, 0.08));
            font-size: 12.5px;
            font-weight: 600;
            transition: filter 0.15s var(--ease, ease);
        }

        .clear-search:hover {
            filter: brightness(1.1);
        }

        .clear-search span {
            font-size: 15px;
            line-height: 1;
        }

        .sort-control {
            display: flex;
            align-items: center;
            gap: 8px;
        }

        .sort-control label {
            font-size: 12.5px;
            color: var(--text-muted, #9a9ba6);
        }

        .sort-control select {
            height: 34px;
            padding: 0 10px;
            border-radius: var(--radius-sm, 8px);
            background: var(--surface, #1b1d24);
            color: var(--text, #f1efe9);
            border: 1px solid var(--border, rgba(255, 255, 255, 0.08));
            font-size: 13px;
        }

        .sort-control select:focus-visible {
            outline: 2px solid var(--accent, #cf9d56);
            outline-offset: 2px;
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

        .notice.error.home-error {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 16px;
            padding: 14px 16px;
            border-radius: var(--radius-md, 12px);
            background: rgba(226, 104, 92, 0.12);
            border: 1px solid rgba(226, 104, 92, 0.3);
        }

        .home-error strong {
            display: block;
            font-size: 13.5px;
            color: var(--danger, #e2685c);
        }

        .home-error p {
            margin: 2px 0 0;
            font-size: 13px;
            color: var(--text-muted, #9a9ba6);
        }

        /* ---- Results heading ---- */

        .results-heading {
            display: flex;
            align-items: center;
            gap: 10px;
            font-size: 12.5px;
            color: var(--text-muted, #9a9ba6);
        }

        .results-query {
            padding: 2px 10px;
            border-radius: 999px;
            background: var(--accent-soft, rgba(207, 157, 86, 0.14));
            color: var(--accent, #cf9d56);
            font-weight: 600;
            font-size: 11.5px;
        }

        /* ---- Video grid (page-scoped to always beat the global rule) ---- */

        .home-page .video-grid {
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
        .home-skeleton-meta span {
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

        .home-card-skeleton {
            display: flex;
            flex-direction: column;
            gap: 10px;
        }

        .home-card-skeleton .skeleton {
            aspect-ratio: 16 / 9;
        }

        .home-skeleton-meta {
            display: flex;
            gap: 10px;
        }

        .home-skeleton-meta > span {
            width: 36px;
            height: 36px;
            border-radius: 50%;
            flex-shrink: 0;
        }

        .home-skeleton-meta > div {
            flex: 1;
            display: flex;
            flex-direction: column;
            gap: 6px;
        }

        .home-skeleton-meta > div span {
            height: 10px;
        }

        .home-skeleton-meta > div span:nth-child(1) { width: 90%; }
        .home-skeleton-meta > div span:nth-child(2) { width: 60%; }
        .home-skeleton-meta > div span:nth-child(3) { width: 40%; }

        @media (prefers-reduced-motion: reduce) {
            .skeleton,
            .home-skeleton-meta span {
                animation: none;
            }
        }

        @media (max-width: 640px) {
            .home-intro {
                flex-direction: column;
                align-items: stretch;
            }

            .home-controls {
                justify-content: space-between;
            }
        }
    `}</style>
);

export default Home;