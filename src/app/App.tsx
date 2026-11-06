import { Navigate, Route, Routes } from 'react-router-dom'
import { PageLayout } from '../layouts/PageLayout'
import {
  AboutPage,
  ContactPage,
  GalleryPage,
  HomePage,
  JournalEntryPage,
  JournalPage,
  ProjectsPage,
} from '../pages'

function App() {
  return (
    <PageLayout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/projects" element={<ProjectsPage />} />
        <Route path="/gallery" element={<GalleryPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/university-journal" element={<JournalPage />} />
        <Route
          path="/university-journal/:slug"
          element={<JournalEntryPage />}
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </PageLayout>
  )
}

export default App
