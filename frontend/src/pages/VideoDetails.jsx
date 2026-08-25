import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { addComment, getComments, getVideo, subscribeTo, toggleVideoLike } from "../services/api";
import { useAuth } from "../context/AuthContext";

const VideoDetails = () => {
    const { videoId } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [video, setVideo] = useState(null);
    const [comments, setComments] = useState([]);
    const [comment, setComment] = useState("");
    const [liked, setLiked] = useState(false);
    const [subscribed, setSubscribed] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        const load = async () => {
            try {
                const [videoResponse, commentsResponse] = await Promise.all([getVideo(videoId), user ? getComments(videoId) : Promise.resolve({ data: { data: [] } })]);
                setVideo(videoResponse.data.data);
                setComments(commentsResponse.data.data || []);
            } catch (requestError) {
                setError(requestError.response?.data?.message || "Unable to load this video.");
            }
        };
        load();
    }, [videoId, user]);

    const requireUser = () => {
        if (!user) { navigate("/login"); return false; }
        return true;
    };

    const handleLike = async () => {
        if (!requireUser()) return;
        const response = await toggleVideoLike(videoId);
        setLiked(response.data.data.liked);
    };

    const handleSubscribe = async () => {
        if (!requireUser() || !video?.owner) return;
        const response = await subscribeTo(video.owner._id);
        setSubscribed(response.data.data?.subscribed ?? !subscribed);
    };

    const handleComment = async (event) => {
        event.preventDefault();
        if (!requireUser() || !comment.trim()) return;
        const response = await addComment(videoId, comment);
        setComments((current) => [...current, response.data.data]);
        setComment("");
    };

    if (error) return <div className="center-state"><p className="notice error">{error}</p><Link to="/">Back to home</Link></div>;
    if (!video) return <div className="center-state">Loading video...</div>;

    return <div className="app-frame"><header className="topbar"><Link className="brand" to="/"><span className="brand-mark">C</span>Creator<span>ly</span></Link><Link className="link-button" to="/">Back to browse</Link></header><main className="watch-layout"><section><div className="player"><video controls poster={video.thumbnail} src={video.videoFile}>Your browser does not support video playback.</video></div><div className="watch-heading"><div><p className="eyebrow">Now watching</p><h1>{video.title}</h1><p className="watch-stats">{video.views || 0} views</p></div><div className="watch-actions"><button className={`button ${liked ? "button-active" : ""}`} onClick={handleLike}>Like</button><button className="button button-quiet" onClick={handleSubscribe}>{subscribed ? "Subscribed" : "Subscribe"}</button></div></div><p className="description">{video.description}</p></section><aside className="comments"><h2>Comments <span>{comments.length}</span></h2><form className="comment-form" onSubmit={handleComment}><input value={comment} onChange={(event) => setComment(event.target.value)} placeholder={user ? "Add a thoughtful comment" : "Log in to comment"} /><button className="button" type="submit">Post</button></form><div className="comment-list">{comments.map((item) => <article className="comment" key={item._id}><div className="mini-avatar">{item.owner?.username?.[0]?.toUpperCase() || "C"}</div><div><strong>{item.owner?.username || "Creator"}</strong><p>{item.content}</p></div></article>)}</div></aside></main></div>;
};

export default VideoDetails;
