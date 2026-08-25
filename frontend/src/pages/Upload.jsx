import {
    useEffect,
    useRef,
    useState,
} from "react";

import {
    Navigate,
    useNavigate,
} from "react-router-dom";

import { useAuth } from "../context/AuthContext";

import { publishVideo } from "../services/api";

const formatFileSize = (bytes = 0) => {
    if (!bytes) return "0 MB";

    const mb = bytes / (1024 * 1024);

    if (mb < 1024) {
        return `${mb.toFixed(1)} MB`;
    }

    return `${(mb / 1024).toFixed(2)} GB`;
};

const formatDuration = (seconds) => {
    if (!seconds || !Number.isFinite(seconds)) {
        return "";
    }

    const totalSeconds = Math.floor(seconds);

    const hours = Math.floor(
        totalSeconds / 3600
    );

    const minutes = Math.floor(
        (totalSeconds % 3600) / 60
    );

    const remainingSeconds =
        totalSeconds % 60;

    if (hours > 0) {
        return `${hours}:${String(
            minutes
        ).padStart(2, "0")}:${String(
            remainingSeconds
        ).padStart(2, "0")}`;
    }

    return `${minutes}:${String(
        remainingSeconds
    ).padStart(2, "0")}`;
};

const UploadStyles = () => (
    <style>{`
        .upload-page {
            display: flex;
            flex-direction: column;
            gap: 24px;
            color: var(--text, #f1efe9);
        }

        .center-state {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 12px;
            min-height: 320px;
            color: var(--text-muted, #9a9ba6);
            font-size: 0.95rem;
        }

        .loading-spinner,
        .button-spinner {
            width: 18px;
            height: 18px;
            border-radius: 50%;
            border: 2px solid var(--border, rgba(255, 255, 255, 0.08));
            border-top-color: var(--accent, #cf9d56);
            animation: upload-spin 0.8s linear infinite;
        }

        .button-spinner {
            width: 14px;
            height: 14px;
            border-width: 2px;
            border-top-color: var(--ink, #14151a);
        }

        @keyframes upload-spin {
            to { transform: rotate(360deg); }
        }

        .upload-header {
            display: flex;
            align-items: flex-start;
            justify-content: space-between;
            gap: 24px;
            flex-wrap: wrap;
        }

        .eyebrow {
            text-transform: uppercase;
            letter-spacing: 0.08em;
            font-size: 0.72rem;
            color: var(--accent, #cf9d56);
            margin: 0 0 6px;
            font-weight: 600;
        }

        .upload-header h1 {
            margin: 0 0 6px;
            font-size: 1.6rem;
        }

        .upload-header .lede {
            margin: 0;
            color: var(--text-muted, #9a9ba6);
            max-width: 480px;
        }

        .upload-step-indicator {
            display: flex;
            align-items: center;
            gap: 8px;
            background: var(--surface, #1b1d24);
            border: 1px solid var(--border, rgba(255, 255, 255, 0.08));
            border-radius: 999px;
            padding: 8px 16px;
            font-size: 0.8rem;
            color: var(--text-muted, #9a9ba6);
        }

        .upload-step-indicator .active {
            width: 22px;
            height: 22px;
            border-radius: 50%;
            background: var(--accent, #cf9d56);
            color: var(--ink, #14151a);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 0.72rem;
            font-weight: 700;
        }

        .notice {
            display: flex;
            gap: 12px;
            padding: 14px 16px;
            border-radius: var(--radius-sm, 8px);
            border: 1px solid var(--border, rgba(255, 255, 255, 0.08));
        }

        .notice.error.upload-error {
            background: rgba(226, 104, 92, 0.14);
            border-color: rgba(226, 104, 92, 0.3);
        }

        .auth-error-icon {
            flex-shrink: 0;
            width: 22px;
            height: 22px;
            border-radius: 50%;
            background: var(--danger, #e2685c);
            color: var(--text, #f1efe9);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 0.8rem;
            font-weight: 700;
        }

        .upload-error strong {
            display: block;
            font-size: 0.9rem;
            margin-bottom: 2px;
            color: var(--text, #f1efe9);
        }

        .upload-error p {
            margin: 0;
            color: var(--text-muted, #9a9ba6);
            font-size: 0.85rem;
        }

        .upload-form {
            display: flex;
            flex-direction: column;
            gap: 20px;
        }

        .upload-panel {
            background: var(--surface, #1b1d24);
            border: 1px solid var(--border, rgba(255, 255, 255, 0.08));
            border-radius: var(--radius-lg, 16px);
            padding: 22px;
            display: flex;
            flex-direction: column;
            gap: 16px;
        }

        .upload-panel-heading {
            display: flex;
            align-items: flex-start;
            justify-content: space-between;
        }

        .upload-panel-heading h2 {
            margin: 0;
            font-size: 1.05rem;
        }

        .upload-panel-heading > span {
            font-size: 0.75rem;
            color: var(--text-muted, #9a9ba6);
            border: 1px solid var(--border, rgba(255, 255, 255, 0.08));
            border-radius: 999px;
            padding: 2px 9px;
        }

        .panel-form {
            display: flex;
            flex-direction: column;
            gap: 16px;
        }

        .panel-form label {
            display: flex;
            flex-direction: column;
            gap: 6px;
            font-size: 0.85rem;
            color: var(--text-muted, #9a9ba6);
        }

        .panel-form input,
        .panel-form textarea {
            background: var(--surface-raised, #23252e);
            border: 1px solid var(--border, rgba(255, 255, 255, 0.08));
            border-radius: var(--radius-sm, 8px);
            padding: 10px 12px;
            color: var(--text, #f1efe9);
            font: inherit;
            transition: border-color 0.2s var(--ease, cubic-bezier(0.4, 0, 0.2, 1));
        }

        .panel-form input:focus-visible,
        .panel-form textarea:focus-visible {
            border-color: var(--accent, #cf9d56);
        }

        .panel-form textarea {
            resize: vertical;
        }

        .field-hint {
            align-self: flex-end;
            color: var(--text-muted, #9a9ba6);
            font-size: 0.75rem;
        }

        .upload-dropzone,
        .thumbnail-dropzone {
            display: block;
            border: 1px dashed var(--border, rgba(255, 255, 255, 0.08));
            border-radius: var(--radius-md, 12px);
            cursor: pointer;
            overflow: hidden;
            transition: border-color 0.2s var(--ease, cubic-bezier(0.4, 0, 0.2, 1));
        }

        .upload-dropzone:hover,
        .thumbnail-dropzone:hover {
            border-color: var(--accent, #cf9d56);
        }

        .upload-dropzone input,
        .thumbnail-dropzone input {
            position: absolute;
            width: 1px;
            height: 1px;
            overflow: hidden;
            opacity: 0;
        }

        .upload-empty {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 6px;
            padding: 48px 20px;
            text-align: center;
            color: var(--text-muted, #9a9ba6);
        }

        .upload-empty strong {
            color: var(--text, #f1efe9);
            font-size: 0.95rem;
        }

        .upload-empty span {
            font-size: 0.82rem;
        }

        .upload-empty small {
            font-size: 0.72rem;
            opacity: 0.8;
        }

        .thumbnail-empty {
            padding: 32px 20px;
        }

        .upload-icon {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            background: var(--accent-soft, rgba(207, 157, 86, 0.14));
            color: var(--accent, #cf9d56);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.1rem;
            font-weight: 700;
        }

        .video-preview-container {
            display: flex;
            flex-direction: column;
        }

        .upload-video-preview {
            width: 100%;
            max-height: 360px;
            background: #000;
            display: block;
        }

        .file-preview-info {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 12px 16px;
            background: var(--surface-raised, #23252e);
            gap: 12px;
        }

        .file-preview-info strong {
            display: block;
            font-size: 0.85rem;
        }

        .file-preview-info span {
            display: block;
            color: var(--text-muted, #9a9ba6);
            font-size: 0.75rem;
        }

        .change-file {
            flex-shrink: 0;
            font-size: 0.78rem;
            color: var(--accent, #cf9d56);
            font-weight: 600;
        }

        .thumbnail-preview-container {
            position: relative;
        }

        .upload-thumbnail-preview {
            width: 100%;
            max-height: 320px;
            object-fit: cover;
            display: block;
        }

        .thumbnail-preview-overlay {
            position: absolute;
            inset: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            background: rgba(20, 21, 26, 0.55);
            opacity: 0;
            transition: opacity 0.2s var(--ease, cubic-bezier(0.4, 0, 0.2, 1));
            color: var(--text, #f1efe9);
            font-size: 0.85rem;
            font-weight: 600;
        }

        .thumbnail-dropzone:hover .thumbnail-preview-overlay {
            opacity: 1;
        }

        .publish-panel {
            background: var(--surface, #1b1d24);
            border: 1px solid var(--border, rgba(255, 255, 255, 0.08));
            border-radius: var(--radius-lg, 16px);
            padding: 22px;
            display: flex;
            flex-direction: column;
            gap: 16px;
        }

        .publish-panel h2 {
            margin: 0 0 4px;
            font-size: 1.05rem;
        }

        .publish-panel p {
            margin: 0;
            color: var(--text-muted, #9a9ba6);
            font-size: 0.85rem;
        }

        .upload-progress {
            display: flex;
            flex-direction: column;
            gap: 8px;
        }

        .progress-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            font-size: 0.82rem;
        }

        .upload-progress progress {
            width: 100%;
            height: 8px;
            border-radius: 999px;
            overflow: hidden;
            accent-color: var(--accent, #cf9d56);
        }

        .muted {
            color: var(--text-muted, #9a9ba6);
            font-size: 0.75rem;
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
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            transition: opacity 0.2s var(--ease, cubic-bezier(0.4, 0, 0.2, 1));
        }

        .button:disabled {
            opacity: 0.5;
            cursor: not-allowed;
        }

        .button:not(:disabled):hover {
            opacity: 0.9;
        }

        .button-large {
            padding: 13px 22px;
            font-size: 0.92rem;
            width: 100%;
        }

        .publish-button span {
            font-size: 1rem;
        }
    `}</style>
);

