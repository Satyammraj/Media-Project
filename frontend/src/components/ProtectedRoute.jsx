import { Navigate, Outlet, useLocation } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

const ProtectedRoute = () => {
    const { user, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return (
            <div className="auth-loading">
                <ProtectedRouteStyles />

                <div className="auth-loading-card">
                    <div className="loading-mark">
                        V
                    </div>

                    <div
                        className="loading-spinner"
                        aria-hidden="true"
                    />

                    <div>
                        <strong>Checking your account</strong>
                        <p>
                            Just a moment...
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    if (!user) {
        return (
            <Navigate
                to="/login"
                replace
                state={{
                    from:
                        location.pathname +
                        location.search,
                }}
            />
        );
    }

    return <Outlet />;
};

/* =================================================================
   STYLES — matches the AppShell "editing studio" theme. Reads the
   same --accent / --ink variables set at :root by AppShell, with
   inline fallbacks so this still looks right on its own (this
   screen can render before AppShell's provider tree is mounted).
   ================================================================= */

const ProtectedRouteStyles = () => (
    <style>{`
        .auth-loading {
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            background: var(--ink, #14151a);
        }

        .auth-loading-card {
            display: flex;
            align-items: center;
            gap: 16px;
            padding: 22px 26px;
            border-radius: var(--radius-md, 12px);
            background: var(--surface, #1b1d24);
            border: 1px solid var(--border, rgba(255, 255, 255, 0.08));
            box-shadow: var(--shadow-menu, 0 12px 32px rgba(0, 0, 0, 0.45));
        }

        .loading-mark {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: 38px;
            height: 38px;
            flex-shrink: 0;
            border-radius: 10px;
            background: linear-gradient(
                155deg,
                var(--accent, #cf9d56),
                #a97c3c
            );
            color: #14151a;
            font-weight: 700;
            font-size: 17px;
        }

        .loading-spinner {
            width: 20px;
            height: 20px;
            flex-shrink: 0;
            border-radius: 50%;
            border: 2px solid var(--border, rgba(255, 255, 255, 0.08));
            border-top-color: var(--accent, #cf9d56);
            animation: loading-spin 0.7s linear infinite;
        }

        @keyframes loading-spin {
            to {
                transform: rotate(360deg);
            }
        }

        .auth-loading-card strong {
            display: block;
            font-size: 14px;
            color: var(--text, #f1efe9);
        }

        .auth-loading-card p {
            margin: 2px 0 0;
            font-size: 12.5px;
            color: var(--text-muted, #9a9ba6);
        }

        @media (prefers-reduced-motion: reduce) {
            .loading-spinner {
                animation: none;
            }
        }
    `}</style>
);

export default ProtectedRoute;