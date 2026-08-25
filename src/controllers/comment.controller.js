import mongoose from "mongoose"
import {Comment} from "../models/comment.model.js"
import {Video} from "../models/video.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const getVideoComments = asyncHandler(async (req, res) => {
    //TODO: get all comments for a video
    const {videoId} = req.params
    const {page = 1, limit = 10} = req.query
    const pageNumber = Number(page)
    const limitNumber = Number(limit)

    if (!Number.isInteger(pageNumber) || !Number.isInteger(limitNumber) || pageNumber <= 0 || limitNumber <= 0) {
        throw new ApiError(400, "Page and limit must be greater than 0")
    }

    const skip = (pageNumber - 1) * limitNumber
    if (!mongoose.Types.ObjectId.isValid(videoId)) {
        throw new ApiError(400, "Invalid video ID")
    }
    const comments = await Comment.find({
        video: videoId
    })
    .populate("owner", "username fullName avatar")
    .skip(skip)
    .limit(limitNumber)

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                comments,
                "Comments fetched successfully"
            )
        )

})

const addComment = asyncHandler(async (req, res) => {
    // TODO: add a comment to a video
    const {videoId} = req.params
    const {content} = req.body

    if (!content?.trim()) {
        throw new ApiError(400, "Comment content is required")
    }

    if (!mongoose.Types.ObjectId.isValid(videoId)) {
        throw new ApiError(400, "Invalid video ID")
    }

    if (!await Video.exists({_id: videoId})) {
        throw new ApiError(404, "Video not found")
    }
    const comment = await Comment.create({
        content: content.trim(),
        video: videoId,
        owner: req.user._id
    })

    return res
        .status(201)
        .json(
            new ApiResponse(
                201,
                comment,
                "Comment added successfully"
            )
        )
    
})

const updateComment = asyncHandler(async (req, res) => {
    // TODO: update a comment
    const {commentId} = req.params
    const {content} = req.body

    if (!content?.trim()) {
        throw new ApiError(400, "Comment content is required")
    }

    if (!mongoose.Types.ObjectId.isValid(commentId)) {
        throw new ApiError(400, "Invalid comment ID")
    }

    const comment = await Comment.findById(commentId)

    if (!comment) {
        throw new ApiError(404, "Comment not found")
    }

    if (comment.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(
            403,
            "You are not authorized to update this comment"
        )
    }

    comment.content = content.trim()
    await comment.save()

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                comment,
                "Comment updated successfully"
            )
        )
})

const deleteComment = asyncHandler(async (req, res) => {
    // TODO: delete a comment
    const {commentId} = req.params

    if (!mongoose.Types.ObjectId.isValid(commentId)) {
        throw new ApiError(400, "Invalid comment ID")
    }

    const comment = await Comment.findById(commentId)

    if (!comment) {
        throw new ApiError(404, "Comment not found")
    }

    if (comment.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(
            403,
            "You are not authorized to delete this comment"
        )
    }

    await Comment.findByIdAndDelete(commentId)

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                {},
                "Comment deleted successfully"
            )
        )

})

export {
    getVideoComments, 
    addComment, 
    updateComment,
     deleteComment
    }