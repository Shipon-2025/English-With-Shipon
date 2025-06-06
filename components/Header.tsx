
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Button from './Button';
import { APP_NAME } from '../constants';
import { UserRole } from '../types';
import { LoginIcon, LogoutIcon, UserCircleIcon, CogIcon, MenuIcon, XIcon } from './icons/HeroIcons';

const Header: React.FC = () => {
  const { user, logout, loading } = useAuth();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    setIsMobileMenuOpen(false);
    navigate('/login');
  };

  useEffect(() => {
    // Close mobile menu on resize if screen becomes larger
    const handleResize = () => {
      if (window.innerWidth >= 768 && isMobileMenuOpen) { // Tailwind 'md' breakpoint is 768px
        setIsMobileMenuOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isMobileMenuOpen]);

  const NavLinkMobile: React.FC<{ to: string, children: React.ReactNode, className?: string, onClick?: () => void }> = ({ to, children, className, onClick }) => (
    <Link 
      to={to} 
      className={`block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 ${className}`}
      onClick={() => {
        setIsMobileMenuOpen(false);
        if (onClick) onClick();
      }}
    >
      {children}
    </Link>
  );

  const ButtonMobile: React.FC<{ children: React.ReactNode, className?: string, onClick?: () => void }> = ({ children, className, onClick }) => (
    <button
      onClick={() => {
        setIsMobileMenuOpen(false);
        if (onClick) onClick();
      }}
      className={`w-full text-left block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 ${className}`}
    >
      {children}
    </button>
  );


  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center" onClick={() => setIsMobileMenuOpen(false)}>
              <span className="text-2xl font-bold text-blue-600">{APP_NAME}</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex flex-wrap justify-end items-center gap-2 sm:gap-3 md:gap-4">
            {loading ? (
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-500 border-t-transparent"></div>
            ) : user ? (
              <>
                <span className="text-sm text-gray-600 hidden sm:inline">
                  Welcome, {user.name || user.email}!
                </span>
                {user.role === UserRole.ADMIN && (
                  <Link
                    to="/admin"
                    className="text-gray-500 hover:text-blue-600 p-1 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    title="Admin Dashboard"
                  >
                    <CogIcon className="h-6 w-6" />
                  </Link>
                )}
                 <Link
                    to={user.role === UserRole.ADMIN ? "/admin/dashboard" : "/dashboard"}
                    className="text-gray-500 hover:text-blue-600 p-1 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    title="My Dashboard"
                  >
                    <UserCircleIcon className="h-6 w-6" />
                  </Link>
                <Button onClick={handleLogout} variant="ghost" size="sm" className="flex items-center">
                  <LogoutIcon className="h-5 w-5 mr-1" />
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="ghost" size="sm" className="flex items-center">
                    <LoginIcon className="h-5 w-5 mr-1" />
                    Login
                  </Button>
                </Link>
                <Link to="/signup">
                  <Button variant="primary" size="sm">
                    Sign Up
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
              aria-expanded={isMobileMenuOpen}
              aria-controls="mobile-menu-main"
            >
              <span className="sr-only">Open main menu</span>
              {isMobileMenuOpen ? (
                <XIcon className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <MenuIcon className="block h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-16 inset-x-0 p-2 transition transform origin-top-right z-40" id="mobile-menu-main">
          <div className="rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 bg-white divide-y-2 divide-gray-50">
            <div className="pt-5 pb-6 px-5">
              <div className="flex items-center justify-between mb-4">
                {/* Optional: Logo again or different title for mobile menu */}
                <Link to="/" className="flex-shrink-0 flex items-center" onClick={() => setIsMobileMenuOpen(false)}>
                    <span className="text-xl font-bold text-blue-600">{APP_NAME} Menu</span>
                </Link>
                <div className="-mr-2">
                  <button
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="bg-white rounded-md p-2 inline-flex items-center justify-center text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
                  >
                    <span className="sr-only">Close menu</span>
                    <XIcon className="h-6 w-6" />
                  </button>
                </div>
              </div>
              <nav className="grid gap-y-4">
                {loading ? (
                   <div className="flex justify-center items-center py-2">
                     <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-500 border-t-transparent"></div>
                   </div>
                ) : user ? (
                  <>
                    <div className="px-3 py-2">
                      <p className="text-sm font-medium text-gray-500 truncate">
                        Welcome, {user.name || user.email}!
                      </p>
                    </div>
                    <NavLinkMobile to={user.role === UserRole.ADMIN ? "/admin/dashboard" : "/dashboard"}>
                      <UserCircleIcon className="h-5 w-5 mr-2 inline-block" />My Dashboard
                    </NavLinkMobile>
                    {user.role === UserRole.ADMIN && (
                      <NavLinkMobile to="/admin">
                        <CogIcon className="h-5 w-5 mr-2 inline-block" />Admin Panel
                      </NavLinkMobile>
                    )}
                    <ButtonMobile onClick={handleLogout} className="text-red-600 hover:bg-red-50">
                       <LogoutIcon className="h-5 w-5 mr-2 inline-block" />Logout
                    </ButtonMobile>
                  </>
                ) : (
                  <>
                    <NavLinkMobile to="/login">
                       <LoginIcon className="h-5 w-5 mr-2 inline-block" />Login
                    </NavLinkMobile>
                    <NavLinkMobile to="/signup" className="bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold">
                      Sign Up
                    </NavLinkMobile>
                  </>
                )}
              </nav>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
