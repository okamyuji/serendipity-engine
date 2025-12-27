import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authApi } from '@/api/auth'
import { useAuthStore } from '@/stores/authStore'
import type { LoginCredentials } from '@/types'

export const LoginPage = () => {
    const navigate = useNavigate()
    const setAuth = useAuthStore((state) => state.setAuth)
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        try {
            const credentials: LoginCredentials = { email, password }
            const response = await authApi.login(credentials)
            setAuth(response.user, response.token)
            navigate('/notes')
        } catch (err) {
            // エラーメッセージを詳細に表示
            const error = err as { response?: { status?: number; data?: { error?: string } } }
            if (error.response?.status === 401) {
                setError('メールアドレスまたはパスワードが正しくありません')
            } else if (error.response?.data?.error) {
                setError(error.response.data.error)
            } else {
                setError('ログインに失敗しました。もう一度お試しください。')
            }
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* ロゴ・ヘッダー */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl mb-4 shadow-lg">
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Serendipity Engine</h1>
                    <p className="text-gray-600">探していなかったものを見つける</p>
                </div>

                {/* ログインフォーム */}
                <div className="card p-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">ログイン</h2>

                    <form onSubmit={handleSubmit} data-testid="login-form" className="space-y-5">
                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl" role="alert">
                                <div className="flex items-center">
                                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                    </svg>
                                    {error}
                                </div>
                            </div>
                        )}

                        <div>
                            <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                                メールアドレス
                            </label>
                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="input-field"
                                placeholder="you@example.com"
                                data-testid="email-input"
                            />
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                                パスワード
                            </label>
                            <input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="input-field"
                                placeholder="••••••••"
                                data-testid="password-input"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-primary w-full"
                            data-testid="submit-button"
                        >
                            {loading ? (
                                <span className="flex items-center justify-center">
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    ログイン中...
                                </span>
                            ) : 'ログイン'}
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-sm text-gray-600">
                            アカウントをお持ちでない方は{' '}
                            <Link to="/signup" className="font-semibold text-blue-600 hover:text-blue-700 transition-colors">
                                新規登録
                            </Link>
                        </p>
                    </div>

                    {/* デモアカウント情報 */}
                    <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-100">
                        <p className="text-xs font-semibold text-blue-900 mb-2">💡 テストアカウント</p>
                        <p className="text-xs text-blue-700">
                            バックエンドで新規ユーザー登録が必要です。<br />
                            <code className="bg-blue-100 px-1 py-0.5 rounded">POST /api/v1/auth/signup</code> でユーザーを作成してください。
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
