import axios from 'axios'

const apiClient = axios.create({
  baseURL: '/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
})

export interface DiagnoseRequest {
  query: string
}

export interface SSEResponse {
  id: number
  type: string
  task_id: string
  data: Record<string, unknown>
}

export function createEventSource(
  url: string,
  onMessage: (data: Record<string, unknown>) => void,
  onDone?: () => void,
) {
  const eventSource = new EventSource(url)

  eventSource.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data) as Record<string, unknown>
      if (data.type === 'done') {
        eventSource.close()
        onDone?.()
        return
      }
      onMessage(data)
    } catch (e) {
      console.error('Failed to parse SSE message:', e)
    }
  }

  eventSource.onerror = (error) => {
    console.error('SSE error:', error)
    eventSource.close()
    onDone?.()
  }

  return eventSource
}

export async function postDiagnose(request: DiagnoseRequest): Promise<string> {
  const response = await apiClient.post('/diagnose', request, {
    responseType: 'text',
  })
  return response.data
}

export async function testDbConnection(config: {
  type: string
  host: string
  port: number
  user: string
  password: string
  database: string
}): Promise<{ status: string }> {
  const response = await apiClient.post('/db/test', config)
  return response.data
}
