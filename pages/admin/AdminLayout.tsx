
import React from 'react';
// Outlet is removed for v5 compatibility
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import AdminSidebar from '../../components/AdminSidebar';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <div className="flex flex-col md:flex-row flex-1 pt-16"> {/* pt-16 to offset fixed header */}
        <AdminSidebar />
        <main className="flex-1 p-4 sm:p-6 md:p-8 md:ml-64 bg-gray-50"> {/* Adjusted padding and md:ml-64 for sidebar width */}
          {children} {/* Render children passed from App.tsx Switch */}
        </main>
      </div>
      {/* Footer might be optional for admin panel, or simplified */}
      {/* <Footer /> */}
    </div>
  );
};

export default AdminLayout;