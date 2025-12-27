import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { tagsApi } from '@/api/tags'
import { PlusIcon, TagIcon, XIcon } from './Icons'

interface TagSelectorProps {
    selectedTagIds: number[]
    onChange: (tagIds: number[]) => void
}

export const TagSelector = ({ selectedTagIds, onChange }: TagSelectorProps) => {
    const [isCreating, setIsCreating] = useState(false)
    const [newTagName, setNewTagName] = useState('')

    const { data: tags = [], refetch } = useQuery({
        queryKey: ['tags'],
        queryFn: () => tagsApi.list(),
    })

    const handleToggleTag = (tagId: number) => {
        if (selectedTagIds.includes(tagId)) {
            onChange(selectedTagIds.filter((id) => id !== tagId))
        } else {
            onChange([...selectedTagIds, tagId])
        }
    }

    const handleCreateTag = async () => {
        if (!newTagName.trim()) return

        try {
            const newTag = await tagsApi.create({ name: newTagName.trim() })
            await refetch()
            onChange([...selectedTagIds, newTag.id])
            setNewTagName('')
            setIsCreating(false)
        } catch (error) {
            console.error('Failed to create tag:', error)
        }
    }

    const selectedTags = tags.filter((tag) => selectedTagIds.includes(tag.id))
    const availableTags = tags.filter((tag) => !selectedTagIds.includes(tag.id))

    return (
        <div className="space-y-3">
            <label className="label flex items-center">
                <TagIcon className="w-4 h-4 mr-2" />
                タグ
            </label>

            {/* 選択済みタグ */}
            {selectedTags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                    {selectedTags.map((tag) => (
                        <button
                            key={tag.id}
                            type="button"
                            onClick={() => handleToggleTag(tag.id)}
                            className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800 hover:bg-indigo-200 transition-colors"
                            style={{ backgroundColor: tag.color ? `${tag.color}20` : undefined }}
                        >
                            {tag.name}
                            <XIcon className="w-3 h-3 ml-1" />
                        </button>
                    ))}
                </div>
            )}

            {/* 利用可能なタグ */}
            {availableTags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                    {availableTags.map((tag) => (
                        <button
                            key={tag.id}
                            type="button"
                            onClick={() => handleToggleTag(tag.id)}
                            className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
                        >
                            <PlusIcon className="w-3 h-3 mr-1" />
                            {tag.name}
                        </button>
                    ))}
                </div>
            )}

            {/* 新規タグ作成 */}
            {isCreating ? (
                <div className="flex items-center space-x-2">
                    <input
                        type="text"
                        value={newTagName}
                        onChange={(e) => setNewTagName(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                e.preventDefault()
                                handleCreateTag()
                            } else if (e.key === 'Escape') {
                                setIsCreating(false)
                                setNewTagName('')
                            }
                        }}
                        placeholder="タグ名を入力"
                        className="input-field flex-1"
                        autoFocus
                    />
                    <button type="button" onClick={handleCreateTag} className="btn-primary px-3 py-2">
                        作成
                    </button>
                    <button
                        type="button"
                        onClick={() => {
                            setIsCreating(false)
                            setNewTagName('')
                        }}
                        className="btn-secondary px-3 py-2"
                    >
                        キャンセル
                    </button>
                </div>
            ) : (
                <button type="button" onClick={() => setIsCreating(true)} className="text-sm text-indigo-600 hover:text-indigo-800 flex items-center">
                    <PlusIcon className="w-4 h-4 mr-1" />
                    新しいタグを作成
                </button>
            )}
        </div>
    )
}
