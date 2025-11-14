import React, { useState, useEffect, useRef } from 'react';
import { User } from '../types';

interface EditablePriceProps {
  price: number;
  currentUser: User | null;
  onPriceChange: (newPrice: number) => void;
}

const EditablePrice: React.FC<EditablePriceProps> = ({ price, currentUser, onPriceChange }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState(price.toString());
  const inputRef = useRef<HTMLInputElement>(null);
  const isLoggedIn = !!currentUser;

  useEffect(() => {
    if (!isEditing) {
      setInputValue(price.toFixed(2));
    } else {
      inputRef.current?.select();
    }
  }, [price, isEditing]);

  const handleCommit = () => {
    const newPrice = parseFloat(inputValue);
    // Validate: must be a number and greater than 0.
    if (!isNaN(newPrice) && newPrice > 0) {
      if (newPrice !== price) {
        onPriceChange(newPrice);
      }
    } else {
      setInputValue(price.toFixed(2));
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleCommit();
      e.preventDefault();
    } else if (e.key === 'Escape') {
      setInputValue(price.toFixed(2));
      setIsEditing(false);
    }
  };

  if (!isLoggedIn) {
    return <p className="text-md font-bold text-gray-800">₹{price.toFixed(2)}</p>;
  }

  return (
    <div className="relative group">
      {isEditing ? (
        <input
          ref={inputRef}
          type="number"
          step="0.01"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onBlur={handleCommit}
          onKeyDown={handleKeyDown}
          className="w-full text-md font-bold text-center bg-white border border-blue-500 rounded-md text-gray-800 focus:outline-none py-1 ring-1 ring-blue-500"
          autoFocus
        />
      ) : (
        <button
          onClick={() => setIsEditing(true)}
          className="w-full text-md font-bold text-gray-800 py-1 rounded-md hover:bg-gray-100 transition-colors flex items-center justify-center"
          aria-label={`Current price: ₹${price.toFixed(2)}. Click to edit.`}
        >
          ₹{price.toFixed(2)}
          <i className="fa-solid fa-pencil text-xs text-gray-400 opacity-0 group-hover:opacity-100 ml-2 transition-opacity"></i>
        </button>
      )}
    </div>
  );
};

export default EditablePrice;