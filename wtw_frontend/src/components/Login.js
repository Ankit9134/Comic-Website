import { useState } from 'react';
import axios from 'axios';
import '../styles/Login.css';
import { useNavigate } from 'react-router-dom';
import logo1 from "../Image/logo1.png";
import logo2 from "../Image/logo2.png";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

function Login() {
  //   const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({ email: '', password: '' });
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  //   const validateEmail = (email) => {
  //     const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  //     return re.test(email);
  //   };

  //   const handleEmailChange = (e) => {
  //     setEmail(e.target.value);
  //     if (errors.email) {
  //       setErrors(prev => ({ ...prev, email: '' }));
  //     }
  //   };
  const handleUsernameChange = (e) => {
    setUsername(e.target.value);
    if (errors.username) {
      setErrors(prev => ({ ...prev, username: '' }));
    }
  };
  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    if (errors.password) {
      setErrors(prev => ({ ...prev, password: '' }));
    }
  };


  // if (!email) {
  //   newErrors.email = 'Email is required';
  //   isValid = false;
  // } else if (!validateEmail(email)) {
  //   newErrors.email = 'Please enter a valid email';
  //   isValid = false;
  // }
  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = { username: '', password: '' };
    let isValid = true;

    if (!username) {
      newErrors.username = 'Username is required';
      isValid = false;
    }
    if (!password) {
      newErrors.password = 'Password is required';
      isValid = false;
    }

    setErrors(newErrors);
    if (!isValid) return;

    setIsLoading(true);

    try {
      const response = await axios.post(
        `${API_BASE_URL}/user/login`,
        { username, password },
        { headers: { 'Content-Type': 'application/json' } }
      );
      const token = response.data.data.token;
      const user = response.data.data.user;

      console.log("Token:", token);
      console.log("User:", user);
      localStorage.setItem('authToken', token);
      localStorage.setItem('userData', JSON.stringify(user));
      console.log("Stored Token:", localStorage.getItem('authToken'));
      console.log("Stored User:", localStorage.getItem('userData'));
      navigate('/dashboard');


    } catch (error) {
      console.error('Login error:', error);
      if (error.response) {
        const errorMessage = error.response.data.message || 'Login failed';
        alert(errorMessage);
      } else if (error.request) {
        alert('Network error. Please try again.');
      } else {
        alert('An unexpected error occurred.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="login-container">
      <div className="login-image-container">
        <div className="logo-badge">
          <img src={logo1} alt="Logo" className="logo-desktop2" />
          <img src={logo2} alt="Logo" className="logo-desktop3" />
        </div>
        <img
          src="assets/Image/2.jpg"
          alt="Anime characters"
          className="login-image"
        />
      </div>
      <div className="login-form-container">
        <div className="login-form-content">
          <h1 className="login-title">Login</h1>
          <p className="login-subtitle">Please login to access the admin panel.</p>

          {/* <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input 
                type="text" 
                value={email}
                onChange={handleEmailChange}
                placeholder="Enter Email" 
                className="form-input"
              />
              {errors.email && <p className="error-message">{errors.email}</p>}
            </div> */}
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Username</label>
              <input
                type="text"
                value={username}
                onChange={handleUsernameChange}
                placeholder="Enter Username"
                className="form-input"
              />
              {errors.username && <p className="error-message">{errors.username}</p>}
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <div className="password-input-container">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={handlePasswordChange}
                  placeholder="Enter Password"
                  className="form-input"
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="toggle-password-btn"
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="eye-icon" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                      <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="eye-icon" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd" />
                      <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                    </svg>
                  )}
                </button>
              </div>
              {errors.password && <p className="error-message">{errors.password}</p>}
            </div>

            <button
              type="submit"
              className="login-button"
              disabled={isLoading}
            >
              {isLoading ? 'Logging in...' : 'Login'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Login;