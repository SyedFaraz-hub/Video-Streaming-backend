import mongoose, { isValidObjectId } from "mongoose"
import { Like } from "../models/like.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"

const toggleVideoLike = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: toggle like on video
    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "video Id is invalid")
    }

    const AlreadyLiked = await Like.findOne({
        $and: [
            { video: videoId },
            { likedBy: req.user._id }
        ]
    })

    if (AlreadyLiked) {
        const deleteLiked = await Like.findByIdAndDelete(AlreadyLiked._id)

        return res
            .status(200)
            .json(
                new ApiResponse(200, deleteLiked, "UnLiked the video successfully")
            )
    }



    const videoliked = await Like.create({
        video: new mongoose.Types.ObjectId(videoId),
        likedBy: req.user._id
    })


    return res
        .status(200)
        .json(
            new ApiResponse(200, videoliked, "Liked the video successfully")
        )

})

const toggleCommentLike = asyncHandler(async (req, res) => {
    const { commentId } = req.params
    //TODO: toggle like on comment
    if (!isValidObjectId(commentId)) {
        throw new ApiError(400, "comment Id is invalid")
    }

    const AlreadyLiked = await Like.findOne({
        $and: [
            { comment: commentId },
            { likedBy: req.user._id }
        ]
    })

    if (AlreadyLiked) {
        const deleteLiked = await Like.findByIdAndDelete(AlreadyLiked._id)

        return res
            .status(200)
            .json(
                new ApiResponse(200, deleteLiked, "UnLiked the Comment successfully")
            )
    }



    const commentliked = await Like.create({
        comment: new mongoose.Types.ObjectId(commentId),
        likedBy: req.user._id
    })


    return res
        .status(200)
        .json(
            new ApiResponse(200, commentliked, "Liked the Comment successfully")
        )

})

const toggleTweetLike = asyncHandler(async (req, res) => {
    const { tweetId } = req.params
    //TODO: toggle like on tweet
    if (!isValidObjectId(tweetId)) {
        throw new ApiError(400, "tweet Id is invalid")
    }

    const AlreadyLiked = await Like.findOne({
        $and: [
            { tweet: tweetId },
            { likedBy: req.user._id }
        ]
    })

    if (AlreadyLiked) {
        const deleteLiked = await Like.findByIdAndDelete(AlreadyLiked._id)

        return res
            .status(200)
            .json(
                new ApiResponse(200, deleteLiked, "UnLiked the tweet successfully")
            )
    }



    const commentliked = await Like.create({
        tweet: new mongoose.Types.ObjectId(tweetId),
        likedBy: req.user._id
    })


    return res
        .status(200)
        .json(
            new ApiResponse(200, commentliked, "Liked the tweet successfully")
        )
}
)

const getLikedVideos = asyncHandler(async (req, res) => {
    //TODO: get all liked videos
    const LikedVideos = await Like.aggregate([
        {
            $lookup: {
                from: "videos",
                localField: "video",
                foreignField: "_id",
                as: "videos"
            }
        },
        {
            $addFields: {
                videos: {
                    $first: "$videos"
                }
            }
        },
        {
            $match: {
                videos: { $exists: true }
            }
        },
        {
            $project: {
                videos: 1
            }
        }
    ])

    return res
        .status(200)
        .json(
            new ApiResponse(200, LikedVideos, "Liked Vidoes Fetch successfully successfully")
        )

})

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}