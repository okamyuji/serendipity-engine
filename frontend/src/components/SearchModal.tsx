import { useQuery } from '@tanstack/react-query'
import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { searchApi } from '@/api/search'
import { CloseIcon, SearchIcon, SpinnerIcon } from './Icons'

interface SearchModalProps {
    isOpen: boolean
    onClose: () => void
}

export const SearchModal = ({ isOpen, onClose }: SearchModalProps) => {
    const [query, setQuery] = useState('')
    const [searchMode, setSearchMode] = useState<'keyword' | 'semantic'>('keyword')
    const navigate = useNavigate()

    const { data: searchResults, isLoading } = useQuery({
        queryKey: ['search', query, searchMode],
        queryFn: () => (searchMode === 'semantic' ? searchApi.semanticSearch(query) : searchApi.search(query)),
        enabled: query.length >= 2,
    })

    const handleClose = useCallback(() => {
        setQuery('')
        onClose()
    }, [onClose])

    const handleNoteClick = useCallback(() => {
        navigate(`/notes`)
        handleClose()
    }, [navigate, handleClose])

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                handleClose()
            }
        }

        if (isOpen) {
            document.addEventListener('keydown', handleKeyDown)
        }

        return () => {
            document.removeEventListener('keydown', handleKeyDown)
        }
    }, [isOpen, handleClose])

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black bg-opacity-50 backdrop-blur-sm p-4 pt-20">
            <div className="bg-white w-full max-w-2xl max-h-[600px] flex flex-col rounded-2xl shadow-2xl border-2 border-gray-200">
                <div className="p-4 border-b border-gray-200">
                    <div className="flex items-center space-x-3">
                        <SearchIcon className="w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="ノートを検索..."
                            className="flex-1 outline-none text-lg"
                            autoFocus
                        />
                        {isLoading && <SpinnerIcon className="animate-spin w-5 h-5 text-indigo-600" />}
                        <button onClick={handleClose} className="text-gray-400 hover:text-gray-600">
                            <CloseIcon className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="flex items-center space-x-2 mt-3">
                        <button
                            onClick={() => setSearchMode('keyword')}
                            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${searchMode === 'keyword' ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                        >
                            キーワード検索
                        </button>
                        <button
                            onClick={() => setSearchMode('semantic')}
                            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${searchMode === 'semantic' ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                        >
                            セマンティック検索
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4">
                    {query.length < 2 ? (
                        <div className="text-center text-gray-500 py-8">2文字以上入力してください</div>
                    ) : searchResults && searchResults.results.length > 0 ? (
                        <div className="space-y-2">
                            {searchResults.results.map((note) => (
                                <button key={note.id} onClick={() => handleNoteClick()} className="w-full text-left p-4 rounded-lg hover:bg-gray-50 transition-colors">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <h3 className="font-medium text-gray-900">{note.title}</h3>
                                            <p className="text-sm text-gray-600 mt-1 line-clamp-2">{note.content?.substring(0, 150)}</p>
                                            {note.tags && note.tags.length > 0 && (
                                                <div className="flex flex-wrap gap-1 mt-2">
                                                    {note.tags.map((tag) => (
                                                        <span key={tag.id} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700">
                                                            {tag.name}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                        {searchMode === 'semantic' && 'similarity_score' in note && (
                                            <span className="ml-3 text-xs text-gray-500">
                                                {(((note as { similarity_score: number }).similarity_score || 0) * 100).toFixed(0)}%
                                            </span>
                                        )}
                                    </div>
                                </button>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center text-gray-500 py-8">検索結果がありません</div>
                    )}
                </div>
            </div>
        </div>
    )
}
