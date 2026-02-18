'use client'
import React, { useMemo, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '@/store/store'
import { setUser } from '@/features/userSlice/UserSlice'
import { toast } from 'sonner'
import { requestHandler } from '@/utils'
import {
    updateProfile,
    changePassword,
    editAvatar,
    editCoverImage,
    checkUsername
} from '@/lib/apiClient'
import { Button } from '@/components/ui/button'
import Image from 'next/image'
import {
    Edit,
    Eye,
    EyeOff,
    Globe,
    Github,
    Linkedin,
    Save,
    User,
    Lock,
    Camera,
    Twitter,
    Instagram,
    Link2
} from 'lucide-react'
import { useRouter } from 'next/navigation'

const SettingsPage = () => {
    const user = useSelector((state: RootState) => state?.user)
    const dispatch = useDispatch()
    const router = useRouter()

    // Profile form state
    const [fullName, setFullName] = useState(user.fullName || '')
    const [username, setUsername] = useState(user.username || '')
    const [bio, setBio] = useState(user.bio || '')
    const [socialLinks, setSocialLinks] = useState({
        website: user.socialLinks?.website || '',
        twitter: user.socialLinks?.twitter || '',
        instagram: user.socialLinks?.instagram || '',
        github: user.socialLinks?.github || '',
        linkedin: user.socialLinks?.linkedin || '',
    })

    // Password form state
    const [oldPassword, setOldPassword] = useState('')
    const [newPassword, setNewPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [showOldPassword, setShowOldPassword] = useState(false)
    const [showNewPassword, setShowNewPassword] = useState(false)

    // Loading states
    const [savingProfile, setSavingProfile] = useState(false)
    const [savingPassword, setSavingPassword] = useState(false)
    const [avatarLoading, setAvatarLoading] = useState(false)
    const [coverLoading, setCoverLoading] = useState(false)

    // Username validation state
    const [usernameStatus, setUsernameStatus] = useState<'idle' | 'checking' | 'available' | 'taken' | 'invalid'>('idle')
    const [usernameMessage, setUsernameMessage] = useState('')
    const usernameTimer = useRef<NodeJS.Timeout | null>(null)

    // Active section
    const [activeSection, setActiveSection] = useState<'profile' | 'password' | 'images'>('profile')

    // Track if profile has unsaved changes
    const hasProfileChanged = useMemo(() => {
        if (fullName !== (user.fullName || '')) return true
        if (username !== (user.username || '')) return true
        if (bio !== (user.bio || '')) return true
        const originalLinks = user.socialLinks || {}
        return (['website', 'twitter', 'instagram', 'github', 'linkedin'] as const).some(
            (key) => socialLinks[key] !== (originalLinks[key] || '')
        )
    }, [fullName, username, bio, socialLinks, user])

    const handleSocialLinkChange = (key: string, value: string) => {
        setSocialLinks((prev) => ({ ...prev, [key]: value }))
    }

    const handleUsernameChange = (value: string) => {
        const sanitized = value.toLowerCase().replace(/[^a-z0-9_]/g, '')
        setUsername(sanitized)

        // If same as current username, no need to check
        if (sanitized === user.username) {
            setUsernameStatus('idle')
            setUsernameMessage('')
            return
        }

        // Client-side validation first
        if (sanitized.length < 3) {
            setUsernameStatus('invalid')
            setUsernameMessage('Username must be at least 3 characters')
            return
        }

        if (!/^[a-z0-9_]+$/.test(sanitized)) {
            setUsernameStatus('invalid')
            setUsernameMessage('Only lowercase letters, numbers, and underscores')
            return
        }

        // Debounced server check
        setUsernameStatus('checking')
        setUsernameMessage('Checking availability...')

        if (usernameTimer.current) {
            clearTimeout(usernameTimer.current)
        }

        usernameTimer.current = setTimeout(() => {
            requestHandler(
                async () => await checkUsername(sanitized),
                null,
                (res) => {
                    if (res.data.available) {
                        setUsernameStatus('available')
                        setUsernameMessage("Username doesn't exist, you're good to go!")
                    } else {
                        setUsernameStatus('taken')
                        setUsernameMessage('Username already exists')
                    }
                },
                () => {
                    setUsernameStatus('idle')
                    setUsernameMessage('')
                }
            )
            usernameTimer.current = null
        }, 800)
    }

    const handleSaveProfile = async () => {
        if (!fullName.trim()) {
            toast.error("Full name cannot be empty")
            return
        }
        if (username.trim().length < 3) {
            toast.error("Username must be at least 3 characters")
            return
        }
        if (usernameStatus === 'taken' || usernameStatus === 'invalid') {
            toast.error(usernameMessage || "Please fix the username before saving")
            return
        }
        if (usernameStatus === 'checking') {
            toast.error("Please wait for username validation to complete")
            return
        }

        requestHandler(
            async () => await updateProfile({ fullName: fullName.trim(), username: username.trim(), bio, socialLinks }),
            setSavingProfile,
            (res) => {
                dispatch(setUser(res.data))
                toast.success("Profile updated successfully!")
            },
            (err: any) => toast.error(err?.message || "Failed to update profile")
        )
    }

    const handleChangePassword = async () => {
        if (!oldPassword || !newPassword) {
            toast.error("Both passwords are required")
            return
        }
        if (newPassword.length < 6) {
            toast.error("New password must be at least 6 characters")
            return
        }
        if (newPassword !== confirmPassword) {
            toast.error("Passwords do not match")
            return
        }

        requestHandler(
            async () => await changePassword(oldPassword, newPassword),
            setSavingPassword,
            (res) => {
                toast.success(res.message || "Password changed successfully!")
                setOldPassword('')
                setNewPassword('')
                setConfirmPassword('')
            },
            (err: any) => toast.error(err?.message || "Failed to change password")
        )
    }

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return
        if (!file.type.startsWith("image")) {
            toast.error("Please select a valid image file")
            return
        }
        requestHandler(
            async () => await editAvatar(file),
            setAvatarLoading,
            (res) => {
                dispatch(setUser({ avatar: res.data }))
                toast.success("Avatar updated!")
            },
            (err: any) => toast.error(err?.message || "Failed to update avatar")
        )
    }

    const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return
        if (!file.type.startsWith("image")) {
            toast.error("Please select a valid image file")
            return
        }
        requestHandler(
            async () => await editCoverImage(file),
            setCoverLoading,
            (res) => {
                dispatch(setUser({ coverImage: res.data }))
                toast.success("Cover image updated!")
            },
            (err: any) => toast.error(err?.message || "Failed to update cover image")
        )
    }

    const placeholderAvatar = "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQfj3Bm37Nn_rBQHkIzxnpmGMv3AnLWNYvA1_GwXzebfQ7rxLHl0fRsKo6mIi1SmoOiCL4&usqp=CAU"
    const placeholderCover = "https://craftsnippets.com/articles_images/placeholder/placeholder.jpg"

    const sections = [
        { key: 'profile' as const, label: 'Profile', icon: User },
        { key: 'password' as const, label: 'Password', icon: Lock },
        { key: 'images' as const, label: 'Images', icon: Camera },
    ]

    const socialLinkFields = [
        { key: 'website', label: 'Website', icon: Globe, placeholder: 'https://yourwebsite.com' },
        { key: 'twitter', label: 'X (Twitter)', icon: Twitter, placeholder: 'https://x.com/username' },
        { key: 'instagram', label: 'Instagram', icon: Instagram, placeholder: 'https://instagram.com/username' },
        { key: 'github', label: 'GitHub', icon: Github, placeholder: 'https://github.com/username' },
        { key: 'linkedin', label: 'LinkedIn', icon: Linkedin, placeholder: 'https://linkedin.com/in/username' },
    ]

    return (
        <main className="w-full h-full flex flex-col lg:flex-row md:px-8 px-4 md:py-6 py-3 gap-6">
            {/* Sidebar Navigation */}
            <aside className="lg:w-[240px] w-full flex-shrink-0">
                <div className="lg:sticky lg:top-24 flex lg:flex-col flex-row gap-2 lg:gap-1 overflow-x-auto">
                    <h2 className="text-xl font-bold dark:text-white mb-3 hidden lg:block">Settings</h2>
                    {sections.map((section) => (
                        <button
                            key={section.key}
                            onClick={() => setActiveSection(section.key)}
                            className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 whitespace-nowrap ${activeSection === section.key
                                ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-400 dark:text-purple-300'
                                : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800/50'
                                }`}
                        >
                            <section.icon className="w-4 h-4" />
                            {section.label}
                        </button>
                    ))}
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 max-w-2xl">
                {/* Profile Section */}
                {activeSection === 'profile' && (
                    <div className="flex flex-col gap-6">
                        <div>
                            <h3 className="text-2xl font-bold dark:text-white mb-1">Edit Profile</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Customize how others see you on Videotube</p>
                        </div>

                        <div className="flex flex-col gap-5 bg-white dark:bg-gray-800/30 rounded-2xl p-6 border border-gray-200 dark:border-gray-700/50">
                            {/* Full Name */}
                            <div>
                                <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1.5">
                                    Full Name
                                </label>
                                <input
                                    type="text"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    placeholder="Your full name"
                                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-transparent dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all text-sm"
                                />
                            </div>

                            {/* Username */}
                            <div>
                                <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1.5">
                                    Username
                                </label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">@</span>
                                    <input
                                        type="text"
                                        value={username}
                                        onChange={(e) => handleUsernameChange(e.target.value)}
                                        placeholder="username"
                                        className={`w-full pl-8 pr-10 py-2.5 rounded-xl border bg-transparent dark:text-white focus:outline-none focus:ring-2 transition-all text-sm ${
                                            usernameStatus === 'available'
                                                ? 'border-green-500 focus:ring-green-500/50 focus:border-green-500'
                                                : usernameStatus === 'taken' || usernameStatus === 'invalid'
                                                    ? 'border-red-500 focus:ring-red-500/50 focus:border-red-500'
                                                    : 'border-gray-300 dark:border-gray-600 focus:ring-purple-500/50 focus:border-purple-500'
                                        }`}
                                    />
                                    {/* Status indicator */}
                                    {usernameStatus === 'checking' && (
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                            <div className="w-4 h-4 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                                        </div>
                                    )}
                                    {usernameStatus === 'available' && (
                                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-green-500 text-sm">✓</span>
                                    )}
                                    {(usernameStatus === 'taken' || usernameStatus === 'invalid') && (
                                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-red-500 text-sm">✗</span>
                                    )}
                                </div>
                                {usernameMessage && usernameStatus !== 'idle' && (
                                    <p className={`text-xs mt-1 ${
                                        usernameStatus === 'available' ? 'text-green-500' :
                                        usernameStatus === 'checking' ? 'text-gray-400' : 'text-red-500'
                                    }`}>
                                        {usernameMessage}
                                    </p>
                                )}
                            </div>

                            {/* Bio */}
                            <div>
                                <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1.5">
                                    Bio
                                </label>
                                <textarea
                                    value={bio}
                                    onChange={(e) => setBio(e.target.value)}
                                    placeholder="Tell the world about yourself..."
                                    rows={4}
                                    maxLength={500}
                                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-transparent dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all text-sm resize-none"
                                />
                                <p className="text-xs text-gray-400 mt-1 text-right">{bio.length}/500</p>
                            </div>
                        </div>

                        {/* Social Links */}
                        <div className="bg-white dark:bg-gray-800/30 rounded-2xl p-6 border border-gray-200 dark:border-gray-700/50">
                            <h4 className="text-lg font-semibold dark:text-white mb-4 flex items-center gap-2">
                                <Link2 className="w-5 h-5" />
                                Social Links
                            </h4>
                            <div className="flex flex-col gap-4">
                                {socialLinkFields.map((field) => (
                                    <div key={field.key} className="flex items-center gap-3">
                                        <field.icon className="w-5 h-5 text-gray-400 flex-shrink-0" />
                                        <input
                                            type="url"
                                            value={socialLinks[field.key as keyof typeof socialLinks]}
                                            onChange={(e) => handleSocialLinkChange(field.key, e.target.value)}
                                            placeholder={field.placeholder}
                                            className="flex-1 px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-transparent dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all text-sm"
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>

                        <Button
                            onClick={handleSaveProfile}
                            disabled={savingProfile || !hasProfileChanged || usernameStatus === 'taken' || usernameStatus === 'invalid' || usernameStatus === 'checking'}
                            className="w-fit self-end rounded-xl font-semibold px-8 py-2.5 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white flex items-center gap-2 transition-all"
                        >
                            <Save className="w-4 h-4" />
                            {savingProfile ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </div>
                )}

                {/* Password Section */}
                {activeSection === 'password' && (
                    <div className="flex flex-col gap-6">
                        <div>
                            <h3 className="text-2xl font-bold dark:text-white mb-1">Change Password</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Keep your account secure with a strong password</p>
                        </div>

                        <div className="flex flex-col gap-5 bg-white dark:bg-gray-800/30 rounded-2xl p-6 border border-gray-200 dark:border-gray-700/50">
                            {/* Old Password */}
                            <div>
                                <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1.5">
                                    Current Password
                                </label>
                                <div className="relative">
                                    <input
                                        type={showOldPassword ? 'text' : 'password'}
                                        value={oldPassword}
                                        onChange={(e) => setOldPassword(e.target.value)}
                                        placeholder="Enter current password"
                                        className="w-full px-4 py-2.5 pr-12 rounded-xl border border-gray-300 dark:border-gray-600 bg-transparent dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all text-sm"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowOldPassword(!showOldPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                    >
                                        {showOldPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>

                            {/* New Password */}
                            <div>
                                <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1.5">
                                    New Password
                                </label>
                                <div className="relative">
                                    <input
                                        type={showNewPassword ? 'text' : 'password'}
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        placeholder="Enter new password"
                                        className="w-full px-4 py-2.5 pr-12 rounded-xl border border-gray-300 dark:border-gray-600 bg-transparent dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all text-sm"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowNewPassword(!showNewPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                    >
                                        {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>

                            {/* Confirm Password */}
                            <div>
                                <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1.5">
                                    Confirm New Password
                                </label>
                                <input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="Confirm new password"
                                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-transparent dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all text-sm"
                                />
                                {confirmPassword && newPassword !== confirmPassword && (
                                    <p className="text-xs text-red-400 mt-1">Passwords do not match</p>
                                )}
                            </div>
                        </div>

                        <Button
                            onClick={handleChangePassword}
                            disabled={savingPassword || !oldPassword || !newPassword || newPassword !== confirmPassword}
                            className="w-fit self-end rounded-xl font-semibold px-8 py-2.5 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white flex items-center gap-2 transition-all"
                        >
                            <Lock className="w-4 h-4" />
                            {savingPassword ? 'Changing...' : 'Change Password'}
                        </Button>
                    </div>
                )}

                {/* Images Section */}
                {activeSection === 'images' && (
                    <div className="flex flex-col gap-6">
                        <div>
                            <h3 className="text-2xl font-bold dark:text-white mb-1">Profile Images</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Update your avatar and cover image</p>
                        </div>

                        {/* Avatar */}
                        <div className="bg-white dark:bg-gray-800/30 rounded-2xl p-6 border border-gray-200 dark:border-gray-700/50">
                            <h4 className="text-lg font-semibold dark:text-white mb-4">Avatar</h4>
                            <div className="flex items-center gap-6">
                                <div className="relative w-[120px] h-[120px] rounded-full group overflow-hidden flex-shrink-0">
                                    {avatarLoading ? (
                                        <div className="w-full h-full flex justify-center items-center bg-gray-200 dark:bg-gray-700 rounded-full">
                                            <div className="w-8 h-8 border-3 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                                        </div>
                                    ) : (
                                        <>
                                            <Image
                                                alt="Avatar"
                                                src={user.avatar || placeholderAvatar}
                                                fill
                                                className="object-cover rounded-full group-hover:opacity-70 transition-all duration-300"
                                            />
                                            <label className="absolute inset-0 bg-black/40 flex justify-center items-center rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                                <Edit className="w-6 h-6 text-white" />
                                                <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
                                            </label>
                                        </>
                                    )}
                                </div>
                                <div className="flex flex-col gap-1">
                                    <p className="text-sm dark:text-gray-300">Click on the avatar to change it</p>
                                    <p className="text-xs text-gray-400">Recommended: Square image, at least 200x200px</p>
                                </div>
                            </div>
                        </div>

                        {/* Cover Image */}
                        <div className="bg-white dark:bg-gray-800/30 rounded-2xl p-6 border border-gray-200 dark:border-gray-700/50">
                            <h4 className="text-lg font-semibold dark:text-white mb-4">Cover Image</h4>
                            <div className="relative w-full h-[200px] rounded-xl group overflow-hidden">
                                {coverLoading ? (
                                    <div className="w-full h-full flex justify-center items-center bg-gray-200 dark:bg-gray-700 rounded-xl">
                                        <div className="w-8 h-8 border-3 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                                    </div>
                                ) : (
                                    <>
                                        <Image
                                            alt="Cover"
                                            src={user.coverImage || placeholderCover}
                                            fill
                                            className="object-cover rounded-xl group-hover:opacity-70 transition-all duration-300"
                                        />
                                        <label className="absolute inset-0 bg-black/30 flex justify-center items-center rounded-xl opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                            <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                                                <Camera className="w-5 h-5 text-white" />
                                                <span className="text-white text-sm font-medium">Change Cover</span>
                                            </div>
                                            <input type="file" accept="image/*" onChange={handleCoverChange} className="hidden" />
                                        </label>
                                    </>
                                )}
                            </div>
                            <p className="text-xs text-gray-400 mt-2">Recommended: 2560x440px for best results</p>
                        </div>
                    </div>
                )}
            </div>
        </main>
    )
}

export default SettingsPage
