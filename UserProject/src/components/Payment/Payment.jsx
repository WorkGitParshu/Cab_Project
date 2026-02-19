import React, { useState, useEffect } from 'react';
import './Payment.css';

const Payment = ({ booking, onPaymentComplete }) => {
  const [paymentData, setPaymentData] = useState({
    cardNumber: '',
    cardHolderName: '',
    expiryMonth: '',
    expiryYear: '',
    cvv: '',
    amount: booking?.estimatedFare || 0
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('CARD');

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 10 }, (_, i) => currentYear + i);
  const months = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0'));

  useEffect(() => {
    const amount = booking?.fare || booking?.estimatedFare;
    if (amount) {
      setPaymentData(prev => ({ ...prev, amount: amount }));
    }
  }, [booking]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === 'cardNumber') {
      // Format card number with spaces
      const formatted = value.replace(/\s/g, '').replace(/(\d{4})/g, '$1 ').trim();
      setPaymentData(prev => ({ ...prev, [name]: formatted }));
    } else if (name === 'cvv') {
      // Limit CVV to 3-4 digits
      if (value.length <= 4 && /^\d*$/.test(value)) {
        setPaymentData(prev => ({ ...prev, [name]: value }));
      }
    } else {
      setPaymentData(prev => ({ ...prev, [name]: value }));
    }
  };

  const validateForm = () => {
    if (!paymentData.cardNumber.replace(/\s/g, '').match(/^\d{16}$/)) {
      setError('Please enter a valid 16-digit card number');
      return false;
    }
    if (!paymentData.cardHolderName.trim()) {
      setError('Please enter card holder name');
      return false;
    }
    if (!paymentData.expiryMonth || !paymentData.expiryYear) {
      setError('Please select expiry date');
      return false;
    }
    if (!paymentData.cvv.match(/^\d{3,4}$/)) {
      setError('Please enter a valid CVV');
      return false;
    }
    if (paymentData.amount <= 0) {
      setError('Invalid payment amount');
      return false;
    }
    return true;
  };

  // Load Razorpay Script
  useEffect(() => {
    const loadRazorpayScript = () => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      document.body.appendChild(script);
    };
    if (!window.Razorpay) {
      loadRazorpayScript();
    }
  }, []);

  const RAZORPAY_KEY_ID = 'rzp_test_RT2cv0jcxdEeZN';

  const handleRazorpayPayment = async () => {
    setLoading(true);
    setError('');

    try {
      let orderData = null;

      // 1. Try to create order in backend
      try {
        const orderResponse = await fetch('http://localhost:8082/api/payments/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            rideId: booking.id,
            userId: booking.userId,
            amount: booking.fare || booking.estimatedFare
          })
        });

        if (orderResponse.ok) {
          orderData = await orderResponse.json();
          console.log("Order Data:", orderData);
        } else {
          console.warn("Backend payment service unavailable/error, falling back to client-side mode");
        }
      } catch (backendError) {
        console.warn("Backend unavailable:", backendError);
      }

      // 2. Open Razorpay Checkout (Client-side fallback if backend fails)
      const options = {
        key: RAZORPAY_KEY_ID,
        amount: orderData ? orderData.amount : Math.round((booking.fare || booking.estimatedFare) * 100),
        currency: orderData ? orderData.currency : "INR",
        name: "Cab Booking Service",
        description: `Payment for Ride #${booking.id}`,
        // Only include order_id if we actually got one from backend
        ...(orderData?.id && { order_id: orderData.id }),

        handler: async function (response) {
          // 3. Verify payment in backend (fire and forget if backend is down)
          try {
            await fetch('http://localhost:8082/api/payments/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature
              })
            });
          } catch (e) {
            console.warn("Verification backend unreachable, but payment succeeded on client.");
          }

          setSuccess('Payment successful! Your ride is now fully paid.');
          if (onPaymentComplete) {
            onPaymentComplete(response);
          }
          // Clear local storage ride data
          localStorage.removeItem('currentUserRide');
          localStorage.removeItem('driverAcceptedRide');
        },
        prefill: {
          name: "User " + (booking.userId || "Guest"),
          email: "user@example.com",
          contact: "9999999999"
        },
        theme: {
          color: "#000000"
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();

    } catch (err) {
      console.error("Payment Error:", err);
      setError(err.message || 'Error initiating payment');
    } finally {
      setLoading(false);
    }
  };

  if (!booking) {
    return (
      <div className="payment-container">
        <div className="payment-card">
          <h2>No Booking Selected</h2>
          <p>Please select a booking to proceed with payment.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="payment-container">
      <div className="payment-card">
        <div className="payment-header">
          <h2>Complete Payment</h2>
          <div className="booking-summary">
            <h3>Booking Summary</h3>
            <div className="summary-details">
              <div className="summary-row">
                <span>From:</span>
                <span>{typeof booking.pickupLocation === 'object' ? booking.pickupLocation.address : booking.pickupLocation}</span>
              </div>
              <div className="summary-row">
                <span>To:</span>
                <span>{typeof booking.dropLocation === 'object' ? booking.dropLocation.address : booking.dropLocation}</span>
              </div>
              <div className="summary-row">
                <span>Cab Type:</span>
                <span>{booking.cabType}</span>
              </div>
              <div className="summary-row total">
                <span>Total Amount:</span>
                <span>₹{booking.estimatedFare}</span>
              </div>
            </div>
          </div>
        </div>

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        <div className="payment-actions" style={{ marginTop: '30px' }}>
          <button
            onClick={handleRazorpayPayment}
            className="btn-pay"
            disabled={loading}
            style={{ width: '100%', fontSize: '1.2rem', padding: '15px' }}
          >
            {loading ? 'Processing...' : `Pay ₹${paymentData.amount} Now`}
          </button>

          <p style={{ textAlign: 'center', marginTop: '15px', color: '#888', fontSize: '0.9rem' }}>
            Secured by Razorpay
          </p>
        </div>
      </div>
    </div>
  );
};

export default Payment; 