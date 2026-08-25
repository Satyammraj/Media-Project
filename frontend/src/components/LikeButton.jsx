import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import { toggleVideoLike } from "../services/api";

const LikeButton = ({ videoId, initialLiked = false }) => {
    const { user } = useAuth();
    const navigate = useNavigate();

    const [liked, setLiked] = useState(initialLiked);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // Resync when the parent hands us a new video — without this,
    // navigating between videos in the same session (no full remount)
    // leaves the button showing the PREVIOUS video's liked state.
    useEffect(() => {
        // Reset when the route reuses this component for another video.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setLiked(initialLiked);
        setError("");
    }, [videoId, initialLiked]);

    const toggle = async () => {
        if (!user) {
            navigate("/login");
            return;
        }

        if (loading) return;

        // Optimistic update so the heart responds instantly; rolled
        // back in the catch block if the request actually fails.
        const previous = liked;
        setLiked(!previous);

        try {
            setLoading(true);
            setError("");

            const response = await toggleVideoLike(videoId);

            setLiked(response.data.data.liked);
        } catch (err) {
            setLiked(previous);
            setError(
                err?.response?.data?.message ||
                    "Unable to update like."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="like-button-wrapper">
            <LikeButtonStyles />

            <button
                type="button"
                className={`button button-ghost like-button ${
                    liked ? "button-liked" : ""
                }`}
                onClick={toggle}
                disabled={loading}
                aria-label={
                    liked
                        ? "Unlike this video"
                        : "Like this video"
                }
                aria-pressed={liked}
                title={
                    liked
                        ? "Remove your like"
                        : "Like this video"
                }
            >
                <span
                    className={`like-icon ${
                        liked ? "is-liked" : ""
                    }`}
                    aria-hidden="true"
                >
                    {liked ? "♥" : "♡"}
                </span>

                <span>
                    {loading
                        ? "Saving..."
                        : liked
                        ? "Liked"
                        : "Like"}
                </span>
            </button>

            {error && (
                <span className="like-error" role="alert">
                    {error}
                </span>
            )}
        </div>
    );
};

/* =================================================================
   STYLES — matches the AppShell / Avatar / CommentSection theme.
   Reads the same --accent / --surface variables set at :root by
   AppShell, with inline fallbacks so this still looks right if
   LikeButton is ever rendered without AppShell mounted.
   ================================================================= */

const LikeButtonStyles = () => (
    <style>{`
        .like-button-wrapper {
            display: inline-flex;
            flex-direction: column;
            align-items: flex-start;
            gap: 6px;
        }

        .like-button {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            height: 38px;
            padding: 0 18px;
        }

        .like-icon {
            font-size: 16px;
            color: var(--text-muted, #9a9ba6);
            transition: color 0.15s var(--ease, ease), transform 0.15s var(--ease, ease);
        }

        .like-icon.is-liked {
            color: var(--accent, #cf9d56);
            transform: scale(1.08);
        }

        .button-liked {
            border-color: var(--accent, #cf9d56);
            color: var(--accent, #cf9d56);
        }

        .like-button:disabled {
            opacity: 0.65;
            cursor: not-allowed;
        }

        .like-error {
            font-size: 12px;
            color: var(--danger, #e2685c);
        }

        @media (prefers-reduced-motion: reduce) {
            .like-icon {
                transition: none;
            }
        }
    `}</style>
);

export default LikeButton;