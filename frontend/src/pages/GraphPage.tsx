import { graphApi } from '@/api/graph'
import { ConnectionEdge } from '@/components/ConnectionEdge'
import { AlertIcon, SpinnerIcon } from '@/components/Icons'
import { NoteNode } from '@/components/NoteNode'
import type { GraphData } from '@/types'
import { useQuery } from '@tanstack/react-query'
import { useCallback, useEffect, useMemo, useState } from 'react'
import ReactFlow, {
    Background,
    Controls,
    MiniMap,
    useEdgesState,
    useNodesState,
    type Edge,
    type Node,
} from 'reactflow'
import 'reactflow/dist/style.css'

const nodeTypes = {
    note: NoteNode,
}

const edgeTypes = {
    connection: ConnectionEdge,
}

export const GraphPage = () => {
    const [minStrength, setMinStrength] = useState(0.5)
    const [selectedProject, setSelectedProject] = useState<string | null>(null)
    const [selectedTags, setSelectedTags] = useState<string[]>([])
    const [showOnlyWithChunks, setShowOnlyWithChunks] = useState(false)

    const { data: graphData, isLoading, error } = useQuery<GraphData>({
        queryKey: ['graph', minStrength],
        queryFn: () => graphApi.get(minStrength),
    })

    const [nodes, setNodes, onNodesChange] = useNodesState([])
    const [edges, setEdges, onEdgesChange] = useEdgesState([])

    // フィルタリングされたデータ
    const filteredData = useMemo(() => {
        if (!graphData) return { nodes: [], edges: [] }

        const filteredNodes = graphData.nodes.filter((node) => {
            if (selectedProject && node.data.project !== selectedProject) return false
            if (selectedTags.length > 0 && !selectedTags.some((tag) => node.data.tags.includes(tag)))
                return false
            if (showOnlyWithChunks && !node.data.hasChunks) return false
            return true
        })

        const nodeIds = new Set(filteredNodes.map((n) => n.id))
        const filteredEdges = graphData.edges.filter(
            (edge) => nodeIds.has(edge.source) && nodeIds.has(edge.target)
        )

        return { nodes: filteredNodes, edges: filteredEdges }
    }, [graphData, selectedProject, selectedTags, showOnlyWithChunks])

    // フォースレイアウトアルゴリズム
    const applyForceLayout = useCallback((nodes: Node[], edges: Edge[]) => {
        const nodeMap = new Map(nodes.map((n) => [n.id, { ...n, position: { x: 0, y: 0 } }]))
        const width = 1200
        const height = 800

        // 初期位置をランダムに設定
        nodeMap.forEach((node) => {
            node.position = {
                x: Math.random() * width,
                y: Math.random() * height,
            }
        })

        // フォースシミュレーション
        const iterations = 50
        const repulsionStrength = 5000
        const attractionStrength = 0.01
        const damping = 0.9

        for (let iter = 0; iter < iterations; iter++) {
            const forces = new Map<string, { x: number; y: number }>()

            // 初期化
            nodeMap.forEach((node) => {
                forces.set(node.id, { x: 0, y: 0 })
            })

            // 反発力（全ノード間）
            const nodesArray = Array.from(nodeMap.values())
            for (let i = 0; i < nodesArray.length; i++) {
                for (let j = i + 1; j < nodesArray.length; j++) {
                    const node1 = nodesArray[i]
                    const node2 = nodesArray[j]
                    const dx = node2.position.x - node1.position.x
                    const dy = node2.position.y - node1.position.y
                    const distance = Math.sqrt(dx * dx + dy * dy) || 1

                    const force = repulsionStrength / (distance * distance)
                    const fx = (dx / distance) * force
                    const fy = (dy / distance) * force

                    const force1 = forces.get(node1.id)!
                    const force2 = forces.get(node2.id)!
                    force1.x -= fx
                    force1.y -= fy
                    force2.x += fx
                    force2.y += fy
                }
            }

            // 引力（エッジで接続されたノード間）
            edges.forEach((edge) => {
                const source = nodeMap.get(edge.source)
                const target = nodeMap.get(edge.target)
                if (!source || !target) return

                const dx = target.position.x - source.position.x
                const dy = target.position.y - source.position.y
                const distance = Math.sqrt(dx * dx + dy * dy) || 1

                const force = distance * attractionStrength
                const fx = (dx / distance) * force
                const fy = (dy / distance) * force

                const force1 = forces.get(source.id)!
                const force2 = forces.get(target.id)!
                force1.x += fx
                force1.y += fy
                force2.x -= fx
                force2.y -= fy
            })

            // 位置更新
            nodeMap.forEach((node) => {
                const force = forces.get(node.id)!
                node.position.x += force.x * damping
                node.position.y += force.y * damping

                // 画面内に収める
                node.position.x = Math.max(50, Math.min(width - 50, node.position.x))
                node.position.y = Math.max(50, Math.min(height - 50, node.position.y))
            })
        }

        return Array.from(nodeMap.values())
    }, [])

    // データが変更されたときにレイアウトを適用
    useEffect(() => {
        if (!filteredData.nodes.length) return

        const layoutedNodes = applyForceLayout(
            filteredData.nodes.map((node, index) => ({
                id: node.id,
                type: 'note',
                data: node.data,
                position: { x: (index % 5) * 250, y: Math.floor(index / 5) * 200 },
            })),
            filteredData.edges.map((edge) => ({
                id: edge.id,
                source: edge.source,
                target: edge.target,
                type: 'connection',
                data: edge.data,
            }))
        )

        setNodes(layoutedNodes)
        setEdges(
            filteredData.edges.map((edge) => ({
                id: edge.id,
                source: edge.source,
                target: edge.target,
                type: 'connection',
                data: edge.data,
            }))
        )
    }, [filteredData, applyForceLayout, setNodes, setEdges])

    // プロジェクトとタグのリストを取得
    const projects = useMemo(() => {
        if (!graphData) return []
        const projectSet = new Set(graphData.nodes.map((n) => n.data.project).filter(Boolean))
        return Array.from(projectSet)
    }, [graphData])

    const tags = useMemo(() => {
        if (!graphData) return []
        const tagSet = new Set(graphData.nodes.flatMap((n) => n.data.tags))
        return Array.from(tagSet)
    }, [graphData])

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="flex items-center text-indigo-700 text-xl">
                    <SpinnerIcon className="animate-spin h-8 w-8 mr-3" />
                    グラフを読み込み中...
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6 flex items-center">
                    <AlertIcon className="w-6 h-6 mr-3 text-red-600" />
                    <span className="text-red-800">グラフの読み込みに失敗しました</span>
                </div>
            </div>
        )
    }

    return (
        <div className="h-screen w-screen flex flex-col">
            {/* コントロールパネル */}
            <div className="bg-white border-b border-gray-200 p-2 sm:p-4">
                <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm">
                    <div className="flex items-center space-x-1 sm:space-x-2">
                        <label className="font-medium text-gray-700 whitespace-nowrap">強度:</label>
                        <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.1"
                            value={minStrength}
                            onChange={(e) => setMinStrength(parseFloat(e.target.value))}
                            className="w-16 sm:w-32"
                        />
                        <span className="text-gray-600 w-8">{minStrength.toFixed(1)}</span>
                    </div>

                    <div className="flex items-center space-x-1 sm:space-x-2">
                        <label className="font-medium text-gray-700 whitespace-nowrap hidden sm:inline">プロジェクト:</label>
                        <select
                            value={selectedProject || ''}
                            onChange={(e) => setSelectedProject(e.target.value || null)}
                            className="border border-gray-300 rounded px-1 sm:px-2 py-1"
                        >
                            <option value="">すべて</option>
                            {projects.map((project) => (
                                <option key={project} value={project}>
                                    {project}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="hidden md:flex items-center space-x-1 sm:space-x-2">
                        <label className="font-medium text-gray-700 whitespace-nowrap">タグ:</label>
                        <select
                            multiple
                            value={selectedTags}
                            onChange={(e) =>
                                setSelectedTags(Array.from(e.target.selectedOptions, (option) => option.value))
                            }
                            className="border border-gray-300 rounded px-2 py-1 h-8"
                        >
                            {tags.map((tag) => (
                                <option key={tag} value={tag}>
                                    {tag}
                                </option>
                            ))}
                        </select>
                    </div>

                    <label className="flex items-center space-x-1 sm:space-x-2">
                        <input
                            type="checkbox"
                            checked={showOnlyWithChunks}
                            onChange={(e) => setShowOnlyWithChunks(e.target.checked)}
                            className="rounded"
                        />
                        <span className="text-gray-700 whitespace-nowrap hidden sm:inline">Embeddingあり</span>
                        <span className="text-gray-700 whitespace-nowrap sm:hidden">EMB</span>
                    </label>

                    <div className="ml-auto text-gray-600 whitespace-nowrap">
                        <span className="hidden sm:inline">{nodes.length} ノード, {edges.length} エッジ</span>
                        <span className="sm:hidden">{nodes.length}N {edges.length}E</span>
                    </div>
                </div>
            </div>

            {/* グラフ */}
            <div className="flex-1">
                <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    nodeTypes={nodeTypes}
                    edgeTypes={edgeTypes}
                    fitView
                    minZoom={0.1}
                    maxZoom={2}
                >
                    <Background />
                    <Controls />
                    <MiniMap
                        nodeColor={(node) => {
                            const data = node.data as { projectColor: string }
                            return data.projectColor
                        }}
                        maskColor="rgba(0, 0, 0, 0.1)"
                    />
                </ReactFlow>
            </div>
        </div>
    )
}
