import React from 'react';
import { BillItem, Product } from '../types';
import QuantityControl from './QuantityControl';
import AISuggestions from './AISuggestions';

interface BillingSectionProps {
  items: BillItem[];
  onUpdateQuantity: (productId: number, newQuantity: number) => void;
  onRemoveItem: (productId: number) => void;
  onClearBill: () => void;
  onSaveBill: () => void;
  subtotal: number;
  gstAmount: number;
  total: number;
  aiSuggestions: Product[];
  isFetchingSuggestions: boolean;
  onAddProduct: (product: Product) => void;
  isInstallationFeeApplied: boolean;
  onToggleInstallationFee: () => void;
  installationFee: number;
  INSTALLATION_FEE_AMOUNT: number;
}

const BillingSection: React.FC<BillingSectionProps> = ({
  items,
  onUpdateQuantity,
  onRemoveItem,
  onClearBill,
  onSaveBill,
  subtotal,
  gstAmount,
  total,
  aiSuggestions,
  isFetchingSuggestions,
  onAddProduct,
  isInstallationFeeApplied,
  onToggleInstallationFee,
  installationFee,
  INSTALLATION_FEE_AMOUNT,
}) => {
  const isBillEmpty = items.length === 0 && !isInstallationFeeApplied;

  return (
    <div className="bg-gray-800 rounded-lg border border-gray-700 h-full flex flex-col">
      <div className="p-4 border-b border-gray-700">
        <h2 className="text-xl font-bold text-white">Current Bill</h2>
      </div>

      <AISuggestions 
        suggestions={aiSuggestions}
        isLoading={isFetchingSuggestions}
        onAddSuggestion={onAddProduct}
      />
      
      <div className="flex-grow overflow-y-auto p-4 space-y-3" style={{maxHeight: 'calc(100vh - 400px)'}}>
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center text-gray-400">
            <i className="fa-solid fa-cart-shopping text-4xl mb-2 text-gray-600"></i>
            <p>Your bill is empty.</p>
            <p className="text-sm">Add products from the list to get started.</p>
          </div>
        ) : (
          items.map(item => (
            <div key={item.id} className="flex items-center space-x-3 bg-gray-700/50 p-2 rounded-md">
              <div className="flex-grow">
                <p className="font-semibold text-white">{item.name}</p>
                <p className="text-sm text-gray-400">₹{item.price.toFixed(2)}</p>
              </div>
              <QuantityControl
                quantity={item.quantity}
                onDecrease={() => onUpdateQuantity(item.id, item.quantity - 1)}
                onIncrease={() => onUpdateQuantity(item.id, item.quantity + 1)}
                onQuantityChange={(newQuantity) => onUpdateQuantity(item.id, newQuantity)}
              />
              <p className="w-20 text-right font-medium text-white">
                ₹{(item.price * item.quantity).toFixed(2)}
              </p>
              <button onClick={() => onRemoveItem(item.id)} className="text-red-400 hover:text-red-500 transition">
                <i className="fa-solid fa-trash-can"></i>
              </button>
            </div>
          ))
        )}
      </div>

      <div className="p-4 border-t border-gray-700 mt-auto space-y-3">
        <button 
          onClick={onToggleInstallationFee}
          className={`w-full py-2 px-3 rounded-lg text-sm font-semibold transition-colors flex items-center justify-center border ${
              isInstallationFeeApplied 
              ? 'bg-red-900/50 text-red-400 hover:bg-red-800/50 border-red-700' 
              : 'bg-gray-700 text-gray-200 hover:bg-gray-600 border-gray-600'
          }`}
        >
            <i className={`fa-solid ${isInstallationFeeApplied ? 'fa-toggle-on text-xl' : 'fa-toggle-off text-xl'} mr-3`}></i>
            {isInstallationFeeApplied ? 'Installation Fee Added' : 'Add Installation Fee'} (₹{INSTALLATION_FEE_AMOUNT.toFixed(2)})
        </button>

        <div className="space-y-2 pt-3 border-t border-gray-700">
            <div className="flex justify-between text-gray-400">
              <span>Subtotal</span>
              <span className="font-medium">₹{subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-gray-400">
              <span>GST (18%)</span>
              <span className="font-medium">₹{gstAmount.toFixed(2)}</span>
            </div>
            {isInstallationFeeApplied && (
              <div className="flex justify-between text-gray-300">
                <span>Installation Fee</span>
                <span className="font-medium">₹{installationFee.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-2xl font-bold text-white border-t border-gray-600 pt-2 mt-2">
              <span>Total</span>
              <span>₹{total.toFixed(2)}</span>
            </div>
        </div>
      </div>
      
      <div className="p-4 grid grid-cols-3 gap-3 bg-gray-800 border-t border-gray-700 rounded-b-lg">
        <button 
          onClick={onClearBill}
          className="w-full bg-red-600 text-white font-semibold py-3 rounded-lg hover:bg-red-700 transition-colors"
        >
          New Bill
        </button>
        <button 
          onClick={onSaveBill}
          disabled={isBillEmpty}
          className="w-full bg-gray-600 text-gray-100 font-semibold py-3 rounded-lg hover:bg-gray-500 transition-colors disabled:bg-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed"
        >
          Save Bill
        </button>
        <button 
          onClick={() => window.print()}
          disabled={isBillEmpty}
          className="w-full bg-white text-gray-900 font-semibold py-3 rounded-lg hover:bg-gray-200 transition-colors disabled:bg-gray-700 disabled:text-gray-400 disabled:cursor-not-allowed"
        >
          Print Bill
        </button>
      </div>
    </div>
  );
};

export default BillingSection;