
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import HomePage from './pages/HomePage';
import AskPage from './pages/AskPage';
import QuestionPage from './pages/QuestionPage';
import LeaderboardPage from './pages/LeaderboardPage';
import UserProfilePage from './pages/UserProfilePage';

function App() {
  return (
    <AppProvider>
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/ask" element={<AskPage />} />
          <Route path="/q/:id" element={<QuestionPage />} />
          <Route path="/leaderboard" element={<LeaderboardPage />} />
          <Route path="/user/:id" element={<UserProfilePage />} />
        </Routes>
      </Router>
    </AppProvider>
  );
}

export default App;