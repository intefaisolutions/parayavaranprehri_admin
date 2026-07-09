import React, { useState } from 'react';
import { Leaf, Phone, Loader2 } from 'lucide-react';
import { getApiUrl } from '../utils/apiConfig';

export const LoginView = ({ onLogin }: { onLogin: () => void }) => {
  const [step, setStep] = useState<'PHONE' | 'OTP'>('PHONE');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (phone.length < 10) return;
    
    setLoading(true);
    setError('');
    
    try {
      const res = await fetch(getApiUrl('/api/v1/auth/otp/request'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to send OTP');
      
      setStep('OTP');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) {
      setError('Please enter a valid 6-digit OTP');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const res = await fetch(getApiUrl('/api/v1/auth/otp/verify'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, code: otp }),
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Invalid OTP');
      
      // Store token securely
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      onLogin(); // Proceed to dashboard
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      height: '100vh',
      width: '100vw',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--bg-color)'
    }}>
      <div className="card" style={{ width: '400px', padding: '40px', textAlign: 'center' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px', color: 'var(--accent-color)' }}>
          <Leaf size={48} />
        </div>
        <h2 style={{ marginBottom: '8px' }}>Paryavaran Prahri</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>Super Admin Command Center</p>
        
        {error && (
          <div style={{ background: 'rgba(255, 61, 0, 0.1)', color: '#ff3d00', padding: '12px', borderRadius: '8px', marginBottom: '16px', fontSize: '14px' }}>
            {error}
          </div>
        )}

        {step === 'PHONE' ? (
          <form onSubmit={handleSendOtp}>
            <div style={{ textAlign: 'left', marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)' }}>Mobile Number</label>
              <div className="search-bar" style={{ width: '100%', borderRadius: '8px', padding: '12px' }}>
                <Phone size={18} color="var(--text-secondary)" />
                <input 
                  type="text" 
                  placeholder="Enter 10-digit number" 
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  maxLength={10}
                  required
                />
              </div>
            </div>
            <button type="submit" className="btn-primary" disabled={loading} style={{ width: '100%', justifyContent: 'center', padding: '12px', opacity: loading ? 0.7 : 1 }}>
              {loading ? <Loader2 size={18} className="spin" /> : 'Send OTP'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp}>
            <div style={{ textAlign: 'left', marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)' }}>Enter OTP</label>
              <input 
                type="text" 
                className="search-bar" 
                style={{ width: '100%', borderRadius: '8px', padding: '12px', textAlign: 'center', letterSpacing: '4px', fontSize: '18px' }}
                placeholder="000000" 
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                maxLength={6}
                required
              />
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '8px', textAlign: 'right' }}>
                OTP sent to +91 {phone} <a href="#" onClick={() => setStep('PHONE')} style={{ color: 'var(--accent-color)' }}>(Change)</a>
              </p>
            </div>
            <button type="submit" className="btn-primary" disabled={loading} style={{ width: '100%', justifyContent: 'center', padding: '12px', opacity: loading ? 0.7 : 1 }}>
              {loading ? <Loader2 size={18} className="spin" /> : 'Verify & Login'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
