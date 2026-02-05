import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Send, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import { adminAPI } from '../utils/api';

const EmailReply = () => {
  const { messageId } = useParams();
  const navigate = useNavigate();
  const [message, setMessage] = useState(null);
  const [reply, setReply] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    fetchMessage();
  }, [messageId]);

  const fetchMessage = async () => {
    try {
      const response = await adminAPI.getAllMessages();
      const foundMessage = response.data.find(m => m.messageId === parseInt(messageId));
      setMessage(foundMessage);
    } catch (error) {
      toast.error('Failed to load message');
      navigate('/admin-dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleSendReply = async (e) => {
    e.preventDefault();
    if (!reply.trim()) {
      toast.error('Please enter a reply message');
      return;
    }

    setSending(true);
    try {
      await adminAPI.replyToMessage(messageId, reply);
      toast.success('Reply sent successfully!');
      navigate('/admin-dashboard');
    } catch (error) {
      toast.error('Failed to send reply');
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading message...</div>;
  }

  if (!message) {
    return <div className="error">Message not found</div>;
  }

  return (
    <div className="email-reply-page">
      <div className="container">
        <div className="email-reply-header">
          <button 
            className="btn btn-secondary"
            onClick={() => navigate('/admin-dashboard')}
          >
            <ArrowLeft size={16} />
            Back to Dashboard
          </button>
          <h1>Reply to Message</h1>
        </div>

        <div className="email-reply-content">
          <div className="original-message">
            <h3>Original Message</h3>
            <div className="message-details">
              <div className="detail-row">
                <strong>From:</strong> {message.name} ({message.email})
              </div>
              <div className="detail-row">
                <strong>Subject:</strong> {message.subject}
              </div>
              <div className="detail-row">
                <strong>Date:</strong> {new Date(message.createdAt).toLocaleDateString()}
              </div>
            </div>
            <div className="message-body">
              <p>{message.message}</p>
            </div>
          </div>

          <form className="reply-form" onSubmit={handleSendReply}>
            <div className="form-group">
              <label>Your Reply *</label>
              <textarea
                value={reply}
                onChange={(e) => setReply(e.target.value)}
                placeholder="Type your reply here..."
                rows="10"
                className="form-control"
                required
              />
            </div>
            
            <div className="form-actions">
              <button 
                type="button" 
                className="btn btn-secondary"
                onClick={() => navigate('/admin-dashboard')}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="btn btn-primary"
                disabled={sending || !reply.trim()}
              >
                {sending ? (
                  'Sending...'
                ) : (
                  <>
                    <Send size={16} />
                    Send Reply
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EmailReply;