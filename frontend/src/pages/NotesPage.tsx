import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { notesApi } from '@/api/notes'
import { NoteCard } from '@/components/NoteCard'
import { NoteCreateModal } from '@/components/NoteCreateModal'
import { NoteEditModal } from '@/components/NoteEditModal'
import { ProjectSidebar } from '@/components/ProjectSidebar'
import type { Note } from '@/types'

export const NotesPage = () => {
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
    const [editingNote, setEditingNote] = useState<Note | null>(null)
    const [selectedProjectId, setSelectedProjectId] = useState<number | undefined>(undefined)
    const { data: notes, isLoading, error } = useQuery({
        queryKey: ['notes', selectedProjectId],
        queryFn: () => notesApi.list({ project_id: selectedProjectId }),
    })

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <svg className="animate-spin h-12 w-12 text-blue-600 mx-auto mb-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <p className="text-gray-600">読み込み中...</p>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <div className="card p-8 max-w-md w-full text-center">
                    <svg className="w-16 h-16 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <h2 className="text-xl font-bold text-gray-900 mb-2">エラーが発生しました</h2>
                    <p className="text-gray-600 mb-4">ノートの読み込みに失敗しました</p>
                    <button onClick={() => window.location.reload()} className="btn-primary">
                        再読み込み
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen flex">
            {/* サイドバー */}
            <ProjectSidebar selectedProjectId={selectedProjectId} onSelectProject={setSelectedProjectId} />

            {/* メインコンテンツ */}
            <main className="flex-1 px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-8 flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">ノート一覧</h2>
                        <p className="text-gray-600">あなたのナレッジを探索しましょう</p>
                    </div>
                    <button onClick={() => setIsCreateModalOpen(true)} className="btn-primary flex items-center space-x-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        <span>新規作成</span>
                    </button>
                </div>

                {notes && notes.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {notes.map((note) => (
                            <NoteCard key={note.id} note={note} onClick={() => setEditingNote(note)} />
                        ))}
                    </div>
                ) : (
                    <div className="card p-12 text-center">
                        <svg className="w-20 h-20 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                            />
                        </svg>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">ノートがありません</h3>
                        <p className="text-gray-600 mb-6">最初のノートを作成してみましょう</p>
                        <button onClick={() => setIsCreateModalOpen(true)} className="btn-primary">
                            ノートを作成
                        </button>
                    </div>
                )}
            </main>

            {/* ノート作成モーダル */}
            <NoteCreateModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} />

            {/* ノート編集モーダル */}
            {editingNote && <NoteEditModal key={editingNote.id} isOpen={!!editingNote} onClose={() => setEditingNote(null)} note={editingNote} />}
        </div>
    )
}
