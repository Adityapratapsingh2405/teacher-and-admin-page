import React, { useState } from 'react';
import AuthService from '../services/authService.js';
// or: import { AuthService } from '../services';

interface LoginTestProps {
  onLogin: () => void;
}

const LoginTest: React.FC<LoginTestProps> = ({ onLogin }) => {
  const [panNumber, setPanNumber] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Correct usage of AuthService
      const response = await AuthService.loginStudent({
        panNumber,
        password
      });
      
      console.log('Login successful:', response);
      onLogin();
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        value={panNumber}
        onChange={(e) => setPanNumber(e.target.value)}
        placeholder="PEN Number"
        required
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        required
      />
      {error && <div className="error">{error}</div>}
      <button type="submit" disabled={isLoading}>
        {isLoading ? 'Logging in...' : 'Login'}
      </button>
    </form>
  );
};

export default LoginTest;
