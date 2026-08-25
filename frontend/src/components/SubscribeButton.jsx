import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import { subscribeTo } from "../services/api";

const SubscribeButton = ({
    channelId,
    initialSubscribed = false,
    onChange,
}) => {
    const { user } = useAuth();
    const navigate = useNavigate();

    const [subscribed, setSubscribed] =
        useState(initialSubscribed);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // Resync when the parent hands us a new channel — without this,
    // browsing between channels in the same session (no full remount)
    // leaves the button showing the PREVIOUS channel's subscribe state.
    useEffect(() => {
        // Reset when the route reuses this component for another channel.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setSubscribed(initialSubscribed);
        setError("");
    }, [channelId, initialSubscribed]);

    // A channel can't subscribe to itself — match YouTube's behavior
    // and just don't render the control on your own channel page.
    const isOwnChannel =
        Boolean(user?._id) && user._id === channelId;

    const toggle = async () => {
        if (!user) {
            navigate("/login");
            return;
        }

        if (!channelId || loading) {
            return;
        }

        // Optimistic update so the button responds instantly; rolled
        // back in the catch block if the request actually fails.
        const previous = subscribed;
        setSubscribed(!previous);
        onChange?.(!previous);

        try {
            setLoading(true);
            setError("");

            const response = await subscribeTo(channelId);

            const next =
                response.data.data.subscribed;

            setSubscribed(next);
            onChange?.(next);
        } catch (err) {
            setSubscribed(previous);
            onChange?.(previous);

            setError(
                err?.response?.data?.message ||
                    "Unable to update subscription."
            );
        } finally {
            setLoading(false);
        }
    };

    if (isOwnChannel) {
        return null;
    }

    return (
        <div className="subscribe-control">
            <SubscribeButtonStyles />

            <button
                type="button"
                className={`button subscribe-button ${
                    subscribed
                        ? "button-muted subscribed"
                        : ""
                }`}
                onClick={toggle}
                disabled={loading || !channelId}
                aria-pressed={subscribed}
                aria-label={
                    subscribed
                        ? "Unsubscribe from this channel"
                        : "Subscribe to this channel"
                }
                title={
                    subscribed
                        ? "Unsubscribe"
                        : "Subscribe"
                }
            >
                <span
                    className="subscribe-icon"
                    aria-hidden="true"
                >
                    {loading
                        ? "•"
                        : subscribed
                        ? "✓"
                        : "+"}
                </span>

                <span>
                    {loading
                        ? "Updating..."
                        : subscribed
                        ? "Subscribed"
                        : "Subscribe"}
                </span>
            </button>

            {error && (
                <span
                    className="subscribe-error"
                    role="alert"
                >
                    {error}
                </span>
            )}
        </div>
    );
};

/* =================================================================
   STYLES — matches the AppShell / LikeButton "editing studio" theme.
   Unsubscribed = solid brass CTA (matches AppShell's .button).
   Subscribed = muted/outlined, so the strong color is reserved for
   the action a visitor hasn't taken yet — same logic YouTube uses.
   ================================================================= */

const SubscribeButtonStyles = () => (
    <style>{`
        .subscribe-control {
            display: inline-flex;
            flex-direction: column;
            align-items: flex-start;
            gap: 6px;
        }

        .subscribe-button {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            height: 38px;
            padding: 0 18px;
            font-weight: 600;
        }

        .subscribe-icon {
            font-size: 14px;
            line-height: 1;
        }

        .subscribe-button.subscribed {
            background: var(--surface-raised, #23252e);
            color: var(--text, #f1efe9);
            border: 1px solid var(--border, rgba(255, 255, 255, 0.08));
        }

        .subscribe-button.subscribed:hover:not(:disabled) {
            background: rgba(226, 104, 92, 0.12);
            border-color: rgba(226, 104, 92, 0.35);
            color: var(--danger, #e2685c);
        }

        /* Swap the check mark for a hint of "unsubscribe" on hover,
           the same way YouTube nudges the intent on the hover state. */
        .subscribe-button.subscribed:hover:not(:disabled) .subscribe-icon {
            color: var(--danger, #e2685c);
        }

        .subscribe-button:disabled {
            opacity: 0.65;
            cursor: not-allowed;
        }

        .subscribe-error {
            font-size: 12px;
            color: var(--danger, #e2685c);
        }
    `}</style>
);

export default SubscribeButton;