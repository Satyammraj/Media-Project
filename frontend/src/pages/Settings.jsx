import { useEffect, useRef, useState } from "react";

import { useAuth } from "../context/AuthContext";

import {
    changePassword,
    updateAccount,
    updateAvatar,
    updateCoverImage,
} from "../services/api";

import Avatar from "../components/Avatar";


const getInitialProfile = (user) => ({
    fullName: user?.fullName || "",
    email: user?.email || "",
    description:
        localStorage.getItem(
            `bio-${user?._id}`
        ) || "",
});


const getInitials = (name) => {
    if (!name) return "?";

    return name
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase() || "")
        .join("");
};


const SettingsStyles = () => (
    <style>{`
        .settings-page {
            display: flex;
            flex-direction: column;
            gap: 28px;
            color: var(--text, #f1efe9);
        }

        .settings-loading {
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 320px;
            color: var(--text-muted, #9a9ba6);
            font-size: 0.95rem;
            gap: 10px;
        }

        .settings-loading-spinner {
            width: 18px;
            height: 18px;
            border-radius: 50%;
            border: 2px solid var(--border, rgba(255, 255, 255, 0.08));
            border-top-color: var(--accent, #cf9d56);
            animation: settings-spin 0.8s linear infinite;
        }

        @keyframes settings-spin {
            to { transform: rotate(360deg); }
        }

        .settings-header {
            display: flex;
            align-items: flex-start;
            justify-content: space-between;
            gap: 24px;
            flex-wrap: wrap;
        }

        .settings-header .eyebrow,
        .settings-panel-heading .eyebrow {
            text-transform: uppercase;
            letter-spacing: 0.08em;
            font-size: 0.72rem;
            color: var(--accent, #cf9d56);
            margin: 0 0 6px;
            font-weight: 600;
        }

        .settings-header h1 {
            margin: 0 0 6px;
            font-size: 1.6rem;
        }

        .settings-header .lede {
            margin: 0;
            color: var(--text-muted, #9a9ba6);
            max-width: 480px;
        }

        .settings-header-profile {
            display: flex;
            align-items: center;
            gap: 12px;
            background: var(--surface, #1b1d24);
            border: 1px solid var(--border, rgba(255, 255, 255, 0.08));
            border-radius: var(--radius-md, 12px);
            padding: 10px 16px;
        }

        .settings-header-profile strong {
            display: block;
            font-size: 0.95rem;
        }

        .settings-header-profile span {
            display: block;
            color: var(--text-muted, #9a9ba6);
            font-size: 0.82rem;
        }

        .settings-message {
            display: flex;
            align-items: center;
            gap: 10px;
            padding: 12px 16px;
            border-radius: var(--radius-sm, 8px);
            font-size: 0.9rem;
            border: 1px solid var(--border, rgba(255, 255, 255, 0.08));
        }

        .settings-message.success {
            background: var(--accent-soft, rgba(207, 157, 86, 0.14));
            color: var(--accent, #cf9d56);
        }

        .settings-message.error {
            background: rgba(226, 104, 92, 0.14);
            color: var(--danger, #e2685c);
        }

        .settings-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(340px, 1fr));
            gap: 20px;
            align-items: start;
        }

        .settings-panel {
            background: var(--surface, #1b1d24);
            border: 1px solid var(--border, rgba(255, 255, 255, 0.08));
            border-radius: var(--radius-lg, 16px);
            padding: 22px;
            display: flex;
            flex-direction: column;
            gap: 16px;
        }

        .settings-panel-heading {
            display: flex;
            align-items: flex-start;
            justify-content: space-between;
        }

        .settings-panel-heading h2 {
            margin: 0;
            font-size: 1.1rem;
        }

        .settings-panel-number {
            font-size: 0.75rem;
            color: var(--text-muted, #9a9ba6);
            border: 1px solid var(--border, rgba(255, 255, 255, 0.08));
            border-radius: 999px;
            padding: 2px 9px;
        }

        .settings-profile {
            display: flex;
            align-items: center;
            gap: 12px;
        }

        .settings-profile strong {
            display: block;
            font-size: 0.95rem;
        }

        .settings-profile span {
            display: block;
            color: var(--text-muted, #9a9ba6);
            font-size: 0.82rem;
        }

        .panel-form,
        .settings-form {
            display: flex;
            flex-direction: column;
            gap: 14px;
        }

        .settings-form label {
            display: flex;
            flex-direction: column;
            gap: 6px;
            font-size: 0.85rem;
            color: var(--text-muted, #9a9ba6);
        }

        .settings-form input,
        .settings-form textarea {
            background: var(--surface-raised, #23252e);
            border: 1px solid var(--border, rgba(255, 255, 255, 0.08));
            border-radius: var(--radius-sm, 8px);
            padding: 10px 12px;
            color: var(--text, #f1efe9);
            font: inherit;
            transition: border-color 0.2s var(--ease, cubic-bezier(0.4, 0, 0.2, 1));
        }

        .settings-form input:focus-visible,
        .settings-form textarea:focus-visible {
            border-color: var(--accent, #cf9d56);
        }

        .settings-form textarea {
            resize: vertical;
        }

        .field-hint {
            color: var(--text-muted, #9a9ba6);
            font-size: 0.75rem;
            align-self: flex-end;
        }

        .settings-buttons {
            display: flex;
            gap: 10px;
        }

        .button {
            border: 1px solid transparent;
            border-radius: var(--radius-sm, 8px);
            padding: 9px 16px;
            font: inherit;
            font-weight: 600;
            font-size: 0.85rem;
            cursor: pointer;
            background: var(--accent, #cf9d56);
            color: var(--ink, #14151a);
            transition: opacity 0.2s var(--ease, cubic-bezier(0.4, 0, 0.2, 1));
        }

        .button:disabled {
            opacity: 0.5;
            cursor: not-allowed;
        }

        .button:not(:disabled):hover {
            opacity: 0.9;
        }

        .button-ghost {
            background: transparent;
            border-color: var(--border, rgba(255, 255, 255, 0.08));
            color: var(--text, #f1efe9);
        }

        .button-muted {
            background: var(--surface-raised, #23252e);
            color: var(--text-muted, #9a9ba6);
        }

        .button-danger {
            background: var(--danger, #e2685c);
            color: var(--text, #f1efe9);
        }

        .media-settings-list {
            display: flex;
            flex-direction: column;
            gap: 18px;
        }

        .image-setting {
            display: flex;
            gap: 14px;
            padding: 12px;
            border-radius: var(--radius-md, 12px);
            border: 1px solid transparent;
            transition: border-color 0.2s var(--ease, cubic-bezier(0.4, 0, 0.2, 1));
        }

        .image-setting.has-pending-file {
            border-color: var(--accent, #cf9d56);
            background: var(--accent-soft, rgba(207, 157, 86, 0.14));
        }

        .image-setting-preview {
            flex-shrink: 0;
            width: 84px;
            height: 60px;
            border-radius: var(--radius-sm, 8px);
            overflow: hidden;
            background: var(--surface-raised, #23252e);
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .settings-avatar-preview {
            width: 100%;
            height: 100%;
            object-fit: cover;
            border-radius: 50%;
        }

        .settings-cover-preview {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }

        .settings-image-placeholder {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 4px;
            width: 100%;
            height: 100%;
            color: var(--text-muted, #9a9ba6);
            font-size: 0.7rem;
            text-align: center;
        }

        .settings-image-placeholder.avatar-placeholder {
            font-size: 0.95rem;
            font-weight: 700;
            color: var(--accent, #cf9d56);
        }

        .settings-image-placeholder svg {
            width: 18px;
            height: 18px;
            opacity: 0.7;
        }

        .image-setting-content {
            display: flex;
            flex-direction: column;
            gap: 4px;
        }

        .image-setting-content strong {
            font-size: 0.9rem;
        }

        .image-setting-content > span {
            color: var(--text-muted, #9a9ba6);
            font-size: 0.78rem;
            margin-bottom: 4px;
        }

        .file-button {
            display: inline-flex;
            align-items: center;
            width: fit-content;
            background: var(--surface-raised, #23252e);
            border: 1px solid var(--border, rgba(255, 255, 255, 0.08));
            border-radius: var(--radius-sm, 8px);
            padding: 7px 14px;
            font-size: 0.8rem;
            cursor: pointer;
            color: var(--text, #f1efe9);
        }

        .file-button input {
            position: absolute;
            width: 1px;
            height: 1px;
            overflow: hidden;
            opacity: 0;
        }

        .file-info {
            font-size: 0.75rem;
            color: var(--text-muted, #9a9ba6);
        }

        .password-setting {
            display: flex;
            gap: 8px;
        }

        .password-setting input {
            flex: 1;
        }

        .password-setting button {
            background: var(--surface-raised, #23252e);
            border: 1px solid var(--border, rgba(255, 255, 255, 0.08));
            border-radius: var(--radius-sm, 8px);
            padding: 0 12px;
            color: var(--text-muted, #9a9ba6);
            font-size: 0.78rem;
            cursor: pointer;
        }

        .settings-description {
            color: var(--text-muted, #9a9ba6);
            font-size: 0.85rem;
            margin: -6px 0 0;
        }

        .theme-options {
            display: flex;
            flex-direction: column;
            gap: 8px;
        }

        .theme-option {
            display: flex;
            align-items: center;
            gap: 12px;
            text-align: left;
            background: var(--surface-raised, #23252e);
            border: 1px solid var(--border, rgba(255, 255, 255, 0.08));
            border-radius: var(--radius-sm, 8px);
            padding: 10px 12px;
            cursor: pointer;
            color: var(--text, #f1efe9);
            transition: border-color 0.2s var(--ease, cubic-bezier(0.4, 0, 0.2, 1));
        }

        .theme-option.selected {
            border-color: var(--accent, #cf9d56);
        }

        .theme-option strong {
            display: block;
            font-size: 0.85rem;
        }

        .theme-option small {
            display: block;
            color: var(--text-muted, #9a9ba6);
            font-size: 0.75rem;
        }

        .theme-radio {
            flex-shrink: 0;
            width: 18px;
            height: 18px;
            border-radius: 50%;
            border: 1px solid var(--border, rgba(255, 255, 255, 0.08));
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 0.7rem;
            color: var(--accent, #cf9d56);
        }

        .settings-subsection {
            border-top: 1px solid var(--border, rgba(255, 255, 255, 0.08));
            padding-top: 16px;
            margin-top: 4px;
            display: flex;
            flex-direction: column;
            gap: 12px;
        }

        .settings-subsection-heading {
            display: flex;
            align-items: baseline;
            justify-content: space-between;
        }

        .settings-subsection-heading h3 {
            margin: 0;
            font-size: 0.95rem;
        }

        .settings-subsection-heading span {
            font-size: 0.72rem;
            color: var(--text-muted, #9a9ba6);
        }

        .toggle-row {
            display: flex;
            align-items: flex-start;
            gap: 10px;
            cursor: pointer;
        }

        .toggle-row input {
            margin-top: 3px;
            accent-color: var(--accent, #cf9d56);
        }

        .toggle-row strong {
            display: block;
            font-size: 0.85rem;
        }

        .toggle-row small {
            display: block;
            color: var(--text-muted, #9a9ba6);
            font-size: 0.75rem;
        }

        .account-danger {
            flex-direction: row;
            align-items: center;
            justify-content: space-between;
            gap: 16px;
        }

        .account-danger h2 {
            margin: 0 0 4px;
        }

        .account-danger p {
            margin: 0;
            color: var(--text-muted, #9a9ba6);
            font-size: 0.85rem;
        }
    `}</style>
);


