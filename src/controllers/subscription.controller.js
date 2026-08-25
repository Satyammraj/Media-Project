import mongoose, {isValidObjectId} from "mongoose"
import {User} from "../models/user.model.js"
import { Subscription } from "../models/subscription.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const toggleSubscription = asyncHandler(async (req, res) => {
    const {channelId} = req.params
    // TODO: toggle subscription
    if (!isValidObjectId(channelId)) {
        throw new ApiError(400, "Invalid channel ID")
    }

    const channel = await User.findById(channelId)

    if (!channel) {
        throw new ApiError(404, "Channel not found")
    }

    if (channelId === req.user._id.toString()) {
        throw new ApiError(
            400,
            "You cannot subscribe to yourself"
        )
    }

    const subscription = await Subscription.findOne({
        subscriber: req.user._id,
        channel: channelId
    })

     if (subscription) {

        await Subscription.findByIdAndDelete(subscription._id)

        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    {subscribed: false},
                    "Channel unsubscribed successfully"
                )
            )
    }

    await Subscription.create({
        subscriber: req.user._id,
        channel: channelId
    })

    return res
        .status(201)
        .json(
            new ApiResponse(
                201,
                {subscribed: true},
                "Channel subscribed successfully"
            )
        )
})

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const {channelId} = req.params

    if (!isValidObjectId(channelId)) {
        throw new ApiError(400, "Invalid channel ID")
    }

    const channel = await User.findById(channelId)

    if (!channel) {
    throw new ApiError(404, "Channel not found")
    }

    const subscribers = await Subscription.find({
        channel: channelId
    })
    .populate("subscriber", "username fullName avatar")

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                subscribers,
                "Channel subscribers fetched successfully"
            )
        )

})

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params

    if(!isValidObjectId(subscriberId)){
        throw new ApiError(400,"Invalid subscriber id")
    }

    const user = await User.findById(subscriberId)

    if(!user){
        throw new ApiError(404,"User not found")
    }

    const subscription = await Subscription.find({
        subscriber: subscriberId
    })
    .populate("channel","username fullName avatar")

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            subscription,
            "Channel subscriptions fetched successfully"
        )
    )
})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}