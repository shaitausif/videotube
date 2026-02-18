'use client'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { PlaylistInterface } from '@/interfaces/playlist'
import { requestHandler } from '@/utils'
import { getBookmarkedPlaylists } from '@/lib/apiClient'
import { toast } from 'sonner'
import PlaylistGrid from '../../../../components/playlist/PlaylistGrid'
import { ArrowDownUp } from 'lucide-react'

type SortOrder = 'newest' | 'oldest'

const PlaylistsPage = () => {
    const [bookmarkedPlaylists, setBookmarkedPlaylists] = useState<PlaylistInterface[]>([])
    const [loading, setLoading] = useState(false)
    const [sortOrder, setSortOrder] = useState<SortOrder>('newest')

    const fetchBookmarkedPlaylists = useCallback(() => {
        requestHandler(
            async () => await getBookmarkedPlaylists(),
            setLoading,
            (res) => setBookmarkedPlaylists(res.data || []),
            (err: any) => toast.error(err?.message || "Failed to load bookmarked playlists")
        )
    }, [])

    useEffect(() => {
        fetchBookmarkedPlaylists()
    }, [fetchBookmarkedPlaylists])

    const sortedPlaylists = useMemo(() => {
        return [...bookmarkedPlaylists].sort((a, b) => {
            const dateA = new Date(a.createdAt).getTime()
            const dateB = new Date(b.createdAt).getTime()
            return sortOrder === 'newest' ? dateB - dateA : dateA - dateB
        })
    }, [bookmarkedPlaylists, sortOrder])

    return (
        <main className="w-full h-full flex flex-col md:px-8 px-4 md:py-4 py-2 gap-6">
            {/* Header */}
            <div className="flex items-center justify-between flex-wrap gap-4">
                <h1 className="text-2xl md:text-3xl font-bold dark:text-white">Bookmarked Playlists</h1>

                {/* Sort Filter */}
                <div className="flex items-center gap-2">
                    <ArrowDownUp className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                    <select
                        value={sortOrder}
                        onChange={(e) => setSortOrder(e.target.value as SortOrder)}
                        className="px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-red-500 cursor-pointer transition-all"
                    >
                        <option value="newest">Recently Added</option>
                        <option value="oldest">Oldest First</option>
                    </select>
                </div>
            </div>

            {/* Content */}
            <PlaylistGrid
                playlists={sortedPlaylists}
                loading={loading}
                showOwner={true}
                emptyMessage="You haven't bookmarked any playlists yet."
            />
        </main>
    )
}

export default PlaylistsPage
