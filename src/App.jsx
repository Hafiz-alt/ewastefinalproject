import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Register from './pages/Register';
import UserDashboard from './pages/dashboards/UserDashboard';
import RecyclerDashboard from './pages/dashboards/RecyclerDashboard';
import TechnicianDashboard from './pages/dashboards/TechnicianDashboard';
import EducatorDashboard from './pages/dashboards/EducatorDashboard';
import AdminDashboard from './pages/dashboards/AdminDashboard';
import Marketplace from './pages/Marketplace';
import ProductDetail from './pages/marketplace/ProductDetail';
import SellItem from './pages/marketplace/SellItem';
import Orders from './pages/marketplace/Orders';
import Profile from './pages/Profile';
import VoiceAssistant from './components/VoiceAssistant';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard/user" element={<UserDashboard />} />
        <Route path="/dashboard/recycler" element={<RecyclerDashboard />} />
        <Route path="/dashboard/technician" element={<TechnicianDashboard />} />
        <Route path="/dashboard/educator" element={<EducatorDashboard />} />
        <Route path="/dashboard/admin" element={<AdminDashboard />} />
        <Route path="/marketplace" element={<Marketplace />} />
        <Route path="/marketplace/orders" element={<Orders />} />
        <Route path="/marketplace/:id" element={<ProductDetail />} />
        <Route path="/marketplace/sell" element={<SellItem />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>
      <VoiceAssistant />
    </Router>
  );
}

export default App;