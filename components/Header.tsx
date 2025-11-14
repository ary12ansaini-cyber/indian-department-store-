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
    <header className="bg-white shadow-md">
      <div className="max-w-screen-2xl mx-auto py-3 px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {isGeneratingLogo ? (
            <div className="w-12 h-12 flex items-center justify-center">
              <i className="fa-solid fa-spinner fa-spin text-2xl text-blue-500"></i>
            </div>
          ) : logoUrl ? (
            <img src={logoUrl} alt="Store Logo" className="w-12 h-12 rounded-md object-contain" />
          ) : (
            <i className="fa-solid fa-store text-3xl text-blue-500"></i>
          )}
          <h1 className="text-2xl font-bold text-gray-800 tracking-tight">
            Indian Department Store
          </h1>
        </div>
        <div className="flex items-center space-x-4">
          {currentUser ? (
            <div className="flex items-center space-x-4">
               <button 
                  onClick={onOpenSavedBills} 
                  className="relative text-gray-500 hover:text-blue-500 transition-colors" 
                  title="View saved bills"
                >
                <i className="fa-solid fa-folder-open text-2xl"></i>
                {savedBillsCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-blue-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center border-2 border-white">
                        {savedBillsCount}
                    </span>
                )}
              </button>
              <div className="flex items-center space-x-2">
                <button 
                  onClick={onRegenerateAvatar} 
                  className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden hover:ring-2 hover:ring-blue-500 hover:ring-offset-2 hover:ring-offset-white transition-all"
                  title="Click to regenerate avatar"
                >
                  {currentUser.isGeneratingAvatar ? (
                     <i className="fa-solid fa-spinner fa-spin text-xl text-gray-500"></i>
                  ) : currentUser.avatarUrl ? (
                    <img src={currentUser.avatarUrl} alt="User Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <i className="fa-solid fa-user text-xl text-gray-500"></i>
                  )}
                </button>
                <span className="font-medium text-gray-700 hidden sm:inline">Welcome, {currentUser.name}</span>
              </div>
              <button onClick={onLogout} className="bg-red-500 text-white font-semibold py-2 px-4 rounded-lg hover:bg-red-600 transition-colors shadow-sm">
                Logout
              </button>
            </div>
          ) : (
            <button onClick={onLoginClick} className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg transition-colors shadow-sm">
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