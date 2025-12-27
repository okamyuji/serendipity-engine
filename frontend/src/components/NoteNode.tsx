import { memo } from 'react'
import { Handle, Position, type NodeProps } from 'reactflow'

interface NoteNodeData {
    label: string
    project?: string
    projectColor: string
    tags: string[]
    accessCount: number
    lastAccessed?: string
    createdAt: string
    hasChunks: boolean
}

export const NoteNode = memo(({ data, selected }: NodeProps<NoteNodeData>) => {
    const opacity = data.hasChunks ? 1 : 0.6

    return (
        <div
            className={`px-4 py-3 rounded-lg border-2 transition-all duration-200 ${selected
                    ? 'border-indigo-500 shadow-lg scale-105'
                    : 'border-gray-300 shadow-md hover:shadow-lg hover:scale-102'
                }`}
            style={{
                backgroundColor: data.projectColor,
                opacity,
                minWidth: '180px',
                maxWidth: '220px',
            }}
        >
            <Handle type="target" position={Position.Top} className="w-3 h-3 bg-indigo-500" />

            <div className="text-white">
                <div className="font-semibold text-sm mb-1 line-clamp-2">{data.label}</div>

                {data.project && (
                    <div className="text-xs opacity-90 mb-2 truncate">
                        {data.project}
                    </div>
                )}

                {data.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-2">
                        {data.tags.slice(0, 2).map((tag, index) => (
                            <span
                                key={index}
                                className="text-xs px-2 py-0.5 bg-white bg-opacity-20 rounded-full truncate max-w-[80px]"
                            >
                                {tag}
                            </span>
                        ))}
                        {data.tags.length > 2 && (
                            <span className="text-xs px-2 py-0.5 bg-white bg-opacity-20 rounded-full">
                                +{data.tags.length - 2}
                            </span>
                        )}
                    </div>
                )}

                <div className="flex items-center justify-between text-xs opacity-80">
                    <div className="flex items-center">
                        <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                            <path
                                fillRule="evenodd"
                                d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                                clipRule="evenodd"
                            />
                        </svg>
                        {data.accessCount}
                    </div>

                    {!data.hasChunks && (
                        <div className="flex items-center" title="Embeddingなし">
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                <path
                                    fillRule="evenodd"
                                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                                    clipRule="evenodd"
                                />
                            </svg>
                        </div>
                    )}
                </div>
            </div>

            <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-indigo-500" />
        </div>
    )
})

NoteNode.displayName = 'NoteNode'
