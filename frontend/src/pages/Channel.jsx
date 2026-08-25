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

            <div className="tabs tabs-skeleton">
                <span />
                <span />
                <span />
            </div>

            <div className="skeleton-grid">
                {Array.from({ length: 8 }).map((_, index) => (
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
                ))}
            </div>
        </div>
    );
};

const Channel = () => {
    const { username } = useParams();
    const { user } = useAuth();

    const [channel, setChannel] = useState(null);
    const [videos, setVideos] = useState([]);
    const [error, setError] = useState("");

    useEffect(() => {
        let mounted = true;

        const load = async () => {
            try {
                setError("");
                setChannel(null);
                setVideos([]);

                const profile =
                    await getChannelProfile(username);

                const channelData =
                    profile.data.data;

                const videoResponse = await getVideos({
                    userId: channelData._id,
                    limit: 20,
                });

                if (!mounted) return;

                setChannel(channelData);
                setVideos(
                    videoResponse.data.data || []
                );
            } catch (requestError) {
                if (!mounted) return;

                setError(
                    requestError?.response?.data?.message ||
                        "Unable to load this channel."
                );
            }
        };

        if (username) load();

        return () => {
            mounted = false;
        };
    }, [username]);

    // Keeps the subscriber count on this page in sync with the button's
    // own optimistic state, without double-counting when the button
    // fires onChange twice per click (once optimistic, once confirmed).
    const handleSubscribeChange = (nextSubscribed) => {
        setChannel((prev) => {
            if (!prev || prev.isSubscribed === nextSubscribed) {
                return prev;
            }

            const delta = nextSubscribed ? 1 : -1;

            return {
                ...prev,
                isSubscribed: nextSubscribed,
                subscribersCount: Math.max(
                    0,
                    (prev.subscribersCount || 0) + delta
                ),
            };
        });
    };

    if (error) {
        return (
            <div className="center-state channel-error-state">
                <ChannelStyles />

                <div className="channel-error-icon">
                    !
                </div>

                <h2>Channel unavailable</h2>

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

    if (!channel) {
        return <ChannelSkeleton />;
    }

    const channelName =
        channel.fullName ||
        channel.username ||
        "Creator";

    const subscribers =
        channel.subscribersCount || 0;

    const isOwnChannel =
        Boolean(user?._id) && user._id === channel._id;

    return (
        <div className="page-content channel-page">
            <ChannelStyles />

            {/* ───────────────── COVER ───────────────── */}
            <div
                className={`channel-cover ${
                    channel.coverImage
                        ? "has-cover"
                        : "no-cover"
                }`}
                style={
                    channel.coverImage
                        ? {
                              backgroundImage: `url("${channel.coverImage}")`,
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

            {/* ───────────────── CHANNEL IDENTITY ───────────────── */}
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

                    <h1>{channelName}</h1>

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
                            channelId={channel._id}
                            initialSubscribed={
                                channel.isSubscribed
                            }
                            onChange={handleSubscribeChange}
                        />
                    )}
                </div>
            </section>

            {/* ───────────────── TABS ───────────────── */}
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

                <button
                    className="channel-tab-disabled"
                    type="button"
                    role="tab"
                    aria-selected="false"
                    disabled
                >
                    About
                </button>
            </div>

            {/* ───────────────── VIDEOS ───────────────── */}
            <section className="channel-videos">
                <div className="section-heading">
                    <div>
                        <h2>Latest uploads</h2>

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

                        <h3>No videos yet</h3>

                        <p>
                            This creator hasn't
                            published anything yet.
                        </p>
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
        </div>
    );
};

/* =================================================================
   STYLES — matches the AppShell / VideoCard "editing studio" theme.
   Reads the same --accent / --surface variables set at :root by
   AppShell, with inline fallbacks so this still looks right on its
   own. Skeleton pieces share one shimmer animation.

   NOTE: the avatar-overlaps-cover effect is applied via a negative
   margin on `.channel-avatar-wrap` only (not on `.channel-identity`
   as a whole). Doing it on the whole row bottom-aligns a short
   avatar against a much taller text column, dragging the text's top
   (name, handle, etc.) up into the cover photo whenever the text
   stack is tall enough — which is exactly what happened before.
   ================================================================= */

const ChannelStyles = () => (
    <style>{`
        .page-content {
            max-width: 1200px;
            margin: 0 auto;
        }

        /* ---- Cover ---- */

        .channel-cover {
            position: relative;
            height: 200px;
            border-radius: var(--radius-lg, 16px);
            overflow: hidden;
            background-size: cover;
            background-position: center;
        }

        .channel-cover.no-cover {
            background: linear-gradient(
                135deg,
                var(--surface-raised, #23252e),
                var(--surface, #1b1d24)
            );
        }

        .channel-cover-overlay {
            position: absolute;
            inset: 0;
            background: linear-gradient(
                to top,
                rgba(20, 21, 26, 0.75),
                transparent 55%
            );
        }

        .channel-cover-content {
            position: absolute;
            bottom: 14px;
            right: 18px;
            font-size: 12.5px;
            font-weight: 600;
            color: var(--text, #f1efe9);
            background: rgba(20, 21, 26, 0.55);
            padding: 4px 12px;
            border-radius: 999px;
        }

        /* ---- Identity ---- */

        .channel-identity {
            display: flex;
            align-items: flex-end;
            gap: 20px;
            padding: 0 8px;
            margin-top: 16px;
            flex-wrap: wrap;
        }

        .channel-avatar-wrap {
            position: relative;
            flex-shrink: 0;
            margin-top: -46px;
        }

        .channel-avatar-wrap .avatar-large {
            border: 3px solid var(--ink, #14151a);
        }

        .channel-status-dot {
            position: absolute;
            bottom: 4px;
            right: 4px;
            width: 14px;
            height: 14px;
            border-radius: 50%;
            background: #4caf6d;
            border: 2px solid var(--ink, #14151a);
        }

        .channel-info {
            flex: 1;
            min-width: 220px;
            padding-bottom: 4px;
        }

        .eyebrow {
            margin: 0 0 4px;
            font-size: 11px;
            font-weight: 700;
            letter-spacing: 0.08em;
            text-transform: uppercase;
            color: var(--accent, #cf9d56);
        }

        .channel-info h1 {
            margin: 0;
            font-size: 24px;
            color: var(--text, #f1efe9);
        }

        .channel-handle {
            margin: 2px 0 8px;
            font-size: 13px;
            color: var(--text-muted, #9a9ba6);
        }

        .channel-stats {
            font-size: 13px;
            color: var(--text-muted, #9a9ba6);
            margin-bottom: 8px;
        }

        .channel-stats strong {
            color: var(--text, #f1efe9);
        }

        .meta-dot {
            margin: 0 6px;
        }

        .channel-description {
            margin: 0;
            font-size: 13.5px;
            color: var(--text-muted, #9a9ba6);
            max-width: 60ch;
            line-height: 1.5;
        }

        .channel-actions {
            padding-bottom: 6px;
        }

        /* ---- Tabs ---- */

        .tabs {
            display: flex;
            gap: 8px;
            border-bottom: 1px solid var(--border, rgba(255, 255, 255, 0.08));
            margin: 24px 0 20px;
            padding: 0 8px;
        }

        .tabs button {
            border: none;
            background: transparent;
            padding: 12px 6px;
            font-size: 14px;
            font-weight: 600;
            color: var(--text-muted, #9a9ba6);
            position: relative;
        }

        .tab-active {
            color: var(--text, #f1efe9);
        }

        .tab-active::after {
            content: "";
            position: absolute;
            left: 0;
            right: 0;
            bottom: -1px;
            height: 2px;
            background: var(--accent, #cf9d56);
            border-radius: 2px;
        }

        .channel-tab-disabled {
            color: var(--text-muted, #9a9ba6);
            opacity: 0.45;
            cursor: not-allowed;
        }

        /* ---- Video grid ---- */

        .video-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
            gap: 20px;
            padding: 0 8px;
        }

        .section-heading {
            padding: 0 8px;
        }

        .section-heading h2 {
            margin: 0;
            font-size: 17px;
            color: var(--text, #f1efe9);
        }

        .section-heading span {
            font-size: 13px;
            color: var(--text-muted, #9a9ba6);
        }

        /* ---- Empty / error states ---- */

        .empty, .center-state {
            display: flex;
            flex-direction: column;
            align-items: center;
            text-align: center;
            gap: 8px;
            padding: 60px 20px;
            color: var(--text-muted, #9a9ba6);
        }

        .empty-icon {
            font-size: 28px;
        }

        .empty h3 {
            margin: 0;
            color: var(--text, #f1efe9);
            font-size: 15px;
        }

        .empty p, .muted {
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
            background: rgba(226, 104, 92, 0.14);
            color: var(--danger, #e2685c);
            font-weight: 700;
            font-size: 18px;
        }

        .center-state h2 {
            margin: 0;
            color: var(--text, #f1efe9);
            font-size: 18px;
        }

        /* ---- Skeleton state ---- */

        @keyframes shimmer {
            0% { background-position: -400px 0; }
            100% { background-position: 400px 0; }
        }

        .channel-cover-skeleton,
        .channel-avatar-skeleton,
        .channel-skeleton-info span,
        .channel-button-skeleton,
        .tabs-skeleton span,
        .channel-video-skeleton .skeleton,
        .channel-video-lines span {
            background: linear-gradient(
                90deg,
                var(--surface, #1b1d24) 25%,
                var(--surface-raised, #23252e) 37%,
                var(--surface, #1b1d24) 63%
            );
            background-size: 800px 100%;
            animation: shimmer 1.4s ease-in-out infinite;
            border-radius: var(--radius-sm, 8px);
        }

        .channel-cover-skeleton {
            height: 200px;
            border-radius: var(--radius-lg, 16px);
        }

        .channel-identity-skeleton {
            display: flex;
            align-items: flex-end;
            gap: 20px;
            padding: 0 8px;
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

        .tabs-skeleton {
            display: flex;
            gap: 16px;
            padding: 0 8px;
            margin: 24px 0 20px;
        }

        .tabs-skeleton span {
            width: 70px;
            height: 16px;
        }

        .skeleton-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
            gap: 20px;
            padding: 0 8px;
        }

        .channel-video-skeleton .skeleton {
            aspect-ratio: 16 / 9;
            border-radius: var(--radius-sm, 8px);
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

        .channel-video-lines span:nth-child(2) {
            width: 60%;
        }

        @media (prefers-reduced-motion: reduce) {
            .channel-cover-skeleton,
            .channel-avatar-skeleton,
            .channel-skeleton-info span,
            .channel-button-skeleton,
            .tabs-skeleton span,
            .channel-video-skeleton .skeleton,
            .channel-video-lines span {
                animation: none;
            }
        }

        @media (max-width: 640px) {
            .channel-identity {
                flex-direction: column;
                align-items: flex-start;
            }

            .channel-actions {
                width: 100%;
            }

            .channel-actions .button,
            .channel-actions .subscribe-control {
                width: 100%;
            }

            .channel-actions .subscribe-button {
                width: 100%;
                justify-content: center;
            }
        }
    `}</style>
);

export default Channel;