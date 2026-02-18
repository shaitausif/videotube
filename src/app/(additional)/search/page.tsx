'use client'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { searchVideos } from '@/lib/apiClient'
import { VideoInterface } from '@/models/video.model'
import { requestHandler, formatVideoDuration } from '@/utils'
import { toast } from 'sonner'
import Image from 'next/image'
import { formatDistanceToNow } from 'date-fns'
import {
    SlidersHorizontal,
    Clock,
    TrendingUp,
    CalendarDays,
    Timer,
    X,
    ChevronLeft,
    ChevronRight,
    Search,
} from 'lucide-react'
import { Button } from '@/components/ui/button'

type SortBy = 'relevance' | 'date' | 'views'
type UploadDate = '' | 'hour' | 'today' | 'week' | 'month' | 'year'
type Duration = '' | 'short' | 'medium' | 'long'

const sortOptions: { value: SortBy; label: string; icon: React.ReactNode }[] = [
    { value: 'relevance', label: 'Relevance', icon: <TrendingUp className="w-3.5 h-3.5" /> },
    { value: 'date', label: 'Upload date', icon: <CalendarDays className="w-3.5 h-3.5" /> },
    { value: 'views', label: 'View count', icon: <TrendingUp className="w-3.5 h-3.5" /> },
]

const uploadDateOptions: { value: UploadDate; label: string }[] = [
    { value: '', label: 'Any time' },
    { value: 'hour', label: 'Last hour' },
    { value: 'today', label: 'Today' },
    { value: 'week', label: 'This week' },
    { value: 'month', label: 'This month' },
    { value: 'year', label: 'This year' },
]

const durationOptions: { value: Duration; label: string }[] = [
    { value: '', label: 'Any duration' },
    { value: 'short', label: 'Under 4 minutes' },
    { value: 'medium', label: '4 – 20 minutes' },
    { value: 'long', label: 'Over 20 minutes' },
]

