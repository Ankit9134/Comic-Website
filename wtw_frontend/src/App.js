import './App.css';
import { BrowserRouter, Route, Routes, useLocation, Navigate } from "react-router-dom";
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Banner from './components/banner';
import Head from './components/Head';
import ComicDashboard from './components/Dashboard';
import AddNewcomic from './components/addNewcomic';
import Login from './components/Login';
import { useState, useEffect } from 'react';
import UpdateComic from './components/Editcomic';
import BannerUpload from './components/createbanner';
import ComicPlay from './components/ComicPlay';

function AppContent() {
  const location = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState(null); 
  
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    setIsAuthenticated(!!token);
  }, [location]);

  // Fixed the hideNavbarFooter logic
  const hideNavbarFooter = ['/dashboard', '/comicsetting', '/login', '/createbanner'].some(path => 
    location.pathname.startsWith(path) || 
    location.pathname.startsWith('/updatecomic/')
  );

  const ProtectedRoute = ({ children }) => {
    if (isAuthenticated === null) {
      return <div>Loading...</div>; 
    }
    
    if (!isAuthenticated) {
      return <Navigate to="/login" replace state={{ from: location }} />;
    }
    return children;
  };

  const PublicRoute = ({ children }) => {
    if (isAuthenticated) {
      return <Navigate to="/dashboard" replace />;
    }
    return children;
  };

  return (
    <>
      {!hideNavbarFooter && <Navbar />}
      <Routes>
        <Route path="/" element={<> <Banner /> <Head /> </>} />
        <Route path="/comic/:comicId" element={<ComicPlay/>} />
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <ComicDashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/comicsetting" 
          element={
            <ProtectedRoute>
              <AddNewcomic />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/updatecomic/:comicId" 
          element={
            <ProtectedRoute>
              <UpdateComic />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/createbanner" 
          element={
            <ProtectedRoute>
              <BannerUpload/>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/login" 
          element={
            <PublicRoute>
              <Login setIsAuthenticated={setIsAuthenticated} />
            </PublicRoute>
          } 
        />
      </Routes>
      {!hideNavbarFooter && <Footer />}
    </>
  );
}

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <AppContent /> 
      </BrowserRouter>
    </div>
  );
}

export default App;