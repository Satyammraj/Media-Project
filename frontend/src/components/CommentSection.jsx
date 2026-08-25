import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
    addComment,
    deleteComment,
    toggleCommentLike,
    updateComment,
} from "../services/api";

import { useAuth } from "../context/AuthContext";
import Avatar from "./Avatar";

const CommentSection = ({ videoId, comments, setComments }) => {
    const { user } = useAuth();
    const navigate = useNavigate();

    const [content, setContent] = useState("");
    const [editing, setEditing] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [processingId, setProcessingId] = useState(null);
    const [error, setError] = useState("");

    const inputRef = useRef(null);

    const resetForm = () => {
        setContent("");
        setEditing(null);
        setError("");
    };

    const submit = async (event) => {
        event.preventDefault();

        if (!user) {
            navigate("/login");
            return;
        }

        const trimmedContent = content.trim();

        if (!trimmedContent || submitting) {
            return;
        }

        try {
            setSubmitting(true);
            setError("");

            if (editing) {
                const response = await updateComment(
                    editing,
                    trimmedContent
                );

                setComments((items) =>
                    items.map((item) =>
                        item._id === editing
                            ? {
                                  ...item,
                                  content:
                                      response.data.data.content,
                              }
                            : item
                    )
                );
            } else {
                const response = await addComment(
                    videoId,
                    trimmedContent
                );

                setComments((items) => [
                    ...items,
                    response.data.data,
                ]);
            }

            resetForm();
        } catch (err) {
            setError(
                err?.response?.data?.message ||
                    "Something went wrong. Please try again."
            );
        } finally {
            setSubmitting(false);
        }
    };

    const remove = async (commentId) => {
        if (processingId) return;

        const confirmed = window.confirm(
            "Delete this comment?"
        );

        if (!confirmed) return;

        try {
            setProcessingId(commentId);
            setError("");

            await deleteComment(commentId);

            setComments((items) =>
                items.filter(
                    (item) => item._id !== commentId
                )
            );

            if (editing === commentId) {
                resetForm();
            }
        } catch (err) {
            setError(
                err?.response?.data?.message ||
                    "Unable to delete the comment."
            );
        } finally {
            setProcessingId(null);
        }
    };

    const like = async (commentId) => {
        if (!user) {
            navigate("/login");
            return;
        }

        if (processingId) return;

        try {
            setProcessingId(commentId);
            setError("");

            const response =
                await toggleCommentLike(commentId);

            setComments((items) =>
                items.map((item) =>
                    item._id === commentId
                        ? {
                              ...item,
                              liked:
                                  response.data.data.liked,
                          }
                        : item
                )
            );
        } catch (err) {
            setError(
                err?.response?.data?.message ||
                    "Unable to update your like."
            );
        } finally {
            setProcessingId(null);
        }
    };

    const startEditing = (comment) => {
        setEditing(comment._id);
        setContent(comment.content);
        setError("");

        // Ref instead of a global querySelector — safe even if this
        // component is ever rendered more than once on the same page.
        requestAnimationFrame(() => {
            inputRef.current?.focus();
        });
    };

    const counterNearLimit = content.length > 900;

    return (
        <section className="comments">
            <CommentSectionStyles />

            <div className="section-heading">
                <div>
                    <h2>Conversation</h2>

                    <span>
                        {comments.length}{" "}
                        {comments.length === 1
                            ? "comment"
                            : "comments"}
                    </span>
                </div>
            </div>

            {/* Comment composer */}
            <form
                className={`comment-form ${
                    editing ? "is-editing" : ""
                }`}
                onSubmit={submit}
            >
                <Avatar
                    user={user}
                    size="small"
                />

                <div className="comment-composer">
                    <input
                        ref={inputRef}
                        value={content}
                        onChange={(event) =>
                            setContent(event.target.value)
                        }
                        placeholder={
                            user
                                ? editing
                                    ? "Edit your comment..."
                                    : "Add to the conversation..."
                                : "Log in to join the conversation"
                        }
                        disabled={submitting || !user}
                        maxLength={1000}
                        aria-label={
                            editing
                                ? "Edit comment"
                                : "Add a comment"
                        }
                    />

                    <div className="comment-composer-footer">
                        <span
                            className={`comment-counter ${
                                counterNearLimit
                                    ? "comment-counter-warn"
                                    : ""
                            }`}
                        >
                            {content.length}/1000
                        </span>

                        <div className="comment-form-actions">
                            {editing && (
                                <button
                                    type="button"
                                    className="button button-muted"
                                    onClick={resetForm}
                                    disabled={submitting}
                                >
                                    Cancel
                                </button>
                            )}

                            <button
                                className="button"
                                type="submit"
                                disabled={
                                    submitting ||
                                    !content.trim()
                                }
                            >
                                {submitting
                                    ? "Saving..."
                                    : editing
                                    ? "Save changes"
                                    : "Post comment"}
                            </button>
                        </div>
                    </div>
                </div>
            </form>

            {!user && (
                <button
                    type="button"
                    className="comment-login-hint"
                    onClick={() => navigate("/login")}
                >
                    Sign in to leave a comment
                    <span>→</span>
                </button>
            )}

            {error && (
                <div className="notice error">
                    {error}
                </div>
            )}

            {/* Comments */}
            <div className="comment-list">
                {comments.length === 0 ? (
                    <div className="comments-empty">
                        <div className="comments-empty-icon">
                            ◌
                        </div>

                        <strong>
                            No comments yet
                        </strong>

                        <p>
                            Be the first to start the
                            conversation.
                        </p>
                    </div>
                ) : (
                    comments.map((item) => {
                        const ownerId =
                            item.owner?._id ||
                            item.owner;

                        const own =
                            user?._id === ownerId;

                        const busy =
                            processingId === item._id;

                        const ownerName =
                            item.owner?.username ||
                            item.owner?.fullName ||
                            "Creator";

                        return (
                            <article
                                className={`comment ${
                                    editing === item._id
                                        ? "comment-editing"
                                        : ""
                                }`}
                                key={item._id}
                            >
                                <Avatar
                                    user={item.owner}
                                    size="small"
                                />

                                <div className="comment-body">
                                    <div className="comment-header">
                                        <strong>
                                            {ownerName}
                                        </strong>

                                        {own && (
                                            <span className="comment-you">
                                                You
                                            </span>
                                        )}
                                    </div>

                                    <p>
                                        {item.content}
                                    </p>

                                    <div className="comment-actions">
                                        <button
                                            type="button"
                                            className={
                                                item.liked
                                                    ? "comment-liked"
                                                    : ""
                                            }
                                            onClick={() =>
                                                like(
                                                    item._id
                                                )
                                            }
                                            disabled={busy}
                                        >
                                            <span>
                                                {item.liked
                                                    ? "♥"
                                                    : "♡"}
                                            </span>

                                            {item.liked
                                                ? "Liked"
                                                : "Like"}
                                        </button>

                                        {own && (
                                            <>
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        startEditing(
                                                            item
                                                        )
                                                    }
                                                    disabled={
                                                        busy
                                                    }
                                                >
                                                    Edit
                                                </button>

                                                <button
                                                    type="button"
                                                    className="comment-delete"
                                                    onClick={() =>
                                                        remove(
                                                            item._id
                                                        )
                                                    }
                                                    disabled={
                                                        busy
                                                    }
                                                >
                                                    {busy
                                                        ? "..."
                                                        : "Delete"}
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </article>
                        );
                    })
                )}
            </div>
        </section>
    );
};

/* =================================================================
   STYLES — matches the AppShell / Avatar "editing studio" theme.
   Reads the same --accent / --surface variables set at :root by
   AppShell, with inline fallbacks so this still looks right if
   CommentSection is ever rendered without AppShell mounted.
   ================================================================= */

const CommentSectionStyles = () => (
    <style>{`
        .comments {
            display: flex;
            flex-direction: column;
            gap: 20px;
            padding-top: 8px;
        }

        .section-heading h2 {
            margin: 0;
            font-size: 17px;
            font-weight: 600;
            color: var(--text, #f1efe9);
        }

        .section-heading span {
            font-size: 13px;
            color: var(--text-muted, #9a9ba6);
        }

        /* ---- Composer ---- */

        .comment-form {
            display: flex;
            gap: 12px;
            align-items: flex-start;
        }

        .comment-form.is-editing .comment-composer {
            border-color: var(--accent, #cf9d56);
            box-shadow: 0 0 0 3px var(--accent-soft, rgba(207, 157, 86, 0.14));
        }

        .comment-composer {
            flex: 1;
            border: 1px solid var(--border, rgba(255, 255, 255, 0.08));
            border-radius: var(--radius-md, 12px);
            background: var(--surface, #1b1d24);
            padding: 10px 12px;
            transition: border-color 0.15s var(--ease, ease), box-shadow 0.15s var(--ease, ease);
        }

        .comment-composer input {
            width: 100%;
            border: none;
            background: transparent;
            color: var(--text, #f1efe9);
            font-size: 14px;
            outline: none;
            padding: 4px 2px 10px;
        }

        .comment-composer input::placeholder {
            color: var(--text-muted, #9a9ba6);
        }

        .comment-composer input:disabled {
            opacity: 0.6;
            cursor: not-allowed;
        }

        .comment-composer-footer {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 12px;
        }

        .comment-counter {
            font-size: 11.5px;
            color: var(--text-muted, #9a9ba6);
        }

        .comment-counter-warn {
            color: var(--danger, #e2685c);
            font-weight: 600;
        }

        .comment-form-actions {
            display: flex;
            gap: 8px;
        }

        /* ---- Shared buttons (kept consistent with AppShell) ---- */

        .button {
            display: inline-flex;
            align-items: center;
            height: 34px;
            padding: 0 16px;
            border-radius: 999px;
            background: var(--accent, #cf9d56);
            color: #14151a;
            font-size: 13px;
            font-weight: 600;
            border: none;
            transition: filter 0.15s var(--ease, ease), opacity 0.15s var(--ease, ease);
        }

        .button:hover:not(:disabled) {
            filter: brightness(1.08);
        }

        .button:disabled {
            opacity: 0.5;
            cursor: not-allowed;
        }

        .button-muted {
            background: transparent;
            color: var(--text-muted, #9a9ba6);
            border: 1px solid var(--border, rgba(255, 255, 255, 0.08));
        }

        .button-muted:hover:not(:disabled) {
            background: var(--surface-raised, #23252e);
            color: var(--text, #f1efe9);
        }

        /* ---- Sign-in hint ---- */

        .comment-login-hint {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            align-self: flex-start;
            border: none;
            background: transparent;
            color: var(--accent, #cf9d56);
            font-size: 13px;
            font-weight: 600;
            padding: 0;
        }

        .comment-login-hint:hover {
            text-decoration: underline;
        }

        /* ---- Notices ---- */

        .notice {
            padding: 10px 14px;
            border-radius: var(--radius-sm, 8px);
            font-size: 13px;
        }

        .notice.error {
            background: rgba(226, 104, 92, 0.12);
            color: var(--danger, #e2685c);
            border: 1px solid rgba(226, 104, 92, 0.3);
        }

        /* ---- Empty state ---- */

        .comments-empty {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 6px;
            padding: 40px 20px;
            color: var(--text-muted, #9a9ba6);
            text-align: center;
        }

        .comments-empty-icon {
            font-size: 26px;
            margin-bottom: 4px;
            color: var(--text-muted, #9a9ba6);
        }

        .comments-empty strong {
            color: var(--text, #f1efe9);
            font-size: 14px;
        }

        .comments-empty p {
            margin: 0;
            font-size: 13px;
        }

        /* ---- Comment list ---- */

        .comment-list {
            display: flex;
            flex-direction: column;
            gap: 18px;
        }

        .comment {
            display: flex;
            gap: 12px;
            padding: 10px;
            border-radius: var(--radius-md, 12px);
            transition: background 0.15s var(--ease, ease);
        }

        .comment-editing {
            background: var(--accent-soft, rgba(207, 157, 86, 0.14));
        }

        .comment-body {
            flex: 1;
            min-width: 0;
        }

        .comment-header {
            display: flex;
            align-items: center;
            gap: 8px;
        }

        .comment-header strong {
            font-size: 13.5px;
            color: var(--text, #f1efe9);
        }

        .comment-you {
            font-size: 10.5px;
            font-weight: 700;
            letter-spacing: 0.04em;
            text-transform: uppercase;
            color: var(--accent, #cf9d56);
            background: var(--accent-soft, rgba(207, 157, 86, 0.14));
            padding: 2px 8px;
            border-radius: 999px;
        }

        .comment-body p {
            margin: 4px 0 8px;
            font-size: 14px;
            line-height: 1.5;
            color: var(--text, #f1efe9);
            word-break: break-word;
        }

        .comment-actions {
            display: flex;
            align-items: center;
            gap: 16px;
        }

        .comment-actions button {
            display: inline-flex;
            align-items: center;
            gap: 5px;
            border: none;
            background: transparent;
            color: var(--text-muted, #9a9ba6);
            font-size: 12.5px;
            font-weight: 600;
            padding: 4px 2px;
        }

        .comment-actions button:hover:not(:disabled) {
            color: var(--text, #f1efe9);
        }

        .comment-actions button:disabled {
            opacity: 0.5;
            cursor: not-allowed;
        }

        .comment-liked {
            color: var(--accent, #cf9d56) !important;
        }

        .comment-delete:hover:not(:disabled) {
            color: var(--danger, #e2685c) !important;
        }

        @media (prefers-reduced-motion: reduce) {
            .comment,
            .comment-composer {
                transition: none;
            }
        }

        @media (max-width: 560px) {
            .comment-composer-footer {
                flex-direction: column;
                align-items: flex-end;
                gap: 8px;
            }
        }
    `}</style>
);

export default CommentSection;