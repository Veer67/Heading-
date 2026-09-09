import { useState, useCallback } from 'react';
import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import { AnimatePresence } from 'framer-motion';
import LoadingScreen from './components/layout/LoadingScreen';
import AppLayout from './components/layout/AppLayout';
import Dashboard from './pages/Dashboard';
import Analyze from './pages/Analyze';
import Strategies from './pages/Strategies';
import MarketNews from './pages/MarketNews';
import Chat from './pages/Chat';
import Profile from './pages/Profile';
import Charts from './pages/Charts';
import Backtest from './pages/Backtest';
import About from './pages/About';
import Contact from './pages/Contact';
import Learn from './pages/Learn';
import LearnCourse from './pages/LearnCourse';
import LearnLesson from './pages/LearnLesson';
import LearnAI from './pages/LearnAI';
import LearnDaily from './pages/LearnDaily';
import LearnAchievements from './pages/LearnAchievements';
import LearnProgress from './pages/LearnProgress';
import LearnJournal from './pages/LearnJournal';
import LearnPractice from './pages/LearnPractice';
import LearnPath from './pages/LearnPath';
import LearnVideos from './pages/LearnVideos';
import LearnVideo from './pages/LearnVideo';
import OAuthConsent from './pages/OAuthConsent';
import { AlertProvider } from '@/lib/AlertContext';
import { ThemeProvider } from '@/lib/ThemeContext';

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();
  const [showLoading, setShowLoading] = useState(true);

  const handleLoadingComplete = useCallback(() => {
    setShowLoading(false);
  }, []);

  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      navigateToLogin();
      return null;
    }
  }

  return (
    <>
      <AnimatePresence>
        {showLoading && <LoadingScreen onComplete={handleLoadingComplete} />}
      </AnimatePresence>
      {!showLoading && (
        <Routes>
          <Route path="/" element={<Navigate to="/Dashboard" replace />} />
          <Route element={<AppLayout />}>
            <Route path="/Dashboard" element={<Dashboard />} />
            <Route path="/Analyze" element={<Analyze />} />
            <Route path="/Strategies" element={<Strategies />} />
            <Route path="/MarketNews" element={<MarketNews />} />
            <Route path="/Chat" element={<Chat />} />
            <Route path="/Profile" element={<Profile />} />
            <Route path="/Charts" element={<Charts />} />
            <Route path="/Backtest" element={<Backtest />} />
            <Route path="/About" element={<About />} />
            <Route path="/Contact" element={<Contact />} />
            <Route path="/Learn" element={<Learn />} />
            <Route path="/Learn/Course/:courseId" element={<LearnCourse />} />
            <Route path="/Learn/Lesson/:lessonId" element={<LearnLesson />} />
            <Route path="/Learn/AI" element={<LearnAI />} />
            <Route path="/Learn/Daily" element={<LearnDaily />} />
            <Route path="/Learn/Achievements" element={<LearnAchievements />} />
            <Route path="/Learn/Progress" element={<LearnProgress />} />
            <Route path="/Learn/Journal" element={<LearnJournal />} />
            <Route path="/Learn/Practice" element={<LearnPractice />} />
            <Route path="/Learn/Path" element={<LearnPath />} />
            <Route path="/Learn/Videos" element={<LearnVideos />} />
            <Route path="/Learn/Video/:videoId" element={<LearnVideo />} />
          </Route>
          <Route path="/oauth/consent" element={<OAuthConsent />} />
          <Route path="*" element={<PageNotFound />} />
        </Routes>
      )}
    </>
  );
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <QueryClientProvider client={queryClientInstance}>
          <AlertProvider>
            <Router>
              <AuthenticatedApp />
            </Router>
            <Toaster />
          </AlertProvider>
        </QueryClientProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}


export default App;