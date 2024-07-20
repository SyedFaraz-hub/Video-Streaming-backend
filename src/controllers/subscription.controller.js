import mongoose, { isValidObjectId } from "mongoose"
import { User } from "../models/user.model.js"
import { Subscription } from "../models/subscription.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"


const toggleSubscription = asyncHandler(async (req, res) => {
    const { channelId } = req.params
    // TODO: toggle subscription
    if (!channelId) {
        throw new ApiError(400, "Channel id is missing")
    }


    const user = await User.findById(new mongoose.Types.ObjectId(channelId))

    if (!user) {
        throw new ApiError(400, "Channel is found which are trying to subscribe")
    }

    const subscribed = await Subscription.create({
        subscriber: new mongoose.Types.ObjectId(req.user._id),
        channel: new mongoose.Types.ObjectId(channelId)
    })


    return res
        .status(200)
        .json(
            new ApiResponse(200, subscribed, "OK")
        )

})

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const { channelId } = req.params

    if (!channelId) {
        throw new ApiError(400, "Channel id is missing")
    }

    if (!(channelId == req.user._id)) {
        throw new ApiError(400, "User can only see their own subscribers")
    }

    const subscribersChannel = await Subscription.aggregate([
        {
            $match: {
                channel: new mongoose.Types.ObjectId(channelId)
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "subscriber",
                foreignField: "_id",
                as: "subscribers"
            }
        },
        {
            $addFields: {
                subscriber: {
                    $first: "$subscribers"
                }
            }
        },
        {
            $project: {
                'subscriber': 1,
            }
        }
    ])


    return res
        .status(200)
        .json(
            new ApiResponse(200, subscribersChannel, "Your channel subscriber list fetch successfully")
        )

})

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params

    if (!subscriberId) {
        throw new ApiError(400, "subscriber id is missing")
    }

   const Channels = await Subscription.aggregate([
        {
            $match: {
                subscriber: new mongoose.Types.ObjectId(subscriberId)
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "channel",
                foreignField: "_id",
                as: "channels"
            }
        },
        {
            $addFields: {
                channel: {
                    $first: '$channels'
                }
            }
        },
        {
            $project: {
                channel: 1
            }
        }
    ])

    return res
    .status(200)
    .json(
        new ApiResponse(200, Channels, "Channels you subscribed fetch successfully")
    )
})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}