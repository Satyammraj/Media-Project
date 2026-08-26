import { useEffect, useState } from "react";

import { Link, useParams } from "react-router-dom";

import {
    getChannelProfile,
    getVideos,
} from "../services/api";

import { useAuth } from "../context/AuthContext";

import Avatar from "../components/Avatar";
import SubscribeButton from "../components/SubscribeButton";
import VideoCard from "../components/VideoCard";
import Accordion from "../components/Accordion";


const formatSubscribers = (count = 0) => {
    if (count < 1000) {
        return count.toLocaleString();
    }

    if (count < 1000000) {
        return `${(count / 1000)
            .toFixed(count >= 10000 ? 0 : 1)
            .replace(/\.0$/, "")}K`;
    }

    if (count < 1000000000) {
        return `${(count / 1000000)
            .toFixed(count >= 10000000 ? 0 : 1)
            .replace(/\.0$/, "")}M`;
    }

    return `${(count / 1000000000)
        .toFixed(1)
        .replace(/\.0$/, "")}B`;
};


/* =============================================================
   SKELETON
   ============================================================= */

const ChannelSkeleton = () => {
    return (
        <div className="page-content channel-page">
            <ChannelStyles />

            <div className="channel-cover channel-cover-skeleton" />

            <section className="channel-identity channel-identity-skeleton">
                <div className="channel-avatar-skeleton" />

                <div className="channel-skeleton-info">
                    <span />
                    <span />
                    <span />
                    <span />
                </div>

                <div className="channel-button-skeleton" />
            </section>

            <div className="channel-accordion-skeleton">
                <span />
                <span />
                <span />
            </div>

            <div className="tabs tabs-skeleton">
                <span />
                <span />
            </div>

            <div className="skeleton-grid">
                {Array.from({ length: 8 }).map(
                    (_, index) => (
                        <div
                            className="channel-video-skeleton"
                            key={index}
                        >
                            <div className="skeleton" />

                            <div className="channel-video-lines">
                                <span />
                                <span />
                                <span />
                            </div>
                        </div>
                    )
                )}
            </div>
        </div>
    );
};


/* =============================================================
   CHANNEL
   ============================================================= */

