
import React from 'react';
// Outlet is removed for v5 compatibility
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import StudentSidebar from '../../components/StudentSidebar';

interface StudentLayoutProps {
  children: React.ReactNode;
}

const StudentLayout: React.FC<StudentLayoutProps> = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <div className="flex flex-col md:flex-row flex-1 pt-16"> {/* pt-16 to offset fixed header */}
        <StudentSidebar />
        <main className="flex-1 p-4 sm:p-6 md:p-8 md:ml-64 bg-gray-100"> {/* Adjusted padding and md:ml-64 for sidebar width, bg-gray-100 for student area */}
          {children} {/* Render children passed from App.tsx Switch */}
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default StudentLayout;