// UpdateComic.jsx
import React, { useState, useRef, useEffect } from 'react';
import '../styles/addNewcomic.css';
import {
  Upload, ChevronDown, CheckCircle, Loader2, XCircle, Eye,
  RefreshCw,
  RotateCcw,
  Trash2,
  X,
  PauseCircle,
  PlayCircle,
  Volume2,
  Undo2,
  FileAudio
} from 'lucide-react';
import SideDashboard from './SideDashboard';
import '../styles/Editcomic.css';
import Header from './header';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';

const UpdateComic = () => {
  const { comicId } = useParams();
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
  const [existingContent, setExistingContent] = useState([]);
  const [isFetching, setIsFetching] = useState(true);
  const imageInputRef = useRef(null);
  const audioInputRef = useRef(null);
  const [genres, setGenres] = useState([]);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [currentPreviewImage, setCurrentPreviewImage] = useState('');
  const navigate = useNavigate();
  const [filesToDelete, setFilesToDelete] = useState({
    images: {},
    audios: {}
  });
  const [filesToReplace, setFilesToReplace] = useState({
    images: {},
    audios: {}
  });
  const [hoverIndex, setHoverIndex] = useState(null);

  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

  // Audio player related states and refs
  const audioRefs = useRef({});
  const [isPlaying, setIsPlaying] = useState({});
  const [currentTime, setCurrentTime] = useState({});
  const [duration, setDuration] = useState({});

  useEffect(() => {
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

    const fetchComicData = async () => {
      try {
        const response = await axios.get(
          `${API_BASE_URL}/comic/getComicDetail?comicId=${comicId}`
        );

        if (response.data && response.data.data) {
          const comicData = response.data.data;
          setComicName(comicData.comicName);
          setComicDescription(comicData.description);
          setSelectedGenre({ id: comicData.genreId, genreName: comicData.genreName });
          setExistingContent(comicData.comicContent);

          const images = comicData.comicContent.map(content => ({
            originalName: content.originalImageName || content.imageFileName.split('/').pop() || content.imageFileName,
            serverFileName: content.imageFileName,
            imageURL: `${API_BASE_URL}/${content.imageFileName}`
          }));

          const audios = comicData.comicContent.map(content => {
            let audioURL = '';
            if (content.audioFileName) {
              // Handle both cases where audioFileName might be full URL or just path
              audioURL = content.audioFileName.startsWith('http')
                ? content.audioFileName
                : `${API_BASE_URL}/${content.audioFileName.replace(/^\//, '')}`;
            }

            return {
              originalName: content.oldFileName || content.audioFileName?.split('/').pop() || 'audio',
              serverFileName: content.audioFileName,
              length: content.length,
              audioURL: audioURL
            };
          }).filter(audio => audio.serverFileName);

          setUploadedImages(images);
          setUploadedAudios(audios);
        }
      } catch (error) {
        console.error('Error fetching comic data:', error);
        setError('Failed to load comic data. Please try again.');
      } finally {
        setIsFetching(false);
      }
    };

    fetchGenres();
    if (comicId) {
      fetchComicData();
    }

    return () => {
      // Clean up audio elements
      Object.values(audioRefs.current).forEach(audio => {
        if (audio) {
          audio.pause();
          audio.removeEventListener('timeupdate', () => { });
          audio.removeEventListener('loadedmetadata', () => { });
        }
      });
    };
  }, [comicId, API_BASE_URL]);

  const handleGenreSelect = (genre) => {
    setSelectedGenre(genre);
    setIsGenreDropdownOpen(false);
  };

  const handleImageUpload = async (e, sceneNumber = null) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setIsImageUploading(true);
    setImageUploadProgress(0);
    setImageFiles(prev => [...prev, ...files]);

    try {
      const uploadPromises = files.map(file => uploadFile(file, 'IMAGE', setImageUploadProgress));
      const results = await Promise.all(uploadPromises);

      if (sceneNumber !== null) {
        setUploadedImages(prev => {
          const newImages = [...prev];
          newImages[sceneNumber - 1] = {
            originalName: results[0].originalName,
            serverFileName: results[0].serverFileName,
            imageURL: `${API_BASE_URL}/${results[0].serverFileName}` // Add full URL for preview
          };
          return newImages;
        });
        setFilesToReplace(prev => ({
          ...prev,
          images: { ...prev.images, [sceneNumber]: false }
        }));
      } else {
        setUploadedImages(prev => [
          ...prev,
          ...results.map(r => ({
            originalName: r.originalName,
            serverFileName: r.serverFileName,
            imageURL: `${API_BASE_URL}/${r.serverFileName}`
          }))
        ]);
      }

      setImageUploadProgress(100);
    } catch (error) {
      setError(error.message);
      setImageFiles(prev => prev.slice(0, -files.length));
    } finally {
      setIsImageUploading(false);
      e.target.value = '';
    }
  };

  const handleAudioUpload = async (e, sceneNumber = null) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setIsAudioUploading(true);
    setAudioUploadProgress(0);
    setAudioFiles(prev => [...prev, ...files]);

    try {
      const uploadPromises = files.map(file => uploadFile(file, 'AUDIO', setAudioUploadProgress));
      const results = await Promise.all(uploadPromises);

      if (sceneNumber !== null) {
        setUploadedAudios(prev => {
          const newAudios = [...prev];
          newAudios[sceneNumber - 1] = {
            originalName: results[0].originalName,
            serverFileName: results[0].serverFileName,
            audioURL: `${API_BASE_URL}/${results[0].serverFileName}`, // Add full URL for audio src
            length: results[0].length
          };
          return newAudios;
        });
        setFilesToReplace(prev => ({
          ...prev,
          audios: { ...prev.audios, [sceneNumber]: false }
        }));
      } else {
        setUploadedAudios(prev => [
          ...prev,
          ...results.map(r => ({
            originalName: r.originalName,
            serverFileName: r.serverFileName,
            audioURL: `${API_BASE_URL}/${r.serverFileName}`,
            length: r.length
          }))
        ]);
      }

      setAudioUploadProgress(100);
    } catch (error) {
      setError(error.message);
      setAudioFiles(prev => prev.slice(0, -files.length));
    } finally {
      setIsAudioUploading(false);
      e.target.value = '';
    }
  };

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

      if (fileType === 'AUDIO') {
        return {
          originalName: file.name,
          serverFileName,
          fileAccessEndpoint,
          length: responseData.length || 0
        };
      } else {
        return {
          originalName: file.name,
          serverFileName,
          fileAccessEndpoint,
        };
      }
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

  const handleDeleteFile = (type, sceneNumber) => {
    setFilesToDelete(prev => ({
      ...prev,
      [type]: {
        ...prev[type],
        [sceneNumber]: !prev[type][sceneNumber]
      }
    }));
  };

  const handleReplaceFile = (type, sceneNumber) => {
    setFilesToReplace(prev => ({
      ...prev,
      [type]: {
        ...prev[type],
        [sceneNumber]: !prev[type][sceneNumber]
      }
    }));
  };

  const validateFilePairing = () => {
    if (Object.values(filesToDelete.images).some(val => val) ||
      Object.values(filesToDelete.audios).some(val => val)) {
      return { isValid: true };
    }

    const activeImages = [...uploadedImages];
    const activeAudios = [...uploadedAudios];
    for (let i = 0; i < activeAudios.length; i++) {
      if (!activeImages[i]) {
        return {
          isValid: false,
          error: `Audio file ${activeAudios[i].originalName} doesn't have a matching image file`
        };
      }
    }

    return { isValid: true };
  };

  const handlePlayPause = (index) => {
    // Ensure audioRefs.current is an array
    if (!Array.isArray(audioRefs.current)) {
      audioRefs.current = [];
    }

    const audio = audioRefs.current[index];
    if (!audio) return;

    // First try to load the audio if src isn't set
    if (!audio.src && uploadedAudios[index]?.audioURL) {
      audio.src = uploadedAudios[index].audioURL;
    }

    if (audio.paused) {
      // Pause all other audio elements
      audioRefs.current.forEach((a, i) => {
        if (a && i !== index && !a.paused) {
          a.pause();
          setIsPlaying(prev => ({ ...prev, [i]: false }));
        }
      });

      // Attempt to play the audio
      const playPromise = audio.play();

      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsPlaying(prev => ({ ...prev, [index]: true }));
          })
          .catch(err => {
            setError(`Playback failed: ${err.message}`);
            console.error('Audio playback error:', err);
            // Try reloading the audio source
            if (uploadedAudios[index]?.audioURL) {
              audio.src = uploadedAudios[index].audioURL;
            }
          });
      }
    } else {
      audio.pause();
      setIsPlaying(prev => ({ ...prev, [index]: false }));
    }
  };

  const handleTimeUpdate = (index) => (e) => {
    setCurrentTime(prev => ({ ...prev, [index]: e.target.currentTime }));
  };

  const handleLoadedMetadata = (index) => (e) => {
    const audioElement = e.target;
    const audioURL = audioElement.src;

    console.log('Audio metadata:', {
      index,
      src: audioURL,
      duration: audioElement.duration,
      readyState: audioElement.readyState,
      networkState: audioElement.networkState
    });

    // Immediate check for known invalid states
    if (audioElement.networkState === HTMLMediaElement.NETWORK_NO_SOURCE) {
      console.error('No audio source available for index', index);
      return;
    }

    // Special handling for Infinity duration
    if (!isFinite(audioElement.duration)) {
      console.warn('Invalid duration detected, using fallback methods');

      // Method 1: Try forcing a duration calculation
      audioElement.currentTime = Number.MAX_VALUE;
      audioElement.ontimeupdate = function () {
        audioElement.ontimeupdate = null;
        audioElement.currentTime = 0;
        const calculatedDuration = audioElement.duration;
        console.log('Calculated duration:', calculatedDuration);

        if (isFinite(calculatedDuration)) {
          setDuration(prev => ({ ...prev, [index]: calculatedDuration }));
        } else {
          // Method 2: Use Web Audio API fallback
          getAudioDuration(audioURL).then(dur => {
            if (dur > 0) {
              setDuration(prev => ({ ...prev, [index]: dur }));
            } else {
              console.error('All duration methods failed');
              setDuration(prev => ({ ...prev, [index]: 0 }));
            }
          });
        }
      };
      return;
    }

    // Normal valid duration case
    if (audioElement.duration > 0) {
      setDuration(prev => ({ ...prev, [index]: audioElement.duration }));
    }
  };

  // Add this helper function outside your component
  const getAudioDuration = (url) => {
    return new Promise((resolve) => {
      // First try simple audio element method
      const audio = new Audio();
      audio.src = url;
      audio.preload = 'metadata';

      audio.onloadedmetadata = () => {
        if (isFinite(audio.duration)) {
          resolve(audio.duration);
          return;
        }
        // If simple method fails, use Web Audio API
        fallbackDurationCalculation(url).then(resolve);
      };

      audio.onerror = () => {
        fallbackDurationCalculation(url).then(resolve);
      };

      // Timeout fallback
      setTimeout(() => {
        fallbackDurationCalculation(url).then(resolve);
      }, 1000);
    });
  };

  const fallbackDurationCalculation = (url) => {
    return new Promise((resolve) => {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const request = new XMLHttpRequest();

      request.open('GET', url, true);
      request.responseType = 'arraybuffer';

      request.onload = function () {
        audioContext.decodeAudioData(request.response)
          .then(buffer => resolve(buffer.duration))
          .catch(() => resolve(0));
      };

      request.onerror = function () {
        resolve(0);
      };

      request.send();
    });
  };

  const formatTime = (time) => {
    if (!time || isNaN(time)) return '00:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleUpdate = async () => {
    try {
      if (!comicName || !selectedGenre) {
        setError('Comic name and genre are required');
        return;
      }
      if (existingContent.length === 0 && uploadedImages.length === 0) {
        setError('At least one image is required');
        return;
      }

      const validationResult = validateFilePairing();
      if (!validationResult.isValid) {
        setError(validationResult.error);
        return;
      }

      setIsLoading(true);
      const content = [];
      existingContent.forEach((item, index) => {
        const sceneNumber = index + 1;
        if (filesToDelete.images[sceneNumber]) {
          return;
        }

        const newItem = {
          sceneNumber: sceneNumber,
          imageFileName: item.imageFileName,
        };
        if (filesToReplace.images[sceneNumber] && uploadedImages[index]) {
          newItem.imageFileName = uploadedImages[index].serverFileName;
        }
        if (item.audioFileName && !filesToDelete.audios[sceneNumber]) {
          newItem.audioFileName = item.audioFileName;
          newItem.length = item.length || 1;
          if (filesToReplace.audios[sceneNumber] && uploadedAudios[index]) {
            newItem.audioFileName = uploadedAudios[index].serverFileName;
            newItem.length = uploadedAudios[index].length || 1;
          }
        } else if (uploadedAudios[index] && !filesToDelete.audios[sceneNumber]) {
          newItem.audioFileName = uploadedAudios[index].serverFileName;
          newItem.length = uploadedAudios[index].length || 1;
        }

        content.push(newItem);
      });
      for (let i = existingContent.length; i < uploadedImages.length; i++) {
        const sceneNumber = i + 1;
        const newScene = {
          imageFileName: uploadedImages[i].serverFileName,
          sceneNumber: content.length + 1
        };

        if (uploadedAudios[i]) {
          newScene.audioFileName = uploadedAudios[i].serverFileName;
          newScene.length = uploadedAudios[i].length || 1;
        }

        content.push(newScene);
      }
      content.forEach((item, index) => {
        item.sceneNumber = index + 1;
      });
      const payload = {
        comicId: parseInt(comicId),
        comicName: comicName.trim(),
        description: comicDescription.trim(),
        genreId: selectedGenre.id,
        comicContent: content
      };

      const response = await axios.post(
        `${API_BASE_URL}/comic/updateComic`,
        payload,
        {
          headers: {
            'Authorization': getAuthToken(),
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data?.status) {
        setShowSuccess(true);
        navigate('/dashboard');
      } else {
        throw new Error(response.data?.message || 'Update failed');
      }
    } catch (error) {
      console.error('Update error:', error);
      setError(`Update failed: ${error.response?.data?.message || error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoToDashboard = () => {
    navigate('/dashboard');
  };

  const handleImagePreview = (imageURL) => {
    window.open(imageURL, '_blank');
  };

  if (isFetching) {
    return (
      <div className="app-container">
        <SideDashboard />
        <div className="main-content">
          <Header />
          <div className="content">
            <div className="loading-container">
              <Loader2 size={32} className="spinner" />
              <span>Loading comic data...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
                <span className="sub-page">Update Comic</span>
              </div>

              <div className="form-container">
                {error && (
                  <div className="error-message">
                    <XCircle size={16} />
                    <span>{error}</span>
                    <button className="close-error" onClick={() => setError(null)}>×</button>
                  </div>
                )}

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
                <div className='imageaudio'>
                  <div className="form-group">
                    <label>Comic Images <span className="file-format">(PNG/JPEG for vertical scrolling)</span></label>

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
                          <span>Upload New Images</span>
                        </>
                      )}
                    </div>

                    {/* Existing Images */}
                    {existingContent.length > 0 && (
                      <div className="file-list">
                        <h4>Current Images:</h4>
                        <div className="image-grid">
                          {existingContent.map((content, index) => (
                            <div
                              key={`image-${index}`}
                              className={`image-card ${filesToDelete.images[index + 1] ? 'marked-delete' : ''}`}
                            >
                              <div className="image-preview-container">
                                <img
                                  src={content.imageURL ? content.imageURL : `${API_BASE_URL}/${content.imageFileName}`}
                                  className="image-preview"
                                  alt={`Comic page ${index + 1}`}
                                />
                                <div className="image-overlay">
                                  <button
                                    className="preview-button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      const imgUrl = content.imageURL || `${API_BASE_URL}/${content.imageFileName}`;
                                      setCurrentPreviewImage(imgUrl);
                                      setIsPreviewOpen(true);
                                    }}
                                  >
                                    <Eye size={18} /> Full Preview
                                  </button>
                                  {uploadedImages.slice(existingContent.length).map((file, index) => (
                                    <div key={`new-image-${index}`} className="new-file-card">
                                      <div className="file-preview">
                                        {file.fileAccessEndpoint && (
                                 <img
                                 src={file.imageUrl}
                                 alt="Comic page"
                                 onClick={(e) => {
                                   e.stopPropagation();
                                   setCurrentPreviewImage(file.imageUrl);
                                   setIsPreviewOpen(true);
                                 }}
                                 style={{ cursor: 'pointer' }}
                               />
                                        )}
                                        <span className="file-name">{file.originalName}</span>
                                      </div>
                                    
                                      <div className="file-actions">
                                        <span className="upload-status">
                                          <CheckCircle size={16} /> Ready
                                        </span>
                                        <button
                                          className="remove-button"
                                          onClick={() => removeImageFile(existingContent.length + index)}
                                          title="Remove this file"
                                        >
                                          <X size={16} />
                                        </button>
                                      </div>
                                    </div>
                                  ))}
                                  <div className="image-meta">
                                    <div className="image-actions">
                                      <button
                                        className={`action-button replace ${filesToReplace.images[index + 1] ? 'active' : ''}`}
                                        onClick={() => handleReplaceFile('images', index + 1)}
                                        disabled={filesToDelete.images[index + 1]}
                                        title="Replace this image"
                                      >
                                        {filesToReplace.images[index + 1] ? (
                                          <RefreshCw size={16} />
                                        ) : (
                                          <Upload size={16} />
                                        )}
                                      </button>
                                      <button
                                        className={`action-button delete ${filesToDelete.images[index + 1] ? 'undo' : ''}`}
                                        onClick={() => handleDeleteFile('images', index + 1)}
                                        title={filesToDelete.images[index + 1] ? "Undo delete" : "Delete this image"}
                                      >
                                        {filesToDelete.images[index + 1] ? (
                                          <RotateCcw size={16} />
                                        ) : (
                                          <Trash2 size={16} />
                                        )}
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {filesToReplace.images[index + 1] && (
                                <div className="replacement-section">
                                  <input
                                    type="file"
                                    id={`image-replace-${index}`}
                                    accept="image/png,image/jpeg,image/jpg"
                                    onChange={(e) => handleImageUpload(e, index + 1)}
                                    style={{ display: 'none' }}
                                  />
                                  <label htmlFor={`image-replace-${index}`} className="replace-upload-label">
                                    <Upload size={16} />
                                    <span>Select replacement image</span>
                                  </label>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* New Images */}
                    {uploadedImages.length > existingContent.length && (
                      <div className="file-list">
                        <h4>New Images to Upload:</h4>
                        <div className="new-files-grid">
                          {uploadedImages.slice(existingContent.length).map((file, index) => (
                            <div key={`new-image-${index}`} className="new-file-card">
                              <div className="file-preview">
                                {file.imageURL && (
                                  <img
                                    src={file.imageURL}
                                    alt={file.originalName}
                                    className="new-image-preview"
                                  />
                                )}
                                <span className="file-name">{file.originalName}</span>
                              </div>
                              <div className="file-actions">
                                <span className="upload-status">
                                  <CheckCircle size={16} /> Ready
                                </span>
                                <button
                                  className="remove-button"
                                  onClick={() => removeImageFile(existingContent.length + index)}
                                  title="Remove this file"
                                >
                                  <X size={16} />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="form-group">
                    <label className="form-label">
                      Audio Files <span className="file-format">(MP3 for each scene)</span>
                    </label>

                    <input
                      type="file"
                      ref={audioInputRef}
                      onChange={handleAudioUpload}
                      accept="audio/mp3,audio/mpeg,audio/wav"
                      multiple
                      style={{ display: 'none' }}
                    />

                    <div
                      className="upload-box hover-effect"
                      onClick={triggerAudioUpload}
                    >
                      {isAudioUploading && audioUploadProgress < 100 ? (
                        <>
                          <Loader2 size={24} className="spinner" />
                          <span>Uploading Audio... {audioUploadProgress}%</span>
                        </>
                      ) : (
                        <>
                          <Upload size={24} />
                          <span>Upload New Audio</span>
                        </>
                      )}
                    </div>

                    {/* Existing Audio Files */}
                    {existingContent.some(c => c.audioFileName) && (
                      <div className="file-list">
                        <h4>Current Audio:</h4>
                        <div className="file-items">
                          {existingContent.map((content, index) => (
                            content.audioFileName && (
                              <div
                                key={`audio-${index}`}
                                className={`file-item ${filesToDelete.audios[index + 1] ? 'marked-delete' : ''}`}
                                onMouseEnter={() => setHoverIndex(index)}
                                onMouseLeave={() => setHoverIndex(null)}
                              >
                                <div className="audio-player">
                                  <div className="audio-controls">
                                    <button
                                      className="play-pause-btn hover-effect"
                                      onClick={() => handlePlayPause(index)}
                                    >
                                      {isPlaying[index] ? (
                                        <PauseCircle size={26} />
                                      ) : (
                                        <PlayCircle size={26} />
                                      )}
                                    </button>

                                    <div className="audio-info">
                                      <div className="file-name-container">
                                        <span className="file-name">
                                          {content.oldFileName || content.audioFileName.split('/').pop()}
                                          {filesToDelete.audios[index + 1] &&
                                            <span className="delete-flag">(Marked for deletion)</span>
                                          }
                                        </span>

                                        <div className="time-display">
                                          <span>{formatTime(currentTime[index] || 0)}</span>
                                          <span>/</span>
                                          <span>
                                            {duration[index] ? formatTime(duration[index]) : '--:--'}
                                          </span>
                                        </div>
                                      </div>

                                      <div className="progress-container">
                                        <input
                                          type="range"
                                          min="0"
                                          max={duration[index] || 0}
                                          value={currentTime[index] || 0}
                                          onChange={(e) => {
                                            if (audioRefs.current[index]) {
                                              audioRefs.current[index].currentTime = e.target.value;
                                              setCurrentTime(prev => ({ ...prev, [index]: parseFloat(e.target.value) }));
                                            }
                                          }}
                                          className="progress-bar hover-effect"
                                        />
                                      </div>
                                    </div>

                                    <audio
                                      ref={el => {
                                        if (el) {
                                          // Clean up previous listeners
                                          const currentAudio = audioRefs.current[index];
                                          if (currentAudio) {
                                            currentAudio.removeEventListener('loadedmetadata', handleLoadedMetadata(index));
                                            currentAudio.removeEventListener('timeupdate', handleTimeUpdate(index));
                                          }

                                          audioRefs.current[index] = el;
                                          el.addEventListener('loadedmetadata', handleLoadedMetadata(index));
                                          el.addEventListener('timeupdate', handleTimeUpdate(index));

                                          // Only set src if it's different to avoid unnecessary reloads
                                          if (content.audioURL && el.src !== content.audioURL) {
                                            el.src = content.audioURL;
                                            // Force metadata load
                                            el.load();
                                          }
                                        }
                                      }}
                                      preload="metadata"
                                      onError={(e) => {
                                        console.error('Audio loading error:', {
                                          index,
                                          src: e.target.src,
                                          error: e.target.error
                                        });
                                        setError(`Audio failed to load: ${content.originalName}`);
                                      }}
                                    />
                                  </div>
                                </div>

                                <div className={`file-actions ${hoverIndex === index ? 'visible' : ''}`}>
                                  <button
                                    className={`action-button delete ${filesToDelete.audios[index + 1] ? 'undo-delete' : ''}`}
                                    onClick={() => handleDeleteFile('audios', index + 1)}
                                  >
                                    {filesToDelete.audios[index + 1] ? (
                                      <><Undo2 size={20} /> Undo</>
                                    ) : (
                                      <><Trash2 size={20} /></>
                                    )}
                                  </button>

                                  <button
                                    className={`action-button replace ${filesToReplace.audios[index + 1] ? 'active' : ''}`}
                                    onClick={() => handleReplaceFile('audios', index + 1)}
                                    disabled={filesToDelete.audios[index + 1]}
                                  >
                                    {filesToReplace.audios[index + 1] ? (
                                      <RefreshCw size={16} />
                                    ) : (
                                      <Upload size={16} />
                                    )}
                                  </button>
                                </div>

                                {filesToReplace.audios[index + 1] && (
                                  <div className="replacement-section">
                                    <input
                                      type="file"
                                      id={`audio-replace-${index}`}
                                      accept="audio/mp3,audio/mpeg,audio/wav"
                                      onChange={(e) => handleAudioUpload(e, index + 1)}
                                      style={{ display: 'none' }}
                                    />
                                    <label
                                      htmlFor={`audio-replace-${index}`}
                                      className="replace-upload-label"
                                    >
                                      <Upload size={16} />
                                      <span>Select replacement audio file</span>
                                    </label>
                                  </div>
                                )}
                              </div>
                            )
                          ))}
                        </div>
                      </div>
                    )}

                    {/* New Audio Files */}
                    {uploadedAudios.length > existingContent.filter(c => c.audioFileName).length && (
                      <div className="file-list new-files">
                        <h4>New Audio to Upload:</h4>
                        <div className="file-items">
                          {uploadedAudios.slice(existingContent.length).map((file, index) => (
                            <div key={`new-audio-${index}`} className="new-file-item">
                              <div className="new-file-info">
                                <FileAudio size={18} />
                                <span className="file-name">{file.originalName}</span>
                              </div>
                              <div className="file-status">
                                <span className="upload-status">
                                  <CheckCircle size={14} /> Ready to upload
                                </span>
                                <button
                                  className="remove-file hover-effect"
                                  onClick={() => removeAudioFile(existingContent.length + index)}
                                >
                                  <X size={14} /> Remove
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="form-actions">
                  <button
                    className="cancel-button"
                    onClick={handleGoToDashboard}
                  >
                    Cancel
                  </button>
                  <button
                    className="save-button"
                    onClick={handleUpdate}
                    disabled={
                      isLoading ||
                      isImageUploading ||
                      isAudioUploading ||
                      !comicName ||
                      !selectedGenre ||
                      (uploadedImages.length === 0 && existingContent.length === 0)
                    }
                  >
                    {isLoading ? <Loader2 size={18} className="spinner" /> : 'Update Comic'}
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="success-container">
              <div className="success-card">
                <CheckCircle size={60} className="success-icon" />
                <h2 className="success-title">Comic Updated Successfully!</h2>
                <p className="success-message">
                  Your comic "{comicName}" has been successfully updated.
                </p>
                <div className="success-details">
                  <div className="success-detail-item">
                    <span className="detail-label">Comic Name:</span>
                    <span className="detail-value">{comicName}</span>
                  </div>
                  <div className="success-detail-item">
                    <span className="detail-label">Genre:</span>
                    <span className="detail-value">{selectedGenre?.genreName}</span>
                  </div>
                  <div className="success-detail-item">
                    <span className="detail-label">Total Scenes:</span>
                    <span className="detail-value">
                      {existingContent.filter(c => !filesToDelete.images[c.sceneNumber]).length +
                        (uploadedImages.length - existingContent.length)}
                    </span>
                  </div>
                </div>
                <button className="primary-button" onClick={handleGoToDashboard}>
                  Go to Dashboard
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
        {/* Full-screen image preview modal */}
        {isPreviewOpen && (
                                        <div className="fullscreen-preview" onClick={() => setIsPreviewOpen(false)}>
                                          <div className="preview-content">
                                            <img
                                              src={currentPreviewImage}
                                              alt="Full screen preview"
                                              onClick={(e) => e.stopPropagation()}
                                            />
                                            <button
                                              className="close-preview"
                                              onClick={() => setIsPreviewOpen(false)}
                                            >
                                              <X size={32} />
                                            </button>
                                          </div>
                                        </div>
                                      )}
    </div>
    
  );
};

export default UpdateComic;