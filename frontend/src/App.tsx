import { Routes, Route, Navigate } from 'react-router-dom'
import { Layout } from 'antd'
import DiagnosticsPage from './features/diagnostics/DiagnosticsPage'

const { Header, Content } = Layout

function App() {
  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ background: '#001529', padding: '0 24px' }}>
        <div style={{ color: '#fff', fontSize: 20, fontWeight: 'bold' }}>QueryDoctor</div>
      </Header>
      <Content style={{ padding: '24px' }}>
        <Routes>
          <Route path="/" element={<Navigate to="/diagnostics" replace />} />
          <Route path="/diagnostics" element={<DiagnosticsPage />} />
        </Routes>
      </Content>
    </Layout>
  )
}

export default App
