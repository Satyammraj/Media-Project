import { Link, Route, Routes } from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/Home";
import VideoDetails from "./pages/VideoDetails";
import Dashboard from "./pages/Dashboard";
import Upload from "./pages/Upload";
import Channel from "./pages/Channel";
import Settings from "./pages/Settings";
import LibraryPage from "./pages/LibraryPage";

import AppShell from "./components/AppShell";
import ProtectedRoute from "./components/ProtectedRoute";

const NotFoundStyles = () => (
    <style>{`
        .not-found-state {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            text-align: center;
            gap: 8px;
            padding: 64px 24px;
        }

        .not-found-number {
            font-size: 96px;
            font-weight: 700;
            line-height: 1;
            color: var(--accent, #cf9d56);
            letter-spacing: -2px;
        }

        .not-found-state .eyebrow {
            text-transform: uppercase;
            letter-spacing: 0.08em;
            font-size: 12px;
            color: var(--text-muted, #9a9ba6);
            margin-top: 8px;
        }

        .not-found-state h1 {
            color: var(--text, #f1efe9);
            font-size: 24px;
            margin: 4px 0;
        }

        .not-found-state .muted {
            color: var(--text-muted, #9a9ba6);
            max-width: 420px;
            margin-bottom: 16px;
        }

        .not-found-state .button {
            transition: background-color 0.2s var(--ease, cubic-bezier(0.4, 0, 0.2, 1)),
                        color 0.2s var(--ease, cubic-bezier(0.4, 0, 0.2, 1));
        }
    `}</style>
);

const NotFound = () => {
    return (
        <main className="center-state not-found-state">
            <NotFoundStyles />

            <div
                className="not-found-number"
                aria-hidden="true"
            >
                404
            </div>

            <p className="eyebrow">
                Page not found
            </p>

            <h1>
                This page wandered off.
            </h1>

            <p className="muted">
                The page you're looking for doesn't
                exist or may have moved somewhere else.
            </p>

            <Link
                className="button"
                to="/"
            >
                Back to discovery
            </Link>
        </main>
    );
};

function App() {
    return (
        <Routes>
            {/* ───────────────── PUBLIC AUTH ───────────────── */}

            <Route
                path="/login"
                element={<Login />}
            />

            <Route
                path="/register"
                element={<Register />}
            />

            {/* ───────────────── APPLICATION SHELL ───────────────── */}

            <Route element={<AppShell />}>
                {/* Public */}
                <Route
                    path="/"
                    element={<Home />}
                />

                <Route
                    path="/watch/:videoId"
                    element={<VideoDetails />}
                />

                <Route
                    path="/channel/:username"
                    element={<Channel />}
                />

                {/* Protected */}
                <Route element={<ProtectedRoute />}>
                    <Route
                        path="/dashboard"
                        element={<Dashboard />}
                    />

                    <Route
                        path="/upload"
                        element={<Upload />}
                    />

                    <Route
                        path="/settings"
                        element={<Settings />}
                    />

                    <Route
                        path="/history"
                        element={<LibraryPage view="history" />}
                    />

                    <Route
                        path="/liked"
                        element={<LibraryPage view="liked" />}
                    />

                    <Route
                        path="/subscriptions"
                        element={<LibraryPage view="subscriptions" />}
                    />

                    <Route
                        path="/playlists"
                        element={<LibraryPage view="playlists" />}
                    />
                </Route>

                {/* ───────────────── 404 (catches anything under the shell) ───────────────── */}

                <Route
                    path="*"
                    element={<NotFound />}
                />
            </Route>
        </Routes>
    );
}

export default App;