import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { BenefactorEdataSheetForm } from './components/BenefactorEdataSheetForm'
import { PublicClientUpdatePage } from './components/PublicClientUpdatePage'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<BenefactorEdataSheetForm />} />
        <Route path="/update-details/:token" element={<PublicClientUpdatePage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
