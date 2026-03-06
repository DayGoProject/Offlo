import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import { initAuthListener } from './store/authStore';
import AnnouncementBar from './components/layout/AnnouncementBar';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import ProtectedRoute from './components/common/ProtectedRoute';

// Pages (lazy imports는 추후 최적화)
import LandingPage from './pages/Landing/LandingPage';
import LoginPage from './pages/Auth/LoginPage';
import SignupPage from './pages/Auth/SignupPage';
import DashboardPage from './pages/Dashboard/DashboardPage';
import AnalysisPage from './pages/Analysis/AnalysisPage';
import AnalysisLoadingPage from './pages/Analysis/AnalysisLoadingPage';
import AnalysisResultPage from './pages/Analysis/AnalysisResultPage';
import HistoryPage from './pages/History/HistoryPage';
import GoalsPage from './pages/Goals/GoalsPage';
import GardenPage from './pages/Garden/GardenPage';
import BadgesPage from './pages/Badges/BadgesPage';
import PricingPage from './pages/Pricing/PricingPage';

export default function App() {
    useEffect(() => {
        const unsubscribe = initAuthListener();
        return () => unsubscribe();
    }, []);

    return (
        <BrowserRouter>
            <AnnouncementBar />
            <Navbar />
            <Routes>
                {/* Public */}
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/signup" element={<SignupPage />} />
                <Route path="/pricing" element={<PricingPage />} />

                {/* Protected */}
                <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
                <Route path="/analysis" element={<ProtectedRoute><AnalysisPage /></ProtectedRoute>} />
                <Route path="/analysis/loading" element={<ProtectedRoute><AnalysisLoadingPage /></ProtectedRoute>} />
                <Route path="/analysis/result" element={<ProtectedRoute><AnalysisResultPage /></ProtectedRoute>} />
                <Route path="/history" element={<ProtectedRoute><HistoryPage /></ProtectedRoute>} />
                <Route path="/goals" element={<ProtectedRoute><GoalsPage /></ProtectedRoute>} />
                <Route path="/garden" element={<ProtectedRoute><GardenPage /></ProtectedRoute>} />
                <Route path="/badges" element={<ProtectedRoute><BadgesPage /></ProtectedRoute>} />
            </Routes>
            <Footer />
        </BrowserRouter>
    );
}
