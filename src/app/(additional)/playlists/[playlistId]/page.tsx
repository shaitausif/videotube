'use client'
import React from 'react'
import PlaylistDetail from '../../../../../components/playlist/PlaylistDetail'
import { useParams } from 'next/navigation'

const PlaylistDetailPage = () => {
    const params = useParams()
    const playlistId = params.playlistId as string

    return (
        <main className="w-full h-full flex md:px-8 px-4 md:py-4 py-2">
            <PlaylistDetail playlistId={playlistId} />
        </main>
    )
}

export default PlaylistDetailPage
