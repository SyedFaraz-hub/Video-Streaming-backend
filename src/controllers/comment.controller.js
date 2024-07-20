import mongoose, { isValidObjectId } from "mongoose"
import { Comment } from "../models/comment.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"

const getVideoComments = asyncHandler(async (req, res) => {
    //TODO: get all comments for a video
    const { videoId } = req.params
    const { page = 1, limit = 3 } = req.query

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Video Id Invalid")
    }

    // Count total comments for the video
    const totalItems = await Comment.countDocuments({ video: videoId });


    const comments = await Comment.aggregate([
        {
            $match: {
                video: new mongoose.Types.ObjectId(videoId)
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "owner"
            }
        },
        {
            $addFields: {
                owner: {
                    $first: '$owner'
                }
            }
        },
        {
            $skip: (page - 1) * limit
        },
        {
            $limit: parseInt(limit)
        }
    ])

    return res
        .status(200)
        .json(
            new ApiResponse(200, {
                totalItems,
                page: parseInt(page),
                limit: parseInt(limit),
                comments
            }, "Comments fetch successfully")
        )

})

const addComment = asyncHandler(async (req, res) => {
    // TODO: add a comment to a video
    const { videoId } = req.params
    const { content } = req.body

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Video Id Invalid")
    }

    if (!content) {
        throw new ApiError(400, "Content Id Invalid")
    }

    const comment = await Comment.create({
        content,
        video: new mongoose.Types.ObjectId(videoId),
        owner: new mongoose.Types.ObjectId(req.user._id)
    })


    return res
        .status(201)
        .json(
            new ApiResponse(201, comment, "Comment added")
        )
})

const updateComment = asyncHandler(async (req, res) => {
    // TODO: update a comment
    const { commentId } = req.params
    const { content } = req.body

    if (!isValidObjectId(commentId)) {
        throw new ApiError(400, "comment Id Invalid")
    }

    if (!content) {
        throw new ApiError(400, "No content Found")
    }

    const comment = await Comment.findById(commentId)

    if (!comment) {
        throw new ApiError(400, "No Comment Found")
    }

    if (!(comment.owner.equals(req.user._id))) {
        throw new ApiError(400, "User can only update their own comment")
    }

    const updatedComment = await Comment.findByIdAndUpdate(
        commentId,
        {
            $set: {
                content
            }
        }, 
        {
        new: true
       }
    )

    return res
        .status(200)
        .json(
            new ApiResponse(200, updatedComment, "Comment updated successfully")
        )




})

const deleteComment = asyncHandler(async (req, res) => {
    // TODO: delete a comment
    const { commentId } = req.params

    if (!isValidObjectId(commentId)) {
        throw new ApiError(400, "comment Id Invalid")
    }

    const comment = await Comment.findById(commentId)

    if (!comment) {
        throw new ApiError(400, "No Comment Found")
    }

    if (!(comment.owner.equals(req.user._id))) {
        throw new ApiError(400, "User can only delete their own comment")
    }

    const deletedComment = await Comment.findByIdAndDelete(
        commentId,
    )

    return res
    .status(201)
    .json(
        new ApiResponse(201, deletedComment, "Comment deleted Successfully")
    )

})

export {
    getVideoComments,
    addComment,
    updateComment,
    deleteComment
}
