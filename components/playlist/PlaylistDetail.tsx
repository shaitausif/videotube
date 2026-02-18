'use client'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { PlaylistInterface } from '@/interfaces/playlist'
import { requestHandler } from '@/utils'
import {
    getPlaylistById,
    deletePlaylist,
    toggleBookmarkPlaylist,
    removeVideoFromPlaylist
} from '@/lib/apiClient'
import { toast } from 'sonner'
import { useSelector } from 'react-redux'
import { RootState } from '@/store/store'
import { Button } from '@/components/ui/button'
import {
    AlertDialog,
    AlertDialogTrigger,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogFooter,
    AlertDialogTitle,
    AlertDialogDescription,
    AlertDialogCancel,
    AlertDialogAction,
} from "@/components/ui/alert-dialog"
import { Bookmark, BookmarkCheck, ListVideo, Trash2, ArrowLeft } from 'lucide-react'
import { formatVideoDuration } from '@/utils'
import { formatDistanceToNow } from 'date-fns'
import PlaylistSkel from '../skeletons/PlaylistSkel'

interface PlaylistDetailProps {
    playlistId: string
}

const PlaylistDetail: React.FC<PlaylistDetailProps> = ({ playlistId }) => {
    const [playlist, setPlaylist] = useState<PlaylistInterface | null>(null)
    const [loading, setLoading] = useState(false)
    const [isBookmarked, setIsBookmarked] = useState(false)
    const user = useSelector((state: RootState) => state?.user)
    const router = useRouter()
    const bookmarkTimer = useRef<NodeJS.Timeout | null>(null)

    const isOwner = playlist?.owner?._id === user?._id

    const fetchPlaylist = useCallback(() => {
        requestHandler(
            async () => await getPlaylistById(playlistId),
            setLoading,
            (res) => {
                setPlaylist(res.data)
                // Check if current user has bookmarked this playlist
                setIsBookmarked(user?.bookmarkedPlaylists?.includes(res.data._id) || false)
            },
            (err: any) => {
                toast.error(err?.message || "Failed to load playlist")
                router.push('/playlists')
            }
        )
    }, [playlistId])

    useEffect(() => {
        fetchPlaylist()
    }, [fetchPlaylist])

    const handleToggleBookmark = () => {
        setIsBookmarked((prev) => !prev)

        if (bookmarkTimer.current) {
            clearTimeout(bookmarkTimer.current)
        }

        bookmarkTimer.current = setTimeout(() => {
            requestHandler(
                async () => await toggleBookmarkPlaylist(playlistId),
                null,
                (res) => {
                    toast.success(res.data ? "Playlist bookmarked!" : "Bookmark removed!")
                },
                (err: any) => toast.error(err?.message || "Failed to toggle bookmark")
            )
            bookmarkTimer.current = null
        }, 800)
    }

    const handleDeletePlaylist = () => {
        requestHandler(
            async () => await deletePlaylist(playlistId),
            null,
            () => {
                toast.success("Playlist deleted!")
                router.push('/playlists')
            },
            (err: any) => toast.error(err?.message || "Failed to delete playlist")
        )
    }

    const handleRemoveVideo = (videoId: string) => {
        requestHandler(
            async () => await removeVideoFromPlaylist(playlistId, videoId),
            null,
            () => {
                toast.success("Video removed from playlist!")
                setPlaylist((prev) => {
                    if (!prev) return prev
                    return {
                        ...prev,
                        videos: prev.videos.filter((v) => v._id !== videoId)
                    }
                })
            },
            (err: any) => toast.error(err?.message || "Failed to remove video")
        )
    }

    const placeholderThumbnail = "https://craftsnippets.com/articles_images/placeholder/placeholder.jpg"

    if (loading || !playlist) {
        return (
            <div className="w-full flex flex-col md:flex-row gap-6 p-4">
                <div className="md:w-[360px] w-full">
                    <PlaylistSkel />
                </div>
                <div className="flex-1 space-y-3">
                    {[1, 2, 3, 4].map((s) => <PlaylistSkel key={s} />)}
                </div>
            </div>
        )
    }

    const thumbnail = playlist.videos?.[0]?.thumbnail || placeholderThumbnail
    const videoCount = playlist.videos?.length || 0

    return (
        <div className="w-full flex flex-col md:flex-row gap-6">
            {/* Sidebar — Playlist Info */}
            <div className="md:w-[360px] w-full shrink-0">
                <div className="sticky top-24 rounded-xl bg-gradient-to-b from-blue-600/20 to-transparent dark:from-blue-900/30 p-4 flex flex-col gap-4">
                    {/* Back button */}
                    <button
                        onClick={() => router.back()}
                        className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors w-fit"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back
                    </button>

                    {/* Thumbnail */}
                    <div className="relative w-full h-[200px] rounded-xl overflow-hidden">
                        <Image
                            alt={playlist.name}
                            src={thumbnail}
                            fill
                            className="object-cover"
                            sizes="360px"
                        />
                        <div className="absolute bottom-0 right-0 bg-black/80 text-white px-3 py-1.5 flex items-center gap-1.5 text-sm rounded-tl-lg">
                            <ListVideo className="w-4 h-4" />
                            <span>{videoCount} {videoCount === 1 ? 'video' : 'videos'}</span>
                        </div>
                    </div>

                    {/* Title & Description */}
                    <div>
                        <h1 className="text-2xl font-bold dark:text-white">{playlist.name}</h1>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{playlist.description}</p>
                    </div>

                    {/* Owner info */}
                    <div
                        className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={() => router.push(`/c/${playlist.owner.username}`)}
                    >
                        <div className="relative w-10 h-10 rounded-full overflow-hidden">
                            <Image
                                alt={playlist.owner.fullName}
                                src={playlist.owner.avatar || placeholderThumbnail}
                                fill
                                className="object-cover"
                            />
                        </div>
                        <div>
                            <p className="font-medium text-sm dark:text-white">{playlist.owner.fullName}</p>
                            <p className="text-xs text-gray-500">@{playlist.owner.username}</p>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-3 flex-wrap">
                        {/* Bookmark button */}
                        <Button
                            onClick={handleToggleBookmark}
                            variant="outline"
                            className="rounded-3xl flex items-center gap-2 text-sm"
                        >
                            {isBookmarked ? (
                                <BookmarkCheck className="w-4 h-4 text-blue-500" />
                            ) : (
                                <Bookmark className="w-4 h-4" />
                            )}
                            {isBookmarked ? 'Bookmarked' : 'Bookmark'}
                        </Button>

                        {/* Delete — owner only */}
                        {isOwner && (
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button
                                        variant="destructive"
                                        className="rounded-3xl flex items-center gap-2 text-sm"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                        Delete
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Delete this playlist?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            This action cannot be undone. This will permanently delete &quot;{playlist.name}&quot;.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction onClick={handleDeletePlaylist}>
                                            Delete
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        )}
                    </div>
                </div>
            </div>

            {/* Video List */}
            <div className="flex-1 flex flex-col gap-3">
                {videoCount === 0 ? (
                    <div className="flex justify-center items-center h-[30vh] text-gray-500 dark:text-gray-400">
                        <p>No videos in this playlist yet.</p>
                    </div>
                ) : (
                    playlist.videos.map((video, index) => (
                        <div
                            key={video._id as string}
                            className="flex gap-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 cursor-pointer group"
                            onClick={() => router.push(`/video/${video._id}`)}
                        >
                            {/* Index */}
                            <span className="text-sm text-gray-400 dark:text-gray-500 w-6 flex items-center justify-center shrink-0">
                                {index + 1}
                            </span>

                            {/* Thumbnail */}
                            <div className="relative w-[160px] h-[90px] rounded-lg overflow-hidden shrink-0">
                                <Image
                                    alt={video.title}
                                    src={video.thumbnail || placeholderThumbnail}
                                    fill
                                    className="object-cover"
                                    sizes="160px"
                                />
                                <div className="absolute bottom-1 right-1 bg-black/80 text-white px-1.5 py-0.5 text-xs rounded">
                                    {formatVideoDuration(video.duration)}
                                </div>
                            </div>

                            {/* Info */}
                            <div className="flex-1 flex flex-col justify-center min-w-0">
                                <h3 className="text-sm font-medium dark:text-white line-clamp-2">{video.title}</h3>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                    {video.owner?.fullName || video.owner?.username}
                                </p>
                                <p className="text-xs text-gray-400 dark:text-gray-500">
                                    {video.views} views • {video.createdAt && formatDistanceToNow(new Date(video.createdAt), { addSuffix: true })}
                                </p>
                            </div>

                            {/* Remove button — owner only */}
                            {isOwner && (
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        handleRemoveVideo(video._id as string)
                                    }}
                                    className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-red-500 self-center p-2"
                                    title="Remove from playlist"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}

export default PlaylistDetail
