import { Routes, Route } from 'react-router-dom'
import { Layout } from './components/Layout/Layout'
import { Hero } from './components/Hero/Hero'
import { DiagnosticsPage } from './features/diagnostics/DiagnosticsPage'
import { LoginPage } from './features/auth/LoginPage'
import { HistoryPage } from './features/history/HistoryPage'

function HomePage() {
  return (
    <>
      <Hero />
      <DiagnosticsPage />
    </>
  )
}

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/history" element={<HistoryPage />} />
      </Routes>
    </Layout>
  )
}

export default App
