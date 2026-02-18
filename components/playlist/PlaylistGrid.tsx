'use client'
import React from 'react'
import { PlaylistInterface } from '@/interfaces/playlist'
import PlaylistCard from './PlaylistCard'
import PlaylistSkel from '../skeletons/PlaylistSkel'

interface PlaylistGridProps {
    playlists: PlaylistInterface[]
    loading: boolean
    showOwner?: boolean
    emptyMessage?: string
}

const PlaylistGrid: React.FC<PlaylistGridProps> = ({
    playlists,
    loading,
    showOwner = true,
    emptyMessage = "No playlists found."
}) => {
    const skeletonCount = [1, 2, 3, 4, 5, 6]

    if (loading) {
        return (
            <div className="grid gap-5 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 w-full">
                {skeletonCount.map((skel) => (
                    <PlaylistSkel key={skel} />
                ))}
            </div>
        )
    }

    if (!playlists || playlists.length === 0) {
        return (
            <div className="flex justify-center items-center w-full h-[30vh] text-gray-500 dark:text-gray-400">
                <p className="text-lg">{emptyMessage}</p>
            </div>
        )
    }

    return (
        <div className="grid gap-5 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 w-full">
            {playlists.map((playlist) => (
                <PlaylistCard
                    key={playlist._id}
                    playlist={playlist}
                    showOwner={showOwner}
                />
            ))}
        </div>
    )
}

export default PlaylistGrid
