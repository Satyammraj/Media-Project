import axios from "axios";

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000/api/v1",
    withCredentials: true,
});

export const getVideos = (params = {}) => api.get("/videos", { params });
export const getVideo = (videoId) => api.get(`/videos/${videoId}`);
export const toggleVideoLike = (videoId) => api.post(`/likes/toggle/v/${videoId}`);
export const getComments = (videoId) => api.get(`/comments/${videoId}`);
export const addComment = (videoId, content) => api.post(`/comments/${videoId}`, { content });
export const subscribeTo = (channelId) => api.post(`/subscriptions/c/${channelId}`);
export const publishVideo = (formData) => api.post("/videos", formData);
export const getDashboard = (channelId) => api.get(`/dashboard/stats/${channelId}`);
export const getDashboardVideos = (channelId) => api.get(`/dashboard/videos/${channelId}`);
export const getLikedVideos = () => api.get("/likes/videos");
export const getWatchHistory = () => api.get("/users/history");
export const getChannelProfile = (username) => api.get(`/users/c/${username}`);
export const updateAccount = (details) => api.patch("/users/update-account", details);
export const getSubscriptions = (subscriberId) => api.get(`/subscriptions/u/${subscriberId}`);
export const getUserPlaylists = (userId) => api.get(`/playlist/user/${userId}`);
export const getPlaylist = (playlistId) => api.get(`/playlist/${playlistId}`);
export const createPlaylist = (details) => api.post("/playlist", details);
export const updatePlaylist = (playlistId, details) => api.patch(`/playlist/${playlistId}`, details);
export const deletePlaylist = (playlistId) => api.delete(`/playlist/${playlistId}`);
export const addVideoToPlaylist = (videoId, playlistId) => api.patch(`/playlist/add/${videoId}/${playlistId}`);
export const removeVideoFromPlaylist = (videoId, playlistId) => api.patch(`/playlist/remove/${videoId}/${playlistId}`);
export const getUserTweets = (userId) => api.get(`/tweets/user/${userId}`);
export const createTweet = (content) => api.post("/tweets", { content });
export const updateTweet = (tweetId, content) => api.patch(`/tweets/${tweetId}`, { content });
export const deleteTweet = (tweetId) => api.delete(`/tweets/${tweetId}`);

export default api;