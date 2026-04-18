import { useEffect, useState } from 'react'
import { ChevronDown, ChevronUp, Clock } from 'lucide-react'
import { GlassCard } from '../../components/ui/Card'

interface HistoryItem {
    id: string
    query: string
    diagnosis: string
    suggestions: string[]
    timestamp: string
}

interface HistoryResponse {
    items: HistoryItem[]
    total: number
    error?: string
}

function HistoryCard({ item }: { item: HistoryItem }) {
    const [expanded, setExpanded] = useState(false)

    const suggestionLines = Array.isArray(item.suggestions) ? item.suggestions : []

    return (
        <GlassCard className="p-4">
            <button
                className="w-full text-left"
                onClick={() => setExpanded(!expanded)}
            >
                <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                        <p className="text-white text-sm font-mono truncate">{item.query}</p>
                        {item.timestamp && (
                            <div className="flex items-center gap-1 mt-1 text-[#555] text-xs">
                                <Clock size={11} />
                                <span>{item.timestamp}</span>
                            </div>
                        )}
                    </div>
                    <span className="text-[#555] flex-shrink-0 mt-0.5">
                        {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </span>
                </div>
            </button>

            {expanded && (
                <div className="mt-4 space-y-3 border-t border-[#1a1a1a] pt-4">
                    {item.diagnosis && (
                        <div>
                            <p className="text-xs text-[#555] uppercase tracking-wider mb-1">诊断结论</p>
                            <pre className="text-sm text-[#ccc] whitespace-pre-wrap font-mono leading-relaxed">
                                {item.diagnosis}
                            </pre>
                        </div>
                    )}
                    {suggestionLines.length > 0 && (
                        <div>
                            <p className="text-xs text-[#555] uppercase tracking-wider mb-2">优化建议</p>
                            <ul className="space-y-1.5">
                                {suggestionLines.map((s, i) => (
                                    <li key={i} className="text-sm text-[#aaa] flex gap-2">
                                        <span className="text-[#555] flex-shrink-0">›</span>
                                        <span>{s.replace(/^建议:\s*/, '')}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            )}
        </GlassCard>
    )
}

export function HistoryPage() {
    const [items, setItems] = useState<HistoryItem[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        fetch('/api/rag/list?limit=50')
            .then((r) => r.json() as Promise<HistoryResponse>)
            .then((data) => {
                if (data.error) setError(data.error)
                else setItems(data.items ?? [])
            })
            .catch((e) => setError(String(e)))
            .finally(() => setLoading(false))
    }, [])

    return (
        <div className="min-h-screen bg-black pt-20 pb-16 px-4">
            <div className="max-w-2xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-2xl font-semibold text-white">诊断历史</h1>
                    <p className="text-[#555] text-sm mt-1">最近的 SQL 诊断记录</p>
                </div>

                {loading && (
                    <div className="text-center py-16 text-[#444] text-sm">加载中...</div>
                )}

                {!loading && error && (
                    <div className="text-center py-16 text-red-500 text-sm">{error}</div>
                )}

                {!loading && !error && items.length === 0 && (
                    <div className="text-center py-16 text-[#444] text-sm">
                        暂无诊断记录，前往首页进行一次 SQL 诊断
                    </div>
                )}

                {!loading && !error && items.length > 0 && (
                    <div className="space-y-3">
                        {items.map((item) => (
                            <HistoryCard key={item.id} item={item} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
