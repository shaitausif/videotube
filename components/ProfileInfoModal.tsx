'use client'
import React from 'react'
import {
    AlertDialog,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Globe, Github, Linkedin, Twitter, Instagram, Calendar, X, ExternalLink } from 'lucide-react'

interface SocialLinks {
    website?: string
    twitter?: string
    instagram?: string
    github?: string
    linkedin?: string
}

interface ProfileInfoModalProps {
    fullName?: string
    username?: string
    bio?: string
    socialLinks?: SocialLinks
    subscribersCount?: number
    createdAt?: string
    children: React.ReactNode // trigger element
}

const socialConfig = [
    { key: 'website' as const, label: 'Website', icon: Globe },
    { key: 'twitter' as const, label: 'X (Twitter)', icon: Twitter },
    { key: 'instagram' as const, label: 'Instagram', icon: Instagram },
    { key: 'github' as const, label: 'GitHub', icon: Github },
    { key: 'linkedin' as const, label: 'LinkedIn', icon: Linkedin },
]

const ProfileInfoModal = ({
    fullName,
    username,
    bio,
    socialLinks,
    subscribersCount,
    createdAt,
    children
}: ProfileInfoModalProps) => {

    const hasSocialLinks = socialLinks && Object.values(socialLinks).some((v) => v && v.trim().length > 0)
    const joinedDate = createdAt ? new Date(createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : null

    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                {children}
            </AlertDialogTrigger>
            <AlertDialogContent className="max-w-md rounded-2xl p-0 overflow-hidden dark:bg-[#1a1a1a] border-gray-200 dark:border-gray-700/50">
                {/* Header */}
                <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 px-6 pt-6 pb-4">
                    <AlertDialogHeader className="flex-row items-start justify-between">
                        <div>
                            <AlertDialogTitle className="text-xl font-bold dark:text-white">
                                {fullName || 'User'}
                            </AlertDialogTitle>
                            {username && (
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">@{username}</p>
                            )}
                        </div>
                        <AlertDialogCancel className="border-0 shadow-none p-1 h-auto w-auto rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 mt-0">
                            <X className="w-4 h-4" />
                        </AlertDialogCancel>
                    </AlertDialogHeader>
                </div>

                <div className="px-6 pb-6 flex flex-col gap-5">
                    {/* Bio */}
                    {bio && (
                        <div>
                            <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">About</h4>
                            <p className="text-sm dark:text-gray-300 text-gray-600 leading-relaxed whitespace-pre-wrap">
                                {bio}
                            </p>
                        </div>
                    )}

                    {/* Stats */}
                    <div className="flex items-center gap-6">
                        {subscribersCount !== undefined && (
                            <div>
                                <span className="text-lg font-bold dark:text-white">{subscribersCount.toLocaleString()}</span>
                                <p className="text-xs text-gray-400">
                                    {subscribersCount === 1 ? 'Subscriber' : 'Subscribers'}
                                </p>
                            </div>
                        )}
                        {joinedDate && (
                            <div className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400">
                                <Calendar className="w-3.5 h-3.5" />
                                <span>Joined {joinedDate}</span>
                            </div>
                        )}
                    </div>

                    {/* Social Links */}
                    {hasSocialLinks && (
                        <div>
                            <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">Links</h4>
                            <div className="flex flex-col gap-2">
                                {socialConfig.map((social) => {
                                    const url = socialLinks?.[social.key]
                                    if (!url || url.trim().length === 0) return null
                                    return (
                                        <a
                                            key={social.key}
                                            href={url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800/50 transition-all group"
                                        >
                                            <social.icon className="w-4 h-4 text-gray-400 group-hover:text-purple-400 transition-colors" />
                                            <span className="text-sm text-blue-500 dark:text-blue-400 flex-1 truncate underline-offset-2 hover:underline">
                                                {url}
                                            </span>
                                            <ExternalLink className="w-3.5 h-3.5 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                                        </a>
                                    )
                                })}
                            </div>
                        </div>
                    )}

                    {/* Empty state when no bio or social links */}
                    {!bio && !hasSocialLinks && (
                        <p className="text-sm text-gray-400 text-center py-4">
                            This user hasn&apos;t added any profile details yet.
                        </p>
                    )}
                </div>
            </AlertDialogContent>
        </AlertDialog>
    )
}

export default ProfileInfoModal
