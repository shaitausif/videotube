'use client'
import React, { useEffect, useState } from 'react'
import { motion } from 'motion/react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { requestHandler } from '@/utils'
import { createPlaylist, getUserVideos } from '@/lib/apiClient'
import { VideoInterface } from '@/models/video.model'
import { useSelector } from 'react-redux'
import { RootState } from '@/store/store'
import Loader from '../skeletons/Loader'
import Image from 'next/image'
import { Check, ListVideo, Search } from 'lucide-react'

const CreatePlaylist = ({ onClose }: { onClose: () => void }) => {
    const user = useSelector((state: RootState) => state?.user)
    const [name, setName] = useState('')
    const [description, setDescription] = useState('')
    const [isCreating, setIsCreating] = useState(false)
    const [loadingVideos, setLoadingVideos] = useState(false)
    const [userVideos, setUserVideos] = useState<VideoInterface[]>([])
    const [selectedVideoIds, setSelectedVideoIds] = useState<string[]>([])
    const [searchQuery, setSearchQuery] = useState('')

    // Fetch user's uploaded videos
    useEffect(() => {
        if (!user?._id) return
        requestHandler(
            async () => await getUserVideos(user._id!),
            setLoadingVideos,
            (res) => setUserVideos(res.data || []),
            (err: any) => toast.error(err?.message || "Failed to load your videos")
        )
    }, [user?._id])

    const toggleVideoSelection = (videoId: string) => {
        setSelectedVideoIds((prev) =>
            prev.includes(videoId)
                ? prev.filter((id) => id !== videoId)
                : [...prev, videoId]
        )
    }

    const filteredVideos = userVideos.filter((video) =>
        video.title.toLowerCase().includes(searchQuery.toLowerCase())
    )

    const handleCreatePlaylist = async () => {
        if (!name.trim() || !description.trim()) {
            toast.error("Name and description are required")
            return
        }

        requestHandler(
            async () => await createPlaylist(name.trim(), description.trim(), selectedVideoIds),
            setIsCreating,
            (res) => {
                toast.success(res.message || "Playlist created successfully!")
                onClose()
            },
            (err: any) => toast.error(err?.message || "Failed to create playlist")
        )
    }

    return (
        <>
            {isCreating ? (
                <div className="flex justify-center items-center w-full h-[50vh]">
                    <Loader size="size-12" />
                </div>
            ) : (
                <motion.div
                    initial={{ x: 50, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: -100, opacity: 0 }}
                    className="py-14 gap-4 flex flex-col items-center w-full h-full"
                >
                    <div className="w-full h-full px-6 flex flex-col gap-4">
                        <h3 className="text-center text-lg text-gray-800 dark:text-gray-200 font-semibold">
                            Create Playlist
                        </h3>

                        {/* Name */}
                        <div>
                            <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                                Name
                            </label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="My awesome playlist"
                                maxLength={100}
                                className="w-full px-3 py-2 rounded-lg outline outline-gray-700 border-2 border-gray-800 focus:border-2 focus:border-gray-600 text-sm transition-discrete duration-300 focus:outline-gray-500 bg-transparent dark:text-white"
                            />
                        </div>

                        {/* Description */}
                        <div>
                            <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                                Description
                            </label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="What's this playlist about?"
                                rows={2}
                                maxLength={500}
                                className="w-full px-3 py-2 rounded-lg outline outline-gray-700 border-2 border-gray-800 focus:border-2 focus:border-gray-600 text-sm transition-discrete duration-300 focus:outline-gray-500 bg-transparent dark:text-white resize-none"
                            />
                        </div>

                        {/* Video Selection */}
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <label className="text-sm font-medium text-gray-600 dark:text-gray-400 flex items-center gap-1.5">
                                    <ListVideo className="w-4 h-4" />
                                    Add Videos
                                    {selectedVideoIds.length > 0 && (
                                        <span className="text-xs bg-purple-500/20 text-purple-400 px-2 py-0.5 rounded-full">
                                            {selectedVideoIds.length} selected
                                        </span>
                                    )}
                                </label>
                            </div>

                            {/* Search Videos */}
                            {userVideos.length > 3 && (
                                <div className="relative mb-2">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder="Search your videos..."
                                        className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-gray-700 bg-transparent text-sm dark:text-white focus:outline-none focus:ring-1 focus:ring-purple-500 transition-all"
                                    />
                                </div>
                            )}

                            {/* Video List */}
                            <div className="max-h-[200px] overflow-y-auto rounded-lg border border-gray-700 custom-scrollbar">
                                {loadingVideos ? (
                                    <div className="flex justify-center items-center py-8">
                                        <Loader size="size-6" />
                                    </div>
                                ) : filteredVideos.length === 0 ? (
                                    <p className="text-center text-sm text-gray-500 dark:text-gray-400 py-6">
                                        {userVideos.length === 0
                                            ? "You haven't uploaded any videos yet."
                                            : "No videos match your search."}
                                    </p>
                                ) : (
                                    filteredVideos.map((video) => {
                                        const isSelected = selectedVideoIds.includes(video._id as string)
                                        return (
                                            <div
                                                key={video._id as string}
                                                onClick={() => toggleVideoSelection(video._id as string)}
                                                className={`flex items-center gap-3 px-3 py-2 cursor-pointer transition-all duration-200 hover:bg-gray-100 dark:hover:bg-gray-800/60 ${isSelected ? 'bg-purple-500/10 dark:bg-purple-500/10' : ''
                                                    }`}
                                            >
                                                {/* Checkbox */}
                                                <div className={`w-5 h-5 rounded flex-shrink-0 flex items-center justify-center border-2 transition-all duration-200 ${isSelected
                                                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 border-purple-500'
                                                    : 'border-gray-500'
                                                    }`}>
                                                    {isSelected && <Check className="w-3 h-3 text-white" />}
                                                </div>

                                                {/* Thumbnail */}
                                                <div className="relative w-[60px] h-[36px] flex-shrink-0 rounded overflow-hidden">
                                                    <Image
                                                        alt={video.title}
                                                        src={video.thumbnail}
                                                        fill
                                                        className="object-cover"
                                                        sizes="60px"
                                                    />
                                                </div>

                                                {/* Title */}
                                                <span className="text-sm dark:text-gray-200 text-gray-800 line-clamp-1 flex-1">
                                                    {video.title}
                                                </span>
                                            </div>
                                        )
                                    })
                                )}
                            </div>
                        </div>

                        {/* Create Button */}
                        <Button
                            onClick={handleCreatePlaylist}
                            disabled={isCreating || !name.trim() || !description.trim()}
                            className="opacity-100 hover:bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 border-purple-300 hover:font-semibold cursor-pointer w-full hover:border-purple-500 transition-all duration-300 border rounded-full py-2 mt-1"
                        >
                            {isCreating ? 'Creating...' : `Create Playlist${selectedVideoIds.length > 0 ? ` with ${selectedVideoIds.length} video${selectedVideoIds.length > 1 ? 's' : ''}` : ''}`}
                        </Button>
                    </div>
                </motion.div>
            )}
        </>
    )
}

export default CreatePlaylist
