import React from 'react';
import '../styles/delete.css';

const DeleteConfirmationModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  comicTitle,
  comicId,
  successMessage
}) => {
  if (!isOpen) return null;

  const handleConfirm = () => {
    if (!comicId) {
      console.error('No comic ID provided for deletion');
      alert('Error: No comic selected');
      return;
    }
    onConfirm(comicId); 
  };

  return (
    <div className="modal-overlay">
      <div className="delete-modal">
        <button className="close-button" onClick={onClose}>
          ✕
        </button>
        
        {successMessage ? (
          <>
            <div className="success-icon">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M22 11.08V12C21.9988 14.1564 21.3005 16.2547 20.0093 17.9818C18.7182 19.709 16.9033 20.9725 14.8354 21.5839C12.7674 22.1953 10.5573 22.1219 8.53447 21.3746C6.51168 20.6273 4.78465 19.2461 3.61096 17.4371C2.43727 15.628 1.87979 13.4881 2.02168 11.3363C2.16356 9.18455 2.99721 7.13631 4.39828 5.49706C5.79935 3.85781 7.69279 2.71537 9.79619 2.24013C11.8996 1.7649 14.1003 1.98232 16.07 2.85999" stroke="#4BB543" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M22 4L12 14.01L9 11.01" stroke="#4BB543" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h2 className="modal-title">Success!</h2>
            <p className="success-message">{successMessage}</p>
            <div className="modal-buttons">
              <button 
                className="confirm-button" 
                onClick={onClose}
              >
                OK
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="delete-icon">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 3H15M3 6H21M19 6L18.2987 16.5193C18.1935 18.0494 18.1409 18.8145 17.8 19.4282C17.4999 19.9718 17.0472 20.4112 16.5017 20.6948C15.882 21.0154 15.1163 21.0498 13.585 21.1185C13.0095 21.1469 12.5171 21.1611 12 21.1611C11.4829 21.1611 10.9905 21.1469 10.415 21.1185C8.88368 21.0498 8.11804 21.0154 7.49834 20.6948C6.95276 20.4112 6.50009 19.9718 6.19998 19.4282C5.85911 18.8145 5.8065 18.0494 5.70129 16.5193L5 6" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h2 className="modal-title">Delete the Comic?</h2>
            <p className="modal-message">
              Are you sure you want to delete<br />
              {comicTitle}?
            </p>
            <div className="modal-buttons">
              <button 
                className="delete-button" 
                onClick={handleConfirm}
                disabled={!comicId}
              >
                Delete
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default DeleteConfirmationModal;