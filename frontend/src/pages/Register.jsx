import { useEffect, useRef, useState } from "react";

import {
    Link,
    useNavigate,
} from "react-router-dom";

import { useAuth } from "../context/AuthContext";

const Register = () => {
    const { register } = useAuth();
    const navigate = useNavigate();

    const [form, setForm] = useState({
        fullName: "",
        email: "",
        username: "",
        password: "",
    });

    const [avatar, setAvatar] = useState(null);
    const [coverImage, setCoverImage] = useState(null);

    const [avatarPreview, setAvatarPreview] =
        useState("");

    const [coverPreview, setCoverPreview] =
        useState("");

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] =
        useState(false);

    // Guards against setting state after this page has unmounted —
    // e.g. the user clicks "Sign in" (or otherwise navigates away)
    // while account creation is still in flight.
    const isMountedRef = useRef(true);

    useEffect(() => {
        isMountedRef.current = true;//fix loading login
        return () => {
            isMountedRef.current = false;
        };
    }, []);

    const handleChange = (event) => {
        const { name, value } = event.target;

        setForm((current) => ({
            ...current,
            [name]: value,
        }));

        if (error) {
            setError("");
        }
    };

    const handleAvatarChange = (event) => {
        const file = event.target.files?.[0];

        if (!file) {
            setAvatar(null);
            setAvatarPreview("");
            return;
        }

        if (!file.type.startsWith("image/")) {
            setError("Please select a valid image file.");
            return;
        }

        setAvatar(file);
        setAvatarPreview(
            URL.createObjectURL(file)
        );
        setError("");
    };

    const handleCoverChange = (event) => {
        const file = event.target.files?.[0];

        if (!file) {
            setCoverImage(null);
            setCoverPreview("");
            return;
        }

        if (!file.type.startsWith("image/")) {
            setError("Please select a valid image file.");
            return;
        }

        setCoverImage(file);
        setCoverPreview(
            URL.createObjectURL(file)
        );
        setError("");
    };

    // Two separate effects, each keyed to just ONE preview URL.
    // A single effect keyed on [avatarPreview, coverPreview] would
    // revoke BOTH captured URLs any time EITHER one changed —
    // e.g. picking a cover image would revoke the avatar URL that
    // is still actively displayed, breaking that preview <img>.
    // Splitting them means each URL is only revoked when it itself
    // is replaced or the page unmounts.
    useEffect(() => {
        return () => {
            if (avatarPreview) {
                URL.revokeObjectURL(avatarPreview);
            }
        };
    }, [avatarPreview]);

    useEffect(() => {
        return () => {
            if (coverPreview) {
                URL.revokeObjectURL(coverPreview);
            }
        };
    }, [coverPreview]);

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (loading) return;

        const fullName = form.fullName.trim();
        const email = form.email.trim();
        const username = form.username.trim();
        const password = form.password;

        if (!fullName || !email || !username || !password) {
            setError(
                "Please complete all required fields."
            );
            return;
        }

        if (password.length < 6) {
            setError(
                "Your password should be at least 6 characters."
            );
            return;
        }

        try {
            setError("");
            setLoading(true);

            const formData = new FormData();

            formData.append("fullName", fullName);
            formData.append("email", email);
            formData.append("username", username);
            formData.append("password", password);

            if (avatar) {
                formData.append("avatar", avatar);
            }

            if (coverImage) {
                formData.append(
                    "coverImage",
                    coverImage
                );
            }

            await register(formData);

            if (!isMountedRef.current) return;

            navigate("/login", {
                replace: true,
                state: {
                    registered: true,
                },
            });
        } catch (requestError) {
            if (!isMountedRef.current) return;

            setError(
                requestError?.response?.data?.message ||
                    "We couldn't create your account. Please try again."
            );
        } finally {
            if (isMountedRef.current) {
                setLoading(false);
            }
        }
    };

    return (
        <main className="auth-page register-page">
            <RegisterStyles />

            <section className="auth-card register-card">
                {/* ───────────────── BRAND ───────────────── */}
                <Link
                    className="auth-brand"
                    to="/"
                    aria-label="Videoly home"
                >
                    <span className="brand-mark">
                        V
                    </span>

                    <span className="brand-name">
                        Videoly
                    </span>
                </Link>

                {/* ───────────────── HEADER ───────────────── */}
                <div className="auth-heading">
                    <p className="eyebrow">
                        Join the library
                    </p>

                    <h1>
                        Make a channel people remember.
                    </h1>

                    <p className="lede">
                        Create your creator profile and
                        publish work on your own terms.
                    </p>
                </div>

                {/* ───────────────── ERROR ───────────────── */}
                {error && (
                    <div
                        className="notice error auth-error"
                        role="alert"
                    >
                        <span
                            className="auth-error-icon"
                            aria-hidden="true"
                        >
                            !
                        </span>

                        <span>{error}</span>
                    </div>
                )}

                {/* ───────────────── FORM ───────────────── */}
                <form
                    className="panel-form auth-form register-form"
                    onSubmit={handleSubmit}
                    noValidate
                >
                    <div className="auth-field">
                        <label htmlFor="register-name">
                            Full name
                        </label>

                        <input
                            id="register-name"
                            type="text"
                            name="fullName"
                            placeholder="Your full name"
                            value={form.fullName}
                            onChange={handleChange}
                            autoComplete="name"
                            autoFocus
                            required
                        />
                    </div>

                    <div className="auth-field">
                        <label htmlFor="register-email">
                            Email
                        </label>

                        <input
                            id="register-email"
                            type="email"
                            name="email"
                            placeholder="you@example.com"
                            value={form.email}
                            onChange={handleChange}
                            autoComplete="email"
                            required
                        />
                    </div>

                    <div className="auth-field">
                        <label htmlFor="register-username">
                            Username
                        </label>

                        <div className="username-input">
                            <span aria-hidden="true">@</span>

                            <input
                                id="register-username"
                                type="text"
                                name="username"
                                placeholder="yourname"
                                value={form.username}
                                onChange={handleChange}
                                autoComplete="username"
                                required
                            />
                        </div>

                        <small className="field-hint">
                            This will be your public channel
                            address.
                        </small>
                    </div>

                    <div className="auth-field">
                        <div className="field-label-row">
                            <label htmlFor="register-password">
                                Password
                            </label>

                            <button
                                type="button"
                                className="password-toggle"
                                onClick={() =>
                                    setShowPassword(
                                        (value) => !value
                                    )
                                }
                                aria-label={
                                    showPassword
                                        ? "Hide password"
                                        : "Show password"
                                }
                            >
                                {showPassword
                                    ? "Hide"
                                    : "Show"}
                            </button>
                        </div>

                        <input
                            id="register-password"
                            type={
                                showPassword
                                    ? "text"
                                    : "password"
                            }
                            name="password"
                            placeholder="At least 6 characters"
                            value={form.password}
                            onChange={handleChange}
                            autoComplete="new-password"
                            minLength={6}
                            required
                        />
                    </div>

                    {/* ───────────────── PROFILE MEDIA ───────────────── */}
                    <div className="profile-media-heading">
                        <p className="eyebrow">
                            Profile
                        </p>

                        <span>
                            Optional
                        </span>
                    </div>

                    {/* Avatar */}
                    <div className="media-upload">
                        <div className="media-upload-preview avatar-upload-preview">
                            {avatarPreview ? (
                                <img
                                    src={avatarPreview}
                                    alt="Avatar preview"
                                />
                            ) : form.fullName.trim() ? (
                                <span>
                                    {form.fullName
                                        .trim()
                                        .charAt(0)
                                        .toUpperCase()}
                                </span>
                            ) : (
                                <span
                                    className="media-upload-placeholder-icon"
                                    aria-hidden="true"
                                >
                                    ◌
                                </span>
                            )}
                        </div>

                        <div className="media-upload-content">
                            <strong>
                                Profile picture
                            </strong>

                            <p>
                                A square image works best.
                            </p>

                            <label className="file-button">
                                Choose image

                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={
                                        handleAvatarChange
                                    }
                                />
                            </label>

                            {avatar && (
                                <span className="file-selected">
                                    {avatar.name}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Cover */}
                    <div className="media-upload cover-upload">
                        <div className="media-upload-preview cover-upload-preview">
                            {coverPreview ? (
                                <img
                                    src={coverPreview}
                                    alt="Cover preview"
                                />
                            ) : (
                                <span>
                                    Channel cover
                                </span>
                            )}
                        </div>

                        <div className="media-upload-content">
                            <strong>
                                Channel cover
                            </strong>

                            <p>
                                Give your channel a
                                recognizable identity.
                            </p>

                            <label className="file-button">
                                Choose cover

                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={
                                        handleCoverChange
                                    }
                                />
                            </label>

                            {coverImage && (
                                <span className="file-selected">
                                    {coverImage.name}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* ───────────────── SUBMIT ───────────────── */}
                    <button
                        className="button auth-submit"
                        type="submit"
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <span
                                    className="button-spinner"
                                    aria-hidden="true"
                                />
                                Creating account...
                            </>
                        ) : (
                            <>
                                Create account
                                <span aria-hidden="true">
                                    →
                                </span>
                            </>
                        )}
                    </button>
                </form>

                {/* ───────────────── FOOTER ───────────────── */}
                <div className="auth-footer">
                    <p className="auth-switch">
                        Already a member?{" "}
                        <Link to="/login">
                            Sign in
                        </Link>
                    </p>

                    <p className="auth-note">
                        Your profile can be updated later
                        from Settings.
                    </p>
                </div>
            </section>
        </main>
    );
};

