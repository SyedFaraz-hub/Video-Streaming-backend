import mongoose, { isValidObjectId } from "mongoose"
import { Tweet } from "../models/tweet.model.js"
import { User } from "../models/user.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"

const createTweet = asyncHandler(async (req, res) => {
    //TODO: create tweet
    const { content } = req.body

    if (!content) {
        throw new ApiError(400, "Content is missing")
    }

    const createdTweet = await Tweet.create({
        content,
        owner: req.user._id,
    })


    res.status(201).json(
        new ApiResponse(200, createdTweet, "tweet created successfully")
    )
})

const getUserTweets = asyncHandler(async (req, res) => {
    // TODO: get user tweets
    const { userId } = req.params

    if (!userId) {
        throw new ApiError(400, "User Id is missing")
    }

    const userTweets = await Tweet.find({ owner: new mongoose.Types.ObjectId(userId) })

    return res
        .status(200)
        .json(
            new ApiResponse(200, userTweets, "Tweet fetch successfully")
        )


})

const updateTweet = asyncHandler(async (req, res) => {
    //TODO: update tweet
    const { tweetId } = req.params
    const { content } = req.body



    if (!tweetId) {
        throw new ApiError(400, "Tweet Id is missing")
    }

    if (!content) {
        throw new ApiError(400, "content field is missing")
    }

   const updatedTweet = await Tweet.findByIdAndUpdate(
        tweetId,
        {
            $set: {
                content
            }
        },
        {new: true}
    )

    return res
        .status(200)
        .json(
            new ApiResponse(200, updatedTweet, "Tweet updated successfully")
        )

})

const deleteTweet = asyncHandler(async (req, res) => {
    //TODO: delete tweet
    const { tweetId } = req.params

    if (!tweetId) {
        throw new ApiError(400, "Tweet Id is missing")
    }

    const deletedTweet = await Tweet.findByIdAndDelete(tweetId)

    return res
        .status(200)
        .json(
            new ApiResponse(200, deletedTweet, "Tweet deleted successfully")
        )

})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}
