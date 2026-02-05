import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, Clock, MessageCircle, HelpCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { contactAPI } from '../utils/api';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    category: 'general'
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // Validation functions
  const validateName = (name) => {
    if (!name.trim()) return 'Name is required';
    if (name.trim().length < 2) return 'Name must be at least 2 characters';
    if (name.trim().length > 20) return 'Name must not exceed 20 characters';
    if (!/^[a-zA-Z\s]+$/.test(name.trim())) return 'Name can only contain letters and spaces';
    return '';
  };

  const validateEmail = (email) => {
    if (!email.trim()) return 'Email is required';
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email.trim())) return 'Please enter a valid email address (e.g., user@example.com)';
    if (!email.includes('@')) return 'Email must contain @ symbol';
    if (!email.includes('.')) return 'Email must contain a domain (e.g., .com, .org)';
    return '';
  };

  const validateSubject = (subject) => {
    if (!subject.trim()) return 'Subject is required';
    if (subject.trim().length < 5) return 'Subject must be at least 5 characters';
    if (subject.trim().length > 200) return 'Subject must not exceed 200 characters';
    return '';
  };

  const validateMessage = (message) => {
    if (!message.trim()) return 'Message is required';
    if (message.trim().length < 10) return 'Message must be at least 10 characters';
    if (message.trim().length > 1000) return 'Message must not exceed 1000 characters';
    return '';
  };

  const validateForm = () => {
    const newErrors = {
      name: validateName(formData.name),
      email: validateEmail(formData.email),
      subject: validateSubject(formData.subject),
      message: validateMessage(formData.message)
    };
    
    setErrors(newErrors);
    return !Object.values(newErrors).some(error => error !== '');
  };

  const contactMethods = [
    {
      icon: <Mail className="contact-icon" />,
      title: 'Email Support',
      info: 'support@bintobloom.com',
      description: 'Get help via email within 24 hours',
      action: 'mailto:support@bintobloom.com'
    },
    {
      icon: <Phone className="contact-icon" />,
      title: 'Phone Support',
      info: '+91 98765 43210',
      description: 'Call us Mon-Fri, 9 AM - 6 PM IST',
      action: 'tel:+919876543210'
    },
    {
      icon: <MessageCircle className="contact-icon" />,
      title: 'Live Chat',
      info: 'Available 24/7',
      description: 'Instant support for urgent queries',
      action: '#'
    },
    {
      icon: <MapPin className="contact-icon" />,
      title: 'Visit Us',
      info: '123 Green Street, Eco City',
      description: 'Mumbai, Maharashtra 400001',
      action: 'https://maps.google.com'
    }
  ];

  const faqItems = [
    {
      question: 'How do I schedule a waste pickup?',
      answer: 'Simply register on our platform, select your waste type, choose a convenient date and time, and our collectors will handle the rest.'
    },
    {
      question: 'What types of waste do you collect?',
      answer: 'We collect food waste and e-waste. Our collectors are trained to handle both residential and commercial waste safely.'
    },
    {
      question: 'How do eco-points work?',
      answer: 'You earn eco-points for every kilogram of waste you contribute. Points can be redeemed for rewards and help you climb our community leaderboard.'
    },
    {
      question: 'Is there a cost for waste collection?',
      answer: 'Household users enjoy free collection services. Business users have affordable pricing plans based on pickup frequency and volume.'
    }
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    let error = '';
    
    switch (name) {
      case 'name':
        error = validateName(value);
        break;
      case 'email':
        error = validateEmail(value);
        break;
      case 'subject':
        error = validateSubject(value);
        break;
      case 'message':
        error = validateMessage(value);
        break;
    }
    
    setErrors({
      ...errors,
      [name]: error
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form before submission
    if (!validateForm()) {
      toast.error('Please fix the validation errors before submitting.');
      return;
    }
    
    setLoading(true);

    try {
      // const response = await fetch('http://localhost:8081/api/contact/submit', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify({
      //     name: formData.name.trim(),
      //     email: formData.email.trim(),
      //     subject: formData.subject.trim(),
      //     message: formData.message.trim()
      //   })
      // });
      // Using shared API utility
      const response = await contactAPI.submit({
          name: formData.name.trim(),
          email: formData.email.trim(),
          subject: formData.subject.trim(),
          message: formData.message.trim(),
          category: formData.category
      });

      if (response.status === 200 || response.data) {
        toast.success('Message sent successfully! We\'ll get back to you within 24 hours. 🌿');
        setFormData({ name: '', email: '', subject: '', message: '', category: 'general' });
        setErrors({});
      } else {
        toast.error('Failed to send message.');
      }
    } catch (error) {
      console.error(error);
      const msg = error.response?.data?.message || 'Failed to send message. Please try again.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="contact">
      <section className="contact-hero hero">
        <div className="hero-content">
          <h1>Get in Touch</h1>
          <p>
            We're here to help you make the most of BinToBloom. Reach out for support,
            partnerships, or feedback
          </p>
        </div>
      </section>



      <section className="contact-form-section">
        <div className="container">
          <div className="contact-grid">
            <div className="contact-info">
              <h2>Send Us a Message</h2>
              <p>Have a specific question or need personalized assistance? Fill out the form and we'll get back to you promptly.</p>
              
              <div className="contact-highlights">
                <div className="highlight">
                  <Clock size={20} />
                  <div>
                    <h4>Quick Response</h4>
                    <p>We respond to all inquiries within 24 hours</p>
                  </div>
                </div>
                <div className="highlight">
                  <HelpCircle size={20} />
                  <div>
                    <h4>Expert Support</h4>
                    <p>Our team has deep expertise in waste management</p>
                  </div>
                </div>
                <div className="highlight">
                  <MessageCircle size={20} />
                  <div>
                    <h4>Personalized Help</h4>
                    <p>Tailored solutions for your specific needs</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="contact-form-container">
              <form className="contact-form" onSubmit={handleSubmit}>
                <div className="form-row">
                  <div className="form-group">
                    <label>Full Name *</label>
                    <input
                      type="text"
                      name="name"
                      placeholder="Enter your full name"
                      value={formData.name}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={errors.name ? 'error' : ''}
                      required
                    />
                    {errors.name && <span className="error-text">{errors.name}</span>}
                  </div>
                  <div className="form-group">
                    <label>Email Address *</label>
                    <input
                      type="email"
                      name="email"
                      placeholder="Enter your email"
                      value={formData.email}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={errors.email ? 'error' : ''}
                      required
                    />
                    {errors.email && <span className="error-text">{errors.email}</span>}
                  </div>
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label>Category</label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                    >
                      <option value="general">General Inquiry</option>
                      <option value="support">Technical Support</option>
                      <option value="business">Business Partnership</option>
                      <option value="feedback">Feedback</option>
                      <option value="complaint">Complaint</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Subject *</label>
                    <input
                      type="text"
                      name="subject"
                      placeholder="Brief subject line"
                      value={formData.subject}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={errors.subject ? 'error' : ''}
                      required
                    />
                    {errors.subject && <span className="error-text">{errors.subject}</span>}
                  </div>
                </div>
                
                <div className="form-group">
                  <label>Message *</label>
                  <textarea
                    name="message"
                    placeholder="Tell us how we can help you..."
                    rows="6"
                    value={formData.message}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={errors.message ? 'error' : ''}
                    required
                  ></textarea>
                  {errors.message && <span className="error-text">{errors.message}</span>}
                </div>
                
                <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
                  {loading ? (
                    'Sending Message...'
                  ) : (
                    <>
                      <Send size={16} />
                      Send Message
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      <section className="faq-section">
        <div className="container">
          <h2>Frequently Asked Questions</h2>
          <div className="faq-grid">
            {faqItems.map((faq, index) => (
              <div key={index} className="faq-item">
                <h4>{faq.question}</h4>
                <p>{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="contact-cta">
        <div className="container">
          <div className="cta-content">
            <h2>Ready to Get Started?</h2>
            <p>Join our community and start making a positive environmental impact today</p>
            <div className="cta-buttons">
              <a href="/register" className="btn btn-primary">Create Account</a>
              <a href="/about" className="btn btn-secondary">Learn More</a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;