/* =================================================================
   STYLES — matches the AppShell theme. The .auth-* / .panel-form /
   .password-* / .button classes mirror the values used in Login.jsx
   so both auth pages stay visually consistent; the .media-upload-*,
   .username-input and .profile-media-heading classes are specific
   to the registration form's extra fields.
   ================================================================= */

const RegisterStyles = () => (
    <style>{`
        .auth-page {
            min-height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 40px 20px;
        }

        .register-page {
            align-items: flex-start;
        }

        .auth-card {
            width: 100%;
            max-width: 420px;
            display: flex;
            flex-direction: column;
            gap: 22px;
            padding: 36px;
            border-radius: var(--radius-lg, 16px);
            background: var(--surface, #1b1d24);
            border: 1px solid var(--border, rgba(255, 255, 255, 0.08));
        }

        .register-card {
            max-width: 480px;
            margin: 0 auto;
        }

        .auth-brand {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            align-self: flex-start;
        }

        .brand-mark {
            width: 30px;
            height: 30px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: var(--radius-sm, 8px);
            background: var(--accent, #cf9d56);
            color: #14151a;
            font-weight: 800;
            font-size: 15px;
        }

        .brand-name {
            font-weight: 700;
            font-size: 15px;
            color: var(--text, #f1efe9);
        }

        .brand-accent {
            color: var(--accent, #cf9d56);
        }

        .eyebrow {
            margin: 0 0 4px;
            font-size: 11px;
            font-weight: 700;
            letter-spacing: 0.08em;
            text-transform: uppercase;
            color: var(--accent, #cf9d56);
        }

        .auth-heading h1 {
            margin: 0;
            font-size: 22px;
            color: var(--text, #f1efe9);
        }

        .lede {
            margin: 6px 0 0;
            font-size: 13.5px;
            line-height: 1.5;
            color: var(--text-muted, #9a9ba6);
        }

        /* ---- Error notice ---- */

        .notice.error.auth-error {
            display: flex;
            align-items: flex-start;
            gap: 10px;
            padding: 12px 14px;
            border-radius: var(--radius-md, 12px);
            background: rgba(226, 104, 92, 0.12);
            border: 1px solid rgba(226, 104, 92, 0.3);
            font-size: 13px;
            color: var(--text, #f1efe9);
        }

        .auth-error-icon {
            width: 18px;
            height: 18px;
            flex-shrink: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 50%;
            background: var(--danger, #e2685c);
            color: #fff;
            font-size: 12px;
            font-weight: 800;
        }

        /* ---- Form ---- */

        .auth-form {
            display: flex;
            flex-direction: column;
            gap: 16px;
        }

        .auth-field {
            display: flex;
            flex-direction: column;
            gap: 6px;
        }

        .auth-field label {
            font-size: 12.5px;
            font-weight: 600;
            color: var(--text-muted, #9a9ba6);
        }

        .auth-field input {
            height: 42px;
            padding: 0 14px;
            border-radius: var(--radius-sm, 8px);
            background: var(--ink, #14151a);
            border: 1px solid var(--border, rgba(255, 255, 255, 0.08));
            color: var(--text, #f1efe9);
            font-size: 14px;
            transition: border-color 0.15s var(--ease, ease);
        }

        .auth-field input::placeholder {
            color: var(--text-muted, #9a9ba6);
        }

        .auth-field input:focus-visible {
            outline: none;
            border-color: var(--accent, #cf9d56);
        }

        .field-hint {
            font-size: 11.5px;
            color: var(--text-muted, #9a9ba6);
        }

        .username-input {
            display: flex;
            align-items: center;
            gap: 6px;
            height: 42px;
            padding: 0 14px;
            border-radius: var(--radius-sm, 8px);
            background: var(--ink, #14151a);
            border: 1px solid var(--border, rgba(255, 255, 255, 0.08));
            transition: border-color 0.15s var(--ease, ease);
        }

        .username-input:focus-within {
            border-color: var(--accent, #cf9d56);
        }

        .username-input span {
            color: var(--text-muted, #9a9ba6);
            font-size: 14px;
        }

        .username-input input {
            flex: 1;
            height: 100%;
            border: none;
            background: transparent;
            padding: 0;
            color: var(--text, #f1efe9);
            font-size: 14px;
        }

        .username-input input:focus-visible {
            outline: none;
        }

        .field-label-row {
            display: flex;
            align-items: center;
            justify-content: space-between;
        }

        .password-toggle {
            font-size: 12px;
            font-weight: 600;
            color: var(--accent, #cf9d56);
            background: none;
            border: none;
            padding: 0;
        }

        .password-toggle:hover {
            text-decoration: underline;
        }

        /* ---- Profile media ---- */

        .profile-media-heading {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-top: 4px;
            padding-top: 16px;
            border-top: 1px solid var(--border, rgba(255, 255, 255, 0.08));
        }

        .profile-media-heading .eyebrow {
            margin: 0;
        }

        .profile-media-heading span {
            font-size: 11px;
            font-weight: 600;
            color: var(--text-muted, #9a9ba6);
        }

        .media-upload {
            display: flex;
            align-items: center;
            gap: 14px;
        }

        .media-upload-preview {
            flex-shrink: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            overflow: hidden;
            background: var(--surface-raised, #23252e);
            border: 1px solid var(--border, rgba(255, 255, 255, 0.08));
            color: var(--text-muted, #9a9ba6);
        }

        .media-upload-preview img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }

        .avatar-upload-preview {
            width: 56px;
            height: 56px;
            border-radius: 50%;
            font-size: 20px;
            font-weight: 700;
            color: var(--accent, #cf9d56);
        }

        .media-upload-placeholder-icon {
            font-size: 20px;
        }

        .cover-upload-preview {
            width: 88px;
            height: 56px;
            border-radius: var(--radius-sm, 8px);
            font-size: 10.5px;
            text-align: center;
            padding: 4px;
        }

        .media-upload-content {
            display: flex;
            flex-direction: column;
            gap: 2px;
        }

        .media-upload-content strong {
            font-size: 13.5px;
            color: var(--text, #f1efe9);
        }

        .media-upload-content p {
            margin: 0 0 4px;
            font-size: 12px;
            color: var(--text-muted, #9a9ba6);
        }

        .file-button {
            display: inline-flex;
            align-items: center;
            width: fit-content;
            height: 30px;
            padding: 0 12px;
            border-radius: 999px;
            background: var(--surface-raised, #23252e);
            border: 1px solid var(--border, rgba(255, 255, 255, 0.08));
            color: var(--text, #f1efe9);
            font-size: 12px;
            font-weight: 600;
            cursor: pointer;
            transition: filter 0.15s var(--ease, ease);
        }

        .file-button:hover {
            filter: brightness(1.1);
        }

        .file-button input[type="file"] {
            position: absolute;
            width: 1px;
            height: 1px;
            padding: 0;
            margin: -1px;
            overflow: hidden;
            clip: rect(0, 0, 0, 0);
            white-space: nowrap;
            border: 0;
        }

        .file-selected {
            display: block;
            margin-top: 4px;
            font-size: 11.5px;
            color: var(--text-muted, #9a9ba6);
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            max-width: 220px;
        }

        /* ---- Submit button ---- */

        .button {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            height: 44px;
            padding: 0 20px;
            border-radius: 999px;
            background: var(--accent, #cf9d56);
            color: #14151a;
            font-size: 14px;
            font-weight: 700;
            border: none;
            transition: filter 0.15s var(--ease, ease);
        }

        .button:hover:not(:disabled) {
            filter: brightness(1.08);
        }

        .button:disabled {
            opacity: 0.7;
            cursor: not-allowed;
        }

        .auth-submit {
            width: 100%;
            margin-top: 4px;
        }

        .button-spinner {
            width: 15px;
            height: 15px;
            border-radius: 50%;
            border: 2px solid rgba(20, 21, 26, 0.35);
            border-top-color: #14151a;
            animation: register-spin 0.7s linear infinite;
        }

        @keyframes register-spin {
            to { transform: rotate(360deg); }
        }

        @media (prefers-reduced-motion: reduce) {
            .button-spinner {
                animation: none;
            }
        }

        /* ---- Footer ---- */

        .auth-footer {
            display: flex;
            flex-direction: column;
            gap: 10px;
            text-align: center;
            padding-top: 6px;
            border-top: 1px solid var(--border, rgba(255, 255, 255, 0.08));
        }

        .auth-switch {
            margin: 0;
            font-size: 13.5px;
            color: var(--text, #f1efe9);
        }

        .auth-switch a {
            color: var(--accent, #cf9d56);
            font-weight: 600;
        }

        .auth-switch a:hover {
            text-decoration: underline;
        }

        .auth-note {
            margin: 0;
            font-size: 12px;
            line-height: 1.5;
            color: var(--text-muted, #9a9ba6);
        }

        @media (max-width: 480px) {
            .auth-card {
                padding: 28px 22px;
            }

            .media-upload {
                align-items: flex-start;
            }
        }
    `}</style>
);

export default Register;