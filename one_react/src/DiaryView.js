import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './DiaryView.css';
import ConfirmationModal from './ConfirmationModal'; // Import ConfirmationModal
import { useData } from './DataContext'; // Import useData hook
import { useProfile } from './ProfileContext'; // Import useProfile hook
import { ProfileContext } from './ProfileContext'; // Import ProfileContext

const DiaryView = () => {
    const { id } = useParams(); // Get ID from URL
    const navigate = useNavigate();
    const [diary, setDiary] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false); // State for confirmation modal
    const { deleteDiaryEntry, refreshDiaries } = useData(); // Get deleteDiaryEntry and refreshDiaries from useData hook
    const { profile } = useProfile(); // useProfile 훅을 컴포넌트 최상위 레벨에서 호출

    useEffect(() => {
        const fetchDiary = async () => {
            if (!id) return;
            setLoading(true);
            setError(null);
            try {
                const res = await fetch(`${process.env.REACT_APP_API_URL}/api/diaries/id/${id}`, {
                    cache: 'no-store'
                });
                if (!res.ok) {
                    throw new Error('Failed to fetch diary');
                }
                const data = await res.json();
                console.log("DiaryView fetchDiary data:", data); // DEBUG
                console.log("Diary object after fetch:", data); // Add this line
                setDiary(data);
            } catch (err) {
                console.error("Error fetching diary:", err);
                setError('다이어리를 불러오는데 실패했습니다.');
            } finally {
                setLoading(false);
            }
        };

        fetchDiary();
    }, [id]);

    const handleGoBack = () => {
        navigate(-1);
    };

    const handleDeleteClick = () => {
        console.log("Delete button clicked. Showing confirmation modal.");
        setShowDeleteConfirmation(true);
    };

    const handleConfirmDelete = async () => {
        console.log("Attempting to delete diary with ID:", diary.id);
        console.log("Diary ID being passed to deleteDiaryEntry:", diary.id);

        const currentUserId = profile?.userId; // 최상위 레벨에서 가져온 profile 객체 사용

        if (!currentUserId || !diary.id) { // diary._id 대신 diary.id 사용
            console.error("Cannot proceed with deletion: userId or diary ID is missing in DiaryView.");
            setError('사용자 정보 또는 다이어리 정보가 부족하여 삭제할 수 없습니다.');
            setShowDeleteConfirmation(false);
            return;
        }

        try {
            await deleteDiaryEntry(diary.id); // diary._id 대신 diary.id 사용
            refreshDiaries(); // 삭제 성공 후 다이어리 목록 새로고침
            navigate('/diary-collection'); // Navigate back to diary list after deletion
        } catch (err) {
            console.error("Error deleting diary:", err);
            setError('다이어리 삭제에 실패했습니다.');
        } finally {
            setShowDeleteConfirmation(false);
        }
    };

    const handleCancelDelete = () => {
        setShowDeleteConfirmation(false);
    };

    if (loading) {
        return <div className="diary-view-container">Loading...</div>;
    }

    if (error) {
        return <div className="diary-view-container error-message">{error}</div>;
    }

    if (!diary) {
        return <div className="diary-view-container no-diary">선택된 날짜에 다이어리가 없습니다.</div>;
    }

    const displayDate = new Date(diary.date).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' });

    return (
        <div className="diary-view-container">
            <header className="diary-view-header">
                <span className="diary-view-back-icon" onClick={handleGoBack}>&lt;</span>
                <h1 className="diary-view-title">{diary.title || '제목 없음'}</h1>
                <span className="diary-view-date">{displayDate}</span>
            </header>
            <div className="diary-view-content">
                {diary.canvasImagePath ? (
                    <img
                        src={`${process.env.REACT_APP_API_URL}${diary.canvasImagePath}`}
                        alt="Canvas Drawing"
                        className="diary-view-canvas-image"
                    />
                ) : (
                    <div className="no-canvas-image">저장된 다이어리 이미지가 없습니다.</div>
                )}
            </div>
            <button className="delete-diary-button" onClick={handleDeleteClick}>삭제</button>

            {showDeleteConfirmation && (
                <ConfirmationModal
                    show={showDeleteConfirmation} // Pass the show prop
                    message="정말로 이 다이어리를 영구히 삭제하시겠습니까?"
                    onConfirm={handleConfirmDelete}
                    onClose={handleCancelDelete} // Use onClose for the modal's close action
                />
            )}
        </div>
    );
};

export default DiaryView;
