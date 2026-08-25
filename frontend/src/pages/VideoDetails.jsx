import { useEffect, useState } from "react";

import {
    Link,
    useParams,
} from "react-router-dom";

import {
    getComments,
    getVideo,
} from "../services/api";

import { useAuth } from "../context/AuthContext";

import LikeButton from "../components/LikeButton";
import SubscribeButton from "../components/SubscribeButton";
import CommentSection from "../components/CommentSection";
import Avatar from "../components/Avatar";

const VIEW_UNITS = [
    { value: 1_000_000_000, suffix: "B" },
    { value: 1_000_000, suffix: "M" },
    { value: 1_000, suffix: "K" },
];

const formatViews = (views = 0) => {
    const count = Math.max(
        0,
        Math.round(Number(views) || 0)
    );

    if (count < 1000) {
        return count.toLocaleString();
    }

    for (const unit of VIEW_UNITS) {
        if (count < unit.value) continue;

        const scaled = count / unit.value;
        const decimals = scaled >= 100 ? 0 : 1;
        const formatted = scaled.toFixed(decimals);

        // Rounding can push a value like 999.96K up to "1000.0" at this
        // precision, which reads wrong as "1000K" - bump to the next
        // unit up instead (e.g. 1M) so the math stays correct.
        if (parseFloat(formatted) >= 1000) {
            const biggerUnit = VIEW_UNITS.find(
                (candidate) =>
                    candidate.value ===
                    unit.value * 1000
            );

            if (biggerUnit) {
                return `1${biggerUnit.suffix}`;
            }
        }

        return `${formatted.replace(
            /\.0$/,
            ""
        )}${unit.suffix}`;
    }

    return count.toLocaleString();
};

const formatDate = (date) => {
    if (!date) return "";

    try {
        return new Date(date).toLocaleDateString(
            undefined,
            {
                year: "numeric",
                month: "long",
                day: "numeric",
            }
        );
    } catch {
        return "";
    }
};

