import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getVideos } from "../services/api";
import VideoCard from "../components/VideoCard";

const Home = () => {
    const { user, logout } = useAuth();
    const [videos, setVideos] = useState([]);
    const [query, setQuery] = useState("");
    const [sort, setSort] = useState("newest");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
      const fetchVideos = async () => {
        setLoading(true);
        try {
            const response = await getVideos({ query, limit: 20, sortBy: sort === "popular" ? "views" : undefined });
            setVideos(Array.isArray(response.data.data) ? response.data.data : []);
            setError("");
        } catch (requestError) {
            setError(requestError.response?.data?.message || "Could not load videos. Is the backend running?");
        } finally {
            setLoading(false);
        }
      };
      const timer = setTimeout(fetchVideos, 250);
      return () => clearTimeout(timer);
    }, [query, sort]);

    return (
        <div className="app-frame">
            <header className="topbar">
                <Link className="brand" to="/"><span className="brand-mark">C</span>Creator<span>ly</span></Link>
                <form className="search" onSubmit={(event) => event.preventDefault()}><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search videos" aria-label="Search videos" /><button type="submit">Search</button></form>
                <nav className="nav-actions">
                    {user ? <><Link to="/upload" className="button button-quiet">Upload</Link><Link to="/dashboard" className="avatar">{user.username?.[0]?.toUpperCase()}</Link><button className="link-button" onClick={logout}>Log out</button></> : <><Link to="/login" className="link-button">Log in</Link><Link to="/register" className="button">Join</Link></>}
                </nav>
            </header>
            <main className="content">
                <section className="intro"><div><p className="eyebrow">Your daily watchlist</p><h1>Find something worth watching.</h1><p className="lede">Fresh ideas, sharp stories, and useful rabbit holes from independent creators.</p></div><div className="sort-control"><label htmlFor="sort">Sort by</label><select id="sort" value={sort} onChange={(event) => setSort(event.target.value)}><option value="newest">Newest</option><option value="popular">Most viewed</option></select></div></section>
                {error && <div className="notice error">{error}</div>}
                {loading ? <div className="skeleton-grid">{[1, 2, 3, 4].map((item) => <div className="skeleton" key={item} />)}</div> : videos.length ? <section className="video-grid">{videos.map((video) => <VideoCard key={video._id} video={video} />)}</section> : <div className="empty"><h2>No videos found</h2><p>Try a different search or check back soon.</p></div>}
            </main>
        </div>
    );
};

export default Home;