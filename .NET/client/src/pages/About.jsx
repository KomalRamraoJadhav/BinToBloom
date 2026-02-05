import React from 'react';
import { Target, Eye, Heart, Users, Recycle, Award, Globe, CheckCircle, Leaf, TrendingUp, Shield, Zap } from 'lucide-react';

const About = () => {
  const teamMembers = [
    {
      name: 'Rehan Ansari',
      image: '/images/team/member1.jpg'
    },
    {
      name: 'Komal Jadhav',
      image: '/images/team/member2.jpg'
    },
    {
      name: 'Atharva Thumbare',
      image: '/images/team/member3.jpg'
    },
    {
      name: 'Mujahid Bagwan',
      image: '/images/team/member4.jpg'
    },
    {
      name: 'Aditya Korde',
      image: '/images/team/member5.jpg'
    }
  ];

  const achievements = [
    { icon: <Users />, value: '10,000+', label: 'Users Served', growth: '+25%' },
    { icon: <Recycle />, value: '50,000kg', label: 'Waste Processed', growth: '+40%' },
    { icon: <Globe />, value: '15', label: 'Cities Covered', growth: '+3 new' },
    { icon: <Award />, value: '95%', label: 'User Satisfaction', growth: '+5%' }
  ];

  const coreValues = [
    {
      icon: <Leaf />,
      title: 'Sustainability First',
      description: 'Every decision we make prioritizes environmental impact and long-term sustainability for our planet.'
    },
    {
      icon: <Users />,
      title: 'Community Driven',
      description: 'We believe in the power of collective action and building strong, engaged communities around waste management.'
    },
    {
      icon: <Shield />,
      title: 'Transparency',
      description: 'Open communication, clear processes, and honest reporting build trust with all our stakeholders.'
    },
    {
      icon: <Zap />,
      title: 'Innovation',
      description: 'We continuously evolve our technology and processes to provide the most efficient waste management solutions.'
    }
  ];

  return (
    <div className="about">
      <section className="hero about-hero">
        <div className="hero-content">
          <h1>About BinToBloom</h1>
          <p>
            Transforming waste management through technology and community engagement
          </p>

          <div className="hero-stats">
            <div className="hero-stat">
              <span className="stat-number">2023</span>
              <span className="stat-label">Founded</span>
            </div>
            <div className="hero-stat">
              <span className="stat-number">15+</span>
              <span className="stat-label">Cities</span>
            </div>
            <div className="hero-stat">
              <span className="stat-number">10K+</span>
              <span className="stat-label">Users</span>
            </div>
          </div>
        </div>
      </section>


      <section className="about-content">
        <div className="container">
          <div className="about-intro">
            <div className="intro-content">
              <h2>Our Story</h2>
              <div className="story-text">
                <p>BinToBloom was born from the recognition that traditional waste management systems needed a digital transformation. Founded in 2023, we started with a simple mission: make waste management efficient, transparent, and rewarding for everyone involved.</p>
                <p>By connecting households, businesses, collectors, and NGOs on a single platform, we're creating a comprehensive solution that addresses the growing waste management challenges in urban India while promoting environmental consciousness.</p>
              </div>
            </div>
            <div className="intro-visual">
              <div className="visual-card">
                <Recycle className="visual-icon" />
                <h4>Smart Collection</h4>
                <p>Real-time tracking & optimization</p>
              </div>
            </div>
          </div>

          <div className="mission-vision-section">
            <div className="mvv-grid">
              <div className="mvv-card mission-card">
                <div className="mvv-icon-wrapper">
                  <Target className="mvv-icon" />
                </div>
                <h3>Our Mission</h3>
                <p>To create a sustainable waste management ecosystem that rewards responsible disposal, promotes environmental consciousness, and builds cleaner communities through innovative technology solutions.</p>
              </div>
              <div className="mvv-card vision-card">
                <div className="mvv-icon-wrapper">
                  <Eye className="mvv-icon" />
                </div>
                <h3>Our Vision</h3>
                <p>A world where every piece of waste is properly managed and tracked, contributing to cleaner cities, reduced carbon footprint, and a healthier planet for future generations.</p>
              </div>
            </div>
          </div>

          <div className="values-section">
            <h2>Our Core Values</h2>
            <div className="values-grid">
              {coreValues.map((value, index) => (
                <div key={index} className="value-card">
                  <div className="value-icon-wrapper">
                    {value.icon}
                  </div>
                  <h4>{value.title}</h4>
                  <p>{value.description}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="achievements-section">
            <div className="section-header">
              <h2>Our Impact</h2>
              <p>Measurable results that drive positive environmental change</p>
            </div>
            <div className="achievements-grid">
              {achievements.map((achievement, index) => (
                <div key={index} className="achievement-card">
                  <div className="achievement-icon">{achievement.icon}</div>
                  <div className="achievement-content">
                    <h3>{achievement.value}</h3>
                    <p>{achievement.label}</p>
                    <div className="growth-indicator">
                      <TrendingUp size={14} />
                      <span>{achievement.growth}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="how-it-works-section">
            <h2>How BinToBloom Works</h2>
            <div className="process-steps">
              <div className="step">
                <span className="step-number">1</span>
                <h4>User Registration</h4>
                <p>Users register on our platform and choose their role - Household, Business, Collector, or NGO</p>
                <div className="step-features">
                  <span><CheckCircle size={14} /> Easy onboarding</span>
                  <span><CheckCircle size={14} /> Role-based access</span>
                  <span><CheckCircle size={14} /> Profile customization</span>
                </div>
              </div>
              <div className="step">
                <span className="step-number">2</span>
                <h4>Smart Scheduling</h4>
                <p>Users schedule waste pickups based on their needs with flexible timing and waste type selection</p>
                <div className="step-features">
                  <span><CheckCircle size={14} /> Flexible scheduling</span>
                  <span><CheckCircle size={14} /> Multiple waste types</span>
                  <span><CheckCircle size={14} /> Bulk pickup options</span>
                </div>
              </div>
              <div className="step">
                <span className="step-number">3</span>
                <h4>Real-time Collection</h4>
                <p>Collectors receive requests, provide live tracking, and update collection status in real-time</p>
                <div className="step-features">
                  <span><CheckCircle size={14} /> Live GPS tracking</span>
                  <span><CheckCircle size={14} /> Real-time updates</span>
                  <span><CheckCircle size={14} /> Photo verification</span>
                </div>
              </div>
              <div className="step">
                <span className="step-number">4</span>
                <h4>Impact Tracking</h4>
                <p>Users earn eco-points, track environmental impact, and NGOs monitor city-wide sustainability progress</p>
                <div className="step-features">
                  <span><CheckCircle size={14} /> Eco-points rewards</span>
                  <span><CheckCircle size={14} /> Impact analytics</span>
                  <span><CheckCircle size={14} /> Community leaderboards</span>
                </div>
              </div>
            </div>
          </div>

          <div className="team-section">
            <div className="section-header">
              <h2>Meet Our Team</h2>
              <p>Passionate experts driving innovation in waste management</p>
            </div>
            <style>
              {`
                .team-grid-5 {
                  display: grid;
                  grid-template-columns: repeat(5, 1fr);
                  gap: 20px;
                  margin-top: 40px;
                }
                .team-card-simple {
                  background: white;
                  padding: 20px;
                  border-radius: 12px;
                  box-shadow: 0 4px 6px rgba(0,0,0,0.05);
                  text-align: center;
                  transition: transform 0.3s ease;
                }
                .team-card-simple:hover {
                  transform: translateY(-5px);
                }
                .team-photo {
                  width: 120px;
                  height: 120px;
                  border-radius: 50%;
                  object-fit: cover;
                  margin: 0 auto 15px;
                  border: 3px solid #10B981;
                }
                @media (max-width: 1024px) {
                  .team-grid-5 {
                    grid-template-columns: repeat(3, 1fr);
                  }
                }
                @media (max-width: 640px) {
                  .team-grid-5 {
                    grid-template-columns: repeat(1, 1fr);
                  }
                }
              `}
            </style>
            <div className="team-grid-5">
              {teamMembers.map((member, index) => (
                <div key={index} className="team-card-simple">
                  <img 
                    src={member.image} 
                    alt={member.name} 
                    className="team-photo"
                    onError={(e) => {
                      e.target.onerror = null; 
                      e.target.src = 'https://via.placeholder.com/150?text=Team+Member'; // Fallback
                    }}
                  />
                  <div className="team-info">
                    <h4>{member.name}</h4>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="technology-section">
            <div className="section-header">
              <h2>Our Technology</h2>
              <p>Cutting-edge solutions powering sustainable waste management</p>
            </div>
            <div className="tech-features">
              <div className="tech-feature">
                <div className="tech-icon">
                  <Globe size={24} />
                </div>
                <h4>Real-time Tracking</h4>
                <p>GPS-based live location sharing and route optimization for efficient waste collection</p>
              </div>
              <div className="tech-feature">
                <div className="tech-icon">
                  <TrendingUp size={24} />
                </div>
                <h4>Smart Analytics</h4>
                <p>AI-powered insights for waste pattern analysis and predictive collection scheduling</p>
              </div>
              <div className="tech-feature">
                <div className="tech-icon">
                  <Zap size={24} />
                </div>
                <h4>Mobile-first Design</h4>
                <p>Responsive web application optimized for mobile devices and tablets</p>
              </div>
              <div className="tech-feature">
                <div className="tech-icon">
                  <Shield size={24} />
                </div>
                <h4>Secure & Scalable</h4>
                <p>Enterprise-grade security with cloud infrastructure that scales with demand</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;