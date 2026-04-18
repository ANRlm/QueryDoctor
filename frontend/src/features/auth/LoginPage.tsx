import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { GlassCard } from '../../components/ui/Card'
import { Input } from '../../components/ui/Input'
import { Button } from '../../components/ui/Button'
import { useAuthStore } from '../../store/useAuthStore'
import { loginUser, registerUser } from '../../services/apiClient'

type Tab = 'login' | 'register'

export function LoginPage() {
    const navigate = useNavigate()
    const login = useAuthStore((s) => s.login)

    const [tab, setTab] = useState<Tab>('login')
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    async function handleSubmit() {
        if (!username.trim() || !password.trim()) {
            setError('请输入用户名和密码')
            return
        }
        setLoading(true)
        setError('')
        try {
            if (tab === 'login') {
                const res = await loginUser(username, password)
                login(res.token, res.username, res.user_id)
                navigate('/')
            } else {
                const res = await registerUser(username, password)
                login(res.token, res.username, res.user_id)
                navigate('/')
            }
        } catch (e: unknown) {
            const msg =
                (e as { response?: { data?: { detail?: string; error?: string } } })?.response?.data
                    ?.detail ??
                (e as { response?: { data?: { error?: string } } })?.response?.data?.error ??
                '操作失败，请重试'
            setError(String(msg))
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-black flex items-center justify-center px-4">
            <div className="w-full max-w-sm">
                <div className="text-center mb-8">
                    <Link to="/" className="inline-flex items-center gap-2 mb-6">
                        <div className="w-7 h-7 bg-white rounded flex items-center justify-center">
                            <span className="text-black font-mono text-xs font-bold">Q</span>
                        </div>
                        <span className="text-white font-medium text-sm">QueryDoctor</span>
                    </Link>
                </div>

                <GlassCard className="p-6">
                    <div className="flex mb-6 border-b border-[#222]">
                        {(['login', 'register'] as Tab[]).map((t) => (
                            <button
                                key={t}
                                onClick={() => { setTab(t); setError('') }}
                                className={`flex-1 pb-3 text-sm font-medium transition-colors ${
                                    tab === t
                                        ? 'text-white border-b-2 border-white -mb-px'
                                        : 'text-[#666] hover:text-[#aaa]'
                                }`}
                            >
                                {t === 'login' ? '登录' : '注册'}
                            </button>
                        ))}
                    </div>

                    <div className="space-y-4">
                        <Input
                            label="用户名"
                            placeholder="请输入用户名"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                        />
                        <Input
                            label="密码"
                            type="password"
                            placeholder="请输入密码"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            error={error}
                        />

                        <Button
                            className="w-full mt-2"
                            disabled={loading}
                            onClick={handleSubmit}
                        >
                            {loading ? '处理中...' : tab === 'login' ? '登录' : '注册'}
                        </Button>
                    </div>
                </GlassCard>

                <p className="text-center text-[#555] text-xs mt-4">
                    无需登录即可{' '}
                    <Link to="/" className="text-[#888] hover:text-white underline">
                        使用诊断功能
                    </Link>
                </p>
            </div>
        </div>
    )
}
