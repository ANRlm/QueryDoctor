import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '../../components/ui/Button'
import { Card, GlassCard } from '../../components/ui/Card'
import { TextArea, Input } from '../../components/ui/Input'
import { useDiagnosticsStore } from '../../store/useDiagnosticsStore'
import { Loader2, ChevronDown, ChevronRight } from 'lucide-react'

const dbTypes = [
  { value: 'mysql', label: 'MySQL' },
  { value: 'postgresql', label: 'PostgreSQL' },
  { value: 'mongodb', label: 'MongoDB' },
  { value: 'redis', label: 'Redis' },
]

interface DbConfig {
  host: string
  port: string
  user: string
  password: string
  database: string
}

function renderDiagnosis(text: string, type: string) {
  if (type === 'analyze') {
    const sepIdx = text.indexOf(': ')
    if (sepIdx > 0) {
      const prefix = text.slice(0, sepIdx)
      const items = text.slice(sepIdx + 2).split('; ').filter(Boolean)
      return (
        <div>
          <p className="text-xs text-[#666] mb-2">{prefix}</p>
          <ul className="space-y-1.5">
            {items.map((item, i) => (
              <li key={i} className="flex gap-2 text-xs text-[#ccc]">
                <span className="text-[#555] shrink-0">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )
    }
  }

  if (type === 'diagnose') {
    const lines = text.split('\n').filter(Boolean)
    const noteLines: string[] = []
    const bulletLines: string[] = []
    for (const line of lines) {
      if (line.startsWith('- ')) bulletLines.push(line.slice(2))
      else noteLines.push(line)
    }
    return (
      <div>
        {noteLines.map((line, i) => (
          <p key={i} className="text-xs text-[#888] mb-2">{line}</p>
        ))}
        {bulletLines.length > 0 && (
          <ul className="space-y-1.5">
            {bulletLines.map((item, i) => (
              <li key={i} className="flex gap-2 text-xs text-[#ccc]">
                <span className="text-[#555] shrink-0">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    )
  }

  return <p className="text-xs text-[#ccc]">{text}</p>
}

function startPostSSE(
  url: string,
  body: object,
  onMessage: (data: Record<string, unknown>) => void,
  onDone: () => void,
): () => void {
  const controller = new AbortController()
  let done = false

  fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    signal: controller.signal,
  })
    .then(async (res) => {
      const reader = res.body!.getReader()
      const decoder = new TextDecoder()
      let buf = ''

      while (true) {
        const { done: rdDone, value } = await reader.read()
        if (rdDone) break
        buf += decoder.decode(value, { stream: true })
        const lines = buf.split('\n')
        buf = lines.pop() ?? ''
        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          try {
            const data = JSON.parse(line.slice(6)) as Record<string, unknown>
            if (data.type === 'done') { onDone(); done = true; return }
            onMessage(data)
          } catch {}
        }
      }
      if (!done) onDone()
    })
    .catch(() => { if (!done) onDone() })

  return () => controller.abort()
}

export function DiagnosticsPage() {
  const [query, setQuery] = useState('')
  const [selectedDb, setSelectedDb] = useState('mysql')
  const [loading, setLoading] = useState(false)
  const [showDbConfig, setShowDbConfig] = useState(false)
  const [dbConfig, setDbConfig] = useState<DbConfig>({
    host: '', port: '', user: '', password: '', database: '',
  })
  const [cancelFn, setCancelFn] = useState<(() => void) | null>(null)
  const { results, addResult, clearResults, setStreaming } = useDiagnosticsStore()

  const hasDbConfig = dbConfig.host.trim() !== ''

  const handleDiagnose = () => {
    if (!query.trim()) return

    clearResults()
    setLoading(true)
    setStreaming(true)

    const body: Record<string, unknown> = {
      query,
      db_type: selectedDb,
    }

    if (hasDbConfig) {
      body.db_config = {
        host: dbConfig.host,
        port: dbConfig.port ? parseInt(dbConfig.port) : undefined,
        user: dbConfig.user || undefined,
        password: dbConfig.password || undefined,
        database: dbConfig.database || undefined,
      }
    }

    const cancel = startPostSSE(
      '/api/diagnose',
      body,
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

    setCancelFn(() => cancel)
  }

  const handleStop = () => {
    cancelFn?.()
    setCancelFn(null)
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
                <button
                  onClick={() => setShowDbConfig(!showDbConfig)}
                  className="flex items-center gap-1.5 text-xs text-[#666] hover:text-[#999] transition-colors"
                >
                  {showDbConfig ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
                  连接到真实数据库（可选）
                  {hasDbConfig && <span className="ml-1 text-[#4a9] text-[10px]">● 已配置</span>}
                </button>

                <AnimatePresence>
                  {showDbConfig && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="mt-3 grid grid-cols-2 gap-3">
                        <div className="col-span-2 sm:col-span-1">
                          <label className="block text-[10px] text-[#666] mb-1">Host</label>
                          <Input
                            placeholder="localhost"
                            value={dbConfig.host}
                            onChange={(e) => setDbConfig({ ...dbConfig, host: e.target.value })}
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] text-[#666] mb-1">Port</label>
                          <Input
                            placeholder={selectedDb === 'mysql' ? '3306' : '5432'}
                            value={dbConfig.port}
                            onChange={(e) => setDbConfig({ ...dbConfig, port: e.target.value })}
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] text-[#666] mb-1">用户名</label>
                          <Input
                            placeholder="root"
                            value={dbConfig.user}
                            onChange={(e) => setDbConfig({ ...dbConfig, user: e.target.value })}
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] text-[#666] mb-1">密码</label>
                          <Input
                            type="password"
                            placeholder="••••••"
                            value={dbConfig.password}
                            onChange={(e) => setDbConfig({ ...dbConfig, password: e.target.value })}
                          />
                        </div>
                        <div className="col-span-2 sm:col-span-1">
                          <label className="block text-[10px] text-[#666] mb-1">数据库名</label>
                          <Input
                            placeholder="mydb"
                            value={dbConfig.database}
                            onChange={(e) => setDbConfig({ ...dbConfig, database: e.target.value })}
                          />
                        </div>
                      </div>
                      <p className="mt-2 text-[10px] text-[#555]">
                        不填则使用静态 SQL 分析模式（无需数据库连接）
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
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
                    <p className="text-xs font-medium text-[#666] mb-3">{result.data.stage}</p>
                  )}

                  {result.data.diagnosis && (
                    <div>{renderDiagnosis(result.data.diagnosis, result.type)}</div>
                  )}

                  {result.data.suggestions && result.data.suggestions.length > 0 && (
                    <ul className="space-y-1.5">
                      {result.data.suggestions.map((s, i) => (
                        <li key={i} className="flex gap-2 text-xs text-[#ccc]">
                          <span className="text-[#555] shrink-0">•</span>
                          <span>{s.startsWith('建议: ') ? s.slice(3) : s}</span>
                        </li>
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