const Settings = () => {
    const { user, updateUser, logout } = useAuth();

    const [form, setForm] = useState(
        getInitialProfile(user)
    );

    const [files, setFiles] = useState({
        avatar: null,
        coverImage: null,
    });

    const [previews, setPreviews] = useState({
        avatar: user?.avatar || "",
        coverImage: user?.coverImage || "",
    });

    const [password, setPassword] = useState({
        oldPassword: "",
        newPassword: "",
    });

    const [showPasswords, setShowPasswords] =
        useState({
            old: false,
            new: false,
        });

    const [theme, setTheme] = useState(
        () =>
            localStorage.getItem("videoly-theme") ||
            "dark"
    );

    const [notifications, setNotifications] =
        useState(() => ({
            creatorUpdates:
                localStorage.getItem(
                    "videoly-creator-updates"
                ) !== "false",

            productAnnouncements:
                localStorage.getItem(
                    "videoly-product-announcements"
                ) === "true",
        }));

    const [message, setMessage] = useState("");
    const [messageType, setMessageType] =
        useState("success");

    const [savingProfile, setSavingProfile] =
        useState(false);

    const [savingMedia, setSavingMedia] =
        useState({
            avatar: false,
            coverImage: false,
        });

    const [savingPassword, setSavingPassword] =
        useState(false);

    const [loggingOut, setLoggingOut] =
        useState(false);

    const messageTimer = useRef(null);

    const previewUrls = useRef({
        avatar: null,
        coverImage: null,
    });

    // Guards setState calls that would otherwise fire after the component
    // has unmounted (e.g. logout triggering an immediate route change while
    // the request is still in flight).
    const isMountedRef = useRef(true);


    /* =====================================================
       MOUNT TRACKING
       ===================================================== */

    useEffect(() => {
        isMountedRef.current = true;

        return () => {
            isMountedRef.current = false;
        };
    }, []);


    /* =====================================================
       THEME
       ===================================================== */

    useEffect(() => {
        document.documentElement.dataset.theme =
            theme;

        localStorage.setItem(
            "videoly-theme",
            theme
        );
    }, [theme]);


    /* =====================================================
       USER SYNC
       ===================================================== */

    useEffect(() => {
        if (!user) return;

        // Refresh draft values when the account returned by the API changes.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setForm(getInitialProfile(user));

        setPreviews({
            avatar: user.avatar || "",
            coverImage: user.coverImage || "",
        });
    }, [
        user,
        user?._id,
        user?.fullName,
        user?.email,
        user?.avatar,
        user?.coverImage,
    ]);


    /* =====================================================
       CLEANUP
       ===================================================== */

    useEffect(() => {
        const previewUrlsToCleanup = previewUrls.current;
        return () => {
            if (messageTimer.current) {
                window.clearTimeout(
                    messageTimer.current
                );
            }

            Object.values(previewUrlsToCleanup).forEach(
                (url) => {
                    if (url) {
                        URL.revokeObjectURL(url);
                    }
                }
            );
        };
    }, []);


    /* =====================================================
       FEEDBACK
       ===================================================== */

    const showMessage = (
        text,
        type = "success"
    ) => {
        if (!isMountedRef.current) return;

        setMessage(text);
        setMessageType(type);

        if (messageTimer.current) {
            window.clearTimeout(
                messageTimer.current
            );
        }

        messageTimer.current =
            window.setTimeout(() => {
                if (isMountedRef.current) {
                    setMessage("");
                }
            }, 4000);
    };


    /* =====================================================
       PROFILE
       ===================================================== */

    const handleProfileChange = (event) => {
        const { name, value } = event.target;

        setForm((current) => ({
            ...current,
            [name]: value,
        }));
    };


    const saveAccount = async (event) => {
        event.preventDefault();

        if (savingProfile) return;

        try {
            setSavingProfile(true);

            const response = await updateAccount({
                fullName: form.fullName.trim(),
                email: form.email.trim(),
            });

            if (!isMountedRef.current) return;

            updateUser(response.data.data);

            localStorage.setItem(
                `bio-${user._id}`,
                form.description.trim()
            );

            showMessage(
                "Your profile has been updated."
            );
        } catch (error) {
            if (!isMountedRef.current) return;

            showMessage(
                error?.response?.data?.message ||
                    "Profile update failed.",
                "error"
            );
        } finally {
            if (isMountedRef.current) {
                setSavingProfile(false);
            }
        }
    };


    const resetProfile = () => {
        setForm(getInitialProfile(user));
    };


    const hasProfileChanges =
        form.fullName !==
            (user?.fullName || "") ||
        form.email !==
            (user?.email || "") ||
        form.description !==
            (
                localStorage.getItem(
                    `bio-${user?._id}`
                ) || ""
            );


    /* =====================================================
       IMAGE UPLOADS
       ===================================================== */

    const chooseFile = (name, file) => {
        if (!file) return;

        if (!file.type.startsWith("image/")) {
            showMessage(
                "Please choose a valid image file.",
                "error"
            );
            return;
        }

        const oldUrl =
            previewUrls.current[name];

        if (oldUrl) {
            URL.revokeObjectURL(oldUrl);
        }

        const previewUrl =
            URL.createObjectURL(file);

        previewUrls.current[name] =
            previewUrl;

        setFiles((current) => ({
            ...current,
            [name]: file,
        }));

        setPreviews((current) => ({
            ...current,
            [name]: previewUrl,
        }));
    };


    const saveFile = async (name) => {
        if (
            !files[name] ||
            savingMedia[name]
        ) {
            return;
        }

        try {
            setSavingMedia((current) => ({
                ...current,
                [name]: true,
            }));

            const data = new FormData();

            data.append(
                name,
                files[name]
            );

            const response =
                name === "avatar"
                    ? await updateAvatar(data)
                    : await updateCoverImage(data);

            if (!isMountedRef.current) return;

            const updatedUser =
                response.data.data;

            updateUser(updatedUser);

            const oldUrl =
                previewUrls.current[name];

            if (oldUrl) {
                URL.revokeObjectURL(oldUrl);
                previewUrls.current[name] = null;
            }

            setFiles((current) => ({
                ...current,
                [name]: null,
            }));

            setPreviews((current) => ({
                ...current,
                [name]:
                    updatedUser[name] || "",
            }));

            showMessage(
                name === "avatar"
                    ? "Profile picture updated."
                    : "Channel cover updated."
            );
        } catch (error) {
            if (!isMountedRef.current) return;

            showMessage(
                error?.response?.data?.message ||
                    "Image update failed.",
                "error"
            );
        } finally {
            if (isMountedRef.current) {
                setSavingMedia((current) => ({
                    ...current,
                    [name]: false,
                }));
            }
        }
    };


    const cancelFile = (name) => {
        const preview =
            previewUrls.current[name];

        if (preview) {
            URL.revokeObjectURL(preview);
            previewUrls.current[name] = null;
        }

        setFiles((current) => ({
            ...current,
            [name]: null,
        }));

        setPreviews((current) => ({
            ...current,
            [name]: user?.[name] || "",
        }));
    };


    /* =====================================================
       PASSWORD
       ===================================================== */

    const savePassword = async (event) => {
        event.preventDefault();

        if (savingPassword) return;

        if (
            password.newPassword.length < 6
        ) {
            showMessage(
                "Your new password should be at least 6 characters.",
                "error"
            );
            return;
        }

        try {
            setSavingPassword(true);

            await changePassword(password);

            if (!isMountedRef.current) return;

            setPassword({
                oldPassword: "",
                newPassword: "",
            });

            setShowPasswords({
                old: false,
                new: false,
            });

            showMessage(
                "Your password has been changed."
            );
        } catch (error) {
            if (!isMountedRef.current) return;

            showMessage(
                error?.response?.data?.message ||
                    "Password change failed.",
                "error"
            );
        } finally {
            if (isMountedRef.current) {
                setSavingPassword(false);
            }
        }
    };


    /* =====================================================
       NOTIFICATIONS
       ===================================================== */

    const toggleNotification = (
        name,
        value
    ) => {
        setNotifications((current) => ({
            ...current,
            [name]: value,
        }));

        const storageKey =
            name === "creatorUpdates"
                ? "videoly-creator-updates"
                : "videoly-product-announcements";

        localStorage.setItem(
            storageKey,
            String(value)
        );

        showMessage(
            "Notification preferences saved."
        );
    };


    /* =====================================================
       LOGOUT
       ===================================================== */

    const handleLogout = async () => {
        if (loggingOut) return;

        try {
            setLoggingOut(true);
            await logout();
        } catch (error) {
            if (!isMountedRef.current) return;

            showMessage(
                error?.response?.data?.message ||
                    "Unable to log out.",
                "error"
            );
        } finally {
            if (isMountedRef.current) {
                setLoggingOut(false);
            }
        }
    };


    /* =====================================================
       RENDER
       ===================================================== */

    // Guard against rendering before the authenticated user is available.
    // Previously this read user.fullName / user.username / user.email
    // directly, which would throw if the component rendered before the
    // user had loaded.
    if (!user) {
        return (
            <main className="page-content settings-page">
                <SettingsStyles />

                <div className="settings-loading" role="status">
                    <span
                        className="settings-loading-spinner"
                        aria-hidden="true"
                    />
                    Loading your settings...
                </div>
            </main>
        );
    }

    return (
        <main className="page-content settings-page">
            <SettingsStyles />

            {/* HEADER */}

            <header className="settings-header">
                <div>
                    <p className="eyebrow">
                        Account control
                    </p>

                    <h1>Settings</h1>

                    <p className="lede">
                        Manage your profile, security,
                        appearance, and preferences.
                    </p>
                </div>

                <div className="settings-header-profile">
                    <Avatar
                        user={user}
                        size="medium"
                    />

                    <div>
                        <strong>
                            {user.fullName ||
                                user.username}
                        </strong>

                        <span>
                            @{user.username}
                        </span>
                    </div>
                </div>
            </header>


            {/* FEEDBACK */}

            {message && (
                <div
                    className={`notice ${
                        messageType === "error"
                            ? "error"
                            : "success"
                    } settings-message`}
                    role="status"
                >
                    <span aria-hidden="true">
                        {messageType === "error"
                            ? "!"
                            : "✓"}
                    </span>

                    {message}
                </div>
            )}


            <div className="settings-grid">

                {/* PROFILE */}

                <section className="settings-panel settings-profile-panel">

                    <div className="settings-panel-heading">
                        <div>
                            <p className="eyebrow">
                                Identity
                            </p>

                            <h2>Profile</h2>
                        </div>

                        <span className="settings-panel-number">
                            01
                        </span>
                    </div>


                    <div className="settings-profile">
                        <Avatar
                            user={user}
                            size="large"
                        />

                        <div>
                            <strong>
                                @{user.username}
                            </strong>

                            <span>
                                {user.email}
                            </span>
                        </div>
                    </div>


                    <form
                        className="panel-form settings-form"
                        onSubmit={saveAccount}
                    >
                        <label>
                            Full name

                            <input
                                name="fullName"
                                value={form.fullName}
                                onChange={
                                    handleProfileChange
                                }
                                placeholder="Your full name"
                                required
                            />
                        </label>


                        <label>
                            Email

                            <input
                                type="email"
                                name="email"
                                value={form.email}
                                onChange={
                                    handleProfileChange
                                }
                                placeholder="you@example.com"
                                required
                            />
                        </label>


                        <label>
                            Bio / description

                            <textarea
                                name="description"
                                value={
                                    form.description
                                }
                                onChange={
                                    handleProfileChange
                                }
                                rows="4"
                                maxLength={500}
                                placeholder="Tell people a little about yourself..."
                            />

                            <span className="field-hint">
                                {
                                    form.description
                                        .length
                                }
                                /500 characters
                            </span>
                        </label>


                        <div className="settings-buttons">
                            <button
                                className="button"
                                type="submit"
                                disabled={
                                    savingProfile ||
                                    !hasProfileChanges
                                }
                            >
                                {savingProfile
                                    ? "Saving..."
                                    : "Save profile"}
                            </button>

                            <button
                                className="button button-ghost"
                                type="button"
                                onClick={
                                    resetProfile
                                }
                                disabled={
                                    savingProfile ||
                                    !hasProfileChanges
                                }
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </section>


                {/* MEDIA IDENTITY */}

                <section className="settings-panel">

                    <div className="settings-panel-heading">
                        <div>
                            <p className="eyebrow">
                                Visual identity
                            </p>

                            <h2>
                                Media identity
                            </h2>
                        </div>

                        <span className="settings-panel-number">
                            02
                        </span>
                    </div>


                    <div className="media-settings-list">

                        {[
                            "avatar",
                            "coverImage",
                        ].map((name) => {
                            const isAvatar =
                                name === "avatar";

                            const hasFile =
                                Boolean(
                                    files[name]
                                );

                            return (
                                <div
                                    className={`image-setting ${
                                        hasFile
                                            ? "has-pending-file"
                                            : ""
                                    }`}
                                    key={name}
                                >

                                    <div className="image-setting-preview">
                                        {previews[name] ? (
                                            <img
                                                className={
                                                    isAvatar
                                                        ? "settings-avatar-preview"
                                                        : "settings-cover-preview"
                                                }
                                                src={
                                                    previews[
                                                        name
                                                    ]
                                                }
                                                alt={
                                                    `${
                                                        isAvatar
                                                            ? "Profile picture"
                                                            : "Channel cover"
                                                    } preview`
                                                }
                                            />
                                        ) : isAvatar ? (
                                            <div className="settings-image-placeholder avatar-placeholder">
                                                {getInitials(
                                                    user.fullName ||
                                                        user.username
                                                )}
                                            </div>
                                        ) : (
                                            <div className="settings-image-placeholder">
                                                <svg
                                                    viewBox="0 0 24 24"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    strokeWidth="1.5"
                                                    aria-hidden="true"
                                                >
                                                    <rect
                                                        x="3"
                                                        y="5"
                                                        width="18"
                                                        height="14"
                                                        rx="2"
                                                    />
                                                    <circle
                                                        cx="9"
                                                        cy="10"
                                                        r="1.5"
                                                    />
                                                    <path d="M21 16l-5.5-5-5 5-2.5-2.5L3 17" />
                                                </svg>
                                                No cover image
                                            </div>
                                        )}
                                    </div>


                                    <div className="image-setting-content">

                                        <strong>
                                            {isAvatar
                                                ? "Profile picture"
                                                : "Channel cover"}
                                        </strong>

                                        <span>
                                            {isAvatar
                                                ? "Square images work best."
                                                : "A wide image works best for your channel."}
                                        </span>


                                        <label className="file-button">
                                            Choose image

                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={(
                                                    event
                                                ) =>
                                                    chooseFile(
                                                        name,
                                                        event
                                                            .target
                                                            .files?.[0]
                                                    )
                                                }
                                            />
                                        </label>


                                        {files[name] && (
                                            <span className="file-info">
                                                {
                                                    files[
                                                        name
                                                    ].name
                                                }
                                            </span>
                                        )}


                                        {hasFile && (
                                            <div className="settings-buttons">

                                                <button
                                                    className="button"
                                                    type="button"
                                                    onClick={() =>
                                                        saveFile(
                                                            name
                                                        )
                                                    }
                                                    disabled={
                                                        savingMedia[
                                                            name
                                                        ]
                                                    }
                                                >
                                                    {savingMedia[
                                                        name
                                                    ]
                                                        ? "Uploading..."
                                                        : "Save"}
                                                </button>


                                                <button
                                                    className="button button-muted"
                                                    type="button"
                                                    onClick={() =>
                                                        cancelFile(
                                                            name
                                                        )
                                                    }
                                                    disabled={
                                                        savingMedia[
                                                            name
                                                        ]
                                                    }
                                                >
                                                    Cancel
                                                </button>

                                            </div>
                                        )}

                                    </div>
                                </div>
                            );
                        })}

                    </div>
                </section>


                {/* SECURITY */}

                <section className="settings-panel">

                    <div className="settings-panel-heading">
                        <div>
                            <p className="eyebrow">
                                Protection
                            </p>

                            <h2>Security</h2>
                        </div>

                        <span className="settings-panel-number">
                            03
                        </span>
                    </div>


                    <form
                        className="panel-form settings-form"
                        onSubmit={savePassword}
                    >

                        <label>
                            Current password

                            <div className="password-setting">

                                <input
                                    type={
                                        showPasswords.old
                                            ? "text"
                                            : "password"
                                    }
                                    value={
                                        password.oldPassword
                                    }
                                    onChange={(event) =>
                                        setPassword(
                                            (current) => ({
                                                ...current,
                                                oldPassword:
                                                    event
                                                        .target
                                                        .value,
                                            })
                                        )
                                    }
                                    autoComplete="current-password"
                                    required
                                />

                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowPasswords(
                                            (current) => ({
                                                ...current,
                                                old:
                                                    !current.old,
                                            })
                                        )
                                    }
                                >
                                    {showPasswords.old
                                        ? "Hide"
                                        : "Show"}
                                </button>

                            </div>
                        </label>


                        <label>
                            New password

                            <div className="password-setting">

                                <input
                                    type={
                                        showPasswords.new
                                            ? "text"
                                            : "password"
                                    }
                                    value={
                                        password.newPassword
                                    }
                                    onChange={(event) =>
                                        setPassword(
                                            (current) => ({
                                                ...current,
                                                newPassword:
                                                    event
                                                        .target
                                                        .value,
                                            })
                                        )
                                    }
                                    autoComplete="new-password"
                                    minLength={6}
                                    required
                                />

                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowPasswords(
                                            (current) => ({
                                                ...current,
                                                new:
                                                    !current.new,
                                            })
                                        )
                                    }
                                >
                                    {showPasswords.new
                                        ? "Hide"
                                        : "Show"}
                                </button>

                            </div>

                            <span className="field-hint">
                                Use at least 6 characters.
                            </span>
                        </label>


                        <button
                            className="button button-ghost"
                            type="submit"
                            disabled={
                                savingPassword ||
                                !password.oldPassword ||
                                !password.newPassword
                            }
                        >
                            {savingPassword
                                ? "Updating..."
                                : "Change password"}
                        </button>

                    </form>
                </section>


                {/* APPEARANCE */}

                <section className="settings-panel">

                    <div className="settings-panel-heading">
                        <div>
                            <p className="eyebrow">
                                Experience
                            </p>

                            <h2>Appearance</h2>
                        </div>

                        <span className="settings-panel-number">
                            04
                        </span>
                    </div>


                    <p className="settings-description">
                        Choose how Videoly should look
                        on this device.
                    </p>


                    <div
                        className="theme-options"
                        role="radiogroup"
                        aria-label="Theme"
                    >
                        {[
                            [
                                "dark",
                                "Dark",
                                "A focused, low-light interface.",
                            ],
                            [
                                "light",
                                "Light",
                                "A brighter reading experience.",
                            ],
                            [
                                "system",
                                "System",
                                "Follow your device preference.",
                            ],
                        ].map(
                            ([
                                option,
                                label,
                                description,
                            ]) => (
                                <button
                                    key={option}
                                    type="button"
                                    className={`theme-option ${
                                        theme === option
                                            ? "selected"
                                            : ""
                                    }`}
                                    onClick={() =>
                                        setTheme(
                                            option
                                        )
                                    }
                                    role="radio"
                                    aria-checked={
                                        theme ===
                                        option
                                    }
                                >
                                    <span
                                        className="theme-radio"
                                        aria-hidden="true"
                                    >
                                        {theme ===
                                        option
                                            ? "✓"
                                            : ""}
                                    </span>

                                    <span>
                                        <strong>
                                            {label}
                                        </strong>

                                        <small>
                                            {
                                                description
                                            }
                                        </small>
                                    </span>
                                </button>
                            )
                        )}
                    </div>


                    <div className="settings-subsection">

                        <div className="settings-subsection-heading">
                            <h3>
                                Notifications
                            </h3>

                            <span>
                                Saved on this device
                            </span>
                        </div>


                        <label className="toggle-row">
                            <input
                                type="checkbox"
                                checked={
                                    notifications.creatorUpdates
                                }
                                onChange={(event) =>
                                    toggleNotification(
                                        "creatorUpdates",
                                        event.target
                                            .checked
                                    )
                                }
                            />

                            <span>
                                <strong>
                                    Creator updates
                                </strong>

                                <small>
                                    Updates from channels
                                    you follow.
                                </small>
                            </span>
                        </label>


                        <label className="toggle-row">
                            <input
                                type="checkbox"
                                checked={
                                    notifications.productAnnouncements
                                }
                                onChange={(event) =>
                                    toggleNotification(
                                        "productAnnouncements",
                                        event.target
                                            .checked
                                    )
                                }
                            />

                            <span>
                                <strong>
                                    Product announcements
                                </strong>

                                <small>
                                    Occasional news about
                                    Videoly.
                                </small>
                            </span>
                        </label>

                    </div>
                </section>


                {/* ACCOUNT */}

                <section className="settings-panel account-danger">

                    <div>
                        <p className="eyebrow">
                            Session
                        </p>

                        <h2>Account</h2>

                        <p>
                            Sign out of Videoly on
                            this device.
                        </p>
                    </div>


                    <button
                        className="button button-danger"
                        type="button"
                        onClick={handleLogout}
                        disabled={loggingOut}
                    >
                        {loggingOut
                            ? "Signing out..."
                            : "Log out"}
                    </button>

                </section>

            </div>
        </main>
    );
};

export default Settings;