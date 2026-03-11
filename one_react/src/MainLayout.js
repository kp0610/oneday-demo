import React from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import ProfileHeader from './ProfileHeader';
import MainBackground from './components/MainBackground';
import SlideOutNav from './SlideOutNav'; // Import SlideOutNav
import './MainLayout.css';

const MainLayout = ({ setIsTemplateNavOpen, isTemplateNavOpen }) => { // Accept all necessary props
    const navigate = useNavigate();

    return (
        <MainBackground>
            <div className="main-layout">
                <header className="main-header">
                    <Link to="/home" className="logo-container">
                        <h1>OneDay</h1>
                        <p>하루를 하나로 관리하다.</p>
                    </Link>
                    <ProfileHeader />
                    {/* collection-trigger moved here, inside main-header */}
                    <div id="collection-trigger" onClick={() => navigate('/healthcare-collection')} className="collection-trigger"></div>
                </header>
                <main className="main-content">
                    <SlideOutNav isOpen={isTemplateNavOpen} onClose={() => setIsTemplateNavOpen(false)} navType="template" />
                    <Outlet /> {/* Pass setIsSlideOutNavOpen via context */}
                </main>
            </div>
        </MainBackground>
    );
};

export default MainLayout;
