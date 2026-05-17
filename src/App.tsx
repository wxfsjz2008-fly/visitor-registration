import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Layout } from './components/Layout'
import { Toaster } from './components/ui/toaster'
import './index.css'

const RegistrationPage = lazy(() => import('./pages/RegistrationPage').then(m => ({ default: m.RegistrationPage })))
const ListPage = lazy(() => import('./pages/ListPage').then(m => ({ default: m.ListPage })))

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<div className="flex items-center justify-center min-h-screen">加载中...</div>}>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<RegistrationPage />} />
            <Route path="list" element={<ListPage />} />
          </Route>
        </Routes>
      </Suspense>
      <Toaster />
    </BrowserRouter>
  )
}

export default App
