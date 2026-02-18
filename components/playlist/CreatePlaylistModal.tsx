'use client'
import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { requestHandler } from '@/utils'
import { createPlaylist } from '@/lib/apiClient'
import { PlaylistInterface } from '@/interfaces/playlist'
import { Plus, X } from 'lucide-react'

interface CreatePlaylistModalProps {
    onPlaylistCreated: (playlist: PlaylistInterface) => void
}

const CreatePlaylistModal: React.FC<CreatePlaylistModalProps> = ({ onPlaylistCreated }) => {
    const [isOpen, setIsOpen] = useState(false)
    const [name, setName] = useState('')
    const [description, setDescription] = useState('')
    const [loading, setLoading] = useState(false)

    const handleCreate = async () => {
        if (!name.trim() || !description.trim()) {
            toast.error("Name and description are required")
            return
        }

        requestHandler(
            async () => await createPlaylist(name.trim(), description.trim()),
            setLoading,
            (res) => {
                toast.success("Playlist created successfully!")
                onPlaylistCreated(res.data)
                setName('')
                setDescription('')
                setIsOpen(false)
            },
            (err: any) => toast.error(err?.message || "Failed to create playlist")
        )
    }

    if (!isOpen) {
        return (
            <Button
                onClick={() => setIsOpen(true)}
                className="rounded-3xl font-semibold text-md flex items-center gap-2"
            >
                <Plus className="w-5 h-5" />
                New Playlist
            </Button>
        )
    }

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setIsOpen(false)}>
            <div
                className="bg-white dark:bg-gray-900 rounded-xl p-6 w-full max-w-md mx-4 shadow-2xl"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold dark:text-white">Create New Playlist</h2>
                    <button
                        onClick={() => setIsOpen(false)}
                        className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="flex flex-col gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Name
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="My Playlist"
                            className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                            maxLength={100}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Description
                        </label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="What's this playlist about?"
                            rows={3}
                            className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all resize-none"
                            maxLength={500}
                        />
                    </div>

                    <div className="flex justify-end gap-3">
                        <Button
                            variant="outline"
                            onClick={() => setIsOpen(false)}
                            className="rounded-3xl"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleCreate}
                            disabled={loading || !name.trim() || !description.trim()}
                            className="rounded-3xl font-semibold"
                        >
                            {loading ? 'Creating...' : 'Create'}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default CreatePlaylistModal
