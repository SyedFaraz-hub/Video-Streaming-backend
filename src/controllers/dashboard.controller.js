import { Video } from "../models/video.model.js"
import { Subscription } from "../models/subscription.model.js"
import { Like } from "../models/like.model.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"

const getChannelStats = asyncHandler(async (req, res) => {
    // TODO: Get the channel stats like total subscribers, total videos, total likes etc.
   const subscribers = await Subscription.find({channel: req.user._id}).countDocuments()
   const totalVideos = await Video.find({ owner: req.user._id }).countDocuments()
   const totalLikes = await Like.find({ likedBy: req.user._id }).countDocuments()

   return res
   .status(200)
   .json(new ApiResponse(200, {
    subscribers,
    totalVideos,
    totalLikes
   }, "Stats fetched successfully"))

})

const getChannelVideos = asyncHandler(async (req, res) => {
    // TODO: Get all the videos uploaded by the channel
    const channelVideos = await Video.find({ owner: req.user._id })


    return res
        .status(200)
        .json(new ApiResponse(200, channelVideos, "Channel videos fetched successfully"))


})

export {
    getChannelStats,
    getChannelVideos
}