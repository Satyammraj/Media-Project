import { Link } from "react-router-dom";

import Avatar from "./Avatar";


const formatDuration = (seconds) => {
    if (!seconds || seconds < 0) {
        return null;
    }

    const totalSeconds = Math.floor(seconds);

    const hours = Math.floor(
        totalSeconds / 3600
    );

    const minutes = Math.floor(
        (totalSeconds % 3600) / 60
    );

    const remainingSeconds =
        totalSeconds % 60;


    if (hours > 0) {
        return `${hours}:${String(
            minutes
        ).padStart(2, "0")}:${String(
            remainingSeconds
        ).padStart(2, "0")}`;
    }


    return `${minutes}:${String(
        remainingSeconds
    ).padStart(2, "0")}`;
};


const formatDate = (date) => {
    if (!date) return "";

    const parsedDate = new Date(date);

    if (
        Number.isNaN(
            parsedDate.getTime()
        )
    ) {
        return "";
    }


    return parsedDate.toLocaleDateString(
        undefined,
        {
            day: "numeric",
            month: "short",
            year: "numeric",
        }
    );
};


const VideoCard = ({ video, index }) => {
    if (!video) return null;


    const title =
        video.title ||
        "Untitled video";


    const creator =
        video.owner?.username ||
        video.owner?.fullName ||
        "Creator";


    const duration =
        formatDuration(
            video.duration
        );


    const date =
        formatDate(
            video.createdAt
        );


    /*
     * Use the supplied index when VideoCard
     * is rendered from a grid.
     *
     * Falls back to 0 so existing usages
     * of <VideoCard video={video} /> don't break.
     */
    const cardNumber =
        typeof index === "number"
            ? String(index + 1).padStart(
                  2,
                  "0"
              )
            : null;


    return (
        <Link
            className="video-card"
            to={`/watch/${video._id}`}
            aria-label={`Watch ${title}`}
        >

            <VideoCardStyles />


            {/* =================================================
                THUMBNAIL
            ================================================= */}

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


                {/* Editorial number */}

                {cardNumber && (
                    <span
                        className="video-card-number"
                        aria-hidden="true"
                    >
                        {cardNumber}
                    </span>
                )}


                {/* Duration */}

                {duration && (
                    <span className="play-pill">
                        {duration}
                    </span>
                )}


                {/* Hover overlay */}

                <span className="thumbnail-overlay">

                    <span className="play-icon">
                        ▶
                    </span>

                </span>

            </div>


            {/* =================================================
                VIDEO META
            ================================================= */}

            <div className="video-meta">

                <Avatar
                    user={video.owner}
                    size="small"
                />


                <div className="video-info">

                    <h3 title={title}>
                        {title}
                    </h3>


                    <p>
                        {creator}
                    </p>


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


/* =============================================================
   STYLES
   ============================================================= */

const VideoCardStyles = () => (
    <style>{`

        /* =====================================================
           CARD
        ===================================================== */

        .video-card {
            position: relative;

            display: flex;

            flex-direction: column;

            gap: 12px;

            border-radius:
                var(
                    --radius-md,
                    12px
                );

            padding: 8px;

            color: inherit;

            text-decoration: none;

            transition:
                background
                0.15s
                var(--ease, ease),

                transform
                0.2s
                var(--ease, ease);
        }


        .video-card:hover {
            background:
                var(
                    --surface-raised,
                    #23252e
                );

            transform:
                translateY(-2px);
        }


        /* =====================================================
           THUMBNAIL
        ===================================================== */

        .thumbnail-wrap {
            position: relative;

            aspect-ratio:
                16 / 9;

            border-radius:
                var(
                    --radius-sm,
                    8px
                );

            overflow: hidden;

            background:
                var(
                    --surface,
                    #1b1d24
                );

            isolation: isolate;
        }


        .thumbnail-wrap img {
            width: 100%;
            height: 100%;

            display: block;

            object-fit: cover;

            transition:
                transform
                0.25s
                var(--ease, ease);
        }


        .video-card:hover
        .thumbnail-wrap img {
            transform:
                scale(1.035);
        }


        /* =====================================================
           PLACEHOLDER
        ===================================================== */

        .thumbnail-placeholder {
            width: 100%;
            height: 100%;

            display: flex;

            align-items: center;
            justify-content: center;

            background:
                linear-gradient(
                    155deg,
                    var(
                        --surface-raised,
                        #23252e
                    ),
                    var(
                        --surface,
                        #1b1d24
                    )
                );

            color:
                var(
                    --text-muted,
                    #9a9ba6
                );

            font-size: 22px;
        }


        /* =====================================================
           EDITORIAL NUMBER
        ===================================================== */

        .video-card-number {
            position: absolute;

            top: 10px;
            left: 10px;

            z-index: 3;

            min-width: 34px;
            height: 25px;

            display: inline-flex;

            align-items: center;
            justify-content: center;

            padding:
                0
                7px;

            border:
                1px solid
                rgba(
                    255,
                    255,
                    255,
                    0.16
                );

            border-radius: 5px;

            background:
                rgba(
                    20,
                    21,
                    26,
                    0.82
                );

            color:
                var(
                    --accent,
                    #cf9d56
                );

            backdrop-filter:
                blur(8px);

            -webkit-backdrop-filter:
                blur(8px);

            font-family:
                "DM Mono",
                "Courier New",
                monospace;

            font-size: 9px;

            font-weight: 700;

            letter-spacing:
                0.08em;

            opacity: 0.92;

            transform:
                rotate(-2deg);

            transition:
                transform
                0.2s
                var(--ease, ease),

                background
                0.2s
                var(--ease, ease);
        }


        .video-card:hover
        .video-card-number {
            background:
                var(
                    --accent,
                    #cf9d56
                );

            color:
                var(
                    --ink,
                    #14151a
                );

            transform:
                rotate(0deg)
                translateY(-1px);
        }


        /* =====================================================
           DURATION
        ===================================================== */

        .play-pill {
            position: absolute;

            bottom: 8px;
            right: 8px;

            z-index: 3;

            background:
                rgba(
                    0,
                    0,
                    0,
                    0.78
                );

            color: #fff;

            font-size: 11.5px;

            font-weight: 600;

            padding:
                2px
                6px;

            border-radius: 4px;

            letter-spacing:
                0.02em;
        }


        /* =====================================================
           HOVER OVERLAY
        ===================================================== */

        .thumbnail-overlay {
            position: absolute;

            inset: 0;

            z-index: 2;

            display: flex;

            align-items: center;
            justify-content: center;

            background:
                rgba(
                    20,
                    21,
                    26,
                    0.35
                );

            opacity: 0;

            transition:
                opacity
                0.15s
                var(--ease, ease);
        }


        .video-card:hover
        .thumbnail-overlay {
            opacity: 1;
        }


        .play-icon {
            display: inline-flex;

            align-items: center;
            justify-content: center;

            width: 44px;
            height: 44px;

            border-radius: 50%;

            background:
                var(
                    --accent,
                    #cf9d56
                );

            color:
                #14151a;

            font-size: 15px;

            padding-left: 2px;

            box-shadow:
                0 8px 24px
                rgba(
                    0,
                    0,
                    0,
                    0.28
                );

            transform:
                scale(0.9);

            transition:
                transform
                0.2s
                var(--ease, ease);
        }


        .video-card:hover
        .play-icon {
            transform:
                scale(1);
        }


        /* =====================================================
           VIDEO META
        ===================================================== */

        .video-meta {
            display: flex;

            gap: 10px;

            align-items:
                flex-start;
        }


        .video-info {
            min-width: 0;
        }


        .video-info h3 {
            margin:
                0
                0
                3px;

            color:
                var(
                    --text,
                    #f1efe9
                );

            font-size: 14px;

            font-weight: 600;

            line-height: 1.35;

            display:
                -webkit-box;

            -webkit-line-clamp: 2;

            -webkit-box-orient:
                vertical;

            overflow: hidden;
        }


        .video-info p {
            margin:
                0
                0
                3px;

            color:
                var(
                    --text-muted,
                    #9a9ba6
                );

            font-size: 12.5px;

            overflow: hidden;

            text-overflow: ellipsis;

            white-space: nowrap;
        }


        .watch-stats {
            color:
                var(
                    --text-muted,
                    #9a9ba6
                );

            font-size: 12px;
        }


        .meta-dot {
            margin:
                0
                5px;
        }


        /* =====================================================
           REDUCED MOTION
        ===================================================== */

        @media (
            prefers-reduced-motion: reduce
        ) {

            .video-card,
            .thumbnail-wrap img,
            .thumbnail-overlay,
            .play-icon,
            .video-card-number {
                transition: none;
            }

        }

    `}</style>
);


export default VideoCard;