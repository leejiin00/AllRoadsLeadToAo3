import { BrowserRouter, Routes, Route } from 'react-router-dom'
import HomePage from './pages/HomePage'
import GalleryPage from './pages/GalleryPage'
import DetailPage from './pages/DetailPage'
import AdminPage from './pages/AdminPage'
import LoginPage from './pages/LoginPage'
import BookmarkPage from './pages/BookmarkPage'
import BookmarkDetailPage from './pages/BookmarkDetailPage'
import WritingPage from './pages/WritingPage'
import CharacterPage from './pages/CharacterPage'
import StatsPage from './pages/StatsPage'
import ProtectedRoute from './components/ProtectedRoute'
import Decorations from './components/Decorations'

export default function App() {
  return (
    <BrowserRouter>
      <Decorations />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/gallery" element={<ProtectedRoute><GalleryPage /></ProtectedRoute>} />
        <Route path="/fic/:id" element={<ProtectedRoute><DetailPage /></ProtectedRoute>} />
        <Route path="/bookmarks" element={<ProtectedRoute><BookmarkPage /></ProtectedRoute>} />
        <Route path="/bookmarks/:id" element={<ProtectedRoute><BookmarkDetailPage /></ProtectedRoute>} />
        <Route path="/writing" element={<ProtectedRoute><WritingPage /></ProtectedRoute>} />
        <Route path="/characters" element={<ProtectedRoute><CharacterPage /></ProtectedRoute>} />
        <Route path="/stats" element={<ProtectedRoute><StatsPage /></ProtectedRoute>} />
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminPage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  )
}