const VideoDetailsStyles = () => (
    <style>{`
        .watch-layout {
            display: flex;
            flex-direction: column;
            color: var(--text, #f1efe9);
        }

        .watch-main {
            display: flex;
            flex-direction: column;
            gap: 20px;
            max-width: 900px;
            width: 100%;
            margin: 0 auto;
        }

        .player,
        .watch-player {
            width: 100%;
            aspect-ratio: 16 / 9;
            background: #000;
            border-radius: var(--radius-lg, 16px);
            overflow: hidden;
        }

        .watch-player video {
            width: 100%;
            height: 100%;
            display: block;
            background: #000;
        }

        .watch-heading {
            display: flex;
            align-items: flex-start;
            justify-content: space-between;
            gap: 16px;
            flex-wrap: wrap;
        }

        .watch-title-block .eyebrow {
            text-transform: uppercase;
            letter-spacing: 0.08em;
            font-size: 0.72rem;
            color: var(--accent, #cf9d56);
            margin: 0 0 6px;
            font-weight: 600;
        }

        .watch-title-block h1 {
            margin: 0 0 8px;
            font-size: 1.35rem;
            line-height: 1.3;
        }

        .watch-stats {
            display: flex;
            align-items: center;
            gap: 8px;
            color: var(--text-muted, #9a9ba6);
            font-size: 0.85rem;
        }

        .meta-dot {
            opacity: 0.6;
        }

        .watch-actions {
            display: flex;
            align-items: center;
            gap: 10px;
            flex-shrink: 0;
        }

        .creator-card {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 16px;
            padding: 14px 16px;
            background: var(--surface, #1b1d24);
            border: 1px solid var(--border, rgba(255, 255, 255, 0.08));
            border-radius: var(--radius-md, 12px);
            flex-wrap: wrap;
        }

        .creator-info {
            display: flex;
            align-items: center;
            gap: 12px;
            text-decoration: none;
            color: inherit;
        }

        .creator-info strong {
            display: block;
            font-size: 0.95rem;
            color: var(--text, #f1efe9);
        }

        .creator-info span {
            display: block;
            font-size: 0.8rem;
            color: var(--text-muted, #9a9ba6);
        }

        .creator-channel-link {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            font-size: 0.82rem;
            font-weight: 600;
            color: var(--accent, #cf9d56);
            text-decoration: none;
        }

        .creator-channel-link:hover {
            text-decoration: underline;
        }

        .video-description {
            background: var(--surface, #1b1d24);
            border: 1px solid var(--border, rgba(255, 255, 255, 0.08));
            border-radius: var(--radius-md, 12px);
            padding: 16px;
            display: flex;
            flex-direction: column;
            gap: 8px;
        }

        .description-heading {
            display: flex;
            align-items: baseline;
            justify-content: space-between;
        }

        .description-heading h2 {
            margin: 0;
            font-size: 0.95rem;
        }

        .description-heading span {
            font-size: 0.72rem;
            color: var(--text-muted, #9a9ba6);
        }

        .video-description p {
            margin: 0;
            color: var(--text-muted, #9a9ba6);
            font-size: 0.88rem;
            line-height: 1.6;
            white-space: pre-wrap;
        }

        .center-state {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 10px;
            min-height: 360px;
            text-align: center;
            padding: 24px;
        }

        .video-error-state h2 {
            margin: 0;
            font-size: 1.1rem;
            color: var(--text, #f1efe9);
        }

        .video-error-icon {
            width: 44px;
            height: 44px;
            border-radius: 50%;
            background: rgba(226, 104, 92, 0.14);
            color: var(--danger, #e2685c);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.2rem;
            font-weight: 700;
        }

        .muted {
            color: var(--text-muted, #9a9ba6);
            font-size: 0.85rem;
        }

        .button {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            border: 1px solid transparent;
            border-radius: var(--radius-sm, 8px);
            padding: 9px 18px;
            font: inherit;
            font-weight: 600;
            font-size: 0.85rem;
            cursor: pointer;
            background: var(--accent, #cf9d56);
            color: var(--ink, #14151a);
            text-decoration: none;
            transition: opacity 0.2s var(--ease, cubic-bezier(0.4, 0, 0.2, 1));
        }

        .button:hover {
            opacity: 0.9;
        }

        /* ───────────────── SKELETON ───────────────── */

        .watch-player-skeleton {
            width: 100%;
            aspect-ratio: 16 / 9;
            border-radius: var(--radius-lg, 16px);
            overflow: hidden;
            background: var(--surface, #1b1d24);
        }

        .skeleton,
        .watch-heading-skeleton span,
        .creator-skeleton span,
        .creator-skeleton div span,
        .description-skeleton span {
            display: block;
            background: linear-gradient(
                90deg,
                var(--surface, #1b1d24) 25%,
                var(--surface-raised, #23252e) 50%,
                var(--surface, #1b1d24) 75%
            );
            background-size: 200% 100%;
            animation: watch-shimmer 1.4s ease infinite;
            border-radius: var(--radius-sm, 8px);
        }

        .skeleton {
            width: 100%;
            height: 100%;
            border-radius: var(--radius-lg, 16px);
        }

        @keyframes watch-shimmer {
            0% { background-position: 200% 0; }
            100% { background-position: -200% 0; }
        }

        .watch-heading-skeleton {
            display: flex;
            flex-direction: column;
            gap: 10px;
        }

        .watch-heading-skeleton span:nth-child(1) {
            width: 70%;
            height: 22px;
        }

        .watch-heading-skeleton span:nth-child(2) {
            width: 40%;
            height: 14px;
        }

        .watch-heading-skeleton span:nth-child(3) {
            width: 90px;
            height: 32px;
            border-radius: 999px;
        }

        .creator-skeleton {
            display: flex;
            align-items: center;
            gap: 12px;
        }

        .creator-skeleton > span {
            width: 44px;
            height: 44px;
            border-radius: 50%;
            flex-shrink: 0;
        }

        .creator-skeleton div {
            display: flex;
            flex-direction: column;
            gap: 6px;
            flex: 1;
        }

        .creator-skeleton div span:nth-child(1) {
            width: 140px;
            height: 14px;
        }

        .creator-skeleton div span:nth-child(2) {
            width: 90px;
            height: 12px;
        }

        .description-skeleton {
            display: flex;
            flex-direction: column;
            gap: 8px;
        }

        .description-skeleton span {
            height: 12px;
            width: 100%;
        }

        .description-skeleton span:last-child {
            width: 60%;
        }
    `}</style>
);

const VideoSkeleton = () => {
    return (
        <main className="watch-layout">
            <VideoDetailsStyles />

            <section className="watch-main">
                <div
                    role="status"
                    aria-label="Loading video"
                >
                    <div className="watch-player-skeleton">
                        <div
                            className="skeleton"
                            aria-hidden="true"
                        />
                    </div>

                    <div
                        className="watch-heading-skeleton"
                        aria-hidden="true"
                    >
                        <span />
                        <span />
                        <span />
                    </div>

                    <div
                        className="creator-skeleton"
                        aria-hidden="true"
                    >
                        <span />
                        <div>
                            <span />
                            <span />
                        </div>
                    </div>

                    <div
                        className="description-skeleton"
                        aria-hidden="true"
                    >
                        <span />
                        <span />
                        <span />
                        <span />
                    </div>
                </div>
            </section>
        </main>
    );
};

