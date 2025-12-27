import type { Note } from '@/types'

interface NoteCardProps {
    note: Note
    onClick?: () => void
}

export const NoteCard = ({ note, onClick }: NoteCardProps) => {
    return (
        <div
            className="card card-hover p-6 cursor-pointer"
            onClick={onClick}
            data-testid={`note-card-${note.id}`}
        >
            <div className="flex items-start justify-between mb-3">
                <h3 className="text-lg font-bold text-gray-900 flex-1">{note.title}</h3>
                {note.pinned && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        📌 ピン留め
                    </span>
                )}
            </div>

            <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                {note.content.substring(0, 150)}
                {note.content.length > 150 && '...'}
            </p>

            {note.tags && note.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-3">
                    {note.tags.map((tag) => (
                        <span
                            key={tag.id}
                            className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700"
                            style={{ backgroundColor: tag.color ? `${tag.color}20` : undefined }}
                        >
                            {tag.name}
                        </span>
                    ))}
                </div>
            )}

            <div className="flex items-center justify-between text-xs text-gray-500">
                <div className="flex items-center space-x-4">
                    <span className="flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        {note.access_count}回
                    </span>
                    {note.last_accessed_at && (
                        <span>
                            最終アクセス: {new Date(note.last_accessed_at).toLocaleDateString('ja-JP')}
                        </span>
                    )}
                </div>
            </div>
        </div>
    )
}
