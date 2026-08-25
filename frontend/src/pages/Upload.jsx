import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { publishVideo } from "../services/api";

const Upload = () => {
    const { user, loading } = useAuth();
    const navigate = useNavigate();
    const [form, setForm] = useState({ title: "", description: "" });
    const [videoFile, setVideoFile] = useState(null);
    const [thumbnail, setThumbnail] = useState(null);
    const [error, setError] = useState("");
    const [saving, setSaving] = useState(false);
    if (loading) return <div className="center-state">Loading account...</div>;
    if (!user) return <Navigate to="/login" replace />;
    const change = (event) => setForm({ ...form, [event.target.name]: event.target.value });
    const submit = async (event) => {
        event.preventDefault(); setSaving(true); setError("");
        try { const data = new FormData(); data.append("title", form.title); data.append("description", form.description); data.append("videoFile", videoFile); data.append("thumbnail", thumbnail); await publishVideo(data); navigate("/dashboard"); } catch (requestError) { setError(requestError.response?.data?.message || "Upload failed."); } finally { setSaving(false); }
    };
    return <div className="app-frame"><header className="topbar"><Link className="brand" to="/"><span className="brand-mark">C</span>Creator<span>ly</span></Link><Link className="link-button" to="/dashboard">Cancel</Link></header><main className="form-page"><p className="eyebrow">Creator studio</p><h1>Publish a new video.</h1><p className="lede">Give your next idea a clear title and a strong first frame.</p>{error && <div className="notice error">{error}</div>}<form className="panel-form" onSubmit={submit}><label>Title<input name="title" value={form.title} onChange={change} required placeholder="What is this video about?" /></label><label>Description<textarea name="description" value={form.description} onChange={change} required rows="5" placeholder="Tell viewers what they will learn or feel." /></label><div className="file-row"><label>Video file<input type="file" accept="video/*" onChange={(event) => setVideoFile(event.target.files[0])} required /></label><label>Thumbnail<input type="file" accept="image/*" onChange={(event) => setThumbnail(event.target.files[0])} required /></label></div><button className="button button-large" disabled={saving || !videoFile || !thumbnail}>{saving ? "Publishing..." : "Publish video"}</button></form></main></div>;
};

export default Upload;
