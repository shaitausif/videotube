'use client'
import React from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { PlaylistInterface } from '@/interfaces/playlist'
import { ListVideo } from 'lucide-react'

interface PlaylistCardProps {
    playlist: PlaylistInterface
    showOwner?: boolean
}

const PlaylistCard: React.FC<PlaylistCardProps> = ({ playlist, showOwner = true }) => {
    const router = useRouter()

    const videoCount = playlist.videos?.length || 0
    const thumbnail = playlist.videos?.[0]?.thumbnail || '/temp/playlist-placeholder.png'

    const placeholderThumbnail = "https://craftsnippets.com/articles_images/placeholder/placeholder.jpg"

    return (
        <div
            className="col-span-1 w-full rounded-lg bg-white dark:bg-gray-800 shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer dark:hover:bg-gray-900 overflow-hidden group"
            onClick={() => router.push(`/playlists/${playlist._id}`)}
        >
            {/* Thumbnail Stack Effect */}
            <div className="relative w-full h-[160px]">
                <Image
                    alt={playlist.name}
                    className="object-cover group-hover:opacity-90 transition-all duration-300"
                    src={thumbnail || placeholderThumbnail}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 25vw"
                />
                {/* Video count overlay */}
                <div className="absolute bottom-0 right-0 bg-black/80 text-white px-3 py-1.5 flex items-center gap-1.5 text-sm rounded-tl-lg">
                    <ListVideo className="w-4 h-4" />
                    <span>{videoCount} {videoCount === 1 ? 'video' : 'videos'}</span>
                </div>
            </div>

            {/* Info */}
            <div className="p-3 flex flex-col gap-1">
                <h3 className="font-semibold text-sm line-clamp-2 dark:text-white">
                    {playlist.name}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1">
                    {playlist.description}
                </p>
                {showOwner && playlist.owner && (
                    <p
                        className="text-xs text-gray-400 dark:text-gray-500 mt-1 hover:text-blue-500 dark:hover:text-blue-400 transition-colors"
                        onClick={(e) => {
                            e.stopPropagation()
                            router.push(`/c/${playlist.owner.username}`)
                        }}
                    >
                        {playlist.owner.fullName}
                    </p>
                )}
            </div>
        </div>
    )
}

export default PlaylistCard
