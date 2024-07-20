import mongoose, { isValidObjectId } from "mongoose"
import { Video } from "../models/video.model.js"
import { User } from "../models/user.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import { Subscription } from "../models/subscription.model.js"


const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 3, query, sortBy, sortType, userId } = req.query;

    if (!isValidObjectId(userId)) {
        throw new ApiError(400, "Invalid User Id");
    }

    const user = await User.findById(userId || req.user._id);

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    const queryCondition = { owner: user._id };
    if (query) {
        queryCondition.$or = [
            { title: { $regex: query, $options: "i" } },
            { description: { $regex: query, $options: "i" } }
        ];
    }

    const totalVideos = await Video.countDocuments(queryCondition);

    let videos;
    if (query) {
        videos = await Video.find(queryCondition);
    } else {
        videos = await Video
            .find(queryCondition)
            .skip(limit * (page - 1))
            .limit(limit)
            .sort({ [sortBy || "createdAt"]: sortType || "desc" });
    }

    return res.status(200).json(
        new ApiResponse(200, { videos, page, limit, totalItems: totalVideos }, "Channel Videos fetch succesfully")
    );
});


const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description } = req.body

    // TODO: get video, upload to cloudinary, create video
    if (!title || !description) {
        throw new ApiError(400, "title or description fields is missing")
    }

    const videoFileLocalPath = req?.files?.videoFile[0]?.path;


    if (!videoFileLocalPath) {
        throw new ApiError(400, "video  is missing")
    }

    const thumbnailLocalPath = req?.files?.thumbnail[0]?.path;

    if (!thumbnailLocalPath) {
        throw new ApiError(400, "thumbnail field is missing")
    }

    const videoFile = await uploadOnCloudinary(videoFileLocalPath)
    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath)

    if (!videoFile) {
        throw new ApiError(400, "Error while uploading the video")
    }

    if (!thumbnail) {
        throw new ApiError(400, "Error while uploading the thumbnail")
    }

    const video = await Video.create({
        title,
        description,
        videoFile: videoFile.url,
        thumbnail: thumbnail.url,
        duration: videoFile.duration,
        owner: new mongoose.Types.ObjectId(req.user._id)
    })

    return res
        .status(200)
        .json(
            new ApiResponse(200, video, "Video uploaded successfully")
        )

})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: get video by id
    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid Video Id");
    }

    const video = await Video.findById(videoId)

    if (!video) {
        throw new ApiError(400, "No Video Found");
    }

    return res
        .status(200)
        .json(
            new ApiResponse(200, video, "Video fetch successfully")
        )


})

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: update video details like title, description, thumbnail
    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid Video Id");
    }

    const video = await Video.findById(videoId)

    if (!video) {
        throw new ApiError(400, "No Such Video found");
    }


    let updateThumbnail;
    if (req.file?.path) {
        updateThumbnail = await uploadOnCloudinary(req.file?.path)

        if (!updateThumbnail) {
            throw new ApiError(400, "Error while uploading the thumbnail")
        }
    }

    const updateVideo = await Video.findByIdAndUpdate(
        videoId,
        {
            $set: {
                thumbnail: updateThumbnail?.url || video.thumbnail,
                title: req.body.title || video.title,
                description: req.body.description || video.description
            }
        },
        { new: true }
    )


    return res
        .status(200)
        .json(
            new ApiResponse(200, updateVideo, "Video Updated Successfully")
        )


})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: delete video
    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid Video Id");
    }

    const video = await Video.findByIdAndDelete(videoId)

    if (!video) {
        throw new ApiError(400, "No Video Found");
    }

    return res
        .status(200)
        .json(
            new ApiResponse(200, video, "Video deleted successfully")
        )
})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid Video Id");
    }

    const video = await Video.findById(videoId)

    if (!video) {
        throw new ApiError(400, "No Video Found");
    }

    const updatedPublshedStatus = await Video.findByIdAndUpdate(
        videoId,
        {
            $set: {
                isPublished: !video.isPublished
            }
        },
        {new:true}
    )


    return res
    .status(200)
    .json(
        new ApiResponse(200, updatedPublshedStatus, "Publish toggled successfully")
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
