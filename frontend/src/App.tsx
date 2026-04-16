import { Routes, Route } from 'react-router-dom'
import { Layout } from './components/Layout/Layout'
import { Hero } from './components/Hero/Hero'
import { DiagnosticsPage } from './features/diagnostics/DiagnosticsPage'

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
      </Routes>
    </Layout>
  )
}

export default App
