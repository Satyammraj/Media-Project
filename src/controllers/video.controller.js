import mongoose, {isValidObjectId} from "mongoose"
import {Video} from "../models/video.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"


const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query
    //TODO: get all videos based on query, sort, pagination
    const pageNumber = Number(page)
    const limitNumber = Number(limit)

    if (pageNumber <= 0 || limitNumber <= 0) {
        throw new ApiError(
            400,
            "Page and limit must be greater than 0"
        )
    }

    const filter = {
        isPublished: true
    }

    if (query?.trim()) {

        filter.$or = [
            {
                title: {
                    $regex: query.trim(),
                    $options: "i"
                }
            },
            {
                description: {
                    $regex: query.trim(),
                    $options: "i"
                }
            }
        ]
    }

    if (userId) {

        if (!isValidObjectId(userId)) {
            throw new ApiError(
                400,
                "Invalid user ID"
            )
        }

        filter.owner = userId
    }

    const sort = {}

    if (sortBy) {
        sort[sortBy] = sortType === "asc" ? 1 : -1
    } else {
        // Newest videos first by default
        sort.createdAt = -1
    }

    const skip = (pageNumber - 1) * limitNumber

    const videos = await Video.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limitNumber)

    
    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                videos,
                "Videos fetched successfully"
            )
        )




})

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description} = req.body
    // TODO: get video, upload to cloudinary, create video
    const {title, description} = req.body

     if (!title?.trim()) {
        throw new ApiError(
            400,
            "Video title is required"
        )
    }

    if (!description?.trim()) {
        throw new ApiError(
            400,
            "Video description is required"
        )
    }

    const videoFile = req.files?.videoFile?.[0]?.path
    const thumbnail = req.files?.thumbnail?.[0]?.path

    if (!videoFile) {
        throw new ApiError(
            400,
            "Video file is required"
        )
    }

    if (!thumbnail) {
        throw new ApiError(
            400,
            "Thumbnail is required"
        )
    }

    const uploadedVideo = await uploadOnCloudinary(videoFile)

    const uploadedThumbnail = await uploadOnCloudinary(thumbnail)

    if (!uploadedVideo) {
        throw new ApiError(
            500,
            "Video upload failed"
        )
    }

    if (!uploadedThumbnail) {
        throw new ApiError(
            500,
            "Thumbnail upload failed"
        )
    }
    
    const video = await Video.create({
        videoFile: uploadedVideo.url,
        thumbnail: uploadedThumbnail.url,
        title: title.trim(),
        description: description.trim(),
        duration: uploadedVideo.duration,
        owner: req.user._id
    })

    return res
        .status(201)
        .json(
            new ApiResponse(
                201,
                video,
                "Video published successfully"
            )
        )

})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: get video by id
    if (!isValidObjectId(videoId)) {
        throw new ApiError(
            400,
            "Invalid video ID"
        )
    }

    const video = await Video.findById(videoId)

    if (!video) {
        throw new ApiError(
            404,
            "Video not found"
        )
    }

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                video,
                "Video fetched successfully"
            )
        )

})

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: update video details like title, description, thumbnail
    const {title, description} = req.body

    if (!isValidObjectId(videoId)) {
        throw new ApiError(
            400,
            "Invalid video ID"
        )
    }

    const video = await Video.findById(videoId)

    if (!video) {
        throw new ApiError(
            404,
            "Video not found"
        )
    }

    if (
        video.owner.toString() !==
        req.user._id.toString()
    ) {
        throw new ApiError(
            403,
            "You are not authorized to update this video"
        )
    }

    if (title?.trim()) {
        video.title = title.trim()
    }


    if (description?.trim()) {
        video.description = description.trim()
    }

    const thumbnail = req.files?.thumbnail?.[0]?.path

    if (thumbnail) {

        const uploadedThumbnail =
            await uploadOnCloudinary(thumbnail)

        if (!uploadedThumbnail) {
            throw new ApiError(
                500,
                "Thumbnail upload failed"
            )
        }

        video.thumbnail = uploadedThumbnail.url
    }



})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: delete video
    if (!isValidObjectId(videoId)) {
        throw new ApiError(
            400,
            "Invalid video ID"
        )
    }

    const video = await Video.findById(videoId)

    if (!video) {
        throw new ApiError(
            404,
            "Video not found"
        )
    }

    if (
        video.owner.toString() !==
        req.user._id.toString()
    ) {
        throw new ApiError(
            403,
            "You are not authorized to delete this video"
        )
    }

    await Video.findByIdAndDelete(videoId)

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                {},
                "Video deleted successfully"
            )
        )


})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    if (!isValidObjectId(videoId)) {
        throw new ApiError(
            400,
            "Invalid video ID"
        )
    }

    const video = await Video.findById(videoId)

    if (!video) {
        throw new ApiError(
            404,
            "Video not found"
        )
    }

    if (
        video.owner.toString() !==
        req.user._id.toString()
    ) {
        throw new ApiError(
            403,
            "You are not authorized to change this video"
        )
    }

    video.isPublished = !video.isPublished

    await video.save()

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                video,
                "Video publish status updated successfully"
            )
        )

})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}