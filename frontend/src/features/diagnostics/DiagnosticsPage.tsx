import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '../../components/ui/Button'
import { Card, GlassCard } from '../../components/ui/Card'
import { TextArea } from '../../components/ui/Input'
import { useDiagnosticsStore } from '../../store/useDiagnosticsStore'
import { createEventSource } from '../../services/apiClient'
import { Loader2 } from 'lucide-react'

const dbTypes = [
  { value: 'mysql', label: 'MySQL' },
  { value: 'postgresql', label: 'PostgreSQL' },
  { value: 'mongodb', label: 'MongoDB' },
  { value: 'redis', label: 'Redis' },
]

export function DiagnosticsPage() {
  const [query, setQuery] = useState('')
  const [selectedDb, setSelectedDb] = useState('mysql')
  const [loading, setLoading] = useState(false)
  const { results, addResult, clearResults, setStreaming } = useDiagnosticsStore()
  const [eventSource, setEventSource] = useState<EventSource | null>(null)

  const handleDiagnose = () => {
    if (!query.trim()) return

    clearResults()
    setLoading(true)
    setStreaming(true)

    const url = `/api/diagnose?query=${encodeURIComponent(query)}&db_type=${selectedDb}`

    const es = createEventSource(
      url,
      (chunk: Record<string, unknown>) => {
        if (chunk.analyze) {
          const { analyses } = chunk.analyze as { analyses: string[] }
          if (analyses?.length > 0) {
            addResult({
              id: String(Date.now()),
              type: 'analyze',
              data: { stage: '执行计划分析', diagnosis: analyses.join('\n') },
            })
          }
        } else if (chunk.diagnose) {
          const { diagnosis } = chunk.diagnose as { diagnosis: string }
          if (diagnosis) {
            addResult({
              id: String(Date.now()),
              type: 'diagnose',
              data: { stage: '诊断结论', diagnosis },
            })
          }
        } else if (chunk.suggest) {
          const { suggestions } = chunk.suggest as { suggestions: string[] }
          if (suggestions?.length > 0) {
            addResult({
              id: String(Date.now()),
              type: 'suggest',
              data: { stage: '优化建议', suggestions },
            })
          }
        }
      },
      () => {
        setLoading(false)
        setStreaming(false)
      },
    )

    setEventSource(es)
  }

  const handleStop = () => {
    if (eventSource) {
      eventSource.close()
      setEventSource(null)
    }
    setLoading(false)
    setStreaming(false)
  }

  return (
    <section id="diagnose" className="py-20 px-6">
      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="text-center mb-12"
        >
          <h2 className="text-2xl font-bold text-white mb-3">智能诊断</h2>
          <p className="text-[#888] text-sm">
            输入 SQL 查询，选择数据库类型，AI 将自动分析性能问题
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <GlassCard className="p-6">
            <div className="space-y-5">
              <div>
                <label className="block text-xs text-[#888] mb-2">数据库类型</label>
                <div className="flex flex-wrap gap-2">
                  {dbTypes.map((db) => (
                    <button
                      key={db.value}
                      onClick={() => setSelectedDb(db.value)}
                      className={`px-3 py-1.5 text-xs rounded border transition-colors ${
                        selectedDb === db.value
                          ? 'bg-white text-black border-white'
                          : 'bg-transparent text-[#888] border-[#333] hover:border-[#555]'
                      }`}
                    >
                      {db.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs text-[#888] mb-2">SQL 查询</label>
                <TextArea
                  rows={5}
                  placeholder="SELECT * FROM users WHERE ..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </div>

              <div className="flex gap-3">
                <Button
                  size="lg"
                  onClick={handleDiagnose}
                  disabled={loading || !query.trim()}
                  className="flex-1"
                >
                  {loading ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      诊断中
                    </>
                  ) : (
                    '开始诊断'
                  )}
                </Button>
                {loading && (
                  <Button variant="outline" size="lg" onClick={handleStop}>
                    停止
                  </Button>
                )}
              </div>
            </div>
          </GlassCard>
        </motion.div>

        <AnimatePresence>
          {results.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="mt-8 space-y-3"
            >
              <h3 className="text-sm font-medium text-white">诊断结果</h3>

              {results.map((result, index) => (
                <Card key={index} className="p-4">
                  {result.data.stage && (
                    <div className="mb-2">
                      <span className="text-xs text-[#888]">{result.data.stage}</span>
                    </div>
                  )}

                  {result.data.diagnosis && (
                    <div className="mb-2">
                      <p className="text-sm text-[#ccc]">{result.data.diagnosis}</p>
                    </div>
                  )}

                  {result.data.suggestions && result.data.suggestions.length > 0 && (
                    <ul className="space-y-1">
                      {result.data.suggestions.map((s, i) => (
                        <li key={i} className="text-xs text-[#888]">• {s}</li>
                      ))}
                    </ul>
                  )}
                </Card>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  )
}
