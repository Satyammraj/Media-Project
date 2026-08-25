import axios from "axios";

const API_URL =
    import.meta.env.VITE_API_URL ||
    "http://localhost:8000/api/v1";

const api = axios.create({
    baseURL: API_URL,
    withCredentials: true,

    headers: {
        Accept: "application/json",
    },

    timeout: 30000,
});

const request = async (config) => {
    try {
        return await api(config);
    } catch (error) {
        /*
         * Keep Axios errors intact so components can still
         * access:
         *
         * error.response?.data?.message
         *
         * This is important because your existing pages
         * already rely on that structure.
         */
        if (!error.response) {
            error.isNetworkError = true;
        }

        throw error;
    }
};

/* ───────────────── VIDEOS ───────────────── */

export const getVideos = (params = {}) =>
    request({
        method: "GET",
        url: "/videos",
        params,
    });

export const getVideo = (videoId) =>
    request({
        method: "GET",
        url: `/videos/${videoId}`,
    });

export const publishVideo = (
    formData,
    config = {}
) =>
    request({
        method: "POST",
        url: "/videos",
        data: formData,

        /*
         * Video uploads can legitimately take much longer
         * than normal API requests.
         */
        timeout: 0,

        ...config,
    });

/* ───────────────── VIDEO LIKES ───────────────── */

export const toggleVideoLike = (videoId) =>
    request({
        method: "POST",
        url: `/likes/toggle/v/${videoId}`,
    });

export const getLikedVideos = () =>
    request({
        method: "GET",
        url: "/likes/videos",
    });

/* ───────────────── COMMENTS ───────────────── */

export const getComments = (videoId) =>
    request({
        method: "GET",
        url: `/comments/${videoId}`,
    });

export const addComment = (
    videoId,
    content
) =>
    request({
        method: "POST",
        url: `/comments/${videoId}`,
        data: {
            content,
        },
    });

export const updateComment = (
    commentId,
    content
) =>
    request({
        method: "PATCH",
        url: `/comments/c/${commentId}`,
        data: {
            content,
        },
    });

export const deleteComment = (commentId) =>
    request({
        method: "DELETE",
        url: `/comments/c/${commentId}`,
    });

export const toggleCommentLike = (
    commentId
) =>
    request({
        method: "POST",
        url: `/likes/toggle/c/${commentId}`,
    });

/* ───────────────── SUBSCRIPTIONS ───────────────── */

export const subscribeTo = (channelId) =>
    request({
        method: "POST",
        url: `/subscriptions/c/${channelId}`,
    });

export const getSubscriptions = (
    subscriberId
) =>
    request({
        method: "GET",
        url: `/subscriptions/u/${subscriberId}`,
    });

/* ───────────────── DASHBOARD ───────────────── */

export const getDashboard = (channelId) =>
    request({
        method: "GET",
        url: `/dashboard/stats/${channelId}`,
    });

export const getDashboardVideos = (
    channelId
) =>
    request({
        method: "GET",
        url: `/dashboard/videos/${channelId}`,
    });

/* ───────────────── USER / CHANNEL ───────────────── */

export const getChannelProfile = (
    username
) =>
    request({
        method: "GET",
        url: `/users/c/${username}`,
    });

export const getWatchHistory = () =>
    request({
        method: "GET",
        url: "/users/history",
    });

export const updateAccount = (details) =>
    request({
        method: "PATCH",
        url: "/users/update-account",
        data: details,
    });

export const updateAvatar = (formData) =>
    request({
        method: "PATCH",
        url: "/users/avatar",
        data: formData,
        timeout: 60000,
    });

export const updateCoverImage = (
    formData
) =>
    request({
        method: "PATCH",
        url: "/users/cover-image",
        data: formData,
        timeout: 60000,
    });

export const changePassword = (details) =>
    request({
        method: "POST",
        url: "/users/change-password",
        data: details,
    });

/* ───────────────── PLAYLISTS ───────────────── */

export const getUserPlaylists = (userId) =>
    request({
        method: "GET",
        url: `/playlist/user/${userId}`,
    });

export const getPlaylist = (playlistId) =>
    request({
        method: "GET",
        url: `/playlist/${playlistId}`,
    });

export const createPlaylist = (details) =>
    request({
        method: "POST",
        url: "/playlist",
        data: details,
    });

export const updatePlaylist = (
    playlistId,
    details
) =>
    request({
        method: "PATCH",
        url: `/playlist/${playlistId}`,
        data: details,
    });

export const deletePlaylist = (playlistId) =>
    request({
        method: "DELETE",
        url: `/playlist/${playlistId}`,
    });

export const addVideoToPlaylist = (
    videoId,
    playlistId
) =>
    request({
        method: "PATCH",
        url: `/playlist/add/${videoId}/${playlistId}`,
    });

export const removeVideoFromPlaylist = (
    videoId,
    playlistId
) =>
    request({
        method: "PATCH",
        url: `/playlist/remove/${videoId}/${playlistId}`,
    });

/* ───────────────── TWEETS ───────────────── */

export const getUserTweets = (userId) =>
    request({
        method: "GET",
        url: `/tweets/user/${userId}`,
    });

export const createTweet = (content) =>
    request({
        method: "POST",
        url: "/tweets",
        data: {
            content,
        },
    });

export const updateTweet = (
    tweetId,
    content
) =>
    request({
        method: "PATCH",
        url: `/tweets/${tweetId}`,
        data: {
            content,
        },
    });

export const deleteTweet = (tweetId) =>
    request({
        method: "DELETE",
        url: `/tweets/${tweetId}`,
    });

/* ───────────────── EXPORT ───────────────── */

export default api;