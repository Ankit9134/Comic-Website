import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import '../styles/banner.css';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

export default function Banner() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [carouselItems, setCarouselItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/banner/getAllBanners`);
        const data = await response.json();
        
        if (data.data && data.data.length > 0) {
          const banners = data.data[0]; 
          const formattedItems = [
            {
              id: 1,
              title: banners.banner1Title,
              description: banners.banner1Description,
              image: banners.banner1ImageURL,
              link: banners.banner1Link
            },
            {
              id: 2,
              title: banners.banner2Title,
              description: banners.banner2Description,
              image: banners.banner2ImageURL,
              link: banners.banner2Link
            },
            {
              id: 3,
              title: banners.banner3Title,
              description: banners.banner3Description,
              image: banners.banner3ImageURL,
              link: banners.banner3Link
            }
          ];
          setCarouselItems(formattedItems);
        }
      } catch (error) {
        console.error('Error fetching banners:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBanners();
  }, []);

  const goToPrevious = () => {
    setActiveIndex(activeIndex === 0 ? carouselItems.length - 1 : activeIndex - 1);
  };

  const goToNext = () => {
    setActiveIndex(activeIndex === carouselItems.length - 1 ? 0 : activeIndex + 1);
  };

  const goToSlide = (index) => {
    setActiveIndex(index);
  };

  if (loading) {
    return <div className="carousel-container">Loading banners...</div>;
  }

  if (carouselItems.length === 0) {
    return <div className="carousel-container">No banners available</div>;
  }

  return (
    <div className="carousel-container">
      <div className="carousel-inner">
        {carouselItems.map((item, index) => (
          <div
            key={item.id}
            className={`carousel-slide ${index === activeIndex ? 'active' : ''}`}
          >
            <div className="carousel-overlay"></div>
            <img src={item.image} alt={item.title} className="carousel-image" />
            <div className="carousel-content">
              <div className="carousel-text">
                <h1 className="carousel-title">{item.title}</h1>
                <p className="carousel-description">{item.description}</p>
                <a href={`${item.link}`} className="carousel-button">Watch Now</a>
              </div>
            </div>
          </div>
        ))}
      </div>

      <button className="carousel-nav left" onClick={goToPrevious}>
        <ChevronLeft size={24} />
      </button>
      
      <button className="carousel-nav right" onClick={goToNext}>
        <ChevronRight size={24} />
      </button>

      <div className="carousel-indicators">
        {carouselItems.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`carousel-indicator ${index === activeIndex ? 'active' : ''}`}
            aria-label={`Go to slide ${index + 1}`}
          ></button>
        ))}
      </div>
    </div>
  );
}
