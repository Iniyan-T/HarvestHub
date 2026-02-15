import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './LandingPage.css';

const LandingPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleGetStarted = () => {
    navigate('/register');
  };

  return (
    <div className="landing-page">
      {/* Navbar */}
      <nav className="navbar">
        <div className="nav-container">
          <h1 className="logo">🌾 HarvestHub</h1>
          <div className="nav-links">
            {user ? (
              <>
                <span className="welcome-text">Welcome, {user.name}</span>
                <button onClick={() => navigate('/dashboard')} className="btn btn-primary">
                  Dashboard
                </button>
              </>
            ) : (
              <>
                <button onClick={() => navigate('/login')} className="btn btn-outline">
                  Login
                </button>
                <button onClick={() => navigate('/register')} className="btn btn-primary">
                  Sign Up
                </button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <h1 className="hero-title">Smart Agricultural Marketplace</h1>
          <p className="hero-subtitle">
            Connecting Farmers & Buyers with AI-Powered Quality Grading
          </p>
          <button onClick={handleGetStarted} className="btn btn-hero">
            Get Started →
          </button>
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <h2 className="section-title">Platform Features</h2>
        
        <div className="features-grid">
          {/* AI Crop Grading */}
          <div className="feature-card">
            <div className="feature-icon">🤖</div>
            <h3>AI Crop Grading</h3>
            <p>
              Advanced YOLOv5-powered automatic quality assessment. Upload your crop images
              and get instant Grade A/B/C classification with confidence scores and detailed
              quality analysis.
            </p>
          </div>

          {/* Smart Storage Monitoring */}
          <div className="feature-card">
            <div className="feature-icon">📊</div>
            <h3>Smart Storage Monitoring</h3>
            <p>
              Real-time ESP32 IoT monitoring for temperature, humidity, and storage conditions.
              Get instant alerts when conditions deviate from optimal ranges to prevent crop
              spoilage.
            </p>
          </div>

          {/* Direct Marketplace */}
          <div className="feature-card">
            <div className="feature-icon">💼</div>
            <h3>Direct Marketplace</h3>
            <p>
              Connect farmers directly with verified buyers. Eliminate middlemen, negotiate fair
              prices, and conduct secure transactions with built-in payment protection.
            </p>
          </div>

          {/* Quality Assurance */}
          <div className="feature-card">
            <div className="feature-icon">✅</div>
            <h3>Quality Assurance</h3>
            <p>
              Every crop listing comes with AI-verified quality grades. Buyers can search and
              filter by grade, location, price, and quantity to find exactly what they need.
            </p>
          </div>

          {/* Real-time Messaging */}
          <div className="feature-card">
            <div className="feature-icon">💬</div>
            <h3>Real-time Messaging</h3>
            <p>
              Communicate directly with buyers or farmers through our integrated messaging system.
              Discuss requirements, negotiate deals, and coordinate logistics seamlessly.
            </p>
          </div>

          {/* Analytics Dashboard */}
          <div className="feature-card">
            <div className="feature-icon">📈</div>
            <h3>Analytics Dashboard</h3>
            <p>
              Track crop performance, sales trends, pricing analytics, and market insights.
              Make data-driven decisions to optimize your agricultural business.
            </p>
          </div>

          {/* Bulk Ordering */}
          <div className="feature-card">
            <div className="feature-icon">📦</div>
            <h3>Bulk Ordering</h3>
            <p>
              Buyers can place bulk orders directly from multiple farmers. Manage procurement,
              track deliveries, and maintain inventory with integrated order management tools.
            </p>
          </div>

          {/* Secure Transactions */}
          <div className="feature-card">
            <div className="feature-icon">🔒</div>
            <h3>Secure Transactions</h3>
            <p>
              Protected payment system with escrow support. Funds are released only after
              successful delivery confirmation, ensuring trust and security for both parties.
            </p>
          </div>

          {/* Mobile Responsive */}
          <div className="feature-card">
            <div className="feature-icon">📱</div>
            <h3>Mobile Responsive</h3>
            <p>
              Access HarvestHub from any device - desktop, tablet, or mobile. Manage your
              agricultural business on the go with our fully responsive web application.
            </p>
          </div>
        </div>
      </section>

      {/* Role-specific Benefits */}
      <section className="benefits">
        <h2 className="section-title">Benefits by Role</h2>
        
        <div className="benefits-grid">
          <div className="benefit-card farmer-benefits">
            <h3>🌾 For Farmers</h3>
            <ul>
              <li>✓ Instant AI-powered crop quality grading</li>
              <li>✓ Direct access to verified buyers nationwide</li>
              <li>✓ Real-time storage monitoring with alerts</li>
              <li>✓ Fair pricing without middlemen</li>
              <li>✓ Track sales and crop performance analytics</li>
              <li>✓ Unique farmer ID for verified transactions</li>
            </ul>
          </div>

          <div className="benefit-card buyer-benefits">
            <h3>🛒 For Buyers</h3>
            <ul>
              <li>✓ Quality-assured crops with AI verification</li>
              <li>✓ Search and filter by grade, location, price</li>
              <li>✓ Direct negotiation with farmers</li>
              <li>✓ Bulk ordering and procurement management</li>
              <li>✓ Real-time inventory updates</li>
              <li>✓ Unique buyer ID for secure transactions</li>
            </ul>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta">
        <h2>Ready to Transform Your Agricultural Business?</h2>
        <p>Join thousands of farmers and buyers on HarvestHub today</p>
        <button onClick={handleGetStarted} className="btn btn-cta">
          Get Started Now →
        </button>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          <div className="footer-section">
            <h4>HarvestHub</h4>
            <p>Smart Agricultural Marketplace</p>
          </div>
          <div className="footer-section">
            <h4>Platform</h4>
            <p>AI Crop Grading</p>
            <p>IoT Monitoring</p>
            <p>Secure Marketplace</p>
          </div>
          <div className="footer-section">
            <h4>Support</h4>
            <p>Help Center</p>
            <p>Contact Us</p>
            <p>FAQs</p>
          </div>
          <div className="footer-section">
            <h4>Legal</h4>
            <p>Privacy Policy</p>
            <p>Terms of Service</p>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2026 HarvestHub. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
