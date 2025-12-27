import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { projectsApi } from '@/api/projects'
import { FolderIcon, PlusIcon } from './Icons'
import { ProjectModal } from './ProjectModal'

interface ProjectSidebarProps {
    selectedProjectId?: number
    onSelectProject: (projectId: number | undefined) => void
}

export const ProjectSidebar = ({ selectedProjectId, onSelectProject }: ProjectSidebarProps) => {
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingProject, setEditingProject] = useState<number | null>(null)

    const { data: projects = [] } = useQuery({
        queryKey: ['projects'],
        queryFn: () => projectsApi.list(),
    })

    const handleCreateProject = () => {
        setEditingProject(null)
        setIsModalOpen(true)
    }

    const handleEditProject = (projectId: number) => {
        setEditingProject(projectId)
        setIsModalOpen(true)
    }

    return (
        <>
            <div className="w-64 bg-white border-r border-gray-200 p-4 space-y-2">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold text-gray-900 flex items-center">
                        <FolderIcon className="w-5 h-5 mr-2" />
                        プロジェクト
                    </h2>
                    <button onClick={handleCreateProject} className="p-1 hover:bg-gray-100 rounded transition-colors" title="新規プロジェクト">
                        <PlusIcon className="w-5 h-5 text-gray-600" />
                    </button>
                </div>

                <button
                    onClick={() => onSelectProject(undefined)}
                    className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${selectedProjectId === undefined ? 'bg-indigo-50 text-indigo-700 font-medium' : 'hover:bg-gray-50 text-gray-700'
                        }`}
                >
                    すべてのノート
                </button>

                {projects.map((project) => (
                    <div key={project.id} className="group relative">
                        <button
                            onClick={() => onSelectProject(project.id)}
                            className={`w-full text-left px-3 py-2 rounded-lg transition-colors flex items-center ${selectedProjectId === project.id ? 'bg-indigo-50 text-indigo-700 font-medium' : 'hover:bg-gray-50 text-gray-700'
                                }`}
                        >
                            <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: project.color || '#6366f1' }}></div>
                            <span className="flex-1 truncate">{project.name}</span>
                        </button>
                        <button
                            onClick={(e) => {
                                e.stopPropagation()
                                handleEditProject(project.id)
                            }}
                            className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-200 rounded transition-all"
                            title="編集"
                        >
                            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                        </button>
                    </div>
                ))}
            </div>

            <ProjectModal key={editingProject || 'new'} isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} projectId={editingProject} />
        </>
    )
}
