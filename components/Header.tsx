import React from 'react';
import { User } from '../types';

interface HeaderProps {
  currentUser: User | null;
  onLoginClick: () => void;
  onLogout: () => void;
  onRegenerateAvatar: () => void;
  onOpenSavedBills: () => void;
  savedBillsCount: number;
  logoUrl: string | null;
  isGeneratingLogo: boolean;
}

const Header: React.FC<HeaderProps> = ({ 
  currentUser, 
  onLoginClick, 
  onLogout, 
  onRegenerateAvatar, 
  onOpenSavedBills, 
  savedBillsCount,
  logoUrl,
  isGeneratingLogo 
}) => {
  return (
    <header className="bg-gray-800 border-b border-gray-700">
      <div className="max-w-screen-2xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {isGeneratingLogo ? (
            <div className="w-10 h-10 flex items-center justify-center">
              <i className="fa-solid fa-spinner fa-spin text-2xl text-white"></i>
            </div>
          ) : logoUrl ? (
            <img src={logoUrl} alt="Store Logo" className="w-10 h-10 rounded-md object-cover" />
          ) : (
            <i className="fa-solid fa-store text-3xl text-white"></i>
          )}
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Indian Department Store
          </h1>
        </div>
        <div className="flex items-center space-x-4">
          {currentUser ? (
            <div className="flex items-center space-x-4">
               <button 
                  onClick={onOpenSavedBills} 
                  className="relative text-gray-400 hover:text-white transition-colors" 
                  title="View saved bills"
                >
                <i className="fa-solid fa-folder-open text-2xl"></i>
                {savedBillsCount > 0 && (
                    <span className="absolute -top-1 -right-2 bg-white text-gray-900 text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center border-2 border-gray-800">
                        {savedBillsCount}
                    </span>
                )}
              </button>
              <div className="flex items-center space-x-2">
                <button 
                  onClick={onRegenerateAvatar} 
                  className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center overflow-hidden hover:ring-2 hover:ring-white hover:ring-offset-2 hover:ring-offset-gray-800 transition-all"
                  title="Click to regenerate avatar"
                >
                  {currentUser.isGeneratingAvatar ? (
                     <i className="fa-solid fa-spinner fa-spin text-xl text-gray-400"></i>
                  ) : currentUser.avatarUrl ? (
                    <img src={currentUser.avatarUrl} alt="User Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <i className="fa-solid fa-user text-xl text-gray-400"></i>
                  )}
                </button>
                <span className="font-medium text-gray-300 hidden sm:inline">Welcome, {currentUser.name}</span>
              </div>
              <button onClick={onLogout} className="bg-transparent border border-red-500 text-red-400 font-semibold py-2 px-4 rounded-lg hover:bg-red-500 hover:text-white transition-colors">
                Logout
              </button>
            </div>
          ) : (
            <button onClick={onLoginClick} className="bg-white hover:bg-gray-200 text-gray-900 font-bold py-2 px-4 rounded-lg transition-colors">
              <i className="fa-solid fa-right-to-bracket mr-2"></i>
              Cashier Login
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;