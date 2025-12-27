import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import { DiscoveryIcon, FolderIcon, GraphIcon, LogoutIcon, SearchIcon } from './Icons'
import { SearchModal } from './SearchModal'

export const NavigationBar = () => {
    const location = useLocation()
    const { user, clearAuth } = useAuthStore()
    const [isSearchOpen, setIsSearchOpen] = useState(false)

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault()
                setIsSearchOpen(true)
            }
        }

        document.addEventListener('keydown', handleKeyDown)
        return () => document.removeEventListener('keydown', handleKeyDown)
    }, [])

    const handleLogout = () => {
        clearAuth()
        window.location.href = '/login'
    }

    const navItems = [
        { path: '/notes', label: 'ノート', icon: FolderIcon },
        { path: '/graph', label: 'グラフ', icon: GraphIcon },
        { path: '/discoveries', label: '発見', icon: DiscoveryIcon },
    ]

    return (
        <nav className="bg-white border-b border-gray-200 sticky top-0 z-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center space-x-8">
                        <Link to="/notes" className="flex items-center space-x-2">
                            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                            </div>
                            <span className="text-lg font-bold text-gray-900">Serendipity</span>
                        </Link>

                        <div className="flex space-x-1">
                            {navItems.map((item) => {
                                const Icon = item.icon
                                const isActive = location.pathname === item.path
                                return (
                                    <Link
                                        key={item.path}
                                        to={item.path}
                                        className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isActive ? 'bg-indigo-50 text-indigo-700' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                            }`}
                                    >
                                        <Icon className="w-5 h-5 mr-2" />
                                        {item.label}
                                    </Link>
                                )
                            })}
                        </div>
                    </div>

                    <div className="flex items-center space-x-4">
                        <button
                            onClick={() => setIsSearchOpen(true)}
                            className="flex items-center space-x-2 px-3 py-1.5 rounded-lg border border-gray-300 hover:border-gray-400 transition-colors text-sm text-gray-600"
                        >
                            <SearchIcon className="w-4 h-4" />
                            <span>検索</span>
                            <kbd className="hidden sm:inline-block px-2 py-0.5 text-xs font-semibold text-gray-500 bg-gray-100 border border-gray-300 rounded">⌘K</kbd>
                        </button>
                        <span className="text-sm text-gray-600">{user?.email}</span>
                        <button onClick={handleLogout} className="text-sm text-gray-600 hover:text-gray-900 transition-colors flex items-center">
                            <LogoutIcon className="w-4 h-4 mr-1" />
                            ログアウト
                        </button>
                    </div>
                </div>
            </div>

            <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
        </nav>
    )
}
