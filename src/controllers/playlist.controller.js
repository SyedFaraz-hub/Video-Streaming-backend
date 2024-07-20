import mongoose, { isValidObjectId } from "mongoose"
import { Playlist } from "../models/playlist.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"


const createPlaylist = asyncHandler(async (req, res) => {
    //TODO: create playlist
    const { name, description } = req.body

    if (!(name && description)) {
        throw new ApiError(200, "name or description is missing")
    }

    const createdPlaylist = await Playlist.create({
        name,
        description,
        owner: req.user._id

    })

    if (!createdPlaylist) {
        throw new ApiError(200, "Unable to create playlist")
    }

    return res
        .status(200)
        .json(
            new ApiResponse(200, createdPlaylist, "Playlist Created Successfully")
        )


})

const getUserPlaylists = asyncHandler(async (req, res) => {
    const { userId } = req.params
    //TODO: get user playlists
    if (!isValidObjectId(userId)) {
        throw new ApiError(200, "Video Id is invalid")
    }

    const playlists = await Playlist.aggregate([
        {
            $match: {
                owner: new mongoose.Types.ObjectId(userId)
            }
        }, 
        {
            $lookup: {
                from: "videos",
                localField: "videos",
                foreignField: "_id",
                as: "videos"
            }
        }
    ])

    return res
        .status(200)
        .json(
            new ApiResponse(200, playlists, "Video added to Playlist Successfully")
        )

})

const getPlaylistById = asyncHandler(async (req, res) => {
    const { playlistId } = req.params
    //TODO: get playlist by id
    if (!isValidObjectId(playlistId)) {
        throw new ApiError(200, "playlist Id is invalid")
    }

    const playlist = await Playlist.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(playlistId)
            }
        }, 
        {
            $lookup: {
                from: "videos",
                localField: "videos",
                foreignField: "_id",
                as: "videos"
            }
        },
    ])

    if (playlist.length === 0) {
        throw new ApiError(200, "No Playlist Found")
    }


    return res
    .status(200)
    .json(
        new ApiResponse(200, playlist[0], "Playlist Fetch Successfully")
    )

})

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const { playlistId, videoId } = req.params

    if (!isValidObjectId(videoId)) {
        throw new ApiError(200, "Video Id is invalid")
    }

    if (!isValidObjectId(playlistId)) {
        throw new ApiError(200, "playlist Id is invalid")
    }


    const playlist = await Playlist.findById(playlistId)

    if (!playlist) {
        throw new ApiError(200, "playlist Id is invalid")
    }

    const Video = await Playlist.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(playlistId)
            }
        },
        {
            $match: {
                owner: new mongoose.Types.ObjectId(req.user._id)
            }
        },
        {
            $match: {
                videos: {
                    $in: [new mongoose.Types.ObjectId(videoId)]
                }
            }
        },
        {
            $addFields: {
                videos: {
                    $first: '$videos'
                }
            }
        },
    ])


    if (Video.length > 0) {
        throw new ApiError(200, "Video already exists in playlist")
    }


    const updatedPlaylist = await Playlist.findByIdAndUpdate(playlistId, {
        $push: { videos: videoId }
    }, { new: true })


    return res
        .status(200)
        .json(
            new ApiResponse(200, updatedPlaylist, "Video added to Playlist Successfully")
        )



})

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const { playlistId, videoId } = req.params
    // TODO: remove video from playlist

    if (!isValidObjectId(videoId)) {
        throw new ApiError(200, "Video Id is invalid")
    }

    if (!isValidObjectId(playlistId)) {
        throw new ApiError(200, "playlist Id is invalid")
    }

    const Video = await Playlist.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(playlistId)
            }
        },
        {
            $match: {
                owner: new mongoose.Types.ObjectId(req.user._id)
            }
        },
        {
            $match: {
                videos: {
                    $in: [new mongoose.Types.ObjectId(videoId)]
                }
            }
        },
        {
            $addFields: {
                videos: {
                    $first: '$videos'
                }
            }
        },
    ])

    if (!Video.length > 0) {
        throw new ApiError(200, "No Video found in playlist")
    }

    const updatedPlaylist = await Playlist.findByIdAndUpdate(playlistId, {
        $pull: { videos: videoId }
    }, { new: true })


    return res
        .status(200)
        .json(
            new ApiResponse(200, updatedPlaylist, "Video removed from Playlist Successfully")
        )


})

const deletePlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params
    // TODO: delete playlist
    if (!isValidObjectId(playlistId)) {
        throw new ApiError(400, "playlist id is missing")
    }

    const playlist = await Playlist.findById(playlistId)

    if (!playlist) {
        throw new ApiError(400, "No Playlist Found ")
    }

    const deletedPlayist = await Playlist.findByIdAndDelete(playlistId)

    return res
        .status(200)
        .json(
            new ApiResponse(200, deletedPlayist, "Playlist Deleted Successfully")
        )


})

const updatePlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params
    const { name, description } = req.body
    //TODO: update playlist
    if (!isValidObjectId(playlistId)) {
        throw new ApiError(400, "playlist id is missing")
    }

    const playlist = await Playlist.findById(playlistId)

    if (!playlist) {
        throw new ApiError(400, "No Playlist Found ")
    }

    const updatedPlaylist = await Playlist.findByIdAndUpdate(playlistId, {
        name,
        description
    }, { new: true })

    return res
        .status(200)
        .json(
            new ApiResponse(200, updatedPlaylist, "Playlist Updated Successfully")
        )

        
})

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}
