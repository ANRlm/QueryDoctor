import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '../../components/ui/Button'
import { Card, GlassCard } from '../../components/ui/Card'
import { TextArea } from '../../components/ui/Input'
import { useDiagnosticsStore } from '../../store/useDiagnosticsStore'
import { createEventSource, SSEResponse } from '../../services/apiClient'
import { Loader2, CheckCircle2, AlertCircle, Lightbulb, TrendingUp } from 'lucide-react'

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

    const es = createEventSource(`/api/diagnose?query=${encodeURIComponent(query)}`, (data: SSEResponse) => {
      addResult({
        id: String(data.id),
        type: data.type,
        data: data.data as { status?: string; query?: string; stage?: string; diagnosis?: string; suggestions?: string[] },
      })
    })

    setEventSource(es)

    setTimeout(() => {
      setLoading(false)
      setStreaming(false)
    }, 5000)
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
    <section id="diagnose" className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl sm:text-4xl font-bold mb-4" style={{ fontFamily: 'var(--font-display)' }}>
            <span className="text-white">开始 </span>
            <span className="bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
              智能诊断
            </span>
          </h2>
          <p className="text-gray-400 max-w-xl mx-auto">
            输入您的 SQL 查询，选择数据库类型，AI 将自动分析性能问题并提供优化建议
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
        >
          <GlassCard className="p-6 sm:p-8">
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">
                  选择数据库类型
                </label>
                <div className="flex flex-wrap gap-3">
                  {dbTypes.map((db) => (
                    <motion.button
                      key={db.value}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setSelectedDb(db.value)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        selectedDb === db.value
                          ? 'bg-blue-600 text-white'
                          : 'bg-white/5 text-gray-300 hover:bg-white/10 border border-white/10'
                      }`}
                    >
                      {db.label}
                    </motion.button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">
                  输入 SQL 查询
                </label>
                <TextArea
                  rows={6}
                  placeholder="SELECT * FROM users WHERE email = 'test@example.com'..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="font-mono"
                />
              </div>

              <div className="flex items-center gap-4">
                <Button
                  size="lg"
                  onClick={handleDiagnose}
                  disabled={loading || !query.trim()}
                  className="flex-1 sm:flex-none"
                >
                  {loading ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      诊断中...
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

        <AnimatePresence mode="wait">
          {results.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mt-8 space-y-4"
            >
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <CheckCircle2 className="text-green-400" size={20} />
                诊断结果
              </h3>

              {results.map((result, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card hover className="p-5">
                    {result.data.stage && (
                      <div className="flex items-center gap-2 mb-3">
                        <span className="px-2 py-1 rounded bg-blue-500/20 text-blue-400 text-xs font-medium">
                          {result.data.stage}
                        </span>
                      </div>
                    )}

                    {result.data.diagnosis && (
                      <div className="mb-4">
                        <h4 className="text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                          <AlertCircle size={14} className="text-yellow-400" />
                          问题分析
                        </h4>
                        <p className="text-gray-400 text-sm leading-relaxed">
                          {result.data.diagnosis}
                        </p>
                      </div>
                    )}

                    {result.data.suggestions && result.data.suggestions.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                          <Lightbulb size={14} className="text-green-400" />
                          优化建议
                        </h4>
                        <ul className="space-y-2">
                          {result.data.suggestions.map((suggestion, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm text-gray-400">
                              <TrendingUp size={14} className="text-blue-400 mt-0.5 flex-shrink-0" />
                              <span>{suggestion}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  )
}
