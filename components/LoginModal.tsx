import React, { useState } from 'react';

interface LoginModalProps {
  onLogin: (username: string) => void;
  onClose: () => void;
}

const LoginModal: React.FC<LoginModalProps> = ({ onLogin, onClose }) => {
  const [username, setUsername] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim()) {
      onLogin(username.trim());
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center p-4" 
      onClick={onClose}
      aria-modal="true"
      role="dialog"
    >
      <div 
        className="bg-gray-800 rounded-lg shadow-xl p-8 w-full max-w-sm border border-gray-700" 
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">Cashier Login</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white" aria-label="Close login modal">
            <i className="fa-solid fa-times text-xl"></i>
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="username" className="block text-gray-300 font-medium mb-2">Username</label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-white focus:outline-none text-white"
              placeholder="Enter your name"
              required
              autoFocus
            />
          </div>
          <div className="mb-6">
            <label htmlFor="password" className="block text-gray-300 font-medium mb-2">Password</label>
            <input
              id="password"
              type="password"
              className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-white focus:outline-none text-white"
              placeholder="••••••••"
            />
             <p className="text-xs text-gray-400 mt-1">For demo purposes, any password will work.</p>
          </div>
          <button
            type="submit"
            className="w-full bg-white text-gray-900 font-semibold py-3 rounded-lg hover:bg-gray-200 transition-colors disabled:bg-gray-600 disabled:text-gray-400"
            disabled={!username.trim()}
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginModal;