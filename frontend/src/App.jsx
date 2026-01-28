import { Navigate, Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar';
import HomeView from './views/HomeView';
import LibraryView from './views/LibraryView';
import TrendingView from './views/TrendingView';

function App() {
  return (
    <div className="app-shell">
      <Navbar />
      <main className="page-container">
        <Routes>
          <Route path="/" element={<HomeView />} />
          <Route path="/library" element={<LibraryView />} />
          <Route path="/trending" element={<TrendingView />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;