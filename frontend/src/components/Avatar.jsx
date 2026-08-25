import { useState } from "react";

const Avatar = ({ user, size = "medium" }) => {
    const [imgFailed, setImgFailed] = useState(false);

    const label =
        user?.username ||
        user?.fullName ||
        "Member";

    const initial = label
        .trim()
        .charAt(0)
        .toUpperCase();

    // Only trust the image if there's a src AND it hasn't already failed.
    const showImage = Boolean(user?.avatar) && !imgFailed;

    return (
        <span
            className={`avatar avatar-${size}`}
            title={label}
            aria-label={`${label}'s avatar`}
        >
            <AvatarStyles />

            {showImage ? (
                <img
                    src={user.avatar}
                    alt={label}
                    loading="lazy"
                    onError={() => setImgFailed(true)}
                />
            ) : (
                <span className="avatar-fallback">
                    {initial}
                </span>
            )}
        </span>
    );
};

/* =================================================================
   STYLES — matches the AppShell "editing studio" theme.
   Reuses the same --accent / --surface-raised variables set on
   :root by AppShell, so it stays in sync automatically. If Avatar
   is ever rendered standalone (no AppShell mounted), the fallback
   values after the commas below keep it looking right anyway.
   ================================================================= */

const AvatarStyles = () => (
    <style>{`
        .avatar {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
            border-radius: 50%;
            overflow: hidden;
            background: var(--surface-raised, #23252e);
            border: 1px solid var(--border, rgba(255, 255, 255, 0.08));
        }

        .avatar img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            display: block;
        }

        .avatar-fallback {
            width: 100%;
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 600;
            color: #14151a;
            background: linear-gradient(
                155deg,
                var(--accent, #cf9d56),
                #a97c3c
            );
        }

        /* ---- Sizes ---- */

        .avatar-small {
            width: 30px;
            height: 30px;
            font-size: 12px;
        }

        .avatar-small .avatar-fallback {
            font-size: 12px;
        }

        .avatar-medium {
            width: 40px;
            height: 40px;
        }

        .avatar-medium .avatar-fallback {
            font-size: 15px;
        }

        .avatar-large {
            width: 88px;
            height: 88px;
            border-width: 2px;
        }

        .avatar-large .avatar-fallback {
            font-size: 30px;
        }
    `}</style>
);

export default Avatar;