const VideoDetails = () => {
    const { videoId } = useParams();
    const { user } = useAuth();

    const [video, setVideo] = useState(null);
    const [comments, setComments] = useState([]);
    const [error, setError] = useState("");

    useEffect(() => {
        let mounted = true;

        const load = async () => {
            try {
                setError("");
                setVideo(null);
                setComments([]);

                const [
                    videoResponse,
                    commentsResponse,
                ] = await Promise.all([
                    getVideo(videoId),

                    user
                        ? getComments(videoId)
                        : Promise.resolve({
                              data: {
                                  data: [],
                              },
                          }),
                ]);

                if (!mounted) return;

                setVideo(
                    videoResponse.data.data
                );

                setComments(
                    commentsResponse.data.data || []
                );
            } catch (requestError) {
                if (!mounted) return;

                setError(
                    requestError?.response?.data
                        ?.message ||
                        "Unable to load this video."
                );
            }
        };

        if (videoId) load();

        return () => {
            mounted = false;
        };
    }, [videoId, user]);

    if (error) {
        return (
            <div className="center-state video-error-state">
                <VideoDetailsStyles />

                <div
                    className="video-error-icon"
                    aria-hidden="true"
                >
                    !
                </div>

                <h2>
                    We couldn't load this video
                </h2>

                <p className="muted">
                    {error}
                </p>

                <Link
                    className="button"
                    to="/"
                >
                    Back to home
                </Link>
            </div>
        );
    }

    if (!video) {
        return <VideoSkeleton />;
    }

    const owner = video.owner;

    const ownerName =
        owner?.fullName ||
        owner?.username ||
        "Creator";

    const ownerUsername =
        owner?.username || "creator";

    const views = video.views || 0;

    const publishedDate = formatDate(
        video.createdAt
    );

    return (
        <main className="watch-layout">
            <VideoDetailsStyles />

            <section className="watch-main">
                {/* ───────────────── VIDEO PLAYER ───────────────── */}
                <div className="player watch-player">
                    <video
                        controls
                        playsInline
                        preload="metadata"
                        poster={video.thumbnail}
                        src={video.videoFile}
                    >
                        Your browser does not support
                        video playback.
                    </video>
                </div>

                {/* ───────────────── VIDEO HEADER ───────────────── */}
                <header className="watch-heading">
                    <div className="watch-title-block">
                        <p className="eyebrow">
                            Now watching
                        </p>

                        <h1>{video.title}</h1>

                        <div className="watch-stats">
                            <span>
                                {formatViews(views)}{" "}
                                {views === 1
                                    ? "view"
                                    : "views"}
                            </span>

                            {publishedDate && (
                                <>
                                    <span
                                        className="meta-dot"
                                        aria-hidden="true"
                                    >
                                        •
                                    </span>

                                    <span>
                                        {publishedDate}
                                    </span>
                                </>
                            )}
                        </div>
                    </div>

                    <div className="watch-actions">
                        {/*
                          key forces a fresh mount when navigating between
                          videos so LikeButton's internal state (seeded
                          from initialLiked) can't leak the previous
                          video's like state into this one.
                        */}
                        <LikeButton
                            key={`like-${videoId}`}
                            videoId={videoId}
                            initialLiked={
                                video.isLiked
                            }
                        />

                        {owner?._id && (
                            <SubscribeButton
                                key={`subscribe-${owner._id}`}
                                channelId={
                                    owner._id
                                }
                                initialSubscribed={
                                    owner.isSubscribed
                                }
                            />
                        )}
                    </div>
                </header>

                {/* ───────────────── CREATOR ───────────────── */}
                <section className="creator-card">
                    <Link
                        className="creator-info"
                        to={`/channel/${ownerUsername}`}
                    >
                        <Avatar
                            user={owner}
                            size="medium"
                        />

                        <div>
                            <strong>
                                {ownerName}
                            </strong>

                            <span>
                                @{ownerUsername}
                            </span>
                        </div>
                    </Link>

                    <Link
                        className="creator-channel-link"
                        to={`/channel/${ownerUsername}`}
                    >
                        View channel
                        <span aria-hidden="true">→</span>
                    </Link>
                </section>

                {/* ───────────────── DESCRIPTION ───────────────── */}
                <section className="video-description">
                    <div className="description-heading">
                        <h2>
                            About this video
                        </h2>

                        <span>
                            {video.description
                                ?.length || 0}{" "}
                            characters
                        </span>
                    </div>

                    <p>
                        {video.description ||
                            "The creator hasn't added a description yet."}
                    </p>
                </section>

                {/* ───────────────── COMMENTS ───────────────── */}
                <CommentSection
                    videoId={videoId}
                    comments={comments}
                    setComments={setComments}
                />
            </section>
        </main>
    );
};

export default VideoDetails;