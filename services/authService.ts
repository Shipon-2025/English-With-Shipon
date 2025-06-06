
import { User, UserRole } from '../types';
import { ADMIN_EMAIL } from '../constants';

// Mock database of users
const mockUsers: User[] = [
  { id: 'user-1', email: ADMIN_EMAIL, name: 'Admin User', role: UserRole.ADMIN },
  { id: 'user-2', email: 'student@example.com', name: 'Student User', role: UserRole.STUDENT },
];

// Mock a simple in-memory session
let currentSessionUser: User | null = null;

const simulateDelay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const mockLogin = async (email: string, password: string): Promise<User> => {
  await simulateDelay(500);
  console.log(`Attempting login for: ${email}`);
  const user = mockUsers.find(u => u.email === email);
  // In a real app, you'd also check the password (hashed)
  if (user && password === 'password123') { // Using a generic password for mock
    currentSessionUser = { ...user }; // Create a copy for the session
    console.log('Login successful:', currentSessionUser);
    if (authSubscribers.length > 0) {
      authSubscribers.forEach(cb => cb(currentSessionUser));
    }
    return { ...currentSessionUser };
  } else {
    console.log('Login failed: Invalid credentials');
    throw new Error('Invalid credentials. Please try again.');
  }
};

export const mockSignup = async (name: string, email: string, password: string): Promise<User> => {
  await simulateDelay(700);
  console.log(`Attempting signup for: ${email}`);
  if (mockUsers.find(u => u.email === email)) {
    console.log('Signup failed: Email already exists');
    throw new Error('An account with this email already exists.');
  }

  const newUser: User = {
    id: `user-${Date.now()}`,
    email,
    name,
    // All new signups are students by default, unless it's the pre-defined admin
    role: email === ADMIN_EMAIL ? UserRole.ADMIN : UserRole.STUDENT,
  };
  mockUsers.push(newUser);
  currentSessionUser = { ...newUser }; // Login the user immediately after signup
  console.log('Signup successful:', currentSessionUser);

  if (authSubscribers.length > 0) {
    authSubscribers.forEach(cb => cb(currentSessionUser));
  }
  return { ...currentSessionUser };
};

export const mockLogout = async (): Promise<void> => {
  await simulateDelay(300);
  console.log('Logout successful');
  currentSessionUser = null;
  if (authSubscribers.length > 0) {
    authSubscribers.forEach(cb => cb(null));
  }
};

type AuthStateChangeCallback = (user: User | null) => void;
let authSubscribers: AuthStateChangeCallback[] = [];

// Mock for onAuthStateChanged behavior (like Firebase)
export const mockOnAuthStateChanged = (callback: AuthStateChangeCallback): (() => void) => {
  console.log('Subscribing to auth state changes');
  // Immediately call with current state
  // Simulate async nature of auth state loading on app start
  setTimeout(() => {
    callback(currentSessionUser ? { ...currentSessionUser } : null);
  }, 100); 

  authSubscribers.push(callback);

  // Return an unsubscribe function
  return () => {
    console.log('Unsubscribing from auth state changes');
    authSubscribers = authSubscribers.filter(sub => sub !== callback);
  };
};

// Function to check initial auth state (e.g., from localStorage, if implemented)
// For now, it just uses the in-memory session
const initializeAuth = () => {
  // In a real app, you might check localStorage for a token or session
  // For this mock, currentSessionUser is reset on page load unless persisted
  // We will call the onAuthStateChanged callbacks if a user is found (e.g. from a previous mock login in the same session)
  if (currentSessionUser && authSubscribers.length > 0) {
     authSubscribers.forEach(cb => cb(currentSessionUser ? { ...currentSessionUser } : null));
  }
};

// initializeAuth(); // Call this if you want to try and restore session on script load.
                    // However, onAuthStateChanged in AuthContext should handle initial check.
