import React, { useState, useEffect, useMemo } from 'react';
import './DiaryCollection.css';
import { useNavigate } from 'react-router-dom';
import { useProfile } from './ProfileContext'; // Import useProfile
import { useData } from './DataContext'; // Import useData

const DiaryCollection = ({ selectedStartDate, selectedEndDate }) => {
    const navigate = useNavigate();
    const { profile } = useProfile(); // Get profile from context
    const { allDiaries, refreshDiaries } = useData(); // Get allDiaries and refreshDiaries from DataContext

    // useEffect to refresh diaries when component mounts or userId changes
    useEffect(() => {
        refreshDiaries();
    }, [profile.userId, refreshDiaries]); // Re-run effect when userId changes or refreshDiaries changes

    const displayedDiaries = useMemo(() => {
        return allDiaries.filter(diary => {
            const diaryDate = new Date(diary.navDate);
            const start = new Date(selectedStartDate);
            const end = new Date(selectedEndDate);

            return diaryDate >= start && diaryDate <= end;
        });
    }, [allDiaries, selectedStartDate, selectedEndDate]);


    const handleCardClick = (id) => {
        navigate(`/diary-view/id/${id}`);
    };

    // const handleGoBack = () => { // Removed
    //     navigate(-1);
    // };



        const renderDiaryCard = (diary) => {
            // Truncate title
            const displayTitle = diary.title && diary.title.length > 10
                ? diary.title.substring(0, 10) + '...'
                : diary.title || '제목 없음';
    
    
            return (
                <div key={diary.id} className="diary-card" onClick={() => handleCardClick(diary.id)}>
                    {diary.image && (
                        <img src={diary.image} alt="Diary Canvas" className="diary-card-image-thumbnail" />
                    )}
                    <div className="diary-card-header">
                        <span className="card-date-display">{diary.displayDate}</span>
                        <span className="diary-title-display">{displayTitle}</span>
                    </div>
                </div>
            );
        };
    return (
        <div className="diary-collection-container">
                        {/* Removed header, back button, title, and calendar icon */}




            {displayedDiaries.length > 0 ? (
                <div className="diary-grid">
                    {displayedDiaries.map(renderDiaryCard)}
                </div>
            ) : (
                <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
                    <div className="empty-data-card">
                        저장된 다이어리 데이터가 없습니다.
                    </div>
                </div>
            )}
        </div>
    );
};

export default DiaryCollection;
