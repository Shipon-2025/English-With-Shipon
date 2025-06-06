
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import Button from '../../components/Button';
import Input from '../../components/Input';
import LoadingSpinner from '../../components/LoadingSpinner';
import { ChevronRightIcon, IdentificationIcon, ShieldCheckIcon, UserCircleIcon } from '../../components/icons/HeroIcons';
import { APP_NAME } from '../../constants';

const StudentProfilePage: React.FC = () => {
  const { user, loading: authLoading, logout } = useAuth(); // Assuming useAuth provides an updateProfile method eventually
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  
  const [isEditingName, setIsEditingName] = useState(false);
  const [updateMessage, setUpdateMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [passwordMessage, setPasswordMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isSavingName, setIsSavingName] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);

  useEffect(() => {
    document.title = `My Profile | ${APP_NAME}`;
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
    }
  }, [user]);

  const handleNameUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsSavingName(true);
    setUpdateMessage(null);
    // Placeholder for actual API call
    // In a real app: await authService.updateProfile(user.id, { name });
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
    
    // This is a mock update. In a real app, the AuthContext would re-fetch or update the user object.
    // For now, we just reflect the change locally and in a mock way.
    // The actual `user` object from `useAuth` won't change unless the context implements this.
    user.name = name; // Mock update

    setUpdateMessage({ type: 'success', text: 'Name updated successfully!' });
    setIsEditingName(false);
    setIsSavingName(false);
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMessage(null);
    if (newPassword !== confirmNewPassword) {
      setPasswordMessage({ type: 'error', text: 'New passwords do not match.' });
      return;
    }
    if (newPassword.length < 6) {
      setPasswordMessage({ type: 'error', text: 'New password must be at least 6 characters long.' });
      return;
    }
    setIsSavingPassword(true);
    // Placeholder for actual API call
    // In a real app: await authService.changePassword(currentPassword, newPassword);
    await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate API call
    // Mock success/error
    // const success = Math.random() > 0.3; // Simulate success
    const success = true; // For demo, always succeed
    if (success) {
        setPasswordMessage({ type: 'success', text: 'Password changed successfully!' });
        setCurrentPassword('');
        setNewPassword('');
        setConfirmNewPassword('');
    } else {
        setPasswordMessage({ type: 'error', text: 'Failed to change password. Please check your current password.' });
    }
    setIsSavingPassword(false);
  };
  
  if (authLoading) {
    return <LoadingSpinner text="Loading profile..." className="mt-10" />;
  }

  if (!user) {
    return (
      <div className="text-center py-10">
        <p className="text-gray-600">Please log in to view your profile.</p>
        <Link to="/login">
          <Button variant="primary" className="mt-4">Login</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Breadcrumbs */}
      <nav className="flex items-center text-sm text-gray-500 mb-4" aria-label="Breadcrumb">
        <Link to="/dashboard/overview" className="hover:text-blue-600">
          Dashboard
        </Link>
        <ChevronRightIcon className="h-5 w-5 mx-1 text-gray-400" />
        <span className="font-medium text-gray-700">My Profile</span>
      </nav>

      <header className="pb-6 border-b border-gray-200">
        <h1 className="text-3xl font-bold text-gray-800 flex items-center">
          <UserCircleIcon className="h-8 w-8 mr-3 text-blue-600" />
          Your Profile
        </h1>
      </header>

      {/* Profile Information Section */}
      <section className="bg-white p-6 rounded-lg shadow-lg">
        <h2 className="text-xl font-semibold text-gray-700 mb-6 flex items-center">
            <IdentificationIcon className="h-6 w-6 mr-2 text-gray-500"/>
            Personal Information
        </h2>
        {updateMessage && (
          <div className={`p-3 rounded-md mb-4 text-sm ${updateMessage.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {updateMessage.text}
          </div>
        )}
        <form onSubmit={handleNameUpdate} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email Address</label>
            <Input
              type="email"
              id="email"
              value={email}
              disabled
              className="mt-1 bg-gray-100 cursor-not-allowed"
            />
             <p className="mt-1 text-xs text-gray-500">Email address cannot be changed.</p>
          </div>
          
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">Full Name</label>
            {isEditingName ? (
              <>
                <Input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="mt-1"
                />
                <div className="mt-2 space-x-2">
                  <Button type="submit" variant="primary" size="sm" isLoading={isSavingName} disabled={isSavingName}>Save Name</Button>
                  <Button type="button" variant="ghost" size="sm" onClick={() => { setIsEditingName(false); setName(user.name || ''); setUpdateMessage(null); }} disabled={isSavingName}>Cancel</Button>
                </div>
              </>
            ) : (
              <div className="flex items-center justify-between mt-1">
                <p className="text-gray-800 p-2 border border-transparent">{name || 'Not set'}</p>
                <Button variant="ghost" size="sm" onClick={() => setIsEditingName(true)}>Edit Name</Button>
              </div>
            )}
          </div>
        </form>
      </section>

      {/* Change Password Section */}
      <section className="bg-white p-6 rounded-lg shadow-lg">
        <h2 className="text-xl font-semibold text-gray-700 mb-6 flex items-center">
            <ShieldCheckIcon className="h-6 w-6 mr-2 text-gray-500"/>
            Change Password
        </h2>
        {passwordMessage && (
          <div className={`p-3 rounded-md mb-4 text-sm ${passwordMessage.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {passwordMessage.text}
          </div>
        )}
        <form onSubmit={handlePasswordChange} className="space-y-4">
          <Input
            label="Current Password"
            type="password"
            id="currentPassword"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
            autoComplete="current-password"
          />
          <Input
            label="New Password"
            type="password"
            id="newPassword"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            autoComplete="new-password"
          />
          <Input
            label="Confirm New Password"
            type="password"
            id="confirmNewPassword"
            value={confirmNewPassword}
            onChange={(e) => setConfirmNewPassword(e.target.value)}
            required
            autoComplete="new-password"
          />
          <div>
            <Button type="submit" variant="primary" isLoading={isSavingPassword} disabled={isSavingPassword}>
              Change Password
            </Button>
          </div>
        </form>
      </section>
       {/* Account Actions
       <section className="bg-white p-6 rounded-lg shadow-lg">
        <h2 className="text-xl font-semibold text-gray-700 mb-6">Account Actions</h2>
        <Button variant="danger" onClick={async () => { if(confirm("Are you sure you want to log out?")) await logout(); }} >
            Log Out
        </Button>
      </section> */}
    </div>
  );
};

export default StudentProfilePage;
