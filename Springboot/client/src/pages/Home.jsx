import React from 'react';
import { Link } from 'react-router-dom';
import { Recycle, Users, Award, TrendingUp, CheckCircle, Leaf, Globe, Shield } from 'lucide-react';

const Home = () => {
  const stats = [
    { icon: <Users />, value: '10,000+', label: 'Active Users' },
    { icon: <Recycle />, value: '50,000kg', label: 'Waste Collected' },
    { icon: <Award />, value: '25,000', label: 'Eco Points Earned' },
    { icon: <Globe />, value: '15 Cities', label: 'Coverage Area' }
  ];

  const testimonials = [
    {
      name: 'Priya Sharma',
      role: 'Household User',
      text: 'BinToBloom has made waste disposal so convenient. I love earning eco-points for being responsible!',
      rating: 5
    },
    {
      name: 'Rajesh Kumar',
      role: 'Restaurant Owner',
      text: 'The business solution is perfect for our restaurant. Scheduled pickups and detailed reports help us stay sustainable.',
      rating: 5
    },
    {
      name: 'Green Earth NGO',
      role: 'Environmental Organization',
      text: 'The city-wide data and impact tracking features help us create better environmental campaigns.',
      rating: 5
    }
  ];

  return (
    <div className="home">
      <section className="hero">
        <div className="hero-content">
          <h1>Transform Waste into Worth</h1>
          <p>Join BinToBloom - the smart waste management system that rewards responsible disposal and creates a cleaner tomorrow for everyone.</p>
          <div className="hero-buttons">
            <Link to="/register" className="btn btn-primary">Get Started Today</Link>
            <Link to="/about" className="btn btn-secondary">Learn More</Link>
          </div>
        </div>
      </section>

      <section className="stats-section">
        <div className="container">
          <div className="stats-grid">
            {stats.map((stat, index) => (
              <div key={index} className="stat-item">
                <div className="stat-icon">{stat.icon}</div>
                <h3>{stat.value}</h3>
                <p>{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="features">
        <div className="container">
          <h2>Why Choose BinToBloom?</h2>
          <div className="features-grid">
            <div className="feature-card">
              <Recycle className="feature-icon" />
              <h3>Smart Collection</h3>
              <p>Schedule pickups for food waste and e-waste with real-time tracking and live location sharing</p>
              <ul>
                <li><CheckCircle size={16} /> Real-time tracking</li>
                <li><CheckCircle size={16} /> Flexible scheduling</li>
                <li><CheckCircle size={16} /> Multiple waste types</li>
              </ul>
            </div>
            <div className="feature-card">
              <Award className="feature-icon" />
              <h3>Earn Rewards</h3>
              <p>Get eco-points for every contribution and climb the leaderboard while making a positive impact</p>
              <ul>
                <li><CheckCircle size={16} /> Eco-points system</li>
                <li><CheckCircle size={16} /> Monthly leaderboards</li>
                <li><CheckCircle size={16} /> Achievement badges</li>
              </ul>
            </div>
            <div className="feature-card">
              <Users className="feature-icon" />
              <h3>Community Impact</h3>
              <p>Join households and businesses in creating sustainable communities with transparent impact tracking</p>
              <ul>
                <li><CheckCircle size={16} /> Community leaderboards</li>
                <li><CheckCircle size={16} /> Impact visualization</li>
                <li><CheckCircle size={16} /> Social engagement</li>
              </ul>
            </div>
            <div className="feature-card">
              <TrendingUp className="feature-icon" />
              <h3>Track Progress</h3>
              <p>Monitor your environmental impact and sustainability score with detailed analytics and reports</p>
              <ul>
                <li><CheckCircle size={16} /> Detailed analytics</li>
                <li><CheckCircle size={16} /> Carbon footprint tracking</li>
                <li><CheckCircle size={16} /> Progress reports</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="how-it-works">
        <div className="container">
          <h2>How It Works</h2>
          <div className="steps">
            <div className="step">
              <div className="step-number">1</div>
              <h3>Sign Up</h3>
              <p>Create your account and choose your user type - Household, Business, Collector, or NGO</p>
            </div>
            <div className="step">
              <div className="step-number">2</div>
              <h3>Schedule Pickup</h3>
              <p>Select waste type, choose date and time, and schedule your pickup with just a few clicks</p>
            </div>
            <div className="step">
              <div className="step-number">3</div>
              <h3>Track & Collect</h3>
              <p>Track your collector in real-time and get notified when your waste is collected</p>
            </div>
            <div className="step">
              <div className="step-number">4</div>
              <h3>Earn & Impact</h3>
              <p>Earn eco-points, track your environmental impact, and see your contribution to sustainability</p>
            </div>
          </div>
        </div>
      </section>

      <section className="testimonials">
        <div className="container">
          <h2>What Our Users Say</h2>
          <div className="testimonials-grid">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="testimonial-card">
                <div className="testimonial-content">
                  <p>"{testimonial.text}"</p>
                  <div className="rating">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <span key={i} className="star">⭐</span>
                    ))}
                  </div>
                </div>
                <div className="testimonial-author">
                  <h4>{testimonial.name}</h4>
                  <p>{testimonial.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;