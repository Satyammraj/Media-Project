import { Link } from "react-router-dom";

import Avatar from "./Avatar";

const formatDuration = (seconds) => {
    if (!seconds || seconds < 0) {
        return null;
    }

    const totalSeconds = Math.floor(seconds);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const remainingSeconds = totalSeconds % 60;

    if (hours > 0) {
        return `${hours}:${String(minutes).padStart(
            2,
            "0"
        )}:${String(remainingSeconds).padStart(2, "0")}`;
    }

    return `${minutes}:${String(remainingSeconds).padStart(
        2,
        "0"
    )}`;
};

const formatDate = (date) => {
    if (!date) return "";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
        return "";
    }

    return parsedDate.toLocaleDateString(undefined, {
        day: "numeric",
        month: "short",
        year: "numeric",
    });
};

const VideoCard = ({ video }) => {
    if (!video) return null;

    const title = video.title || "Untitled video";
    const creator =
        video.owner?.username ||
        video.owner?.fullName ||
        "Creator";

    const duration = formatDuration(video.duration);
    const date = formatDate(video.createdAt);

    return (
        <Link
            className="video-card"
            to={`/watch/${video._id}`}
            aria-label={`Watch ${title}`}
        >
            <VideoCardStyles />

            <div className="thumbnail-wrap">
                {video.thumbnail ? (
                    <img
                        src={video.thumbnail}
                        alt={`${title} thumbnail`}
                        loading="lazy"
                    />
                ) : (
                    <div
                        className="thumbnail-placeholder"
                        aria-hidden="true"
                    >
                        <span>▶</span>
                    </div>
                )}

                {duration && (
                    <span className="play-pill">
                        {duration}
                    </span>
                )}

                <span className="thumbnail-overlay">
                    <span className="play-icon">
                        ▶
                    </span>
                </span>
            </div>

            <div className="video-meta">
                <Avatar
                    user={video.owner}
                    size="small"
                />

                <div className="video-info">
                    <h3 title={title}>
                        {title}
                    </h3>

                    <p>{creator}</p>

                    <span className="watch-stats">
                        {(video.views || 0).toLocaleString()}{" "}
                        {video.views === 1
                            ? "view"
                            : "views"}

                        {date && (
                            <>
                                <span className="meta-dot">
                                    •
                                </span>
                                {date}
                            </>
                        )}
                    </span>
                </div>
            </div>
        </Link>
    );
};

/* =================================================================
   STYLES — matches the AppShell / Avatar "editing studio" theme.
   Reads the same --accent / --surface variables set at :root by
   AppShell, with inline fallbacks so this still looks right if
   VideoCard is ever rendered without AppShell mounted.
   ================================================================= */

const VideoCardStyles = () => (
    <style>{`
        .video-card {
            display: flex;
            flex-direction: column;
            gap: 12px;
            border-radius: var(--radius-md, 12px);
            padding: 8px;
            transition: background 0.15s var(--ease, ease);
        }

        .video-card:hover {
            background: var(--surface-raised, #23252e);
        }

        .thumbnail-wrap {
            position: relative;
            aspect-ratio: 16 / 9;
            border-radius: var(--radius-sm, 8px);
            overflow: hidden;
            background: var(--surface, #1b1d24);
        }

        .thumbnail-wrap img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            display: block;
            transition: transform 0.25s var(--ease, ease);
        }

        .video-card:hover .thumbnail-wrap img {
            transform: scale(1.03);
        }

        .thumbnail-placeholder {
            width: 100%;
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            background: linear-gradient(
                155deg,
                var(--surface-raised, #23252e),
                var(--surface, #1b1d24)
            );
            color: var(--text-muted, #9a9ba6);
            font-size: 22px;
        }

        .play-pill {
            position: absolute;
            bottom: 8px;
            right: 8px;
            background: rgba(0, 0, 0, 0.78);
            color: #fff;
            font-size: 11.5px;
            font-weight: 600;
            padding: 2px 6px;
            border-radius: 4px;
            letter-spacing: 0.02em;
        }

        .thumbnail-overlay {
            position: absolute;
            inset: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            background: rgba(20, 21, 26, 0.35);
            opacity: 0;
            transition: opacity 0.15s var(--ease, ease);
        }

        .video-card:hover .thumbnail-overlay {
            opacity: 1;
        }

        .play-icon {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: 44px;
            height: 44px;
            border-radius: 50%;
            background: var(--accent, #cf9d56);
            color: #14151a;
            font-size: 15px;
            padding-left: 2px;
        }

        .video-meta {
            display: flex;
            gap: 10px;
            align-items: flex-start;
        }

        .video-info {
            min-width: 0;
        }

        .video-info h3 {
            margin: 0 0 3px;
            font-size: 14px;
            font-weight: 600;
            color: var(--text, #f1efe9);
            line-height: 1.35;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
        }

        .video-info p {
            margin: 0 0 3px;
            font-size: 12.5px;
            color: var(--text-muted, #9a9ba6);
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }

        .watch-stats {
            font-size: 12px;
            color: var(--text-muted, #9a9ba6);
        }

        .meta-dot {
            margin: 0 5px;
        }

        @media (prefers-reduced-motion: reduce) {
            .video-card,
            .thumbnail-wrap img,
            .thumbnail-overlay {
                transition: none;
            }
        }
    `}</style>
);

export default VideoCard;