const Channel = () => {
    const { username } = useParams();

    const { user } = useAuth();

    const [channel, setChannel] =
        useState(null);

    const [videos, setVideos] =
        useState([]);

    const [error, setError] =
        useState("");


    /* =========================================================
       LOAD CHANNEL
       ========================================================= */

    useEffect(() => {
        let mounted = true;


        const load = async () => {
            try {
                setError("");

                setChannel(null);

                setVideos([]);


                const profile =
                    await getChannelProfile(
                        username
                    );


                const channelData =
                    profile.data.data;


                const videoResponse =
                    await getVideos({
                        userId:
                            channelData._id,

                        limit: 20,
                    });


                if (!mounted) {
                    return;
                }


                setChannel(
                    channelData
                );


                setVideos(
                    videoResponse
                        .data
                        .data || []
                );

            } catch (requestError) {
                if (!mounted) {
                    return;
                }


                setError(
                    requestError
                        ?.response
                        ?.data
                        ?.message ||
                    "Unable to load this channel."
                );
            }
        };


        if (username) {
            load();
        }


        return () => {
            mounted = false;
        };
    }, [username]);


    /* =========================================================
       SUBSCRIBE STATE
       ========================================================= */

    const handleSubscribeChange =
        (nextSubscribed) => {
            setChannel((prev) => {
                if (
                    !prev ||
                    prev.isSubscribed ===
                        nextSubscribed
                ) {
                    return prev;
                }


                const delta =
                    nextSubscribed
                        ? 1
                        : -1;


                return {
                    ...prev,

                    isSubscribed:
                        nextSubscribed,

                    subscribersCount:
                        Math.max(
                            0,
                            (prev.subscribersCount ||
                                0) + delta
                        ),
                };
            });
        };


    /* =========================================================
       ERROR
       ========================================================= */

    if (error) {
        return (
            <div className="center-state channel-error-state">

                <ChannelStyles />

                <div className="channel-error-icon">
                    !
                </div>


                <h2>
                    Channel unavailable
                </h2>


                <p className="muted">
                    {error}
                </p>


                <Link
                    className="button"
                    to="/"
                >
                    Back to browse
                </Link>

            </div>
        );
    }


    /* =========================================================
       LOADING
       ========================================================= */

    if (!channel) {
        return <ChannelSkeleton />;
    }


    /* =========================================================
       CHANNEL DATA
       ========================================================= */

    const channelName =
        channel.fullName ||
        channel.username ||
        "Creator";


    const subscribers =
        channel.subscribersCount ||
        0;


    const isOwnChannel =
        Boolean(user?._id) &&
        user._id === channel._id;


    return (
        <div className="page-content channel-page">

            <ChannelStyles />


            {/* =================================================
                COVER
            ================================================= */}

            <div
                className={`channel-cover ${
                    channel.coverImage
                        ? "has-cover"
                        : "no-cover"
                }`}
                style={
                    channel.coverImage
                        ? {
                              backgroundImage:
                                  `url("${channel.coverImage}")`,
                          }
                        : undefined
                }
            >

                <div className="channel-cover-overlay" />


                <div className="channel-cover-content">

                    <span>
                        {videos.length}{" "}

                        {videos.length === 1
                            ? "video"
                            : "videos"}
                    </span>

                </div>

            </div>


            {/* =================================================
                CHANNEL IDENTITY
            ================================================= */}

            <section className="channel-identity">

                <div className="channel-avatar-wrap">

                    <Avatar
                        user={channel}
                        size="large"
                    />


                    <span
                        className="channel-status-dot"
                        aria-hidden="true"
                    />

                </div>


                <div className="channel-info">

                    <p className="eyebrow">
                        Creator channel
                    </p>


                    <h1>
                        {channelName}
                    </h1>


                    <p className="channel-handle">
                        @{channel.username}
                    </p>


                    <div className="channel-stats">

                        <span>
                            <strong>
                                {formatSubscribers(
                                    subscribers
                                )}
                            </strong>{" "}
                            subscribers
                        </span>


                        <span className="meta-dot">
                            •
                        </span>


                        <span>
                            <strong>
                                {videos.length}
                            </strong>{" "}

                            {videos.length === 1
                                ? "video"
                                : "videos"}
                        </span>

                    </div>


                    <p className="channel-description">
                        {channel.description ||
                            "Sharing thoughtful work, one upload at a time."}
                    </p>

                </div>


                <div className="channel-actions">

                    {isOwnChannel ? (

                        <Link
                            className="button button-muted"
                            to="/settings"
                        >
                            Manage channel
                        </Link>

                    ) : (

                        <SubscribeButton
                            channelId={
                                channel._id
                            }

                            initialSubscribed={
                                channel.isSubscribed
                            }

                            onChange={
                                handleSubscribeChange
                            }
                        />

                    )}

                </div>

            </section>


            {/* =================================================
                CHANNEL ACCORDIONS
            ================================================= */}

            <section
                className="channel-details"
                aria-label="Channel details"
            >

                <div className="channel-details-heading">

                    <div>

                        <p className="eyebrow">
                            More from this channel
                        </p>

                        <h2>
                            Channel details
                        </h2>

                    </div>


                    <span className="channel-details-count">
                        03
                    </span>

                </div>


                <div className="channel-accordions">

                    {/* =================================================
                        01 — ABOUT
                    ================================================= */}

                    <Accordion
                        number="01"
                        eyebrow="Creator"
                        title="About this creator"
                        defaultOpen={true}
                    >

                        <p>
                            {channel.description ||
                                "This creator hasn't added a channel description yet."}
                        </p>


                        <div className="accordion-meta-grid">

                            <div>
                                <span>
                                    Username
                                </span>

                                <strong>
                                    @{channel.username}
                                </strong>
                            </div>


                            <div>
                                <span>
                                    Subscribers
                                </span>

                                <strong>
                                    {formatSubscribers(
                                        subscribers
                                    )}
                                </strong>
                            </div>


                            <div>
                                <span>
                                    Published
                                </span>

                                <strong>
                                    {videos.length}{" "}
                                    {videos.length === 1
                                        ? "video"
                                        : "videos"}
                                </strong>
                            </div>

                        </div>

                    </Accordion>


                    {/* =================================================
                        02 — CHANNEL INFORMATION
                    ================================================= */}

                    <Accordion
                        number="02"
                        eyebrow="Details"
                        title="Channel information"
                    >

                        <div className="accordion-info-list">

                            <div className="accordion-info-row">

                                <span>
                                    Channel name
                                </span>

                                <strong>
                                    {channelName}
                                </strong>

                            </div>


                            <div className="accordion-info-row">

                                <span>
                                    Handle
                                </span>

                                <strong>
                                    @{channel.username}
                                </strong>

                            </div>


                            <div className="accordion-info-row">

                                <span>
                                    Subscribers
                                </span>

                                <strong>
                                    {formatSubscribers(
                                        subscribers
                                    )}
                                </strong>

                            </div>


                            <div className="accordion-info-row">

                                <span>
                                    Videos
                                </span>

                                <strong>
                                    {videos.length}
                                </strong>

                            </div>

                        </div>

                    </Accordion>


                    {/* =================================================
                        03 — ACTIVITY
                    ================================================= */}

                    <Accordion
                        number="03"
                        eyebrow="Activity"
                        title="Recent activity"
                    >

                        {videos.length > 0 ? (

                            <div className="accordion-activity">

                                <div className="activity-status-dot" />

                                <div>

                                    <strong>
                                        Active creator
                                    </strong>

                                    <p>
                                        This channel currently
                                        has {videos.length}{" "}
                                        published{" "}
                                        {videos.length === 1
                                            ? "video"
                                            : "videos"}.
                                    </p>

                                </div>

                            </div>

                        ) : (

                            <p>
                                This creator hasn't
                                published any videos yet.
                            </p>

                        )}

                    </Accordion>

                </div>

            </section>


            {/* =================================================
                TABS
            ================================================= */}

            <div
                className="tabs channel-tabs"
                role="tablist"
                aria-label="Channel sections"
            >

                <button
                    className="tab-active"
                    type="button"
                    role="tab"
                    aria-selected="true"
                >
                    Videos
                </button>


                <button
                    className="channel-tab-disabled"
                    type="button"
                    role="tab"
                    aria-selected="false"
                    disabled
                >
                    Playlists
                </button>

            </div>


            {/* =================================================
                VIDEOS
            ================================================= */}

            <section className="channel-videos">

                <div className="section-heading">

                    <div>

                        <h2>
                            Latest uploads
                        </h2>


                        <span>
                            {videos.length}{" "}

                            {videos.length === 1
                                ? "video"
                                : "videos"}
                        </span>

                    </div>

                </div>


                {videos.length === 0 ? (

                    <div className="empty channel-empty">

                        <div className="empty-icon">
                            ◌
                        </div>


                        <h3>
                            No videos yet
                        </h3>


                        <p>
                            This creator hasn't
                            published anything yet.
                        </p>

                    </div>

                ) : (

                    <div className="video-grid">

                        {videos.map(
                            (video) => (
                                <VideoCard
                                    key={
                                        video._id
                                    }
                                    video={
                                        video
                                    }
                                />
                            )
                        )}

                    </div>

                )}

            </section>

        </div>
    );
};


