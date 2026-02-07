import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { authService } from '../services/auth';

export function EmailVerification() {
  const { token } = useParams<{ token: string }>();
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [message, setMessage] = useState('');

  // Verify email when token is available
  useEffect(() => {
    const verifyEmail = async () => {
      if (!token || token.trim() === '') {
        setStatus('error');
        setMessage('No verification token found in the URL.');
        return;
      }

      try {
        console.log('Verifying email with token:', token.substring(0, 20) + '...');
        await authService.verifyEmail(token);
        setStatus('success');
        setMessage('Email verified successfully! You can now log in.');
      } catch (error) {
        console.error('Email verification error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Email verification failed';
        
        // Check if email is already verified (this is actually a success case)
        if (errorMessage.includes('already verified') || errorMessage.includes('Email already verified')) {
          setStatus('success');
          setMessage('Email already verified. You can now log in.');
        } else {
          setStatus('error');
          setMessage(errorMessage);
        }
      }
    };

    verifyEmail();
  }, [token]);

  return (
    <div style={{ maxWidth: '500px', margin: '50px auto', padding: '20px', textAlign: 'center' }}>
      {status === 'verifying' && (
        <>
          <h2>Verifying your email...</h2>
          <p>Please wait while we verify your email address.</p>
        </>
      )}
      {status === 'success' && (
        <>
          <h2 style={{ color: '#2563eb' }}>✅ Email Verified!</h2>
          <p style={{ marginTop: '20px' }}>{message}</p>
          <Link
            to="/login"
            style={{
              display: 'inline-block',
              marginTop: '20px',
              padding: '10px 20px',
              backgroundColor: '#2563eb',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '4px'
            }}
          >
            Go to Login
          </Link>
        </>
      )}
      {status === 'error' && (
        <>
          <h2 style={{ color: '#c33' }}>❌ Verification Failed</h2>
          <p style={{ marginTop: '20px' }}>{message}</p>
          <Link
            to="/login"
            style={{
              display: 'inline-block',
              marginTop: '20px',
              padding: '10px 20px',
              backgroundColor: '#2563eb',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '4px'
            }}
          >
            Go to Login
          </Link>
        </>
      )}
    </div>
  );
}

