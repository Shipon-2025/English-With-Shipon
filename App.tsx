
import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminManageContentPage from './pages/admin/AdminManageContentPage';
import AdminLessonEditorPage from './pages/admin/AdminLessonEditorPage';
import StudentLayout from './pages/student/StudentLayout';
import StudentDashboardPage from './pages/student/StudentDashboardPage';
import StudentCategoryLessonsPage from './pages/student/StudentCategoryLessonsPage';
import StudentLessonViewPage from './pages/student/StudentLessonViewPage';
import StudentProgressPage from './pages/student/StudentProgressPage';
import StudentProfilePage from './pages/student/StudentProfilePage';
import NotFoundPage from './pages/NotFoundPage';
import ProtectedRoute from './components/ProtectedRoute';
import { UserRole } from './types';
import { APP_NAME } from './constants';

const App: React.FC = () => {
  React.useEffect(() => {
    document.title = APP_NAME;
  }, []);

  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />

        {/* Student Routes */}
        <Route
          path="/dashboard/*"
          element={
            <ProtectedRoute allowedRoles={[UserRole.STUDENT, UserRole.ADMIN]}>
              <StudentLayout>
                <Routes>
                  <Route path="/" element={<Navigate to="overview" replace />} />
                  <Route path="overview" element={<StudentDashboardPage />} />
                  <Route path="category/:categorySlug/lesson/:lessonSlug" element={<StudentLessonViewPage />} />
                  <Route path="category/:categorySlug" element={<StudentCategoryLessonsPage />} />
                  <Route path="progress" element={<StudentProgressPage />} />
                  <Route path="profile" element={<StudentProfilePage />} />
                </Routes>
              </StudentLayout>
            </ProtectedRoute>
          }
        />

        {/* Admin Routes */}
        <Route
          path="/admin/*"
          element={
            <ProtectedRoute allowedRoles={[UserRole.ADMIN]}>
              <AdminLayout>
                <Routes>
                  <Route path="/" element={<Navigate to="dashboard" replace />} />
                  <Route path="dashboard" element={<AdminDashboardPage />} />
                  <Route path="manage/:contentType/edit/:lessonId" element={<AdminLessonEditorPage />} />
                  <Route path="manage/:contentType/new" element={<AdminLessonEditorPage />} />
                  <Route path="manage/:contentType" element={<AdminManageContentPage />} />
                </Routes>
              </AdminLayout>
            </ProtectedRoute>
          }
        />
        
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </HashRouter>
  );
};

export default App;