/* =============================================================
   STYLES
   ============================================================= */

const ChannelStyles = () => (
    <style>{`

        /* =====================================================
           PAGE
        ===================================================== */

        .page-content {
            max-width: 1200px;

            margin: 0 auto;
        }


        /* =====================================================
           COVER
        ===================================================== */

        .channel-cover {
            position: relative;

            height: 200px;

            border-radius:
                var(
                    --radius-lg,
                    16px
                );

            overflow: hidden;

            background-size: cover;

            background-position: center;
        }


        .channel-cover.no-cover {
            background:
                linear-gradient(
                    135deg,
                    var(
                        --surface-raised,
                        #23252e
                    ),
                    var(
                        --surface,
                        #1b1d24
                    )
                );
        }


        .channel-cover-overlay {
            position: absolute;

            inset: 0;

            background:
                linear-gradient(
                    to top,
                    rgba(
                        20,
                        21,
                        26,
                        0.75
                    ),
                    transparent 55%
                );
        }


        .channel-cover-content {
            position: absolute;

            bottom: 14px;
            right: 18px;

            font-size: 12.5px;

            font-weight: 600;

            color:
                var(
                    --text,
                    #f1efe9
                );

            background:
                rgba(
                    20,
                    21,
                    26,
                    0.55
                );

            padding:
                4px
                12px;

            border-radius: 999px;
        }


        /* =====================================================
           IDENTITY
        ===================================================== */

        .channel-identity {
            display: flex;

            align-items: flex-end;

            gap: 20px;

            padding:
                0
                8px;

            margin-top: 16px;

            flex-wrap: wrap;
        }


        .channel-avatar-wrap {
            position: relative;

            flex-shrink: 0;

            margin-top: -46px;
        }


        .channel-avatar-wrap
        .avatar-large {
            border:
                3px solid
                var(
                    --ink,
                    #14151a
                );
        }


        .channel-status-dot {
            position: absolute;

            bottom: 4px;
            right: 4px;

            width: 14px;
            height: 14px;

            border-radius: 50%;

            background: #4caf6d;

            border:
                2px solid
                var(
                    --ink,
                    #14151a
                );
        }


        .channel-info {
            flex: 1;

            min-width: 220px;

            padding-bottom: 4px;
        }


        .eyebrow {
            margin:
                0
                0
                4px;

            font-size: 11px;

            font-weight: 700;

            letter-spacing:
                0.08em;

            text-transform:
                uppercase;

            color:
                var(
                    --accent,
                    #cf9d56
                );
        }


        .channel-info h1 {
            margin: 0;

            font-family:
                var(
                    --display-font,
                    "Arial Black",
                    sans-serif
                );

            font-size:
                clamp(
                    2rem,
                    5vw,
                    3.5rem
                );

            line-height: 0.95;

            letter-spacing:
                -0.05em;

            text-transform:
                uppercase;

            color:
                var(
                    --text,
                    #f1efe9
                );
        }


        .channel-handle {
            margin:
                4px
                0
                8px;

            font-size: 13px;

            color:
                var(
                    --text-muted,
                    #9a9ba6
                );
        }


        .channel-stats {
            font-size: 13px;

            color:
                var(
                    --text-muted,
                    #9a9ba6
                );

            margin-bottom: 8px;
        }


        .channel-stats strong {
            color:
                var(
                    --text,
                    #f1efe9
                );
        }


        .meta-dot {
            margin:
                0
                6px;
        }


        .channel-description {
            margin: 0;

            font-size: 13.5px;

            color:
                var(
                    --text-muted,
                    #9a9ba6
                );

            max-width: 60ch;

            line-height: 1.5;
        }


        .channel-actions {
            padding-bottom: 6px;
        }


        /* =====================================================
           CHANNEL DETAILS / ACCORDIONS
        ===================================================== */

        .channel-details {
            margin-top: 34px;

            padding:
                0
                8px;
        }


        .channel-details-heading {
            display: flex;

            align-items: flex-end;

            justify-content:
                space-between;

            gap: 20px;

            margin-bottom: 14px;
        }


        .channel-details-heading
        .eyebrow {
            margin-bottom: 5px;
        }


        .channel-details-heading h2 {
            margin: 0;

            font-family:
                var(
                    --display-font,
                    "Arial Black",
                    sans-serif
                );

            font-size:
                clamp(
                    1.7rem,
                    4vw,
                    2.8rem
                );

            line-height: 0.95;

            letter-spacing:
                -0.05em;

            text-transform:
                uppercase;

            color:
                var(
                    --text,
                    #f1efe9
                );
        }


        .channel-details-count {
            font-family:
                "DM Mono",
                "Courier New",
                monospace;

            font-size: 11px;

            color:
                var(
                    --text-muted,
                    #9a9ba6
                );

            letter-spacing:
                0.08em;
        }


        .channel-accordions {
            display: flex;

            flex-direction: column;

            gap: 10px;
        }


        /* =====================================================
           ACCORDION INNER CONTENT
        ===================================================== */

        .accordion-meta-grid {
            display: grid;

            grid-template-columns:
                repeat(
                    3,
                    minmax(
                        0,
                        1fr
                    )
                );

            gap: 10px;

            margin-top: 18px;
        }


        .accordion-meta-grid > div {
            display: flex;

            flex-direction: column;

            gap: 5px;

            padding:
                12px;

            border:
                1px solid
                var(
                    --border,
                    rgba(
                        255,
                        255,
                        255,
                        0.08
                    )
                );

            border-radius:
                var(
                    --radius-sm,
                    8px
                );

            background:
                rgba(
                    255,
                    255,
                    255,
                    0.02
                );
        }


        .accordion-meta-grid span {
            font-size: 9px;

            font-weight: 700;

            letter-spacing:
                0.1em;

            text-transform:
                uppercase;

            color:
                var(
                    --text-muted,
                    #9a9ba6
                );
        }


        .accordion-meta-grid strong {
            font-size: 13px;

            color:
                var(
                    --text,
                    #f1efe9
                );
        }


        .accordion-info-list {
            display: flex;

            flex-direction: column;

            border-top:
                1px solid
                var(
                    --border,
                    rgba(
                        255,
                        255,
                        255,
                        0.08
                    )
                );
        }


        .accordion-info-row {
            display: flex;

            align-items: center;

            justify-content:
                space-between;

            gap: 20px;

            padding:
                12px
                0;

            border-bottom:
                1px solid
                var(
                    --border,
                    rgba(
                        255,
                        255,
                        255,
                        0.08
                    )
                );
        }


        .accordion-info-row span {
            color:
                var(
                    --text-muted,
                    #9a9ba6
                );

            font-size: 12.5px;
        }


        .accordion-info-row strong {
            color:
                var(
                    --text,
                    #f1efe9
                );

            font-size: 13px;

            text-align: right;
        }


        .accordion-activity {
            display: flex;

            align-items: flex-start;

            gap: 12px;
        }


        .activity-status-dot {
            width: 9px;
            height: 9px;

            flex-shrink: 0;

            margin-top: 7px;

            border-radius: 50%;

            background: #4caf6d;

            box-shadow:
                0 0 0 4px
                rgba(
                    76,
                    175,
                    109,
                    0.12
                );
        }


        .accordion-activity strong {
            color:
                var(
                    --text,
                    #f1efe9
                );

            font-size: 13px;
        }


        .accordion-activity p {
            margin:
                3px
                0
                0;

            color:
                var(
                    --text-muted,
                    #9a9ba6
                );
        }


        /* =====================================================
           TABS
        ===================================================== */

        .tabs {
            display: flex;

            gap: 8px;

            border-bottom:
                1px solid
                var(
                    --border,
                    rgba(
                        255,
                        255,
                        255,
                        0.08
                    )
                );

            margin:
                32px
                8px
                20px;

            padding: 0;
        }


        .tabs button {
            border: none;

            background: transparent;

            padding:
                12px
                6px;

            font-size: 14px;

            font-weight: 600;

            color:
                var(
                    --text-muted,
                    #9a9ba6
                );

            position: relative;
        }


        .tab-active {
            color:
                var(
                    --text,
                    #f1efe9
                );
        }


        .tab-active::after {
            content: "";

            position: absolute;

            left: 0;
            right: 0;

            bottom: -1px;

            height: 2px;

            background:
                var(
                    --accent,
                    #cf9d56
                );

            border-radius: 2px;
        }


        .channel-tab-disabled {
            color:
                var(
                    --text-muted,
                    #9a9ba6
                );

            opacity: 0.45;

            cursor: not-allowed;
        }


        /* =====================================================
           VIDEOS
        ===================================================== */

        .video-grid {
            display: grid;

            grid-template-columns:
                repeat(
                    auto-fill,
                    minmax(
                        240px,
                        1fr
                    )
                );

            gap: 20px;

            padding:
                0
                8px;
        }


        .section-heading {
            padding:
                0
                8px;
        }


        .section-heading h2 {
            margin: 0;

            font-size: 17px;

            color:
                var(
                    --text,
                    #f1efe9
                );
        }


        .section-heading span {
            font-size: 13px;

            color:
                var(
                    --text-muted,
                    #9a9ba6
                );
        }


        /* =====================================================
           EMPTY / ERROR
        ===================================================== */

        .empty,
        .center-state {
            display: flex;

            flex-direction: column;

            align-items: center;

            text-align: center;

            gap: 8px;

            padding:
                60px
                20px;

            color:
                var(
                    --text-muted,
                    #9a9ba6
                );
        }


        .empty-icon {
            font-size: 28px;
        }


        .empty h3 {
            margin: 0;

            color:
                var(
                    --text,
                    #f1efe9
                );

            font-size: 15px;
        }


        .empty p,
        .muted {
            margin: 0;

            font-size: 13.5px;
        }


        .channel-error-icon {
            width: 44px;
            height: 44px;

            border-radius: 50%;

            display: flex;

            align-items: center;
            justify-content: center;

            background:
                rgba(
                    226,
                    104,
                    92,
                    0.14
                );

            color:
                var(
                    --danger,
                    #e2685c
                );

            font-weight: 700;

            font-size: 18px;
        }


        .center-state h2 {
            margin: 0;

            color:
                var(
                    --text,
                    #f1efe9
                );

            font-size: 18px;
        }


        /* =====================================================
           SKELETON
        ===================================================== */

        @keyframes channelShimmer {

            0% {
                background-position:
                    -400px 0;
            }

            100% {
                background-position:
                    400px 0;
            }

        }


        .channel-cover-skeleton,
        .channel-avatar-skeleton,
        .channel-skeleton-info span,
        .channel-button-skeleton,
        .channel-accordion-skeleton span,
        .tabs-skeleton span,
        .channel-video-skeleton .skeleton,
        .channel-video-lines span {

            background:
                linear-gradient(
                    90deg,
                    var(
                        --surface,
                        #1b1d24
                    ) 25%,
                    var(
                        --surface-raised,
                        #23252e
                    ) 37%,
                    var(
                        --surface,
                        #1b1d24
                    ) 63%
                );

            background-size:
                800px 100%;

            animation:
                channelShimmer
                1.4s
                ease-in-out
                infinite;

            border-radius:
                var(
                    --radius-sm,
                    8px
                );
        }


        .channel-cover-skeleton {
            height: 200px;

            border-radius:
                var(
                    --radius-lg,
                    16px
                );
        }


        .channel-identity-skeleton {
            display: flex;

            align-items: flex-end;

            gap: 20px;

            padding:
                0
                8px;

            margin-top: 16px;
        }


        .channel-avatar-skeleton {
            width: 88px;
            height: 88px;

            border-radius: 50%;

            flex-shrink: 0;

            margin-top: -46px;
        }


        .channel-skeleton-info {
            flex: 1;

            display: flex;

            flex-direction: column;

            gap: 8px;
        }


        .channel-skeleton-info span {
            height: 12px;

            width: 40%;
        }


        .channel-skeleton-info span:first-child {
            width: 25%;

            height: 10px;
        }


        .channel-button-skeleton {
            width: 130px;
            height: 38px;

            border-radius: 999px;
        }


        .channel-accordion-skeleton {
            display: flex;

            flex-direction: column;

            gap: 10px;

            margin:
                34px
                8px
                0;
        }


        .channel-accordion-skeleton span {
            width: 100%;

            height: 76px;

            border-radius:
                var(
                    --radius-md,
                    12px
                );
        }


        .tabs-skeleton {
            display: flex;

            gap: 16px;

            padding:
                0
                8px;

            margin:
                24px
                0
                20px;
        }


        .tabs-skeleton span {
            width: 70px;

            height: 16px;
        }


        .skeleton-grid {
            display: grid;

            grid-template-columns:
                repeat(
                    auto-fill,
                    minmax(
                        240px,
                        1fr
                    )
                );

            gap: 20px;

            padding:
                0
                8px;
        }


        .channel-video-skeleton
        .skeleton {
            aspect-ratio:
                16 / 9;

            border-radius:
                var(
                    --radius-sm,
                    8px
                );
        }


        .channel-video-lines {
            display: flex;

            flex-direction: column;

            gap: 6px;

            margin-top: 10px;
        }


        .channel-video-lines span {
            height: 10px;
        }


        .channel-video-lines
        span:nth-child(2) {
            width: 60%;
        }


        /* =====================================================
           MOBILE
        ===================================================== */

        @media (max-width: 640px) {

            .channel-identity {
                flex-direction: column;

                align-items: flex-start;
            }


            .channel-actions {
                width: 100%;
            }


            .channel-actions
            .button,
            .channel-actions
            .subscribe-control {
                width: 100%;
            }


            .channel-actions
            .subscribe-button {
                width: 100%;

                justify-content: center;
            }


            .channel-details {
                margin-top: 26px;
            }


            .accordion-meta-grid {
                grid-template-columns: 1fr;
            }


            .accordion-info-row {
                align-items: flex-start;

                flex-direction: column;

                gap: 4px;
            }


            .accordion-info-row strong {
                text-align: left;
            }


            .tabs {
                margin-top: 26px;
            }

        }


        /* =====================================================
           REDUCED MOTION
        ===================================================== */

        @media (prefers-reduced-motion: reduce) {

            .channel-cover-skeleton,
            .channel-avatar-skeleton,
            .channel-skeleton-info span,
            .channel-button-skeleton,
            .channel-accordion-skeleton span,
            .tabs-skeleton span,
            .channel-video-skeleton .skeleton,
            .channel-video-lines span {
                animation: none;
            }

        }

    `}</style>
);


export default Channel;