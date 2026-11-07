import { Navigate, Route, Routes } from "react-router-dom";
import { PageLayout } from "../layouts/PageLayout";
import AdminCreateSessionPage from "../pages/AdminCreateSessionPage";
import AdminLoginPage from "../pages/AdminLoginPage";
import AdminEditSessionPage from "../pages/AdminEditSessionPage";
import {
  AboutPage,
  ContactPage,
  GalleryPage,
  HomePage,
  JournalEntryPage,
  JournalPage,
  ProjectsPage,
} from "../pages";

import AdminDashboardPage from "../pages/AdminDashboardPage";
import AdminJournalSettingsPage from "../pages/AdminJournalSettingsPage";

function App() {
  return (
    <PageLayout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/projects" element={<ProjectsPage />} />
        <Route path="/gallery" element={<GalleryPage />} />
        <Route path="/contact" element={<ContactPage />} />

        {/* Public University Journal */}
        <Route path="/university-journal" element={<JournalPage />} />
        <Route
          path="/journal-admin/sessions/:id/edit"
          element={<AdminEditSessionPage />}
        />

        <Route
          path="/university-journal/:slug"
          element={<JournalEntryPage />}
        />

        {/* Journal CMS login */}
        <Route path="/journal-admin/login" element={<AdminLoginPage />} />
        <Route path="/journal-admin" element={<AdminDashboardPage />} />
        <Route
          path="/journal-admin/settings"
          element={<AdminJournalSettingsPage />}
        />

        <Route
          path="/journal-admin/sessions/new"
          element={<AdminCreateSessionPage />}
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </PageLayout>
  );
}

export default App;
