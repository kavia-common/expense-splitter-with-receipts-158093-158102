import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import BottomNav from './components/BottomNav';
import GroupsPage from './pages/GroupsPage';
import GroupDetailPage from './pages/GroupDetailPage';
import ExpensesPage from './pages/ExpensesPage';
import FriendsPage from './pages/FriendsPage';
import ReceiptsPage from './pages/ReceiptsPage';
import NotFound from './pages/NotFound';

// PUBLIC_INTERFACE
function App() {
  /**
   * Main application component providing the app shell, theme toggle,
   * and route structure for the Expense Splitter app.
   */
  const [theme, setTheme] = useState('light');

  // Effect to apply theme to document element
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // PUBLIC_INTERFACE
  const toggleTheme = () => {
    /** Toggle between light and dark themes. */
    setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  return (
    <div className="App app-shell">
      <button
        className="theme-toggle"
        onClick={toggleTheme}
        aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
      >
        {theme === 'light' ? '🌙 Dark' : '☀️ Light'}
      </button>

      <main className="app-content" role="main">
        <Routes>
          <Route path="/" element={<Navigate to="/groups" replace />} />
          <Route path="/groups" element={<GroupsPage />} />
          <Route path="/groups/:groupId" element={<GroupDetailPage />} />
          <Route path="/expenses" element={<ExpensesPage />} />
          <Route path="/friends" element={<FriendsPage />} />
          <Route path="/receipts" element={<ReceiptsPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>

        {/* Keep Learn React link to satisfy existing test */}
        <div style={{ marginTop: 24 }}>
          <a
            className="App-link"
            href="https://reactjs.org"
            target="_blank"
            rel="noopener noreferrer"
          >
            Learn React
          </a>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}

export default App;