const SearchPage = () => {
    const searchParams = useSearchParams()
    const router = useRouter()
    const query = searchParams.get('q') || ''

    const [videos, setVideos] = useState<VideoInterface[]>([])
    const [loading, setLoading] = useState(false)
    const [totalCount, setTotalCount] = useState(0)
    const [page, setPage] = useState(1)
    const [totalPages, setTotalPages] = useState(0)

    // Filters
    const [sortBy, setSortBy] = useState<SortBy>('relevance')
    const [uploadDate, setUploadDate] = useState<UploadDate>('')
    const [duration, setDuration] = useState<Duration>('')
    const [showFilters, setShowFilters] = useState(false)

    const hasActiveFilters = useMemo(() => {
        return sortBy !== 'relevance' || uploadDate !== '' || duration !== ''
    }, [sortBy, uploadDate, duration])

    const clearFilters = () => {
        setSortBy('relevance')
        setUploadDate('')
        setDuration('')
        setPage(1)
    }

    const fetchVideos = useCallback(() => {
        if (!query) return
        requestHandler(
            async () => await searchVideos({ query, sortBy, uploadDate, duration, page, limit: 20 }),
            setLoading,
            (res) => {
                setVideos(res.data || [])
                setTotalCount(res.totalCount ?? 0)
                setTotalPages(res.totalPages ?? 0)
            },
            (err: any) => {
                console.error(err)
                toast.error(err?.message || 'Failed to search videos')
                setVideos([])
            }
        )
    }, [query, sortBy, uploadDate, duration, page])

    // Refetch when query or filters change
    useEffect(() => {
        setPage(1)
    }, [query, sortBy, uploadDate, duration])

    useEffect(() => {
        fetchVideos()
    }, [fetchVideos])

    const activeFilterChips = useMemo(() => {
        const chips: { key: string; label: string; onRemove: () => void }[] = []
        if (sortBy !== 'relevance') {
            const opt = sortOptions.find((o) => o.value === sortBy)
            chips.push({ key: 'sort', label: `Sort: ${opt?.label}`, onRemove: () => setSortBy('relevance') })
        }
        if (uploadDate) {
            const opt = uploadDateOptions.find((o) => o.value === uploadDate)
            chips.push({ key: 'date', label: opt?.label || uploadDate, onRemove: () => setUploadDate('') })
        }
        if (duration) {
            const opt = durationOptions.find((o) => o.value === duration)
            chips.push({ key: 'dur', label: opt?.label || duration, onRemove: () => setDuration('') })
        }
        return chips
    }, [sortBy, uploadDate, duration])

    if (!query) {
        return (
            <div className="flex flex-col justify-center items-center h-[60vh] gap-4">
                <Search className="w-16 h-16 text-gray-300 dark:text-gray-600" />
                <p className="text-xl text-gray-500 dark:text-gray-400">Enter a search query to find videos</p>
            </div>
        )
    }

    return (
        <main className="w-full flex flex-col md:px-8 px-4 md:py-6 py-3 gap-4">
            {/* Header */}
            <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold dark:text-white">
                            Search results for &quot;{query}&quot;
                        </h1>
                        {!loading && (
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                                {totalCount} {totalCount === 1 ? 'result' : 'results'} found
                            </p>
                        )}
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowFilters(!showFilters)}
                        className={`rounded-xl gap-2 transition-all ${hasActiveFilters ? 'border-purple-500 text-purple-500' : ''}`}
                    >
                        <SlidersHorizontal className="w-4 h-4" />
                        Filters
                        {hasActiveFilters && (
                            <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                        )}
                    </Button>
                </div>

                {/* Active filter chips */}
                {activeFilterChips.length > 0 && (
                    <div className="flex items-center gap-2 flex-wrap">
                        {activeFilterChips.map((chip) => (
                            <span
                                key={chip.key}
                                className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/10 text-purple-400 text-xs font-medium"
                            >
                                {chip.label}
                                <button onClick={chip.onRemove} className="hover:text-purple-300 transition-colors">
                                    <X className="w-3 h-3" />
                                </button>
                            </span>
                        ))}
                        <button onClick={clearFilters} className="text-xs text-gray-400 hover:text-gray-300 transition-colors ml-1">
                            Clear all
                        </button>
                    </div>
                )}

                {/* Filters panel */}
                {showFilters && (
                    <div className="bg-white dark:bg-gray-800/30 rounded-2xl border border-gray-200 dark:border-gray-700/50 p-5 flex flex-col md:flex-row gap-6">
                        {/* Sort By */}
                        <div className="flex-1">
                            <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3 flex items-center gap-1.5">
                                <TrendingUp className="w-3.5 h-3.5" />
                                Sort by
                            </h4>
                            <div className="flex flex-col gap-1.5">
                                {sortOptions.map((opt) => (
                                    <button
                                        key={opt.value}
                                        onClick={() => setSortBy(opt.value)}
                                        className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm transition-all ${
                                            sortBy === opt.value
                                                ? 'bg-purple-500/15 text-purple-400 font-medium'
                                                : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700/50'
                                        }`}
                                    >
                                        {opt.icon}
                                        {opt.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Upload Date */}
                        <div className="flex-1">
                            <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3 flex items-center gap-1.5">
                                <CalendarDays className="w-3.5 h-3.5" />
                                Upload date
                            </h4>
                            <div className="flex flex-col gap-1.5">
                                {uploadDateOptions.map((opt) => (
                                    <button
                                        key={opt.value}
                                        onClick={() => setUploadDate(opt.value)}
                                        className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm transition-all ${
                                            uploadDate === opt.value
                                                ? 'bg-purple-500/15 text-purple-400 font-medium'
                                                : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700/50'
                                        }`}
                                    >
                                        {opt.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Duration */}
                        <div className="flex-1">
                            <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3 flex items-center gap-1.5">
                                <Timer className="w-3.5 h-3.5" />
                                Duration
                            </h4>
                            <div className="flex flex-col gap-1.5">
                                {durationOptions.map((opt) => (
                                    <button
                                        key={opt.value}
                                        onClick={() => setDuration(opt.value)}
                                        className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm transition-all ${
                                            duration === opt.value
                                                ? 'bg-purple-500/15 text-purple-400 font-medium'
                                                : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700/50'
                                        }`}
                                    >
                                        {opt.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Results */}
            {loading ? (
                <div className="flex flex-col gap-4">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="flex gap-4 animate-pulse">
                            <div className="w-[360px] h-[200px] rounded-xl bg-gray-200 dark:bg-gray-700 flex-shrink-0 hidden md:block" />
                            <div className="w-full h-[200px] rounded-xl bg-gray-200 dark:bg-gray-700 md:hidden" />
                            <div className="flex-1 flex-col gap-3 py-1 hidden md:flex">
                                <div className="h-5 w-3/4 rounded bg-gray-200 dark:bg-gray-700" />
                                <div className="h-4 w-1/2 rounded bg-gray-200 dark:bg-gray-700" />
                                <div className="h-3 w-1/3 rounded bg-gray-200 dark:bg-gray-700" />
                                <div className="h-3 w-full rounded bg-gray-200 dark:bg-gray-700 mt-2" />
                                <div className="h-3 w-2/3 rounded bg-gray-200 dark:bg-gray-700" />
                            </div>
                        </div>
                    ))}
                </div>
            ) : videos.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-[40vh] gap-3">
                    <Search className="w-12 h-12 text-gray-300 dark:text-gray-600" />
                    <p className="text-lg text-gray-500 dark:text-gray-400">No videos found for &quot;{query}&quot;</p>
                    {hasActiveFilters && (
                        <button onClick={clearFilters} className="text-sm text-purple-400 hover:text-purple-300 transition-colors">
                            Try clearing your filters
                        </button>
                    )}
                </div>
            ) : (
                <div className="flex flex-col gap-4">
                    {videos.map((video) => (
                        <div
                            key={video._id as string}
                            onClick={() => router.push(`/video/${video._id}`)}
                            className="flex flex-col md:flex-row gap-4 cursor-pointer group rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all p-2 -mx-2"
                        >
                            {/* Thumbnail */}
                            <div className="relative w-full md:w-[360px] aspect-video rounded-xl overflow-hidden flex-shrink-0">
                                <Image
                                    src={video.thumbnail || 'https://craftsnippets.com/articles_images/placeholder/placeholder.jpg'}
                                    alt={video.title}
                                    fill
                                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                                />
                                <span className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-1.5 py-0.5 rounded">
                                    {formatVideoDuration(video.duration)}
                                </span>
                            </div>

                            {/* Info */}
                            <div className="flex flex-col gap-1.5 py-1 flex-1 min-w-0">
                                <h3 className="text-lg font-semibold dark:text-white line-clamp-2 group-hover:text-purple-400 transition-colors">
                                    {video.title}
                                </h3>
                                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                                    <span>{video.views?.toLocaleString()} views</span>
                                    <span>•</span>
                                    <span>{formatDistanceToNow(new Date(video.createdAt!), { addSuffix: true })}</span>
                                </div>
                                {/* Owner */}
                                <div
                                    className="flex items-center gap-2 mt-1"
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        router.push(`/c/${video.owner?.username}`)
                                    }}
                                >
                                    <div className="relative w-6 h-6 rounded-full overflow-hidden flex-shrink-0">
                                        <Image
                                            src={video.owner?.avatar || 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQfj3Bm37Nn_rBQHkIzxnpmGMv3AnLWNYvA1_GwXzebfQ7rxLHl0fRsKo6mIi1SmoOiCL4&usqp=CAU'}
                                            alt={video.owner?.fullName || 'Channel'}
                                            fill
                                            className="object-cover"
                                        />
                                    </div>
                                    <span className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
                                        {video.owner?.fullName}
                                    </span>
                                </div>
                                {/* Description preview */}
                                <p className="text-sm text-gray-400 dark:text-gray-500 line-clamp-2 mt-1 hidden md:block">
                                    {video.description}
                                </p>
                            </div>
                        </div>
                    ))}

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-center gap-4 py-6">
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={page <= 1}
                                onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                                className="rounded-xl gap-1"
                            >
                                <ChevronLeft className="w-4 h-4" />
                                Previous
                            </Button>
                            <span className="text-sm text-gray-500 dark:text-gray-400">
                                Page {page} of {totalPages}
                            </span>
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={page >= totalPages}
                                onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
                                className="rounded-xl gap-1"
                            >
                                Next
                                <ChevronRight className="w-4 h-4" />
                            </Button>
                        </div>
                    )}
                </div>
            )}
        </main>
    )
}

export default SearchPage
