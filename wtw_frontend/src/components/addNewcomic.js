// ComicSettings.jsx
import React, { useState, useRef, useEffect } from 'react';
import '../styles/addNewcomic.css';
import { Upload, ChevronDown, CheckCircle, Loader2 } from 'lucide-react';
import SideDashboard from './SideDashboard';
import Header from './header';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AddNewcomic = () => {
  const [selectedGenre, setSelectedGenre] = useState(null);
  const [isGenreDropdownOpen, setIsGenreDropdownOpen] = useState(false);
  const [comicName, setComicName] = useState('');
  const [comicDescription, setComicDescription] = useState('');
  const [imageFiles, setImageFiles] = useState([]);
  const [audioFiles, setAudioFiles] = useState([]);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [imageUploadProgress, setImageUploadProgress] = useState(0);
  const [audioUploadProgress, setAudioUploadProgress] = useState(0);
  const [isImageUploading, setIsImageUploading] = useState(false);
  const [isAudioUploading, setIsAudioUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadedImages, setUploadedImages] = useState([]);
  const [uploadedAudios, setUploadedAudios] = useState([]);
  const imageInputRef = useRef(null);
  const audioInputRef = useRef(null);
  const [genres, setGenres] = useState([]);
  const navigate = useNavigate();

  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

  const fetchGenres = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/genre/getAllGenres`);
      if (response.data && response.data.data) {
        setGenres(response.data.data);
      }
    } catch (err) {
      console.error('Error fetching genres:', err);
      setError('Failed to load genres. Please try again.');
    }
  };

  useEffect(() => {
    fetchGenres();
  }, []);

  const handleGenreSelect = (genre) => {
    setSelectedGenre(genre);
    setIsGenreDropdownOpen(false);
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setImageFiles(prevFiles => [...prevFiles, ...files]);
    setIsImageUploading(true);
    setImageUploadProgress(0);

    try {
      const uploadPromises = files.map(file => uploadFile(file, 'IMAGE', setImageUploadProgress));
      const results = await Promise.all(uploadPromises);

      setUploadedImages(prev => [...prev, ...results]);
      setImageUploadProgress(100);
    } catch (error) {
      setError(error.message);
      setImageFiles(prevFiles => prevFiles.filter(f => !files.includes(f)));
    } finally {
      setIsImageUploading(false);
    }
  };
  console.log("Uploaded Images:", uploadedImages);
  const handleAudioUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setAudioFiles(prevFiles => [...prevFiles, ...files]);
    setIsAudioUploading(true);
    setAudioUploadProgress(0);

    try {
      const uploadPromises = files.map(file => uploadFile(file, 'AUDIO', setAudioUploadProgress));
      const results = await Promise.all(uploadPromises);

      setUploadedAudios(prev => [...prev, ...results]);
      setAudioUploadProgress(100);
    } catch (error) {
      setError(error.message);
      setAudioFiles(prevFiles => prevFiles.filter(f => !files.includes(f)));
    } finally {
      setIsAudioUploading(false);
    }
  };
  console.log("Uploaded Audios:", uploadedAudios);
  const triggerImageUpload = () => {
    imageInputRef.current.click();
  };

  const triggerAudioUpload = () => {
    audioInputRef.current.click();
  };

  const removeImageFile = (index) => {
    setImageFiles(prevFiles => prevFiles.filter((_, i) => i !== index));
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
  };

  const removeAudioFile = (index) => {
    setAudioFiles(prevFiles => prevFiles.filter((_, i) => i !== index));
    setUploadedAudios(prev => prev.filter((_, i) => i !== index));
  };

  const getAuthToken = () => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      navigate('/login');
      throw new Error('No authentication token found');
    }
    return token;
  };

  const uploadFile = async (file, fileType, progressCallback) => {
    const token = getAuthToken();
    const formData = new FormData();
    formData.append('fileType', fileType);
    formData.append('file', file);

    try {
      const response = await axios.post(`${API_BASE_URL}/upload/uploadFile`, formData, {
        headers: {
          'Authorization': token,
          'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          progressCallback(percentCompleted);
        }
      });
      console.log("Server Response:", response.data);
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

      const fileAccessEndpoint = responseData.fileAccessEndpoint ||
        responseData.imageURL ||
        responseData.audioURL;

      if (!fileAccessEndpoint) {
        throw new Error('Server response missing file reference');
      }
      const serverFileName = fileAccessEndpoint.match(/key=([^&]+)/)?.[1] ||
      responseData.oldFileName ||
      file.name;
      return {
        originalName: file.name,
        serverFileName,
        fileAccessEndpoint,
        length: fileType === 'AUDIO' ? (responseData.length || 0) : undefined,
      };
    } catch (error) {
      console.error(`Upload failed for ${file.name}:`, error);
      if (error.response?.status === 401) {
        localStorage.removeItem('authToken');
        navigate('/login');
        throw new Error('Session expired. Please login again.');
      }
      throw new Error(`Failed to upload ${fileType.toLowerCase()}: ${error.response?.data?.message || error.message}`);
    }
  };
const checkFilePairing = () => {
  if (audioFiles.length === 0) return true; 
  const imageBaseNames = imageFiles.map(file => 
    file.name.replace(/\.[^/.]+$/, "").toLowerCase()
  );
  const audioBaseNames = audioFiles.map(file => 
    file.name.replace(/\.[^/.]+$/, "").toLowerCase()
  );
  for (let i = 0; i < audioFiles.length; i++) {
    if (!imageBaseNames.includes(audioBaseNames[i])) {
      return false;
    }
  }

  return true;
};
const handleSave = async () => {
  if (!comicName || !selectedGenre || imageFiles.length === 0) {
    setError('Please fill all required fields and upload at least one image');
    return;
  }
  if (!checkFilePairing()) {
    setError('Audio files must pair with image files (e.g., 1.png with 1.wav, 2.png with 2.mp3)');
    return;
  }
  
  if (uploadedImages.length !== imageFiles.length ||
    (audioFiles.length > 0 && uploadedAudios.length !== audioFiles.length)) {
    setError('Please wait for all files to finish uploading');
    return;
  }
  
  setIsLoading(true);
  setError(null);
  
  try {
    const comicContent = uploadedImages.map((image, index) => {
      const imageBaseName = imageFiles[index].name.replace(/\.[^/.]+$/, "").toLowerCase();
      const audioIndex = uploadedAudios.findIndex(audio => {
        const audioBaseName = audio.originalName.replace(/\.[^/.]+$/, "").toLowerCase();
        return audioBaseName === imageBaseName;
      });
      
      const audio = audioIndex >= 0 ? uploadedAudios[audioIndex] : null;
      
      return {
        imageFileName: image.serverFileName||image.originalName,
        audioFileName: audio?.serverFileName||audio?.originalName || '', 
        length: audio?.length || 0,
        sceneNumber: index + 1
      };
    });

    const response = await axios.post(`${API_BASE_URL}/comic/addNewComic`, {
      comicName,
      description: comicDescription,
      genreId: selectedGenre.id,
      comicContent,
    }, {
      headers: {
        'Authorization': getAuthToken(),
        'Content-Type': 'application/json'
      }
    });
    
    if (response.data.status === false) {
      throw new Error(response.data.message || 'Failed to create comic');
    }
    
    const comicData = response.data.data || response.data;

    const formattedResponse = {
      data: {
        id: comicData.id,
        comicName: comicData.comicName,
        description: comicData.description,
        genreId: comicData.genreId,
        genreName: selectedGenre.genreName,
        comicContent: comicData.comicContent.map(content => {
          const matchingImage = uploadedImages.find(img => 
            img.serverFileName === content.imageFileName
          );
          const matchingAudio = content.audioFileName ? 
            uploadedAudios.find(aud => 
              aud.serverFileName === content.audioFileName
            ) : null;
    
          return {
            id: content.id,
            imageFileName: matchingImage?.originalName || content.oldFileName || content.imageFileName,
            imageURL: `${API_BASE_URL}/upload/getFileFromCloud?key=${content.imageFileName}`,
            ...(content.audioFileName && {
              audioFileName: matchingAudio?.originalName || content.audioFileName,
              audioURL: `${API_BASE_URL}/upload/getFileFromCloud?key=${content.audioFileName}`,
              length: content.length
            }),
            sceneNumber: content.sceneNumber
          };
        })
      }
    };
    console.log("Formatted response:", formattedResponse);
    setShowSuccess(true);
    navigate('/dashboard');
  } catch (error) {
    console.error('Comic creation failed:', error);
    setError(error.message);
  } finally {
    setIsLoading(false);
  }
};
  const handleGoToDashboard = () => {
    navigate('/dashboard');
  };

  return (
    <div className="app-container">
      <SideDashboard />
      <div className="main-content">
        <Header />

        <div className="content">
          {!showSuccess ? (
            <>
              <div className="breadcrumb">
                <span className="page-title">Comic Settings</span>
                <span className="separator">/</span>
                <span className="sub-page">Add New Comic</span>
              </div>

              <div className="form-container">
                {error && <div className="error-message">{error}</div>}

                <div className="form-group">
                  <label>Comic Name</label>
                  <input
                    type="text"
                    placeholder="Enter Comic Name"
                    value={comicName}
                    onChange={(e) => setComicName(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label>Comic Description</label>
                  <textarea
                    placeholder="Enter Comic Description"
                    value={comicDescription}
                    onChange={(e) => setComicDescription(e.target.value)}
                  ></textarea>
                </div>

                <div className="form-group">
                  <label>Genre</label>
                  <div className="dropdown">
                    <div
                      className="dropdown-headeradd"
                      onClick={() => setIsGenreDropdownOpen(!isGenreDropdownOpen)}
                    >
                      {selectedGenre?.genreName || 'Select Genre'}
                      <ChevronDown size={16} />
                    </div>

                    {isGenreDropdownOpen && (
                      <div className="dropdown-options">
                        {genres.map((genre) => (
                          <div
                            key={genre.id}
                            className="dropdown-option"
                            onClick={() => handleGenreSelect(genre)}
                          >
                            {genre.genreName}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="form-group">
                  <label>Upload Image Files <span className="file-format">(PNG format for vertical scrolling)</span></label>

                  <input
                    type="file"
                    ref={imageInputRef}
                    onChange={handleImageUpload}
                    accept="image/png,image/jpeg,image/jpg"
                    multiple
                    style={{ display: 'none' }}
                  />

                  <div className="upload-box" onClick={triggerImageUpload}>
                    {isImageUploading && imageUploadProgress < 100 ? (
                      <>
                        <Loader2 size={24} className="spinner" />
                        <span>Uploading Images... {imageUploadProgress}%</span>
                      </>
                    ) : (
                      <>
                        <Upload size={24} />
                        <span>Upload Images</span>
                      </>
                    )}
                  </div>

                  {imageFiles.length > 0 && (
                    <div className="file-list">
                      {imageFiles.map((file, index) => (
                        <div key={index} className="file-item">
                          <span>{file.name}</span>
                          {uploadedImages[index] ? (
                            <span className="upload-status">✓</span>
                          ) : (
                            <Loader2 size={16} className="spinner" />
                          )}
                          <button
                            className="remove-file"
                            onClick={() => removeImageFile(index)}
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="form-group">
                  <label>Upload Audio Files <span className="file-format">(MP3 for each scene)</span></label>

                  <input
                    type="file"
                    ref={audioInputRef}
                    onChange={handleAudioUpload}
                    accept="audio/mp3,audio/mpeg,audio/wav"
                    multiple
                    style={{ display: 'none' }}
                  />

                  <div className="upload-box" onClick={triggerAudioUpload}>
                    {isAudioUploading && audioUploadProgress < 100 ? (
                      <>
                        <Loader2 size={24} className="spinner" />
                        <span>Uploading Audio... {audioUploadProgress}%</span>
                      </>
                    ) : (
                      <>
                        <Upload size={24} />
                        <span>Upload Audio</span>
                      </>
                    )}
                  </div>

                  {audioFiles.length > 0 && (
                    <div className="file-list">
                      {audioFiles.map((file, index) => (
                        <div key={index} className="file-item">
                          <span>{file.name}</span>
                          {uploadedAudios[index] ? (
                            <span className="upload-status">✓</span>
                          ) : (
                            <Loader2 size={16} className="spinner" />
                          )}
                          <button
                            className="remove-file"
                            onClick={() => removeAudioFile(index)}
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="form-actions">
                  <button
                    className="save-button"
                    onClick={handleSave}
                    disabled={
                      !comicName ||
                      !selectedGenre ||
                      imageFiles.length === 0 ||
                      isLoading ||
                      isImageUploading ||
                      isAudioUploading ||
                      uploadedImages.length !== imageFiles.length ||
                      (audioFiles.length > 0 && uploadedAudios.length !== audioFiles.length)
                    }
                  >
                    {isLoading ? (
                      <>
                        <Loader2 size={18} className="spinner" />
                        <span>Saving...</span>
                      </>
                    ) : 'Save'}
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="success-container">
              <div className="success-card">
                <CheckCircle size={60} className="success-icon" />
                <h2 className="success-title">Comic Created Successfully!</h2>
                <p className="success-message">
                  Your comic "{comicName}" has been successfully created and saved.
                </p>
                {/* <div className="success-details">
                  <div className="success-detail-item">
                    <span className="detail-label">Comic Name:</span>
                    <span className="detail-value">{comicName}</span>
                  </div>
                  <div className="success-detail-item">
                    <span className="detail-label">Genre:</span>
                    <span className="detail-value">{selectedGenre?.genreName}</span>
                  </div>
                  <div className="success-detail-item">
                    <span className="detail-label">Images Uploaded:</span>
                    <span className="detail-value">{imageFiles.length}</span>
                  </div>
                  <div className="success-detail-item">
                    <span className="detail-label">Audio Files Uploaded:</span>
                    <span className="detail-value">{audioFiles.length}</span>
                  </div>
                </div> */}
                {showSuccess && (
  <div className="success-container">
    <div className="success-card">
                  <button className="primary-button" onClick={handleGoToDashboard}>
                    Go to Dashboard
                  </button>
                  </div>
                  </div>
                  )}
                </div>
              </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddNewcomic;