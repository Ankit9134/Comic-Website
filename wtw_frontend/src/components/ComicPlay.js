import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Play, Pause, Volume2, VolumeX } from 'lucide-react';
import '../styles/ComicPlay.css'

function throttle(func, limit) {
  let inThrottle;
  return function () {
    const args = arguments;
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

const ComicPlay = () => {
  const { comicId } = useParams();
  const navigate = useNavigate();
  const [comic, setComic] = useState(null);
  const [scenes, setScenes] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [autoScroll, setAutoScroll] = useState(true);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [currentScene, setCurrentScene] = useState(1);
  const [progress, setProgress] = useState(0);
  const [audioEnded, setAudioEnded] = useState(false);
  const [isAudioLoaded, setIsAudioLoaded] = useState(false);
  const [contentVisibility, setContentVisibility] = useState({});
  const [isUserScrolling, setIsUserScrolling] = useState(false);
  const [isPreloading, setIsPreloading] = useState(true);
  const [allAssetsLoaded, setAllAssetsLoaded] = useState(false);
  const [error, setError] = useState(null);
  const [audioState, setAudioState] = useState({
    isReady: false,
    isLoading: false,
    error: null
  });
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [activeSceneIndex, setActiveSceneIndex] = useState(0);
  const [initialLoad, setInitialLoad] = useState(true);
  const [loadingStatus, setLoadingStatus] = useState({
    audio: false,
    images: false,
    ready: false
  });
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
  // Use a single, persistent audio element
  const audioRef = useRef(null);
  const mainSceneRef = useRef(null);
  const imageContainerRefs = useRef({});
  const audioElementsRef = useRef({});
  const imageElementsRef = useRef({});
  const scrollIntervalRef = useRef(null);
  const animationFrameRef = useRef(null);
  const userScrollTimeoutRef = useRef(null);
  const imageRefs = useRef({});
  const loadedImagesCount = useRef(0);
  const totalImagesCount = useRef(0);

  function easeInOutQuad(t) {
    return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
  }

  // Initialize audio element once
  useEffect(() => {
    const audio = new Audio();
    audio.preload = "auto";
    audioRef.current = audio;

    const handleError = (e) => {
      console.error("Audio error:", e.type, e.message);
      setIsAudioLoaded(false);
      setAudioState(prev => ({
        ...prev,
        error: e.message || 'Unknown audio error',
        isReady: false,
        isLoading: false
      }));
      setLoadingStatus(prev => ({
        ...prev,
        audio: false,
        ready: false
      }));
    };

    const handleCanPlay = () => {
      setIsAudioLoaded(true);
      setAudioState(prev => ({
        ...prev,
        isReady: true,
        isLoading: false
      }));
      setLoadingStatus(prev => ({
        ...prev,
        audio: true,
        ready: prev.images
      }));
    };

    const handleWaiting = () => {
      setIsAudioLoaded(false);
      setAudioState(prev => ({
        ...prev,
        isLoading: true
      }));
      setLoadingStatus(prev => ({
        ...prev,
        audio: false,
        ready: false
      }));
    };

    const handleEnded = () => {
      handleAudioEnded();
    };

    audio.addEventListener('error', handleError);
    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('waiting', handleWaiting);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('timeupdate', handleAudioTimeUpdate);

    return () => {
      audio.removeEventListener('error', handleError);
      audio.removeEventListener('canplay', handleCanPlay);
      audio.removeEventListener('waiting', handleWaiting);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('timeupdate', handleAudioTimeUpdate);
      audio.pause();
      audio.src = "";
      audio.remove();
    };
  }, []);
  useEffect(() => {
    const fetchComicData = async () => {
      try {
        setIsPreloading(true);
        const response = await fetch(`${API_BASE_URL}/comic/getComicDetail?comicId=${comicId}`);
        if (!response.ok) throw new Error('Failed to fetch comic');
        const { data } = await response.json();
        setComic(data);
      } catch (err) {
        console.error("Error fetching comic:", err);
        setError(err.message);
        setIsPreloading(false);
      }
    };
    fetchComicData();
  }, [comicId]);

  useEffect(() => {
    if (!comic || !comic.comicContent) return;

    const transformedScenes = comic.comicContent.map((content, index) => ({
      id: index + 1,
      title: `Scene ${content.sceneNumber}`,
      audio: content.audioURL || '',
      content: [
        {
          type: "image",
          src: content.imageURL || '',
          alt: `Scene ${content.sceneNumber}`,
          className: "scene-image"
        }
      ],
      thumbnail: (
        <div className="thumbnail-image-wrapper">
          <img
            src={content.imageURL || ''}
            alt={`Scene ${content.sceneNumber}`}
            className="thumbnail-image"
          />
        </div>
      ),
      caption: `Scene ${content.sceneNumber} of ${comic.comicName}`,
      duration: content.length || 0
    }));

    setScenes(transformedScenes);
    // Calculate total images to track loading
    totalImagesCount.current = transformedScenes.length * 2;
    loadedImagesCount.current = 0;
  }, [comic]);

  // Enhanced asset preloading
  useEffect(() => {
    if (scenes.length === 0) return;

    const preloadAssets = async () => {
      setIsPreloading(true);
      setLoadingStatus({
        audio: false,
        images: false,
        ready: false
      });

      // Track image loading progress
      loadedImagesCount.current = 0;
      totalImagesCount.current = scenes.length * 2;

      const imagePromises = [];
      const audioPromises = [];

      // Helper to update image loading status
      const updateImageLoadStatus = () => {
        loadedImagesCount.current++;
        const progress = loadedImagesCount.current / totalImagesCount.current;
        if (loadedImagesCount.current >= totalImagesCount.current) {
          setLoadingStatus(prev => ({
            ...prev,
            images: true,
            ready: prev.audio
          }));
        }
      };

      scenes.forEach(scene => {
        scene.content.forEach(item => {
          if (item.type === 'image' && item.src) {
            const imagePromise = new Promise((resolve) => {
              const img = new Image();
              img.onload = () => {
                if (!imageElementsRef.current[item.src]) {
                  imageElementsRef.current[item.src] = img;
                }
                updateImageLoadStatus();
                resolve();
              };
              img.onerror = () => {
                console.warn(`Failed to load image: ${item.src}`);
                updateImageLoadStatus();
                resolve();
              };
              img.src = item.src;
            });
            imagePromises.push(imagePromise);
          }
        });

        // Also preload thumbnails
        if (scene.content[0]?.src) {
          const thumbnailPromise = new Promise((resolve) => {
            const img = new Image();
            img.onload = () => {
              updateImageLoadStatus();
              resolve();
            };
            img.onerror = () => {
              console.warn(`Failed to load thumbnail: ${scene.content[0].src}`);
              updateImageLoadStatus();
              resolve();
            };
            img.src = scene.content[0].src;
          });
          imagePromises.push(thumbnailPromise);
        }

        if (scene.audio) {
const audioPromise = new Promise((resolve) => {
  const audio = new Audio();
  audio.preload = 'auto';
  const timeout = setTimeout(() => {
    console.warn(`Audio load timeout: ${scene.audio}`);
    resolve();
  }, 5000); 

  audio.oncanplaythrough = () => {
    clearTimeout(timeout);
    audioElementsRef.current[scene.id] = audio;
    resolve();
  };
  audio.onerror = () => {
    clearTimeout(timeout);
    console.warn(`Failed to load audio: ${scene.audio}`);
    resolve();
  };
  audio.src = scene.audio;
});
          audioPromises.push(audioPromise);
        }
      });

      try {
        // Load images first
        await Promise.all(imagePromises);

        // Now load first scene's audio
        if (audioRef.current && scenes[0]?.audio) {
          audioRef.current.src = scenes[0].audio;
          audioRef.current.load();
        }

        setAllAssetsLoaded(true);
        setInitialLoad(false);
        setIsPreloading(false);

        // Audio readiness will be handled by the audio element's canplay event
      } catch (error) {
        console.error("Error in asset preloading:", error);
        setIsPreloading(false);
      }
    };

    preloadAssets();
  }, [scenes]);
  const loadAudioWithRetry = async (url, retries = 3) => {
    for (let i = 0; i < retries; i++) {
      try {
        const audio = new Audio();
        audio.preload = 'auto';
        await new Promise((resolve, reject) => {
          audio.oncanplaythrough = resolve;
          audio.onerror = reject;
          audio.src = url;
        });
        return audio;
      } catch (err) {
        if (i === retries - 1) throw err;
        await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1))); 
      }
    }
  };
  // Handle scene changes
  useEffect(() => {
    if (!audioRef.current || scenes.length === 0) return;

    // Reset loading status when changing scenes
    setLoadingStatus(prev => ({
      ...prev,
      audio: false,
      ready: false
    }));

    const scene = scenes[currentScene - 1];
    if (!scene || !scene.audio) return;

    // Load audio from preloaded source or directly
    if (audioElementsRef.current[currentScene]) {
      audioRef.current.src = audioElementsRef.current[currentScene].src;
    } else {
      audioRef.current.src = scene.audio;
    }

    audioRef.current.load();
    setIsAudioLoaded(false);
    setAudioEnded(false);
    setActiveImageIndex(0);

    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    if (mainSceneRef.current) {
      mainSceneRef.current.scrollTop = 0;
    }
  }, [currentScene, scenes]);

  // Handle audio playback rate changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = playbackSpeed;
    }
  }, [playbackSpeed]);

  // Handle mute/unmute
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.muted = isMuted;
    }
  }, [isMuted]);

  useEffect(() => {
    const container = mainSceneRef.current;
    if (!container) return;

    const handleScroll = throttle(() => {
      if (!container) return;

      const { scrollTop, scrollHeight, clientHeight } = container;
      const currentProgress = (scrollTop / (scrollHeight - clientHeight)) * 100;
      if (!autoScroll) {
        setIsUserScrolling(true);

        if (userScrollTimeoutRef.current) {
          clearTimeout(userScrollTimeoutRef.current);
        }

        userScrollTimeoutRef.current = setTimeout(() => {
          setIsUserScrolling(false);
        }, 1000);

        if (audioRef.current && audioRef.current.duration) {
          const newTime = (currentProgress / 100) * audioRef.current.duration;
          audioRef.current.currentTime = newTime;
          setProgress(currentProgress);
        }
      }
    }, 100);

    container.addEventListener('scroll', handleScroll);
    return () => {
      container.removeEventListener('scroll', handleScroll);
      if (userScrollTimeoutRef.current) {
        clearTimeout(userScrollTimeoutRef.current);
      }
    };
  }, [isPlaying, autoScroll]);

  useEffect(() => {
    const handleScroll = throttle(() => {
      const container = mainSceneRef.current;
      if (!container || !scenes || scenes.length === 0) return;

      scenes.forEach((scene, sceneIndex) => {
        if (!scene.content) return;

        scene.content.forEach((item, itemIndex) => {
          const imageEl = imageRefs.current[scene.id]?.[itemIndex];
          if (!imageEl) return;

          const rect = imageEl.getBoundingClientRect();
          const isVisible = rect.top <= window.innerHeight / 2 && rect.bottom >= 0;

          if (isVisible && (sceneIndex !== activeSceneIndex || itemIndex !== activeImageIndex)) {
            setActiveSceneIndex(sceneIndex);
            setActiveImageIndex(itemIndex);
          }
        });
      });
    }, 100);

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [scenes, activeSceneIndex, activeImageIndex]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !scenes.length) return;

    const handleTimeUpdate = () => {
      if (!audio.duration) return;

      const scene = scenes[currentScene - 1];
      if (!scene || !scene.content) return;

      const progress = (audio.currentTime / audio.duration) * 100;
      setProgress(progress);

      // Calculate which image should be visible based on audio progress
      const imageCount = scene.content.length;
      const activeIndex = Math.min(
        Math.floor((audio.currentTime / audio.duration) * imageCount),
        imageCount - 1
      );

      if (activeIndex !== activeImageIndex) {
        setActiveImageIndex(activeIndex);

        // Update visibility
        const newVisibility = { ...contentVisibility };
        if (!newVisibility[currentScene]) newVisibility[currentScene] = {};
        newVisibility[currentScene][activeIndex] = true;
        setContentVisibility(newVisibility);

        // Only auto-scroll if auto-scroll is enabled and not user scrolling
        const activeImage = imageRefs.current[currentScene]?.[activeIndex];
        if (activeImage && autoScroll && !isUserScrolling) {
          activeImage.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
    };
  }, [currentScene, scenes, autoScroll, contentVisibility, isUserScrolling, activeImageIndex]);

  const togglePlay = async () => {
    if (!audioRef.current || !loadingStatus.ready) return;
  
    try {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        // Wait for audio to be completely ready before playing
        if (audioRef.current.readyState < HTMLMediaElement.HAVE_ENOUGH_DATA) {
          setAudioState(prev => ({
            ...prev,
            isLoading: true
          }));
          
          // Wait for audio to be ready
          await new Promise((resolve, reject) => {
            const onCanPlay = () => {
              audioRef.current.removeEventListener('canplay', onCanPlay);
              audioRef.current.removeEventListener('error', onError);
              resolve();
            };
            
            const onError = (err) => {
              audioRef.current.removeEventListener('canplay', onCanPlay);
              audioRef.current.removeEventListener('error', onError);
              reject(err);
            };
            
            audioRef.current.addEventListener('canplay', onCanPlay);
            audioRef.current.addEventListener('error', onError);
          });
        }
        await audioRef.current.play();
        setIsPlaying(true);
      }
    } catch (err) {
      console.error("Playback error:", err);
      setIsPlaying(false);
      setAudioState(prev => ({
        ...prev,
        error: err.message,
        isLoading: false
      }));
    }
  };

  useEffect(() => {
    if (!audioRef.current || !isAudioLoaded) return;

    if (isPlaying) {
      audioRef.current.play().catch(err => {
        console.error("Audio play failed:", err);
        setIsPlaying(false);
      });
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying, isAudioLoaded]);

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const handleProgressChange = (e) => {
    if (!audioRef.current) return;

    const newProgress = parseFloat(e.target.value);

    // Validate the progress value
    if (isNaN(newProgress)) {
      console.warn("Invalid progress value");
      return;
    }

    if (audioRef.current.duration && isFinite(audioRef.current.duration)) {
      const newTime = (audioRef.current.duration * newProgress) / 100;

      if (isFinite(newTime) && newTime >= 0) {
        audioRef.current.currentTime = newTime;
        setProgress(newProgress);
        updateActiveImage(newTime);
      }
    }
  };

  const adjustPlaybackSpeed = (e) => {
    e.preventDefault(); // Prevent context menu on right click
    const speeds = [0.5, 0.75, 1, 1.25, 1.5, 2];
    const currentIndex = speeds.indexOf(playbackSpeed);
    let newIndex;

    if (e.type === 'contextmenu' || e.button === 2) {
      newIndex = currentIndex > 0 ? currentIndex - 1 : speeds.length - 1;
    }
    else {
      newIndex = (currentIndex + 1) % speeds.length;
    }

    const newSpeed = speeds[newIndex];
    setPlaybackSpeed(newSpeed);
  };
  const handleAudioEnded = () => {
    const sceneIndex = currentScene - 1;
    const scene = scenes[sceneIndex];
    const itemIndex = activeImageIndex;

    if (!scenes || !Array.isArray(scenes) || scenes.length === 0) {
      console.warn("No scenes available");
      setIsPlaying(false);
      return;
    }

    if (!scene) {
      console.warn("Invalid scene");
      return;
    }

    try {
      if (itemIndex < scene.content.length - 1) {
        // Move to next image in current scene
        const nextIndex = itemIndex + 1;
        setActiveImageIndex(nextIndex);

        // Scroll to next image immediately
        const nextImage = imageRefs.current[scene.id]?.[nextIndex];
        if (nextImage) {
          nextImage.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      } else if (sceneIndex < scenes.length - 1) {
        // Move to next scene immediately
        const nextSceneIndex = sceneIndex + 1;
        const nextSceneId = scenes[nextSceneIndex].id;

        // Update state first
        setCurrentScene(nextSceneId);
        setActiveSceneIndex(nextSceneIndex);
        setActiveImageIndex(0);
        setProgress(0);

        // Scroll to next scene immediately (don't wait for loading)
        setTimeout(() => {
          const nextSceneFirstImage = imageRefs.current[nextSceneId]?.[0];
          if (nextSceneFirstImage) {
            nextSceneFirstImage.scrollIntoView({ behavior: 'smooth', block: 'center' });
          } else {
            // Fallback: scroll to scene container if image not available yet
            const nextSceneElement = document.querySelector(`.scene-wrapper[data-scene-id="${nextSceneId}"]`);
            if (nextSceneElement) {
              nextSceneElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
          }
        }, 0);

        // Reset loading status after scroll
        setLoadingStatus({
          audio: false,
          images: true,
          ready: false
        });

        // Load next scene's audio
        if (audioRef.current) {
          const nextScene = scenes[nextSceneIndex];
          if (nextScene && nextScene.audio) {
            audioRef.current.src = nextScene.audio;
            audioRef.current.load();
            audioRef.current.currentTime = 0;

            if (isPlaying) {
              // audioRef.current.play().catch(err => console.error("Audio play failed:", err));
            }
          }
        }
      } else {
        // End of all scenes - reset to beginning
        setCurrentScene(1);
        setActiveImageIndex(0);
        setActiveSceneIndex(0);
        setProgress(0);
        setIsPlaying(false);

        setLoadingStatus({
          audio: false,
          images: true,
          ready: false
        });

        // Scroll to top immediately
        setTimeout(() => {
          const firstSceneElement = document.querySelector('.scene-wrapper[data-scene-id="1"]');
          if (firstSceneElement) {
            firstSceneElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
          } else if (mainSceneRef.current) {
            mainSceneRef.current.scrollTo({ top: 0, behavior: 'smooth' });
          }
        }, 0);

        // Reset audio to first scene
        if (audioRef.current && scenes[0]?.audio) {
          audioRef.current.src = scenes[0].audio;
          audioRef.current.load();
          audioRef.current.currentTime = 0;
        }
      }
    } catch (err) {
      console.error("Error in handleAudioEnded:", err);
      setIsPlaying(false);
    }
  };

  const handleAudioTimeUpdate = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || !audio.duration || audio.duration <= 0) return;

    const currentTime = audio.currentTime;
    const duration = audio.duration;
    const percentage = (currentTime / duration) * 100;

    // Use requestAnimationFrame for smoother UI updates
    animationFrameRef.current = requestAnimationFrame(() => {
      setProgress(percentage);

      if (scenes.length > 0 && currentScene <= scenes.length) {
        const scene = scenes[currentScene - 1];
        if (scene?.content) {
          const totalImages = scene.content.length;
          const newActiveIndex = Math.min(
            Math.floor((currentTime / duration) * totalImages),
            totalImages - 1
          );

          if (newActiveIndex !== activeImageIndex) {
            setActiveImageIndex(newActiveIndex);
          }
        }
      }
    });
  }, [scenes, currentScene, activeImageIndex]);

  const isAudioReady = () => {
    if (!audioRef.current) return false;
    const hasMetadata = audioRef.current.readyState >= HTMLMediaElement.HAVE_METADATA;
    const hasEnoughData = audioRef.current.readyState >= HTMLMediaElement.HAVE_ENOUGH_DATA;
    const duration = audioRef.current.duration;
    const hasValidDuration = isFinite(duration) && duration > 0;
    return (hasMetadata || hasEnoughData) && hasValidDuration;
  };

  const updateActiveImage = (currentTime) => {
    if (!scenes.length || !isAudioReady()) return;

    const scene = scenes[currentScene - 1];
    if (!scene || !scene.content) return;

    const totalImages = scene.content.length;
    const audioProgress = currentTime / audioRef.current.duration;

    const newActiveIndex = Math.min(
      Math.floor(audioProgress * totalImages),
      totalImages - 1
    );

    if (newActiveIndex !== activeImageIndex) {
      setActiveImageIndex(newActiveIndex);
    }
  };

  const handleAudioError = (e) => {
    console.error("Audio error:", e.target.error);
    setIsAudioLoaded(false);
    setAudioState(prev => ({
      ...prev,
      error: `Audio error: ${e.target.error?.message || 'Unknown error'}`,
      isReady: false,
      isLoading: false
    }));
    setLoadingStatus(prev => ({
      ...prev,
      audio: false,
      ready: false
    }));
  };

  const formatTime = (seconds) => {
    if (!isFinite(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleSceneSelect = async (sceneId) => {
    if (!scenes[sceneId - 1]) return;
  
    try {
      // Pause and reset current audio first
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
  
      // Update state
      setCurrentScene(sceneId);
      setActiveSceneIndex(sceneId - 1);
      setActiveImageIndex(0);
      setProgress(0);
  
      const newScene = scenes[sceneId - 1];
  
      // Set audio source
      if (newScene.audio) {
        setAudioState({ isReady: false, isLoading: true, error: null });
        audioRef.current.src = newScene.audio;
        await audioRef.current.load();
        
        // Wait for audio to be ready
        await new Promise((resolve) => {
          const checkReady = () => {
            if (audioRef.current.readyState >= HTMLMediaElement.HAVE_ENOUGH_DATA) {
              audioRef.current.removeEventListener('canplay', checkReady);
              resolve();
            }
          };
          audioRef.current.addEventListener('canplay', checkReady);
        });
  
        // If was playing before scene change, resume playback
        if (isPlaying) {
          await audioRef.current.play();
        }
      }
  
      // Scroll to scene
      setTimeout(() => {
        const sceneElement = document.querySelector(`.scene-wrapper[data-scene-id="${sceneId}"]`);
        if (sceneElement) {
          sceneElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 0);
  
    } catch (err) {
      console.error("Scene change error:", err);
      setAudioState({ isReady: false, isLoading: false, error: err.message });
    }
  };
  const toggleAutoScroll = () => {
    const newAutoScroll = !autoScroll;
    setAutoScroll(newAutoScroll);
    setIsUserScrolling(!newAutoScroll);
  };


  // const smoothScrollTo = (position, onComplete) => {
  //   if (!mainSceneRef.current || typeof position !== 'number') {
  //     onComplete?.();
  //     return;
  //   }

  //   if (animationFrameRef.current) {
  //     cancelAnimationFrame(animationFrameRef.current);
  //     animationFrameRef.current = null;
  //   }

  //   const start = mainSceneRef.current.scrollTop;
  //   const change = position - start;
  //   const duration = 100;
  //   let startTime = null;

  //   const animateScroll = (currentTime) => {
  //     if (!startTime) startTime = currentTime;
  //     const elapsed = currentTime - startTime;
  //     const progress = Math.min(elapsed / duration, 1);
  //     const ease = easeInOutQuad(progress);

  //     mainSceneRef.current.scrollTop = start + (change * ease);

  //     if (progress < 1) {
  //       animationFrameRef.current = requestAnimationFrame(animateScroll);
  //     } else {
  //       onComplete?.();
  //     }
  //   };

  //   animationFrameRef.current = requestAnimationFrame(animateScroll);
  // };

  const renderSceneContent = () => {
    return (
      <div className="scene-image-container">
        {scenes.map((scene, sceneIndex) => (
          <div
            key={`scene-${scene.id}`}
            className={`scene-wrapper ${sceneIndex === activeSceneIndex ? 'active-scene' : ''}`}
            data-scene-id={scene.id}
            ref={el => {
              if (el) imageContainerRefs.current[`scene-${scene.id}`] = el;
            }}
          >
            {scene.content.map((item, itemIndex) => {
              if (item.type === "image") {
                const isActive = sceneIndex === activeSceneIndex && itemIndex === activeImageIndex;
                const isPast = sceneIndex < activeSceneIndex ||
                  (sceneIndex === activeSceneIndex && itemIndex < activeImageIndex);

                return (
                  <div
                    key={`${scene.id}-img-${itemIndex}`}
                    ref={el => {
                      if (!imageRefs.current[scene.id]) imageRefs.current[scene.id] = [];
                      imageRefs.current[scene.id][itemIndex] = el;
                    }}
                    className={`image-wrapper ${isActive ? 'active-image' : ''}`}
                    style={{
                      opacity: isPast || isActive ? 1 : 1,
                      transform: isPast || isActive ? 'translateY(0)' : 'translateY(30px)',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <img
                      src={item.src}
                      alt={item.alt}
                      className="scene-image"
                      onLoad={() => {
                        // Update image loading tracking when each image loads
                        const newVisibility = { ...contentVisibility };
                        if (!newVisibility[scene.id]) newVisibility[scene.id] = {};
                        newVisibility[scene.id][itemIndex] = true;
                        setContentVisibility(newVisibility);
                      }}
                    />
                  </div>
                );
              }
              return null;
            })}
          </div>
        ))}
      </div>
    );
  };

  // Calculate loading progress percentage
  const calculateLoadingProgress = () => {
    if (initialLoad) return 0;

    let progress = 0;
    if (loadingStatus.images) progress += 50;
    if (loadingStatus.audio) progress += 50;

    return progress;
  };

  if (error) {
    return (
      <div className="error-screen">
        <div className="error-content">
          <h2>Error Loading Comic</h2>
          <p>{error}</p>
          <button onClick={() => navigate(-1)} className="back-button">
            <ArrowLeft size={20} /> Go Back
          </button>
        </div>
      </div>
    );
  }

  if (isPreloading || !comic) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner"></div>
        <div className="loading-text">Loading Comic...</div>
      </div>
    );
  }

  return (
    <div className="comic-reader">
      <div className="content-container">
        <div className='comic-arrow'>
          <button className="back-button" onClick={() => navigate(-1)}>
            <ArrowLeft size={20} />
          </button>
        </div>
        <div className='comic-container'>
          <div className="title-bar">
            <p className="comic-name">{comic?.comicName}</p>
            <p className="comic-description">{comic?.description}</p>
          </div>
          <div className='main-container'>
            <div className="scene-panel">
              <div ref={mainSceneRef} className="scene-content">
                {renderSceneContent()}

                {/* Enhanced loading indicator with progress bar */}
                {(!loadingStatus.ready) && (
                  <div className="loading-state">
                    <div className="loading-spinner"></div>
                    {/* <div className="loading-text">
                      {loadingStatus.images && !loadingStatus.audio 
                        ? 'Images loaded. Loading audio...' 
                        : !loadingStatus.images 
                          ? 'Loading images...' 
                          : 'Loading...'}
                    </div> */}
                    <div className="loading-progress-container">
                      <div
                        className="loading-progress-bar"
                        style={{ width: `${calculateLoadingProgress()}%` }}
                      ></div>
                    </div>
                    {/* <div className="loading-progress-text">
                      {calculateLoadingProgress()}% Complete
                    </div> */}
                  </div>
                )}

                <div className="player-controls">
                  <button
                    onClick={togglePlay}
                    className={`control-button ${!loadingStatus.ready ? 'disabled' : ''}`}
                    disabled={!loadingStatus.ready}
                    title={!loadingStatus.ready ? 'Loading assets...' : isPlaying ? 'Pause' : 'Play'}
                  >
                    {isPlaying ? <Pause size={18} /> : <Play size={18} />}
                  </button>

                  <button
                    onClick={toggleMute}
                    className="control-button"
                  >
                    {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
                  </button>

                  <div className="auto-scroll-toggle">
                    <input
                      type="checkbox"
                      id="auto-scroll"
                      checked={autoScroll}
                      onChange={toggleAutoScroll}
                    />
                    <label htmlFor="auto-scroll">
                      {autoScroll ? 'Auto-scroll (On)' : 'Auto-scroll (Off)'}
                    </label>
                  </div>

                  <div className="progress-container">
                    <input
                      type="range"
                      min="0"
                      max={audioRef.current?.duration || 100}
                      step="0.1"
                      value={audioRef.current?.currentTime || progress}
                      onChange={handleProgressChange}
                      className="progress-slider"
                      style={{
                        backgroundSize: `${progress}% 100%`,
                        opacity: audioRef.current ? 1 : 0.7
                      }}
                    />
                    <div className="time-display">
                      {isAudioReady() ? (
                        <>
                          {formatTime(audioRef.current.currentTime)} /
                          {formatTime(audioRef.current.duration)}
                        </>
                      ) : (
                        "Buffering..."
                      )}
                    </div>
                  </div>

                  <button
                    onClick={adjustPlaybackSpeed}
                    onContextMenu={(e) => {
                      adjustPlaybackSpeed(e);
                      return false;
                    }}
                    className="playback-speed"
                  >
                    {playbackSpeed}x
                  </button>
                </div>
              </div>

              <audio
                ref={audioRef}
                preload="auto"
                src={scenes[currentScene - 1]?.audio || ''}
                autoPlay={false}
                onEnded={handleAudioEnded}
                onTimeUpdate={handleAudioTimeUpdate}
                onError={(e) => {
                  console.error("Audio error:", e);
                  setIsAudioLoaded(false);
                  setLoadingStatus(prev => ({
                    ...prev,
                    audio: false,
                    ready: false
                  }));
                }}
                onCanPlay={() => {
                  setIsAudioLoaded(true);
                  setLoadingStatus(prev => ({
                    ...prev,
                    audio: true,
                    ready: prev.images
                  }));
                }}
              />
            </div>

            {/* <div className="thumbnails-sidebar">
              <div className='thumbnails-sidebar-scroll'>
                {scenes.map((scene) => (
                  <div
                    key={scene.id}
                    className={`thumbnail-container ${currentScene === scene.id ? 'active' : ''}`}
                    onClick={() => handleSceneSelect(scene.id)}
                  >
                    <div className="thumbnail-header">
                      <span className="scene-label">{scene.title}</span>
                      <span className="scene-duration">{scene.duration.toFixed(1)}s</span>
                    </div>
                    {scene.thumbnail}
                  </div>
                ))}
              </div>
            </div> */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComicPlay;