import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useParams } from 'react-router-dom';
import Home from './Home';
import Login from './Login';
// Removed direct imports for DiaryCollection, StopwatchCollection, HealthcareCollection
import MainLayout from './MainLayout';
import Profile from './Profile';
import Diary from './Diary'; // Import Diary component
import DiaryView from './DiaryView'; // Import DiaryView component
import { useProfile } from './ProfileContext'; // Import useProfile
import Template from './Template'; // Import Template component
import CollectionView from './CollectionView'; // Import new CollectionView component

import { DataProvider } from './DataContext'; // Import DataProvider
import './App.css'; // Ensure App.css is imported

const BASE_WIDTH = 1194; // New base width
const BASE_HEIGHT = 834; // New base height

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true); // Add loading state
  const [scale, setScale] = useState(1); // Add scale state
  const [isTemplateNavOpen, setIsTemplateNavOpen] = useState(false);
  const { refreshProfile } = useProfile(); // Get refreshProfile from context

  useEffect(() => {
    const attemptGuestLogin = async () => {
      try {
        const res = await fetch(`${process.env.REACT_APP_API_URL}/api/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: process.env.REACT_APP_GUEST_EMAIL,
            password: process.env.REACT_APP_GUEST_PASSWORD,
          }),
        });

        if (res.ok) {
          const data = await res.json();
          if (data.userId) {
            localStorage.setItem('userId', process.env.REACT_APP_GUEST_USER_ID); // Use the predefined guest ID
            setIsAuthenticated(true);
            refreshProfile();
            return true;
          }
        }
      } catch (error) {
        console.error("Failed to auto-login guest:", error);
      }
      return false;
    };

    const checkAuth = async () => {
      try {
        const res = await fetch(`${process.env.REACT_APP_API_URL}/me`, {
          method: 'GET',
          credentials: 'include',
        });

        if (res.ok) {
          const data = await res.json();
          if (data.isLoggedIn) {
            localStorage.setItem('userId', data.userId);
            setIsAuthenticated(true);
            refreshProfile();
          } else {
            localStorage.removeItem('userId');
            setIsAuthenticated(false);
            // If not logged in, attempt guest login
            const guestLoggedIn = await attemptGuestLogin();
            if (!guestLoggedIn) {
              setLoading(false); // Only set loading to false if guest login also fails
            }
          }
        } else {
          // Handle cases where /me returns an error or not ok status (e.g., 401)
          localStorage.removeItem('userId');
          setIsAuthenticated(false);
          // Attempt guest login
          const guestLoggedIn = await attemptGuestLogin();
          if (!guestLoggedIn) {
            setLoading(false); // Only set loading to false if guest login also fails
          }
        }
      } catch (error) {
        console.error("Failed to fetch /me:", error);
        localStorage.removeItem('userId');
        setIsAuthenticated(false);
        // Attempt guest login
        const guestLoggedIn = await attemptGuestLogin();
        if (!guestLoggedIn) {
          setLoading(false); // Only set loading to false if guest login also fails
        }
      } finally {
        // setLoading(false); // Moved inside if (!guestLoggedIn) blocks
      }
    };

    checkAuth();
    window.addEventListener('storage', checkAuth);
    return () => {
      window.removeEventListener('storage', checkAuth);
    };
  }, []);

  // Scaling logic
  useEffect(() => {
    const calculateScale = () => {
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      const widthScale = viewportWidth / BASE_WIDTH;
      const heightScale = viewportHeight / BASE_HEIGHT;

      const newScale = Math.min(widthScale, heightScale);
      setScale(newScale);
    };

    calculateScale();
    window.addEventListener('resize', calculateScale);

    return () => window.removeEventListener('resize', calculateScale);
  }, []);

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  const DiaryWrapper = () => {
    const { date } = useParams();
    const { profile } = useProfile();
    const getToday = () => {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }
    const selectedDate = date || getToday();
    return <Diary selectedDate={selectedDate} userId={profile.userId} />;
  };

  const DiaryViewWrapper = () => {
    const { id } = useParams();
    return <DiaryView id={id} />;
  };

  return (
    <div id="scale-wrapper">
      <div
        id="ipad-root"
        style={{
          transform: `scale(${scale})`,
          transformOrigin: 'top left',
          // To center the scaled content horizontally
          marginLeft: scale < 1 ? `${(window.innerWidth - BASE_WIDTH * scale) / 2}px` : 'auto',
          marginRight: scale < 1 ? `${(window.innerWidth - BASE_WIDTH * scale) / 2}px` : 'auto',
        }}
      >
          <div id="content-frame">
            <Router>
              <div className="App">
                <Routes>
                  <Route path="/login" element={isAuthenticated ? <Navigate to="/home" /> : <Login onLogin={handleLogin} />} />
                  
                  <Route element={<DataProvider><MainLayout setIsTemplateNavOpen={setIsTemplateNavOpen} isTemplateNavOpen={isTemplateNavOpen} /></DataProvider>} >
                    <Route path="/home" element={<Home />} />
                    {/* All collection routes now point to CollectionView */}
                    <Route path="/diary-collection" element={<CollectionView />} />
                    <Route path="/stopwatch-collection" element={<CollectionView />} />
                    <Route path="/healthcare-collection" element={<CollectionView />} />
                    <Route path="/diary" element={<DiaryWrapper />} />
                    <Route path="/diary/:date" element={<DiaryWrapper />} />
                    <Route path="/diary-view/id/:id" element={<DiaryViewWrapper />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/template" element={<Template />} />
                  </Route>

                  <Route path="/" element={<Navigate to="/home" />} />
                </Routes>
              </div>
            </Router>
          </div>
      </div>
    </div>
  );
}

export default App;
