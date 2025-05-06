import React, { useState, useEffect,useCallback } from 'react';
import axios from 'axios';
import SideDashboard from './SideDashboard';
import Header from './header';
import '../styles/createbanner.css';
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL

const BannerUpload = () => {
  const [bannerData, setBannerData] = useState({
    bannerId: 1,
    banner1Title: '',
    banner1Description: '',
    banner1Image: '',
    banner1Link: '',
    banner2Title: '',
    banner2Description: '',
    banner2Image: '',
    banner2Link: '',
    banner3Title: '',
    banner3Description: '',
    banner3Image: '',
    banner3Link: ''
  });

  const [selectedFiles, setSelectedFiles] = useState({
    banner1: null,
    banner2: null,
    banner3: null
  });

  const [previewImages, setPreviewImages] = useState({
    banner1: null,
    banner2: null,
    banner3: null
  });

  const [uploadStatus, setUploadStatus] = useState({
    banner1: { loading: false, message: '', progress: 0 },
    banner2: { loading: false, message: '', progress: 0 },
    banner3: { loading: false, message: '', progress: 0 }
  });

  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const fetchBannerData = useCallback(async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/banner/getAllBanners`, {
        headers: {
          'Authorization': getAuthToken()
        }
      });

      if (response.data && response.data.data && response.data.data.length > 0) {
        const banner = response.data.data[0];
        setBannerData({
          bannerId: banner.id || 1,
          banner1Title: banner.banner1Title || '',
          banner1Description: banner.banner1Description || '',
          banner1Image: banner.banner1Image || '',
          banner1Link: banner.banner1Link || '',
          banner2Title: banner.banner2Title || '',
          banner2Description: banner.banner2Description || '',
          banner2Image: banner.banner2Image || '',
          banner2Link: banner.banner2Link || '',
          banner3Title: banner.banner3Title || '',
          banner3Description: banner.banner3Description || '',
          banner3Image: banner.banner3Image || '',
          banner3Link: banner.banner3Link || ''
        });

        setPreviewImages({
          banner1: banner.banner1ImageURL || null,
          banner2: banner.banner2ImageURL || null,
          banner3: banner.banner3ImageURL || null
        });
      }
    } catch (error) {
      console.error('Error fetching banner data:', error);
      if (error.response?.status === 401) {
        localStorage.removeItem('authToken');
        navigate('/login');
      }
    } finally {
      setIsLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    fetchBannerData();
  }, [fetchBannerData]);


  const handleInputChange = (e, bannerNumber) => {
    const { name, value } = e.target;
    setBannerData(prevData => ({
      ...prevData,
      [`banner${bannerNumber}${name}`]: value
    }));
  };

  const uploadFile = async (file, bannerNumber) => {
    const fileKey = `banner${bannerNumber}`;
    const formData = new FormData();
    formData.append('file', file);
    formData.append('fileType', 'IMAGE');
  
    try {
      setUploadStatus(prev => ({
        ...prev,
        [fileKey]: { ...prev[fileKey], loading: true, message: 'Uploading...', progress: 0 }
      }));
  
      const response = await axios.post(
        `${API_BASE_URL}/upload/uploadFile`, 
        formData, 
        {
          headers: {
            'Authorization': getAuthToken(),
            'Content-Type': 'multipart/form-data'
          },
          onUploadProgress: (progressEvent) => {
            const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadStatus(prev => ({
              ...prev,
              [fileKey]: { ...prev[fileKey], progress }
            }));
          }
        }
      );
  
      if (!response.data) {
        throw new Error('Server returned empty response');
      }
      if (response.data.status === false) {
        throw new Error(response.data.message || 'Upload rejected by server');
      }
      
      const responseData = response.data.data || response.data;
      if (!responseData) {
        throw new Error('Invalid response format - missing data');
      }
      return {
        fileAccessEndpoint: responseData.imageFileName || 
                         responseData.imageFileName || 
                         responseData.url
      };
  
    } catch (error) {
      console.error('Error uploading file:', error);
      let errorMessage = 'Error uploading file';
      if (error.response) {
        if (error.response.status === 401) {
          localStorage.removeItem('authToken');
          navigate('/login');
          errorMessage = 'Session expired. Please login again.';
        } else if (error.response.data && error.response.data.message) {
          errorMessage = error.response.data.message;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
  
      setUploadStatus(prev => ({
        ...prev,
        [fileKey]: { 
          ...prev[fileKey], 
          loading: false, 
          message: errorMessage, 
          progress: 0 
        }
      }));
      
      throw error;
    }
  };
  
  const handleFileChange = async (e, bannerNumber) => {
    const file = e.target.files[0];
    const fileKey = `banner${bannerNumber}`;
    
    if (!file) return;
  
    setSelectedFiles(prev => ({
      ...prev,
      [fileKey]: file
    }));
    
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewImages(prev => ({
        ...prev,
        [fileKey]: reader.result
      }));
    };
    reader.readAsDataURL(file);
  
    try {
      const { fileAccessEndpoint } = await uploadFile(file, bannerNumber);
      
      const imageField = `banner${bannerNumber}Image`;
      setBannerData(prevData => ({
        ...prevData,
        [imageField]: fileAccessEndpoint 
      }));
      
      setUploadStatus(prev => ({
        ...prev,
        [fileKey]: { 
          loading: false, 
          message: 'File uploaded successfully', 
          progress: 100 
        }
      }));
    } catch (error) {
      setSelectedFiles(prev => ({
        ...prev,
        [fileKey]: null
      }));
      setPreviewImages(prev => ({
        ...prev,
        [fileKey]: null
      }));
    }
  };

  const getAuthToken = () => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      navigate('/login');
      throw new Error('No authentication token found');
    }
    return token;
  };


  const saveBannerData = async () => {
    const uploadsInProgress = Object.values(uploadStatus).some(status => status.loading);
    if (uploadsInProgress) {
      setSaveMessage('Please wait for all uploads to complete before saving');
      return;
    }

    setIsSaving(true);
    setSaveMessage('');

    try {
      const response = await axios.post(
        `${API_BASE_URL}/banner/saveBanner`, 
        bannerData, 
        {
          headers: {
            'Authorization': getAuthToken(),
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data) {
        setSaveMessage('Banner data saved successfully');
        navigate('/dashboard')
        setPreviewImages(prev => ({
          banner1: bannerData.banner1Image 
            ? `${API_BASE_URL}/upload/getFileFromCloud?key=${bannerData.banner1Image}`
            : prev.banner1,
          banner2: bannerData.banner2Image 
            ? `${API_BASE_URL}/upload/getFileFromCloud?key=${bannerData.banner2Image}`
            : prev.banner2,
          banner3: bannerData.banner3Image 
            ? `${API_BASE_URL}/upload/getFileFromCloud?key=${bannerData.banner3Image}`
            : prev.banner3
        }));
      }
    } catch (error) {
      console.error('Error saving banner data:', error);
      setSaveMessage('Error saving banner data');
      if (error.response?.status === 401) {
        localStorage.removeItem('authToken');
        navigate('/login');
      }
    } finally {
      setIsSaving(false);
    }
  };

  const renderBannerForm = (bannerNumber) => {
    const fileKey = `banner${bannerNumber}`;
    const status = uploadStatus[fileKey];
    
    return (
      <div className="banner-form" key={bannerNumber}>
        
        <h2>Banner {bannerNumber}</h2>
        
        <div className="form-group">
          <label>Title</label>
          <input 
            type="text" 
            name="Title" 
            value={bannerData[`${fileKey}Title`] || ''} 
            onChange={(e) => handleInputChange(e, bannerNumber)} 
            placeholder="Enter Banner Title"
          />
        </div>
        
        <div className="form-group">
          <label>Description</label>
          <textarea 
            name="Description" 
            value={bannerData[`${fileKey}Description`] || ''} 
            onChange={(e) => handleInputChange(e, bannerNumber)} 
            placeholder="Enter Banner Description"
          ></textarea>
        </div>
        
        <div className="form-group">
          <label>Upload Banner Image</label>
          <div className="upload-area">
            {previewImages[fileKey] ? (
              <div className="preview-container">
                <img 
                  src={previewImages[fileKey]} 
                  alt={`Banner ${bannerNumber} Preview`} 
                  className="image-preview" 
                />
                {status.loading ? (
                  <div className="uploading-overlay">
                    <div className="progress-bar-container">
                      <div 
                        className="progress-bar" 
                        style={{ width: `${status.progress}%` }}
                      ></div>
                    </div>
                    <p>{status.progress}% Uploading...</p>
                  </div>
                ) : (
                  <button 
                    className="change-image-btn" 
                    onClick={() => document.getElementById(`banner-image-${bannerNumber}`).click()}
                  >
                    Change Image
                  </button>
                )}
              </div>
            ) : (
              <div 
                className="upload-placeholder"
                onClick={() => document.getElementById(`banner-image-${bannerNumber}`).click()}
              >
                {status.loading ? (
                  <div className="uploading-content">
                    <div className="progress-bar-container">
                      <div 
                        className="progress-bar" 
                        style={{ width: `${status.progress}%` }}
                      ></div>
                    </div>
                    <p>{status.progress}% Uploading...</p>
                  </div>
                ) : (
                  <>
                    <div className="upload-icon">
                      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 4V16M12 4L8 8M12 4L16 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M3 19H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    <p>Upload Images</p>
                  </>
                )}
              </div>
            )}
            <input 
              type="file" 
              id={`banner-image-${bannerNumber}`} 
              accept="image/*" 
              onChange={(e) => handleFileChange(e, bannerNumber)} 
              style={{ display: 'none' }} 
            />
          </div>
          {status.message && (
            <div className={`message ${status.message.includes('Error') ? 'error' : 'success'}`}>
              {status.message}
            </div>
          )}
        </div>
        
        <div className="form-group">
          <label>Link</label>
          <input 
            type="text" 
            name="Link" 
            value={bannerData[`${fileKey}Link`] || ''} 
            onChange={(e) => handleInputChange(e, bannerNumber)} 
            placeholder="Enter Link"
          />
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading banner data...</p>
      </div>
    );
  }

  return (
    <section className="app-container">
        <SideDashboard />
    <div className="main-content">
    <Header />
    <div className="banner-upload-container">
      <div className="banner-forms-container">
        {[1, 2, 3].map(bannerNumber => renderBannerForm(bannerNumber))}
      </div>
      
      <div className="save-section">
        <button 
          className="save-button" 
          onClick={saveBannerData}
          disabled={isSaving}
        >
          {isSaving ? (
            <>
              <span className="spinner"></span> Saving...
            </>
          ) : 'Save All Banners'}
        </button>
        {saveMessage && <div className={`message ${saveMessage.includes('success') ? 'success' : 'error'}`}>{saveMessage}</div>}
      </div>
    </div>
    </div>
    </section>
  );
};

export default BannerUpload;