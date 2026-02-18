'use client'
import React, { useEffect, useState } from 'react'
import { PlaylistInterface } from '@/interfaces/playlist'
import { requestHandler } from '@/utils'
import { getUserPlaylists } from '@/lib/apiClient'
import { toast } from 'sonner'
import PlaylistGrid from '../playlist/PlaylistGrid'

interface UserPlaylistsProps {
    userId: string
}

const UserPlaylists: React.FC<UserPlaylistsProps> = ({ userId }) => {
    const [playlists, setPlaylists] = useState<PlaylistInterface[]>([])
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (!userId) return

        requestHandler(
            async () => await getUserPlaylists(userId),
            setLoading,
            (res) => {
                setPlaylists(res.data || [])
            },
            (err: any) => toast.error(err?.message || "Failed to load playlists")
        )
    }, [userId])

    return (
        <div className="w-full">
            <PlaylistGrid
                playlists={playlists}
                loading={loading}
                showOwner={false}
                emptyMessage="No playlists yet."
            />
        </div>
    )
}

export default UserPlaylists
