import { useEffect, useRef, useState } from "react";
import {
    Link,
    useLocation,
    useNavigate,
} from "react-router-dom";

import { useAuth } from "../context/AuthContext";

const Login = () => {
    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const [form, setForm] = useState({
        email: "",
        username: "",
        password: "",
    });

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    // Guards against setting state after this page has unmounted —
    // e.g. the user clicks "Create an account" (or otherwise
    // navigates away) while a login request is still in flight.
    const isMountedRef = useRef(true);

    useEffect(() => {
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

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (loading) return;

        const email = form.email.trim();
        const username = form.username.trim();
        const password = form.password;

        if (!email && !username) {
            setError(
                "Enter your email or username to continue."
            );
            return;
        }

        if (!password) {
            setError(
                "Enter your password to continue."
            );
            return;
        }

        try {
            setError("");
            setLoading(true);

            await login({
                email,
                username,
                password,
            });

            if (!isMountedRef.current) return;

            const destination =
                location.state?.from || "/";

            navigate(destination, {
                replace: true,
            });
        } catch (requestError) {
            if (!isMountedRef.current) return;

            setError(
                requestError?.response?.data?.message ||
                    "We couldn't sign you in. Please check your details and try again."
            );
        } finally {
            if (isMountedRef.current) {
                setLoading(false);
            }
        }
    };

    return (
        <main className="auth-page">
            <LoginStyles />

            <section className="auth-card">

                {/* Brand */}
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

                {/* Header */}
                <div className="auth-heading">
                    <p className="eyebrow">
                        Welcome back
                    </p>

                    <h1>
                        Return to the story.
                    </h1>

                    <p className="lede">
                        Sign in to keep watching, support
                        creators, and manage your channel.
                    </p>
                </div>

                {/* Error */}
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

                {/* Form */}
                <form
                    className="panel-form auth-form"
                    onSubmit={handleSubmit}
                    noValidate
                >
                    {/* Email */}
                    <div className="auth-field">
                        <label htmlFor="login-email">
                            Email
                        </label>

                        <input
                            id="login-email"
                            type="email"
                            name="email"
                            placeholder="you@example.com"
                            value={form.email}
                            onChange={handleChange}
                            autoComplete="email"
                            autoFocus
                        />
                    </div>

                    {/* Divider */}
                    <div
                        className="auth-divider"
                        aria-hidden="true"
                    >
                        <span>or</span>
                    </div>

                    {/* Username */}
                    <div className="auth-field">
                        <label htmlFor="login-username">
                            Username
                        </label>

                        <input
                            id="login-username"
                            type="text"
                            name="username"
                            placeholder="your username"
                            value={form.username}
                            onChange={handleChange}
                            autoComplete="username"
                        />
                    </div>

                    {/* Password */}
                    <div className="auth-field">
                        <div className="field-label-row">
                            <label htmlFor="login-password">
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

                        <div className="password-field">
                            <input
                                id="login-password"
                                type={
                                    showPassword
                                        ? "text"
                                        : "password"
                                }
                                name="password"
                                placeholder="Enter your password"
                                value={form.password}
                                onChange={handleChange}
                                autoComplete="current-password"
                            />
                        </div>
                    </div>

                    {/* Submit */}
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
                                Signing in...
                            </>
                        ) : (
                            <>
                                Sign in
                                <span aria-hidden="true">
                                    →
                                </span>
                            </>
                        )}
                    </button>
                </form>

                {/* Footer */}
                <div className="auth-footer">
                    <p className="auth-switch">
                        New to Videoly?{" "}
                        <Link to="/register">
                            Create an account
                        </Link>
                    </p>

                    <p className="auth-note">
                        By continuing, you're joining a
                        community built around good
                        stories and great creators.
                    </p>
                </div>

            </section>
        </main>
    );
};

/* =================================================================
   STYLES — matches the AppShell theme. .eyebrow/.lede/.button/
   .notice.error mirror the values used in Dashboard/Home/Library
   for consistency; the rest (.auth-*, .panel-form, .password-*)
   is specific to the auth pages (Login/Register share this pattern).
   ================================================================= */

const LoginStyles = () => (
    <style>{`
        .auth-page {
            min-height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 40px 20px;
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

        .auth-divider {
            display: flex;
            align-items: center;
            gap: 12px;
            color: var(--text-muted, #9a9ba6);
            font-size: 11.5px;
            text-transform: uppercase;
            letter-spacing: 0.06em;
        }

        .auth-divider::before,
        .auth-divider::after {
            content: "";
            flex: 1;
            height: 1px;
            background: var(--border, rgba(255, 255, 255, 0.08));
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

        .password-field {
            display: flex;
        }

        .password-field input {
            width: 100%;
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
            animation: auth-spin 0.7s linear infinite;
        }

        @keyframes auth-spin {
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
        }
    `}</style>
);

export default Login;