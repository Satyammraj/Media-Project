import { Link } from "react-router-dom";

const VideoCard = ({ video }) => (
    <Link className="video-card" to={`/watch/${video._id}`}>
        <div className="thumbnail-wrap"><img src={video.thumbnail} alt="" /><span className="play-pill">Play</span></div>
        <div className="video-meta"><div className="mini-avatar">{video.owner?.username?.[0]?.toUpperCase() || "C"}</div><div><h3>{video.title}</h3><p>{video.owner?.username || "Creator"}</p><span>{video.views || 0} views</span></div></div>
    </Link>
);

export default VideoCard;