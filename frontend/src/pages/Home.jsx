import {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";

import {
    Link,
    useSearchParams,
} from "react-router-dom";

import { getVideos } from "../services/api";
import VideoCard from "../components/VideoCard";


/* ============================================================
   SKELETON
============================================================ */

const HomeSkeleton = () => {
    return (
        <div className="video-grid home-skeleton-grid">
            {Array.from({ length: 8 }).map(
                (_, index) => (
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
                )
            )}
        </div>
    );
};


/* ============================================================
   STAT HELPERS
============================================================ */

const getCreatorKey = (video) => {
    const owner =
        video?.owner ||
        video?.creator ||
        video?.user ||
        video?.uploadedBy;

    if (!owner) {
        return null;
    }

    if (typeof owner === "string") {
        return owner;
    }

    return (
        owner._id ||
        owner.id ||
        owner.username ||
        owner.fullName ||
        null
    );
};


const getViews = (video) => {
    const views = Number(
        video?.views ??
        video?.viewCount ??
        0
    );

    return Number.isFinite(views)
        ? views
        : 0;
};


const formatStatNumber = (value) => {
    const number = Number(value) || 0;

    if (number >= 1_000_000_000) {
        return `${(
            number / 1_000_000_000
        )
            .toFixed(
                number >= 10_000_000_000
                    ? 0
                    : 1
            )
            .replace(/\.0$/, "")}B`;
    }

    if (number >= 1_000_000) {
        return `${(
            number / 1_000_000
        )
            .toFixed(
                number >= 10_000_000
                    ? 0
                    : 1
            )
            .replace(/\.0$/, "")}M`;
    }

    if (number >= 1_000) {
        return `${(
            number / 1_000
        )
            .toFixed(
                number >= 10_000
                    ? 0
                    : 1
            )
            .replace(/\.0$/, "")}K`;
    }

    return number.toLocaleString();
};


/* ============================================================
   HOME
============================================================ */

const Home = () => {
    const [
        searchParams,
        setSearchParams,
    ] = useSearchParams();


    const query =
        searchParams.get("query") || "";


    const [videos, setVideos] =
        useState([]);


    const [sort, setSort] =
        useState("newest");


    const [loading, setLoading] =
        useState(true);


    const [error, setError] =
        useState("");


    const requestIdRef =
        useRef(0);


    /* ========================================================
       FETCH VIDEOS
    ======================================================== */

    const fetchVideos = useCallback(
        async () => {
            const requestId =
                ++requestIdRef.current;


            try {
                setLoading(true);
                setError("");


                const response =
                    await getVideos({
                        query:
                            query.trim(),

                        limit: 20,

                        sortBy:
                            sort ===
                            "popular"
                                ? "views"
                                : undefined,
                    });


                if (
                    requestIdRef.current !==
                    requestId
                ) {
                    return;
                }


                setVideos(
                    Array.isArray(
                        response?.data?.data
                    )
                        ? response.data.data
                        : []
                );

            } catch (
                requestError
            ) {

                if (
                    requestIdRef.current !==
                    requestId
                ) {
                    return;
                }


                setVideos([]);


                setError(
                    requestError
                        ?.response
                        ?.data
                        ?.message ||
                    "Could not load videos. Is the backend running?"
                );

            } finally {

                if (
                    requestIdRef.current ===
                    requestId
                ) {
                    setLoading(false);
                }

            }
        },
        [query, sort]
    );


    /* ========================================================
       FETCH EFFECT
    ======================================================== */

    useEffect(() => {
        const timer = setTimeout(
            fetchVideos,
            query ? 250 : 0
        );


        return () =>
            clearTimeout(timer);

    }, [
        query,
        sort,
        fetchVideos,
    ]);


    /* ========================================================
       INVALIDATE REQUESTS
    ======================================================== */

    useEffect(() => {
        return () => {
            requestIdRef.current += 1;
        };
    }, []);


    /* ========================================================
       CONTROLS
    ======================================================== */

    const handleSortChange = (
        event
    ) => {
        setSort(
            event.target.value
        );
    };


    const clearSearch = () => {
        setSearchParams({});
    };


    const hasSearch =
        Boolean(query.trim());


    /* ========================================================
       STATS
    ======================================================== */

    const stats = useMemo(() => {
        const creatorKeys =
            new Set();

        let totalViews = 0;


        videos.forEach((video) => {
            const creatorKey =
                getCreatorKey(video);


            if (creatorKey) {
                creatorKeys.add(
                    String(
                        creatorKey
                    )
                );
            }


            totalViews +=
                getViews(video);
        });


        return {
            videos:
                videos.length,

            creators:
                creatorKeys.size,

            views:
                totalViews,
        };

    }, [videos]);


    /* ========================================================
       RENDER
    ======================================================== */

    return (
        <main className="content home-page">

            <HomeStyles />


            {/* ==================================================
                HERO
            ================================================== */}

            <section className="home-hero">

                <div className="hero-topline">

                    <span>
                        VIDEOLY
                    </span>

                    <span>
                        {hasSearch
                            ? "SEARCH / 01"
                            : "DISCOVER / 01"}
                    </span>

                </div>


                <div className="hero-main">

                    <div className="home-heading">

                        <p className="eyebrow">
                            {hasSearch
                                ? "Search results"
                                : "Independent video discovery"}
                        </p>


                        <h1>
                            {hasSearch ? (
                                <>
                                    Results for{" "}
                                    <span>
                                        "{query}"
                                    </span>
                                </>
                            ) : (
                                <>
                                    Find something
                                    <br />
                                    <span>
                                        worth watching.
                                    </span>
                                </>
                            )}
                        </h1>


                        <p className="lede">
                            {hasSearch
                                ? "Explore videos matching your search and discover your next rabbit hole."
                                : "Fresh ideas, sharp stories, and useful rabbit holes from independent creators."}
                        </p>

                    </div>


                    <div className="hero-side">

                        <span className="hero-side-number">
                            01
                        </span>


                        <p>
                            A place for
                            videos worth
                            your attention.
                        </p>


                        <span className="hero-side-line" />

                    </div>

                </div>


                <div className="hero-bottomline">

                    <span>
                        SCROLL TO EXPLORE
                    </span>

                    <span>
                        ↓
                    </span>

                </div>

            </section>


            {/* ==================================================
                STATS
            ================================================== */}

            {!hasSearch &&
                !loading &&
                !error && (

                    <section
                        className="home-stats"
                        aria-label="Videoly statistics"
                    >

                        <div className="stats-label">
                            PLATFORM
                            <br />
                            INDEX
                        </div>


                        <div className="home-stat">

                            <span className="home-stat-number">
                                {formatStatNumber(
                                    stats.videos
                                )}
                            </span>

                            <span className="home-stat-label">
                                Videos
                            </span>

                        </div>


                        <div className="home-stat-divider" />


                        <div className="home-stat">

                            <span className="home-stat-number">
                                {formatStatNumber(
                                    stats.creators
                                )}
                            </span>

                            <span className="home-stat-label">
                                Creators
                            </span>

                        </div>


                        <div className="home-stat-divider" />


                        <div className="home-stat">

                            <span className="home-stat-number">
                                {formatStatNumber(
                                    stats.views
                                )}
                            </span>

                            <span className="home-stat-label">
                                Views
                            </span>

                        </div>

                    </section>
                )}


            {/* ==================================================
                ERROR
            ================================================== */}

            {error && (
                <div className="notice error home-error">

                    <div>

                        <strong>
                            Couldn't load videos
                        </strong>

                        <p>
                            {error}
                        </p>

                    </div>


                    <button
                        type="button"
                        className="button button-muted"
                        onClick={
                            fetchVideos
                        }
                        disabled={loading}
                    >
                        Try again
                    </button>

                </div>
            )}


            {/* ==================================================
                RESULTS HEADER
            ================================================== */}

            {!loading &&
                !error && (

                    <section className="content-heading">

                        <div>

                            <span className="section-number">
                                02
                            </span>

                            <h2>
                                {hasSearch
                                    ? "Search results"
                                    : "Latest discoveries"}
                            </h2>

                        </div>


                        <div className="content-heading-right">

                            {hasSearch && (
                                <button
                                    type="button"
                                    className="clear-search"
                                    onClick={
                                        clearSearch
                                    }
                                >
                                    <span>
                                        ×
                                    </span>

                                    Clear search
                                </button>
                            )}


                            <div className="sort-control">

                                <label htmlFor="sort">
                                    Sort
                                </label>

                                <select
                                    id="sort"
                                    value={sort}
                                    onChange={
                                        handleSortChange
                                    }
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
                )}


            {/* ==================================================
                RESULT META
            ================================================== */}

            {!loading &&
                !error && (

                    <div className="results-meta">

                        <span>
                            {videos.length === 0
                                ? "No results"
                                : `${videos.length} ${
                                      videos.length === 1
                                          ? "video"
                                          : "videos"
                                  }`}
                        </span>


                        <span>
                            {hasSearch
                                ? `QUERY / ${query}`
                                : "CURATED FEED"}
                        </span>

                    </div>
                )}


            {/* ==================================================
                CONTENT
            ================================================== */}

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

                    {videos.map(
                        (
                            video,
                            index
                        ) => (

                            <VideoCard
                                key={
                                    video._id
                                }
                                video={
                                    video
                                }
                                index={
                                    index
                                }
                            />

                        )
                    )}

                </section>

            ) : (

                <div className="empty home-empty">

                    <div
                        className="empty-index"
                        aria-hidden="true"
                    >
                        00
                    </div>


                    <div className="empty-icon">
                        {hasSearch
                            ? "⌕"
                            : "◌"}
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
                            onClick={
                                clearSearch
                            }
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
   HOME STYLES
================================================================= */

const HomeStyles = () => (
    <style>{`

        /* =========================================================
           PAGE
        ========================================================= */

        .home-page {
            width: 100%;
            max-width: 1400px;

            margin: 0 auto;

            display: flex;
            flex-direction: column;

            gap: 0;

            color:
                var(
                    --text,
                    #f5f5f5
                );
        }


        /* =========================================================
           HERO
        ========================================================= */

        .home-hero {
            position: relative;

            padding:
                12px
                0
                24px;

            border-bottom:
                1px solid
                var(
                    --border,
                    rgba(
                        255,
                        255,
                        255,
                        0.12
                    )
                );
        }


        .hero-topline,
        .hero-bottomline {
            display: flex;

            align-items: center;

            justify-content:
                space-between;

            color:
                var(
                    --text-muted,
                    #9a9da1
                );

            font-family:
                var(
                    --font-mono,
                    "DM Mono",
                    monospace
                );

            font-size: 9px;

            letter-spacing:
                0.1em;
        }


        .hero-topline {
            padding-bottom: 18px;
        }


        .hero-topline span:first-child {
            color:
                var(
                    --accent,
                    #ffffff
                );

            font-weight: 500;
        }


        .hero-main {
            display: grid;

            grid-template-columns:
                minmax(0, 1fr)
                180px;

            gap: 50px;

            align-items:
                flex-end;
        }


        .home-heading {
            min-width: 0;

            max-width: 1000px;
        }


        .eyebrow {
            margin:
                0
                0
                18px;

            color:
                var(
                    --accent,
                    #ffffff
                );

            font-family:
                var(
                    --font-mono,
                    "DM Mono",
                    monospace
                );

            font-size: 10px;

            letter-spacing:
                0.1em;

            text-transform:
                uppercase;
        }


        .home-heading h1 {
            margin: 0;

            font-family:
                var(
                    --display-font,
                    "Space Grotesk",
                    sans-serif
                );

            font-size:
                clamp(
                    4rem,
                    9vw,
                    9rem
                );

            font-weight: 700;

            line-height:
                0.84;

            letter-spacing:
                -0.075em;

            text-transform:
                uppercase;

            color:
                var(
                    --text,
                    #f5f5f5
                );
        }


        .home-heading h1 span {
            color:
                var(
                    --accent,
                    #ffffff
                );
        }


        .home-heading .lede {
            max-width: 520px;

            margin:
                28px
                0
                0;

            color:
                var(
                    --text-muted,
                    #9a9da1
                );

            font-size: 14px;

            line-height: 1.65;
        }


        /* =========================================================
           HERO SIDE NOTE
        ========================================================= */

        .hero-side {
            padding:
                0
                0
                12px;

            display: flex;

            flex-direction: column;

            align-items:
                flex-start;

            gap: 12px;
        }


        .hero-side-number {
            color:
                var(
                    --text-muted,
                    #9a9da1
                );

            font-family:
                var(
                    --font-mono,
                    monospace
                );

            font-size: 10px;
        }


        .hero-side p {
            margin: 0;

            max-width: 150px;

            color:
                var(
                    --text-muted,
                    #9a9da1
                );

            font-size: 12px;

            line-height: 1.5;
        }


        .hero-side-line {
            width: 45px;

            height: 1px;

            margin-top: 8px;

            background:
                var(
                    --accent,
                    #ffffff
                );
        }


        .hero-bottomline {
            margin-top: 38px;

            padding-top: 14px;

            border-top:
                1px solid
                var(
                    --border,
                    rgba(
                        255,
                        255,
                        255,
                        0.12
                    )
                );
        }


        /* =========================================================
           STATS
        ========================================================= */

        .home-stats {
            display: grid;

            grid-template-columns:
                110px
                1fr
                1px
                1fr
                1px
                1fr;

            align-items: stretch;

            width: 100%;

            min-height: 120px;

            border-bottom:
                1px solid
                var(
                    --border,
                    rgba(
                        255,
                        255,
                        255,
                        0.12
                    )
                );
        }


        .stats-label {
            display: flex;

            align-items: flex-start;

            padding:
                18px
                16px
                18px
                0;

            color:
                var(
                    --text-muted,
                    #9a9da1
                );

            font-family:
                var(
                    --font-mono,
                    monospace
                );

            font-size: 8px;

            line-height: 1.45;

            letter-spacing:
                0.08em;
        }


        .home-stat {
            min-width: 0;

            display: flex;

            flex-direction: column;

            justify-content:
                center;

            gap: 5px;

            padding:
                18px
                24px;
        }


        .home-stat-number {
            font-family:
                var(
                    --display-font,
                    "Space Grotesk",
                    sans-serif
                );

            font-size:
                clamp(
                    2rem,
                    4vw,
                    4rem
                );

            font-weight: 700;

            line-height: 0.9;

            letter-spacing:
                -0.06em;
        }


        .home-stat-label {
            color:
                var(
                    --text-muted,
                    #9a9da1
                );

            font-family:
                var(
                    --font-mono,
                    monospace
                );

            font-size: 9px;

            letter-spacing:
                0.1em;

            text-transform:
                uppercase;
        }


        .home-stat-divider {
            width: 1px;

            height: 100%;

            background:
                var(
                    --border,
                    rgba(
                        255,
                        255,
                        255,
                        0.12
                    )
                );
        }


        /* =========================================================
           CONTENT HEADING
        ========================================================= */

        .content-heading {
            display: flex;

            align-items:
                flex-end;

            justify-content:
                space-between;

            gap: 20px;

            padding:
                62px
                0
                20px;

            border-bottom:
                1px solid
                var(
                    --border,
                    rgba(
                        255,
                        255,
                        255,
                        0.12
                    )
                );
        }


        .content-heading > div:first-child {
            display: flex;

            align-items:
                baseline;

            gap: 16px;
        }


        .section-number {
            color:
                var(
                    --accent,
                    #ffffff
                );

            font-family:
                var(
                    --font-mono,
                    monospace
                );

            font-size: 10px;
        }


        .content-heading h2 {
            margin: 0;

            font-family:
                var(
                    --display-font,
                    "Space Grotesk",
                    sans-serif
                );

            font-size:
                clamp(
                    2rem,
                    4vw,
                    3.8rem
                );

            font-weight: 600;

            line-height: 0.9;

            letter-spacing:
                -0.06em;

            text-transform:
                uppercase;
        }


        .content-heading-right {
            display: flex;

            align-items:
                center;

            gap: 14px;
        }


        /* =========================================================
           SORT
        ========================================================= */

        .sort-control {
            display: flex;

            align-items: center;

            gap: 8px;
        }


        .sort-control label {
            color:
                var(
                    --text-muted,
                    #9a9da1
                );

            font-family:
                var(
                    --font-mono,
                    monospace
                );

            font-size: 9px;

            text-transform:
                uppercase;
        }


        .sort-control select {
            height: 32px;

            padding:
                0
                8px;

            border:
                1px solid
                var(
                    --border,
                    rgba(
                        255,
                        255,
                        255,
                        0.12
                    )
                );

            border-radius: 0;

            outline: none;

            background:
                var(
                    --background,
                    #0d0f11
                );

            color:
                var(
                    --text,
                    #f5f5f5
                );

            font-size: 11px;

            cursor: pointer;
        }


        /* =========================================================
           CLEAR SEARCH
        ========================================================= */

        .clear-search {
            height: 32px;

            display: inline-flex;

            align-items: center;

            gap: 7px;

            padding:
                0
                10px;

            border:
                1px solid
                var(
                    --border,
                    rgba(
                        255,
                        255,
                        255,
                        0.12
                    )
                );

            border-radius: 0;

            background:
                transparent;

            color:
                var(
                    --text-muted,
                    #9a9da1
                );

            font-size: 11px;

            cursor: pointer;
        }


        .clear-search:hover {
            color:
                var(
                    --text,
                    #f5f5f5
                );

            border-color:
                var(
                    --accent,
                    #ffffff
                );
        }


        .clear-search span {
            font-size: 16px;

            line-height: 1;
        }


        /* =========================================================
           RESULTS META
        ========================================================= */

        .results-meta {
            display: flex;

            align-items: center;

            justify-content:
                space-between;

            padding:
                12px
                0;

            color:
                var(
                    --text-muted,
                    #9a9da1
                );

            font-family:
                var(
                    --font-mono,
                    monospace
                );

            font-size: 8px;

            letter-spacing:
                0.08em;

            text-transform:
                uppercase;
        }


        .results-meta span:last-child {
            color:
                var(
                    --accent,
                    #ffffff
                );

            max-width: 50%;

            overflow: hidden;

            text-overflow: ellipsis;

            white-space: nowrap;
        }


        /* =========================================================
           VIDEO GRID
        ========================================================= */

        .home-page .video-grid {
            display: grid;

            grid-template-columns:
                repeat(
                    auto-fill,
                    minmax(
                        240px,
                        1fr
                    )
                );

            gap:
                34px
                20px;

            padding-top: 10px;
        }


        /* =========================================================
           EMPTY STATE
        ========================================================= */

        .home-empty {
            position: relative;

            min-height: 320px;

            display: flex;

            flex-direction: column;

            align-items: center;

            justify-content: center;

            text-align: center;

            gap: 8px;

            padding: 50px;

            border-top:
                1px solid
                var(
                    --border,
                    rgba(
                        255,
                        255,
                        255,
                        0.12
                    )
                );

            border-bottom:
                1px solid
                var(
                    --border,
                    rgba(
                        255,
                        255,
                        255,
                        0.12
                    )
                );
        }


        .empty-index {
            position: absolute;

            top: 14px;
            left: 0;

            color:
                var(
                    --accent,
                    #ffffff
                );

            font-family:
                var(
                    --font-mono,
                    monospace
                );

            font-size: 10px;
        }


        .empty-icon {
            color:
                var(
                    --accent,
                    #ffffff
                );

            font-size: 30px;
        }


        .empty h2 {
            margin: 4px 0 0;

            font-family:
                var(
                    --display-font,
                    "Space Grotesk",
                    sans-serif
                );

            font-size: 24px;

            text-transform:
                uppercase;

            letter-spacing:
                -0.04em;
        }


        .empty p {
            max-width: 360px;

            margin:
                0
                0
                10px;

            color:
                var(
                    --text-muted,
                    #9a9da1
                );

            font-size: 13px;

            line-height: 1.6;
        }


        /* =========================================================
           BUTTON
        ========================================================= */

        .button {
            height: 38px;

            display: inline-flex;

            align-items: center;

            justify-content: center;

            padding:
                0
                18px;

            border:
                1px solid
                var(
                    --accent,
                    #ffffff
                );

            border-radius: 0;

            background:
                var(
                    --accent,
                    #ffffff
                );

            color:
                var(
                    --background,
                    #0d0f11
                );

            font-size: 11px;

            font-weight: 700;

            letter-spacing:
                0.04em;

            text-transform:
                uppercase;

            cursor: pointer;

            transition:
                transform
                0.15s
                var(--ease, ease),

                background
                0.15s
                var(--ease, ease),

                color
                0.15s
                var(--ease, ease);
        }


        .button:hover:not(:disabled) {
            transform:
                translateY(-2px);

            background:
                transparent;

            color:
                var(
                    --text,
                    #f5f5f5
                );
        }


        .button-muted {
            border-color:
                var(
                    --border,
                    rgba(
                        255,
                        255,
                        255,
                        0.12
                    )
                );

            background:
                transparent;

            color:
                var(
                    --text,
                    #f5f5f5
                );
        }


        .button:disabled {
            opacity: 0.5;

            cursor: not-allowed;
        }


        /* =========================================================
           ERROR
        ========================================================= */

        .notice.error.home-error {
            display: flex;

            align-items: center;

            justify-content:
                space-between;

            gap: 16px;

            padding:
                16px
                0;

            border-top:
                1px solid
                rgba(
                    226,
                    104,
                    92,
                    0.4
                );

            border-bottom:
                1px solid
                rgba(
                    226,
                    104,
                    92,
                    0.4
                );

            background:
                transparent;
        }


        .home-error strong {
            display: block;

            color:
                var(
                    --danger,
                    #e2685c
                );

            font-size: 13px;
        }


        .home-error p {
            margin:
                3px
                0
                0;

            color:
                var(
                    --text-muted,
                    #9a9da1
                );

            font-size: 12px;
        }


        /* =========================================================
           SKELETON
        ========================================================= */

        @keyframes shimmer {

            0% {
                background-position:
                    -500px 0;
            }

            100% {
                background-position:
                    500px 0;
            }

        }


        .skeleton,
        .home-skeleton-meta span {
            display: block;

            background:
                linear-gradient(
                    90deg,
                    var(
                        --surface,
                        #15181b
                    ) 25%,
                    var(
                        --surface-raised,
                        #1b1f23
                    ) 37%,
                    var(
                        --surface,
                        #15181b
                    ) 63%
                );

            background-size:
                1000px
                100%;

            animation:
                shimmer
                1.4s
                ease-in-out
                infinite;
        }


        .home-skeleton-grid {
            padding-top: 20px;
        }


        .home-card-skeleton {
            display: flex;

            flex-direction: column;

            gap: 10px;
        }


        .home-card-skeleton .skeleton {
            aspect-ratio:
                16 / 9;
        }


        .home-skeleton-meta {
            display: flex;

            gap: 10px;
        }


        .home-skeleton-meta > span {
            width: 36px;
            height: 36px;

            flex-shrink: 0;

            border-radius: 50%;
        }


        .home-skeleton-meta > div {
            flex: 1;

            display: flex;

            flex-direction: column;

            gap: 6px;
        }


        .home-skeleton-meta > div span {
            height: 9px;
        }


        .home-skeleton-meta > div span:nth-child(1) {
            width: 90%;
        }


        .home-skeleton-meta > div span:nth-child(2) {
            width: 60%;
        }


        .home-skeleton-meta > div span:nth-child(3) {
            width: 40%;
        }


        /* =========================================================
           TABLET
        ========================================================= */

        @media (max-width: 900px) {

            .hero-main {
                grid-template-columns:
                    1fr;
            }


            .hero-side {
                display: none;
            }


            .home-heading h1 {
                font-size:
                    clamp(
                        3.4rem,
                        11vw,
                        7rem
                    );
            }


            .content-heading {
                align-items:
                    flex-start;

                flex-direction:
                    column;
            }


            .content-heading-right {
                width: 100%;

                justify-content:
                    space-between;
            }

        }


        /* =========================================================
           MOBILE
        ========================================================= */

        @media (max-width: 640px) {

            .home-hero {
                padding-top: 6px;
            }


            .hero-main {
                gap: 20px;
            }


            .home-heading h1 {
                font-size:
                    clamp(
                        3rem,
                        15vw,
                        5.5rem
                    );

                letter-spacing:
                    -0.06em;
            }


            .home-heading .lede {
                margin-top: 20px;

                font-size: 13px;
            }


            .hero-bottomline {
                margin-top: 28px;
            }


            .home-stats {
                grid-template-columns:
                    60px
                    1fr
                    1px
                    1fr
                    1px
                    1fr;

                min-height: 105px;
            }


            .stats-label {
                padding-right: 8px;

                font-size: 7px;
            }


            .home-stat {
                padding:
                    14px
                    10px;
            }


            .home-stat-number {
                font-size:
                    1.7rem;
            }


            .home-stat-label {
                font-size: 7px;
            }


            .content-heading {
                padding-top: 44px;
            }


            .content-heading h2 {
                font-size: 2.3rem;
            }


            .content-heading-right {
                align-items:
                    flex-start;

                flex-direction:
                    column;

                gap: 8px;
            }


            .sort-control {
                width: 100%;

                justify-content:
                    space-between;
            }


            .sort-control select {
                flex: 1;

                max-width: 180px;
            }


            .home-page .video-grid {
                grid-template-columns:
                    repeat(
                        2,
                        minmax(
                            0,
                            1fr
                        )
                    );

                gap:
                    22px
                    8px;
            }


            .results-meta {
                font-size: 7px;
            }

        }


        /* =========================================================
           VERY SMALL MOBILE
        ========================================================= */

        @media (max-width: 420px) {

            .home-heading h1 {
                font-size:
                    clamp(
                        2.7rem,
                        16vw,
                        4.8rem
                    );
            }


            .home-stats {
                grid-template-columns:
                    48px
                    1fr
                    1px
                    1fr
                    1px
                    1fr;
            }


            .stats-label {
                font-size: 6px;
            }


            .home-stat {
                padding:
                    12px
                    6px;
            }


            .home-stat-number {
                font-size:
                    1.35rem;
            }


            .home-stat-label {
                font-size: 6px;
            }


            .home-page .video-grid {
                grid-template-columns:
                    1fr;
            }

        }


        /* =========================================================
           REDUCED MOTION
        ========================================================= */

        @media (
            prefers-reduced-motion: reduce
        ) {

            .skeleton,
            .home-skeleton-meta span {
                animation: none;
            }


            .button {
                transition: none;
            }

        }

    `}</style>
);


export default Home;