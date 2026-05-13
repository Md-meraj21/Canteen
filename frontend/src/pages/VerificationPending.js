import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import '../styles/VerificationPending.css';

function VerificationPending() {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email;

  useEffect(() => {
    const pendingEmail = localStorage.getItem('pendingRegistrationEmail');
    
    if (!email && !pendingEmail) {
      navigate('/register');
      return;
    }

    const finalEmail = email || pendingEmail;
    
    if (finalEmail) {
      localStorage.setItem('pendingRegistrationEmail', finalEmail);
    }
  }, [email, navigate]);

  const handleGoToLogin = () => {
    localStorage.removeItem('pendingRegistrationEmail');
    navigate('/login');
  };

  const handleGoHome = () => {
    localStorage.removeItem('pendingRegistrationEmail');
    navigate('/');
  };

  const finalEmail = email || localStorage.getItem('pendingRegistrationEmail');

  return (
    <div className="verification-container">
      <div className="verification-card">
        <div className="verification-icon-success"></div>
        <h1>रजसटरशन सफल | Registration Successful!</h1>
        
        <div className="verification-content">
          <div className="success-box">
            <p className="success-message">
               आपक खत सफलतपरवक बनय गय!
            </p>
            <p className="email-display">
              Email: <strong>{finalEmail}</strong>
            </p>
          </div>

          <div className="processing-section">
            <h2> परशसक सतयपन परकरय | Admin Verification Process</h2>
            
            <div className="processing-steps">
              <div className="step completed">
                <div className="step-number"></div>
                <div className="step-content">
                  <h4>खत बनय गय</h4>
                  <p>Account Created</p>
                </div>
              </div>

              <div className="step-connector"></div>

              <div className="step active">
                <div className="step-number"></div>
                <div className="step-content">
                  <h4>परशसक दवर सतयपन</h4>
                  <p>Admin Verification</p>
                </div>
              </div>

              <div className="step-connector"></div>

              <div className="step">
                <div className="step-number">3</div>
                <div className="step-content">
                  <h4>आप लगन कर सकग</h4>
                  <p>Ready to Login</p>
                </div>
              </div>
            </div>

            <div className="processing-status">
              <div className="status-bar">
                <div className="status-fill"></div>
              </div>
              <p className="status-text">परशसक आपक ID करड क समकष कर रह ह...</p>
            </div>
          </div>

          <div className="info-boxes">
            <div className="info-box">
              <h3>कय हग? | What Next?</h3>
              <ul>
                <li> आपक ID करड क फट सतयपत क जएग</li>
                <li> परशसक दवर मजर क इतजर</li>
                <li> अनमत मलन पर ईमल दवर सचत कय जएग</li>
                <li> फर आप समनय रप स लगन कर सकग</li>
              </ul>
            </div>

            <div className="time-box">
              <h3> अनमनत समय</h3>
              <p><strong>24-48 घट</strong></p>
              <p className="small-text">(Estimated Time)</p>
            </div>
          </div>

          <div className="contact-box">
            <h3> परशसक स सपरक कर</h3>
            <p>Email: <strong>seller@shopkaro.com</strong></p>
            <p>Phone: <strong>+91-9999999999</strong></p>
          </div>
        </div>

        <div className="redirect-info">
          <p className="countdown-text">
             यह page तब तक खल रहग जब तक admin आपक verify न कर
          </p>
        </div>

        <div className="button-group">
          <button className="btn-back" onClick={handleGoToLogin}>
            लगन पज पर जए | Go to Login
          </button>
          <button className="btn-home" onClick={handleGoHome}>
            हम पज | Home Page
          </button>
        </div>
      </div>
    </div>
  );
}

export default VerificationPending;
