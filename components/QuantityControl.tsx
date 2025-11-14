import React, { useState, useEffect, useRef } from 'react';

interface QuantityControlProps {
  quantity: number;
  onIncrease: () => void;
  onDecrease: () => void;
  onQuantityChange: (newQuantity: number) => void;
}

const QuantityControl: React.FC<QuantityControlProps> = ({ quantity, onIncrease, onDecrease, onQuantityChange }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState(quantity.toString());
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isEditing) {
      setInputValue(quantity.toString());
    } else {
      inputRef.current?.select();
    }
  }, [quantity, isEditing]);

  const handleCommit = () => {
    const newQuantity = parseInt(inputValue, 10);
    // Validate: must be a number and greater than 0.
    if (!isNaN(newQuantity) && newQuantity > 0) {
      // Only call update if the quantity has actually changed.
      if (newQuantity !== quantity) {
        onQuantityChange(newQuantity);
      }
    } else {
      // If input is invalid (not a number, or <= 0), reset to the previous valid quantity.
      setInputValue(quantity.toString());
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleCommit();
      e.preventDefault(); 
    } else if (e.key === 'Escape') {
      setInputValue(quantity.toString());
      setIsEditing(false);
    }
  };

  return (
    <div className="flex items-center">
      <button 
        onClick={onDecrease} 
        className="w-7 h-7 bg-gray-200 rounded-l-md text-gray-600 hover:bg-gray-300 transition-colors"
        aria-label="Decrease quantity"
      >
        <i className="fa-solid fa-minus text-xs"></i>
      </button>
      {isEditing ? (
        <input
          ref={inputRef}
          type="number"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onBlur={handleCommit}
          onKeyDown={handleKeyDown}
          className="w-10 h-7 text-center font-semibold bg-white border-y border-blue-500 text-gray-800 focus:outline-none ring-1 ring-blue-500"
          autoFocus
        />
      ) : (
        <button 
          onClick={() => setIsEditing(true)}
          className="w-10 h-7 text-center font-semibold bg-white border-t border-b border-gray-200 text-gray-800 flex items-center justify-center cursor-text"
          aria-label={`Current quantity: ${quantity}. Click to edit.`}
        >
          {quantity}
        </button>
      )}
      <button 
        onClick={onIncrease} 
        className="w-7 h-7 bg-gray-200 rounded-r-md text-gray-600 hover:bg-gray-300 transition-colors"
        aria-label="Increase quantity"
      >
        <i className="fa-solid fa-plus text-xs"></i>
      </button>
    </div>
  );
};

export default QuantityControl;