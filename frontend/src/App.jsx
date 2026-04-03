import { Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import HomeView from './views/HomeView';
import LibraryView from './views/LibraryView';
import SearchView from './views/SearchView';
import TrendingView from './views/TrendingView';
import LoginView from './views/LoginView';
import RegisterView from './views/RegisterView';

import ChatView from './views/ChatView';
import GamePassportView from './views/GamePassportView';
import TierListView from './views/TierListView';
import ProfileView from './views/ProfileView';
import MoodView from './views/MoodView';

function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <div className="app-shell">
          <Navbar />
          <main className="page-container">
            <Routes>
              {/* Public */}
              <Route path="/login"    element={<LoginView />} />
              <Route path="/register" element={<RegisterView />} />
              <Route path="/"         element={<HomeView />} />
              <Route path="/trending" element={<TrendingView />} />
              <Route path="/search"   element={<SearchView />} />

              {/* Protected */}
              <Route path="/library"  element={<ProtectedRoute><LibraryView /></ProtectedRoute>} />
              <Route path="/mood"     element={<ProtectedRoute><MoodView /></ProtectedRoute>} />
              <Route path="/chat"     element={<ProtectedRoute><ChatView /></ProtectedRoute>} />
              <Route path="/passport" element={<ProtectedRoute><GamePassportView /></ProtectedRoute>} />
              <Route path="/tierlist" element={<ProtectedRoute><TierListView /></ProtectedRoute>} />
              <Route path="/profile"  element={<ProtectedRoute><ProfileView /></ProtectedRoute>} />

              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
      </SocketProvider>
    </AuthProvider>
  );
}

export default App;
