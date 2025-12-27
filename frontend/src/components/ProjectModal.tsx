import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { projectsApi } from '@/api/projects'
import { AlertIcon, CloseIcon, SpinnerIcon, TrashIcon } from './Icons'

interface ProjectModalProps {
    isOpen: boolean
    onClose: () => void
    projectId?: number | null
}

export const ProjectModal = ({ isOpen, onClose, projectId }: ProjectModalProps) => {
    const queryClient = useQueryClient()

    const { data: project } = useQuery({
        queryKey: ['project', projectId],
        queryFn: () => projectsApi.get(projectId!),
        enabled: !!projectId,
    })

    const [name, setName] = useState(project?.name || '')
    const [description, setDescription] = useState(project?.description || '')
    const [color, setColor] = useState(project?.color || '#6366f1')
    const [error, setError] = useState('')

    const createMutation = useMutation({
        mutationFn: projectsApi.create,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['projects'] })
            onClose()
        },
        onError: (err: unknown) => {
            const error = err as { response?: { data?: { errors?: string[] } } }
            setError(error.response?.data?.errors?.[0] || 'プロジェクトの作成に失敗しました')
        },
    })

    const updateMutation = useMutation({
        mutationFn: (params: { name: string; description: string; color: string }) => projectsApi.update(projectId!, params),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['projects'] })
            queryClient.invalidateQueries({ queryKey: ['project', projectId] })
            onClose()
        },
        onError: (err: unknown) => {
            const error = err as { response?: { data?: { errors?: string[] } } }
            setError(error.response?.data?.errors?.[0] || 'プロジェクトの更新に失敗しました')
        },
    })

    const deleteMutation = useMutation({
        mutationFn: () => projectsApi.delete(projectId!),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['projects'] })
            onClose()
        },
        onError: (err: unknown) => {
            const error = err as { response?: { data?: { errors?: string[] } } }
            setError(error.response?.data?.errors?.[0] || 'プロジェクトの削除に失敗しました')
        },
    })

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (!name.trim()) {
            setError('プロジェクト名は必須です')
            return
        }

        if (projectId) {
            updateMutation.mutate({ name: name.trim(), description: description.trim(), color })
        } else {
            createMutation.mutate({ name: name.trim(), description: description.trim(), color })
        }
    }

    const handleDelete = () => {
        if (window.confirm('このプロジェクトを削除してもよろしいですか？関連するノートは削除されません。')) {
            deleteMutation.mutate()
        }
    }

    if (!isOpen) return null

    const isLoading = createMutation.isPending || updateMutation.isPending || deleteMutation.isPending

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm p-4">
            <div className="bg-white w-full max-w-lg p-6 rounded-2xl shadow-2xl border-2 border-gray-200 space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-gray-900">{projectId ? 'プロジェクト編集' : '新規プロジェクト作成'}</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                        <CloseIcon className="w-6 h-6" />
                    </button>
                </div>

                {error && (
                    <div className="alert alert-error">
                        <AlertIcon className="w-5 h-5 mr-2" />
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="name" className="label">
                            プロジェクト名 <span className="text-red-500">*</span>
                        </label>
                        <input id="name" type="text" value={name} onChange={(e) => setName(e.target.value)} className="input-field" required autoFocus />
                    </div>

                    <div>
                        <label htmlFor="description" className="label">
                            説明
                        </label>
                        <textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className="input-field"></textarea>
                    </div>

                    <div>
                        <label htmlFor="color" className="label">
                            カラー
                        </label>
                        <div className="flex items-center space-x-3">
                            <input id="color" type="color" value={color} onChange={(e) => setColor(e.target.value)} className="w-12 h-12 rounded cursor-pointer" />
                            <span className="text-sm text-gray-600">{color}</span>
                        </div>
                    </div>

                    <div className="flex justify-between items-center pt-4">
                        {projectId ? (
                            <button type="button" onClick={handleDelete} disabled={isLoading} className="text-red-600 hover:text-red-800 font-medium transition-colors flex items-center">
                                {deleteMutation.isPending ? <SpinnerIcon className="animate-spin w-5 h-5 mr-2" /> : <TrashIcon className="w-5 h-5 mr-2" />}
                                削除
                            </button>
                        ) : (
                            <div></div>
                        )}

                        <div className="flex space-x-3">
                            <button type="button" onClick={onClose} disabled={isLoading} className="btn-secondary">
                                キャンセル
                            </button>
                            <button type="submit" disabled={isLoading} className="btn-primary">
                                {isLoading ? <SpinnerIcon className="animate-spin w-5 h-5 mr-2" /> : projectId ? '更新' : '作成'}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    )
}
