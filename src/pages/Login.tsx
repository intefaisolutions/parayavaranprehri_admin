import React, { useEffect, useRef, useState } from 'react';
import { Leaf, Phone, Loader2, AlertCircle } from 'lucide-react';
import { apiFetch } from '../utils/apiConfig';
import { OtpInput } from '../components/form/OtpInput';

const RESEND_COOLDOWN_SECONDS = 45;

interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: Record<string, unknown>;
}

export const LoginView = ({ onLogin }: { onLogin: () => void }) => {
  // Mobile OTP login
  const [step, setStep] = useState<'PHONE' | 'OTP'>('PHONE');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const cooldownTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      if (cooldownTimer.current) clearInterval(cooldownTimer.current);
    };
  }, []);

  const startResendCooldown = () => {
    setResendCooldown(RESEND_COOLDOWN_SECONDS);
    if (cooldownTimer.current) clearInterval(cooldownTimer.current);
    cooldownTimer.current = setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 1) {
          if (cooldownTimer.current) clearInterval(cooldownTimer.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const persistSession = (data: AuthResponse) => {
    localStorage.setItem('accessToken', data.accessToken);
    localStorage.setItem('refreshToken', data.refreshToken);
    localStorage.setItem('user', JSON.stringify(data.user));
    onLogin();
  };

  const requestOtp = async () => {
    await apiFetch('/api/v1/auth/otp/request', {
      method: 'POST',
      body: JSON.stringify({ phone, source: 'admin' }),
    });
    startResendCooldown();
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (phone.length < 10) return;

    setLoading(true);
    setError('');

    try {
      await requestOtp();
      setOtp('');
      setStep('OTP');
    } catch (err: any) {
      setError(err.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendCooldown > 0 || loading) return;
    setLoading(true);
    setError('');
    try {
      await requestOtp();
      setOtp('');
    } catch (err: any) {
      setError(err.message || 'Failed to resend OTP');
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async (code: string) => {
    if (code.length !== 4) {
      setError('Please enter the 4-digit OTP');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const data = await apiFetch<AuthResponse>('/api/v1/auth/otp/verify', {
        method: 'POST',
        body: JSON.stringify({ phone, code, source: 'admin' }),
      });
      persistSession(data);
    } catch (err: any) {
      setError(err.message || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    await verifyOtp(otp);
  };

  // Auto-submit as soon as all 4 digits are present
  useEffect(() => {
    if (step === 'OTP' && otp.length === 4 && !loading) {
      verifyOtp(otp);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [otp, step]);

  return (
    <div className="login-shell">
      <div className="card login-card">
        <div className="login-logo">
          <div className="login-logo-badge">
            <Leaf size={32} />
          </div>
        </div>
        <h2 style={{ marginBottom: '6px' }}>Paryavaran Prahri</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '28px', fontSize: 14 }}>
          Super Admin Command Center
        </p>

        {error && (
          <div className="login-error">
            <AlertCircle size={16} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        {step === 'PHONE' ? (
          <form onSubmit={handleSendOtp}>
            <div className="login-field" style={{ marginBottom: 24 }}>
              <label>Mobile Number</label>
              <div className="login-input-wrap">
                <Phone size={18} color="var(--text-secondary)" />
                <span className="login-input-prefix">+91</span>
                <input
                  type="text"
                  placeholder="Enter 10-digit number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                  inputMode="numeric"
                  maxLength={10}
                  autoFocus
                  required
                />
              </div>
            </div>
            <button
              type="submit"
              className="btn-primary login-submit"
              disabled={loading || phone.length !== 10}
            >
              {loading ? <Loader2 size={18} className="spin" /> : 'Send OTP'}
            </button>
            <p className="login-hint">
              Mobile must already be registered as a user; OTP is sent via SMS.
            </p>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp}>
            <div className="login-field" style={{ textAlign: 'center' }}>
              <label style={{ textAlign: 'center' }}>Enter the 4-digit OTP</label>
              <OtpInput
                value={otp}
                onChange={setOtp}
                disabled={loading}
              />
              <div className="otp-meta-row">
                <span className="otp-sent-to">
                  OTP sent to +91 {phone}{' '}
                  <button
                    type="button"
                    className="link-btn"
                    onClick={() => {
                      setStep('PHONE');
                      setError('');
                    }}
                  >
                    Change
                  </button>
                </span>
                {resendCooldown > 0 ? (
                  <span className="otp-resend-disabled">Resend in {resendCooldown}s</span>
                ) : (
                  <button type="button" className="link-btn" onClick={handleResendOtp} disabled={loading}>
                    Resend OTP
                  </button>
                )}
              </div>
            </div>
            <button
              type="submit"
              className="btn-primary login-submit"
              disabled={loading || otp.length !== 4}
              style={{ marginTop: 24 }}
            >
              {loading ? <Loader2 size={18} className="spin" /> : 'Verify & Login'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

