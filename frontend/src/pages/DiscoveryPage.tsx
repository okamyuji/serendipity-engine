import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { discoveriesApi } from '@/api/discoveries'
import { AlertIcon, CheckIcon, DiscoveryIcon, SpinnerIcon, XIcon } from '@/components/Icons'

export const DiscoveryPage = () => {
    const queryClient = useQueryClient()

    const { data: discoveries = [], isLoading, error } = useQuery({
        queryKey: ['discoveries'],
        queryFn: () => discoveriesApi.list(),
    })

    const generateMutation = useMutation({
        mutationFn: () => discoveriesApi.generate(),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['discoveries'] })
        },
    })

    const actMutation = useMutation({
        mutationFn: (id: number) => discoveriesApi.act(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['discoveries'] })
        },
    })

    const dismissMutation = useMutation({
        mutationFn: (id: number) => discoveriesApi.dismiss(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['discoveries'] })
        },
    })

    const getDiscoveryTypeLabel = (type: string) => {
        switch (type) {
            case 'forgotten_gem':
                return '💎 忘れられた宝石'
            case 'bridge':
                return '🌉 ブリッジ'
            case 'learning_path':
                return '📚 学習経路'
            default:
                return '✨ 発見'
        }
    }

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="flex items-center text-indigo-700 text-xl">
                    <SpinnerIcon className="animate-spin h-8 w-8 mr-3" />
                    発見を読み込み中...
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <div className="alert alert-error">
                    <AlertIcon className="w-5 h-5 mr-2" />
                    発見の読み込みに失敗しました
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
            <div className="max-w-4xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                            <DiscoveryIcon className="w-8 h-8 mr-3" />
                            発見フィード
                        </h1>
                        <p className="text-gray-600 mt-2">AIがあなたのナレッジから新しいインサイトを発見しました</p>
                    </div>
                    <button onClick={() => generateMutation.mutate()} disabled={generateMutation.isPending} className="btn-primary flex items-center">
                        {generateMutation.isPending ? <SpinnerIcon className="animate-spin w-5 h-5 mr-2" /> : <DiscoveryIcon className="w-5 h-5 mr-2" />}
                        新しい発見を生成
                    </button>
                </div>

                {discoveries.length === 0 ? (
                    <div className="bg-white p-10 text-center rounded-2xl shadow-lg border-2 border-gray-200">
                        <DiscoveryIcon className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                        <p className="text-gray-700 text-lg">まだ発見がありません</p>
                        <p className="text-gray-500 mt-2">「新しい発見を生成」ボタンをクリックして、AIに発見を生成させましょう</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {discoveries.map((discovery) => (
                            <div key={discovery.id} className="bg-white p-6 rounded-2xl shadow-lg border-2 border-gray-200 hover:shadow-xl hover:border-indigo-300 transition-all">
                                <div className="flex items-start justify-between mb-4">
                                    <span className="badge badge-primary">{getDiscoveryTypeLabel(discovery.discovery_type)}</span>
                                    <div className="flex items-center space-x-2">
                                        <span className="text-sm text-gray-500">関連性: {(discovery.relevance_score * 100).toFixed(0)}%</span>
                                    </div>
                                </div>

                                <p className="text-gray-800 mb-4">{discovery.explanation}</p>

                                {(discovery.source_note || discovery.target_note) && (
                                    <div className="flex items-center space-x-4 mb-4 text-sm text-gray-600">
                                        {discovery.source_note && (
                                            <span className="flex items-center">
                                                <span className="font-medium">From:</span>
                                                <span className="ml-1">{discovery.source_note.title}</span>
                                            </span>
                                        )}
                                        {discovery.target_note && (
                                            <span className="flex items-center">
                                                <span className="font-medium">To:</span>
                                                <span className="ml-1">{discovery.target_note.title}</span>
                                            </span>
                                        )}
                                    </div>
                                )}

                                <div className="flex items-center space-x-3">
                                    <button
                                        onClick={() => actMutation.mutate(discovery.id)}
                                        disabled={actMutation.isPending || discovery.acted_upon}
                                        className="btn-primary flex items-center text-sm"
                                    >
                                        <CheckIcon className="w-4 h-4 mr-1" />
                                        {discovery.acted_upon ? '確認済み' : '確認'}
                                    </button>
                                    <button
                                        onClick={() => dismissMutation.mutate(discovery.id)}
                                        disabled={dismissMutation.isPending}
                                        className="btn-secondary flex items-center text-sm"
                                    >
                                        <XIcon className="w-4 h-4 mr-1" />
                                        却下
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
