import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getDashboard, getDashboardVideos } from "../services/api";
import VideoCard from "../components/VideoCard";

const Dashboard = () => {
    const { user, loading } = useAuth();
    const [stats, setStats] = useState(null);
    const [videos, setVideos] = useState([]);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!user) return;
        Promise.all([getDashboard(user._id), getDashboardVideos(user._id)]).then(([statsResponse, videosResponse]) => { setStats(statsResponse.data.data); setVideos(videosResponse.data.data || []); }).catch((requestError) => setError(requestError.response?.data?.message || "Unable to load dashboard."));
    }, [user]);

    if (loading) return <div className="center-state">Loading account...</div>;
    if (!user) return <Navigate to="/login" replace />;

    return <div className="app-frame"><header className="topbar"><Link className="brand" to="/"><span className="brand-mark">C</span>Creator<span>ly</span></Link><Link className="button" to="/upload">Upload video</Link></header><main className="content dashboard"><p className="eyebrow">Creator studio</p><h1>Good to see you, {user.fullName || user.username}.</h1><p className="lede">A quick read on how your channel is doing.</p>{error && <div className="notice error">{error}</div>}<section className="stats">{[["Views", stats?.totalViews || 0], ["Subscribers", stats?.totalSubscribers || 0], ["Videos", stats?.totalVideos || 0], ["Likes", stats?.totalLikes || 0]].map(([label, value]) => <div className="stat" key={label}><span>{label}</span><strong>{value.toLocaleString()}</strong></div>)}</section><div className="section-heading"><h2>Your videos</h2><span>{videos.length} published</span></div><section className="video-grid">{videos.map((video) => <VideoCard key={video._id} video={video} />)}</section></main></div>;
};

export default Dashboard;