const Upload = () => {
    const { user, loading } = useAuth();
    const navigate = useNavigate();

    const [form, setForm] = useState({
        title: "",
        description: "",
    });

    const [videoFile, setVideoFile] =
        useState(null);

    const [thumbnail, setThumbnail] =
        useState(null);

    const [error, setError] = useState("");
    const [saving, setSaving] = useState(false);
    const [progress, setProgress] = useState(0);

    const [preview, setPreview] = useState({
        video: "",
        thumbnail: "",
    });

    const [videoDuration, setVideoDuration] =
        useState(0);

    // Guards setState calls that would otherwise fire after the component
    // has unmounted (e.g. the user navigates away mid-upload, or the
    // periodic onUploadProgress callback fires after the request/component
    // is gone).
    const isMountedRef = useRef(true);

    useEffect(() => {
        isMountedRef.current = true;

        return () => {
            isMountedRef.current = false;
        };
    }, []);

    useEffect(() => {
        return () => {
            if (
                preview.video?.startsWith("blob:")
            ) {
                URL.revokeObjectURL(
                    preview.video
                );
            }

            if (
                preview.thumbnail?.startsWith(
                    "blob:"
                )
            ) {
                URL.revokeObjectURL(
                    preview.thumbnail
                );
            }
        };
    }, [preview.video, preview.thumbnail]);

    if (loading) {
        return (
            <div className="center-state">
                <UploadStyles />
                <div
                    className="loading-spinner"
                    aria-hidden="true"
                />
                <span>
                    Loading account...
                </span>
            </div>
        );
    }

    if (!user) {
        return (
            <Navigate
                to="/login"
                replace
            />
        );
    }

    const change = (event) => {
        const { name, value } = event.target;

        setForm((current) => ({
            ...current,
            [name]: value,
        }));

        if (error) {
            setError("");
        }
    };

    const handleVideoChange = (event) => {
        const file = event.target.files?.[0];

        if (!file) return;

        if (!file.type.startsWith("video/")) {
            setError(
                "Please choose a valid video file."
            );
            return;
        }

        if (
            preview.video?.startsWith("blob:")
        ) {
            URL.revokeObjectURL(
                preview.video
            );
        }

        const videoUrl =
            URL.createObjectURL(file);

        setVideoFile(file);

        setPreview((current) => ({
            ...current,
            video: videoUrl,
        }));

        setVideoDuration(0);
        setError("");
    };

    const handleThumbnailChange = (event) => {
        const file = event.target.files?.[0];

        if (!file) return;

        if (!file.type.startsWith("image/")) {
            setError(
                "Please choose a valid thumbnail image."
            );
            return;
        }

        if (
            preview.thumbnail?.startsWith(
                "blob:"
            )
        ) {
            URL.revokeObjectURL(
                preview.thumbnail
            );
        }

        const imageUrl =
            URL.createObjectURL(file);

        setThumbnail(file);

        setPreview((current) => ({
            ...current,
            thumbnail: imageUrl,
        }));

        setError("");
    };

    const handleVideoLoaded = (event) => {
        setVideoDuration(
            event.currentTarget.duration || 0
        );
    };

    const submit = async (event) => {
        event.preventDefault();

        if (saving) return;

        if (!videoFile) {
            setError(
                "Please choose a video to upload."
            );
            return;
        }

        if (!thumbnail) {
            setError(
                "Please choose a thumbnail."
            );
            return;
        }

        if (!form.title.trim()) {
            setError(
                "Please give your video a title."
            );
            return;
        }

        if (!form.description.trim()) {
            setError(
                "Please add a description."
            );
            return;
        }

        try {
            setSaving(true);
            setProgress(0);
            setError("");

            const data = new FormData();

            data.append(
                "title",
                form.title.trim()
            );

            data.append(
                "description",
                form.description.trim()
            );

            data.append(
                "videoFile",
                videoFile
            );

            data.append(
                "thumbnail",
                thumbnail
            );

            await publishVideo(data, {
                onUploadProgress: (event) => {
                    if (!event.total) return;
                    if (!isMountedRef.current) return;

                    setProgress(
                        Math.round(
                            (event.loaded /
                                event.total) *
                                100
                        )
                    );
                },
            });

            if (!isMountedRef.current) return;

            setProgress(100);

            navigate("/dashboard", {
                replace: true,
                state: {
                    uploaded: true,
                },
            });
        } catch (requestError) {
            if (!isMountedRef.current) return;

            setError(
                requestError?.response?.data
                    ?.message ||
                    "Upload failed. Please try again."
            );
        } finally {
            if (isMountedRef.current) {
                setSaving(false);
            }
        }
    };

    const canPublish =
        !saving &&
        Boolean(videoFile) &&
        Boolean(thumbnail) &&
        Boolean(form.title.trim()) &&
        Boolean(form.description.trim());

    return (
        <main className="form-page upload-page">
            <UploadStyles />

            {/* ───────────────── HEADER ───────────────── */}
            <header className="upload-header">
                <div>
                    <p className="eyebrow">
                        Creator studio
                    </p>

                    <h1>
                        Publish a new video.
                    </h1>

                    <p className="lede">
                        Give your next idea a clear
                        title, a strong description,
                        and a frame worth clicking.
                    </p>
                </div>

                <div className="upload-step-indicator">
                    <span className="active">
                        01
                    </span>
                    <span>Details</span>
                </div>
            </header>

            {/* ───────────────── ERROR ───────────────── */}
            {error && (
                <div
                    className="notice error upload-error"
                    role="alert"
                >
                    <span
                        className="auth-error-icon"
                        aria-hidden="true"
                    >
                        !
                    </span>

                    <div>
                        <strong>
                            Upload couldn't start
                        </strong>

                        <p>{error}</p>
                    </div>
                </div>
            )}

            <form
                className="upload-form"
                onSubmit={submit}
            >
                {/* ───────────────── DETAILS ───────────────── */}
                <section className="upload-panel upload-details">
                    <div className="upload-panel-heading">
                        <div>
                            <p className="eyebrow">
                                Video details
                            </p>

                            <h2>
                                Tell viewers what to
                                expect.
                            </h2>
                        </div>

                        <span>01</span>
                    </div>

                    <div className="panel-form">
                        <label>
                            Title

                            <input
                                name="title"
                                value={form.title}
                                onChange={change}
                                required
                                maxLength={120}
                                placeholder="What is this video about?"
                            />

                            <small className="field-hint">
                                {form.title.length}
                                /120
                            </small>
                        </label>

                        <label>
                            Description

                            <textarea
                                name="description"
                                value={
                                    form.description
                                }
                                onChange={change}
                                required
                                rows="7"
                                maxLength={5000}
                                placeholder="Tell viewers what they will learn, see, or feel."
                            />

                            <small className="field-hint">
                                {
                                    form.description
                                        .length
                                }
                                /5000
                            </small>
                        </label>
                    </div>
                </section>

                {/* ───────────────── VIDEO ───────────────── */}
                <section className="upload-panel">
                    <div className="upload-panel-heading">
                        <div>
                            <p className="eyebrow">
                                Main media
                            </p>

                            <h2>
                                Choose your video.
                            </h2>
                        </div>

                        <span>02</span>
                    </div>

                    <label className="upload-dropzone">
                        <input
                            type="file"
                            accept="video/*"
                            onChange={
                                handleVideoChange
                            }
                            required
                        />

                        {preview.video ? (
                            <div className="video-preview-container">
                                <video
                                    className="upload-video-preview"
                                    src={
                                        preview.video
                                    }
                                    controls
                                    onLoadedMetadata={
                                        handleVideoLoaded
                                    }
                                />

                                <div className="file-preview-info">
                                    <div>
                                        <strong>
                                            {
                                                videoFile?.name
                                            }
                                        </strong>

                                        <span>
                                            {formatFileSize(
                                                videoFile?.size
                                            )}

                                            {videoDuration >
                                                0 &&
                                                ` · ${formatDuration(
                                                    videoDuration
                                                )}`}
                                        </span>
                                    </div>

                                    <span className="change-file">
                                        Change video
                                    </span>
                                </div>
                            </div>
                        ) : (
                            <div className="upload-empty">
                                <div
                                    className="upload-icon"
                                    aria-hidden="true"
                                >
                                    ↑
                                </div>

                                <strong>
                                    Choose a video
                                </strong>

                                <span>
                                    MP4, WebM and other
                                    supported formats
                                </span>

                                <small>
                                    Click to browse your
                                    files
                                </small>
                            </div>
                        )}
                    </label>
                </section>

                {/* ───────────────── THUMBNAIL ───────────────── */}
                <section className="upload-panel">
                    <div className="upload-panel-heading">
                        <div>
                            <p className="eyebrow">
                                Presentation
                            </p>

                            <h2>
                                Pick your thumbnail.
                            </h2>
                        </div>

                        <span>03</span>
                    </div>

                    <label className="thumbnail-dropzone">
                        <input
                            type="file"
                            accept="image/*"
                            onChange={
                                handleThumbnailChange
                            }
                            required
                        />

                        {preview.thumbnail ? (
                            <div className="thumbnail-preview-container">
                                <img
                                    className="upload-thumbnail-preview"
                                    src={
                                        preview.thumbnail
                                    }
                                    alt="Selected thumbnail preview"
                                />

                                <div className="thumbnail-preview-overlay">
                                    <span>
                                        Change thumbnail
                                    </span>
                                </div>
                            </div>
                        ) : (
                            <div className="upload-empty thumbnail-empty">
                                <div
                                    className="upload-icon"
                                    aria-hidden="true"
                                >
                                    +
                                </div>

                                <strong>
                                    Choose a thumbnail
                                </strong>

                                <span>
                                    Use a clear image that
                                    represents your video.
                                </span>

                                <small>
                                    Click to browse your
                                    files
                                </small>
                            </div>
                        )}
                    </label>
                </section>

                {/* ───────────────── PUBLISH ───────────────── */}
                <section className="publish-panel">
                    <div>
                        <p className="eyebrow">
                            Ready?
                        </p>

                        <h2>
                            {saving
                                ? "Publishing your video..."
                                : "Everything looks good."}
                        </h2>

                        <p>
                            {saving
                                ? "Keep this tab open while your video is being uploaded."
                                : "Review your title, description, video, and thumbnail before publishing."}
                        </p>
                    </div>

                    {saving && (
                        <div className="upload-progress">
                            <div className="progress-header">
                                <span>
                                    Uploading
                                </span>

                                <strong>
                                    {progress}%
                                </strong>
                            </div>

                            <progress
                                value={progress}
                                max="100"
                                aria-label="Upload progress"
                            />

                            <span className="muted">
                                Please don't close this
                                page.
                            </span>
                        </div>
                    )}

                    <button
                        className="button button-large publish-button"
                        type="submit"
                        disabled={!canPublish}
                    >
                        {saving ? (
                            <>
                                <span
                                    className="button-spinner"
                                    aria-hidden="true"
                                />
                                Publishing...
                            </>
                        ) : (
                            <>
                                Publish video
                                <span aria-hidden="true">→</span>
                            </>
                        )}
                    </button>
                </section>
            </form>
        </main>
    );
};

export default Upload;