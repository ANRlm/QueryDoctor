import { useState } from 'react'
import { Card, Input, Button, Space, message, Spin } from 'antd'
import { useDiagnosticsStore } from '../../store/useDiagnosticsStore'
import { createEventSource, SSEResponse } from '../../services/apiClient'

const { TextArea } = Input

export default function DiagnosticsPage() {
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const { results, addResult, clearResults, setStreaming } = useDiagnosticsStore()
  const [eventSource, setEventSource] = useState<EventSource | null>(null)

  const handleDiagnose = () => {
    if (!query.trim()) {
      message.warning('请输入 SQL 查询')
      return
    }

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
    <div>
      <Card title="SQL 诊断" style={{ marginBottom: 16 }}>
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          <TextArea
            rows={4}
            placeholder="输入 SQL 查询语句..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <Space>
            <Button type="primary" onClick={handleDiagnose} loading={loading}>
              开始诊断
            </Button>
            {loading && (
              <Button onClick={handleStop}>停止</Button>
            )}
          </Space>
        </Space>
      </Card>

      <Card title="诊断结果">
        {loading && <Spin tip="诊断中..." style={{ margin: '20px 0' }} />}
        <div className="diagnostic-result">
          {results.map((result, index) => (
            <Card
              key={index}
              size="small"
              style={{ marginBottom: 8 }}
              type={result.type === 'result' ? 'inner' : undefined}
            >
              <p><strong>阶段:</strong> {result.type}</p>
              {result.data.stage && <p><strong>当前步骤:</strong> {result.data.stage}</p>}
              {result.data.diagnosis && <p><strong>诊断结果:</strong> {result.data.diagnosis}</p>}
              {result.data.suggestions && (
                <div>
                  <strong>优化建议:</strong>
                  <ul>
                    {result.data.suggestions.map((s, i) => (
                      <li key={i}>{s}</li>
                    ))}
                  </ul>
                </div>
              )}
            </Card>
          ))}
        </div>
      </Card>
    </div>
  )
}
