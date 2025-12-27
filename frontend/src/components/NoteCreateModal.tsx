import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { notesApi } from '@/api/notes'
import { TagSelector } from './TagSelector'

interface NoteCreateModalProps {
    isOpen: boolean
    onClose: () => void
}

export const NoteCreateModal = ({ isOpen, onClose }: NoteCreateModalProps) => {
    const [title, setTitle] = useState('')
    const [content, setContent] = useState('')
    const [tagIds, setTagIds] = useState<number[]>([])
    const queryClient = useQueryClient()

    const createMutation = useMutation({
        mutationFn: notesApi.create,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notes'] })
            setTitle('')
            setContent('')
            setTagIds([])
            onClose()
        },
    })

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (!title.trim()) return

        createMutation.mutate({
            title: title.trim(),
            content: content.trim(),
            tag_ids: tagIds,
        })
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-screen items-center justify-center p-4">
                {/* Backdrop */}
                <div
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
                    onClick={onClose}
                />

                {/* Modal */}
                <div className="relative bg-white w-full max-w-2xl p-6 rounded-2xl shadow-2xl border-2 border-gray-200">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold text-gray-900">新しいノートを作成</h2>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label htmlFor="title" className="label">
                                タイトル <span className="text-red-500">*</span>
                            </label>
                            <input
                                id="title"
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="ノートのタイトルを入力"
                                className="input-field"
                                autoFocus
                                required
                            />
                        </div>

                        <div>
                            <label htmlFor="content" className="label">
                                内容
                            </label>
                            <textarea
                                id="content"
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                placeholder="ノートの内容を入力"
                                className="input-field min-h-[200px] resize-y"
                                rows={8}
                            />
                        </div>

                        <TagSelector selectedTagIds={tagIds} onChange={setTagIds} />

                        {createMutation.error && (
                            <div className="alert alert-error">
                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                ノートの作成に失敗しました
                            </div>
                        )}

                        <div className="flex justify-end space-x-3 pt-4">
                            <button
                                type="button"
                                onClick={onClose}
                                className="btn-secondary"
                                disabled={createMutation.isPending}
                            >
                                キャンセル
                            </button>
                            <button
                                type="submit"
                                className="btn-primary"
                                disabled={createMutation.isPending || !title.trim()}
                            >
                                {createMutation.isPending ? (
                                    <span className="flex items-center">
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        作成中...
                                    </span>
                                ) : (
                                    '作成'
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}
