import React, { useState } from 'react';
import { CreditCard, X } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../utils/api';
import '../styles/payment-modal.css';

const PaymentModal = ({ isOpen, onClose, amount, onSuccess }) => {
  const [loading, setLoading] = useState(false);

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayment = async () => {
    setLoading(true);
    
    try {
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        toast.error('Failed to load payment gateway');
        return;
      }

      // Create order
      const orderResponse = await api.post('/payment/create-order', { amount });
      const { orderId, keyId } = orderResponse.data;

      const options = {
        key: keyId,
        amount: amount * 100,
        currency: 'INR',
        name: 'BinToBloom',
        description: 'Waste Management Service Payment',
        order_id: orderId,
        handler: async (response) => {
          try {
            await api.post('/payment/verify', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature
            });
            
            toast.success('Payment successful!');
            onSuccess();
            onClose();
          } catch (error) {
            toast.error('Payment verification failed');
          }
        },
        prefill: {
          name: 'Business User',
          email: 'business@example.com'
        },
        theme: {
          color: '#22c55e'
        }
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      toast.error('Payment failed');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h3>Payment</h3>
          <button className="modal-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>
        
        <div className="modal-body">
          <div className="payment-details">
            <h4>Payment Amount</h4>
            <div className="amount-display">
              ₹{amount}
            </div>
            <p>Secure payment powered by Razorpay</p>
          </div>
          
          <button 
            className="btn btn-primary btn-full"
            onClick={handlePayment}
            disabled={loading}
          >
            <CreditCard size={16} />
            {loading ? 'Processing...' : 'Pay Now'}
          </button>
          
          <button 
            className="btn btn-secondary btn-full"
            onClick={onClose}
            style={{ marginTop: '0.5rem' }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;