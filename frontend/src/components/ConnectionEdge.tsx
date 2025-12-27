import { memo } from 'react'
import {
    BaseEdge,
    EdgeLabelRenderer,
    type EdgeProps,
    getSmoothStepPath,
} from 'reactflow'

interface ConnectionEdgeData {
    strength: number
    connectionType: 'semantic' | 'explicit' | 'temporal' | 'tag_based'
    aiSuggested: boolean
    confirmed: boolean
}

export const ConnectionEdge = memo(
    ({
        id,
        sourceX,
        sourceY,
        targetX,
        targetY,
        sourcePosition,
        targetPosition,
        data,
        selected,
    }: EdgeProps<ConnectionEdgeData>) => {
        const [edgePath, labelX, labelY] = getSmoothStepPath({
            sourceX,
            sourceY,
            sourcePosition,
            targetX,
            targetY,
            targetPosition,
        })

        const getEdgeColor = () => {
            if (data?.confirmed) return '#10b981' // green
            if (data?.aiSuggested) return '#f59e0b' // amber
            return '#6366f1' // indigo
        }

        const getEdgeStyle = () => {
            const baseStyle = {
                stroke: getEdgeColor(),
                strokeWidth: (data?.strength || 0.5) * 4,
            }

            if (data?.aiSuggested && !data?.confirmed) {
                return {
                    ...baseStyle,
                    strokeDasharray: '5,5',
                    animation: 'dashdraw 0.5s linear infinite',
                }
            }

            return baseStyle
        }

        const getConnectionTypeLabel = () => {
            switch (data?.connectionType) {
                case 'semantic':
                    return '意味的'
                case 'explicit':
                    return '明示的'
                case 'temporal':
                    return '時系列'
                case 'tag_based':
                    return 'タグ'
                default:
                    return ''
            }
        }

        return (
            <>
                <BaseEdge id={id} path={edgePath} style={getEdgeStyle()} />
                {selected && (
                    <EdgeLabelRenderer>
                        <div
                            style={{
                                position: 'absolute',
                                transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
                                pointerEvents: 'all',
                            }}
                            className="nodrag nopan"
                        >
                            <div className="bg-white px-3 py-1.5 rounded-full shadow-lg border border-gray-200 text-xs font-medium">
                                <div className="flex items-center space-x-2">
                                    <span className="text-gray-700">{getConnectionTypeLabel()}</span>
                                    <span className="text-gray-500">
                                        {Math.round((data?.strength || 0) * 100)}%
                                    </span>
                                    {data?.aiSuggested && !data?.confirmed && (
                                        <span className="text-amber-600 flex items-center">
                                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                            </svg>
                                        </span>
                                    )}
                                    {data?.confirmed && (
                                        <span className="text-green-600 flex items-center">
                                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                                <path
                                                    fillRule="evenodd"
                                                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                                    clipRule="evenodd"
                                                />
                                            </svg>
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </EdgeLabelRenderer>
                )}
            </>
        )
    }
)

ConnectionEdge.displayName = 'ConnectionEdge'
