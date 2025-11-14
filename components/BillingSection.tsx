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
    <div className="bg-white rounded-lg border border-gray-200 h-full flex flex-col shadow-lg">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-xl font-bold text-gray-800">Current Bill</h2>
      </div>

      <AISuggestions 
        suggestions={aiSuggestions}
        isLoading={isFetchingSuggestions}
        onAddSuggestion={onAddProduct}
      />
      
      <div className="flex-grow overflow-y-auto p-4 space-y-3" style={{maxHeight: 'calc(100vh - 400px)'}}>
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center text-gray-500">
            <i className="fa-solid fa-cart-shopping text-4xl mb-2 text-gray-300"></i>
            <p>Your bill is empty.</p>
            <p className="text-sm">Add products from the list to get started.</p>
          </div>
        ) : (
          items.map(item => (
            <div key={item.id} className="flex items-center space-x-3 bg-gray-50 p-2 rounded-md">
              <div className="flex-grow">
                <p className="font-semibold text-gray-800">{item.name}</p>
                <p className="text-sm text-gray-600">₹{item.price.toFixed(2)}</p>
              </div>
              <QuantityControl
                quantity={item.quantity}
                onDecrease={() => onUpdateQuantity(item.id, item.quantity - 1)}
                onIncrease={() => onUpdateQuantity(item.id, item.quantity + 1)}
                onQuantityChange={(newQuantity) => onUpdateQuantity(item.id, newQuantity)}
              />
              <p className="w-20 text-right font-medium text-gray-800">
                ₹{(item.price * item.quantity).toFixed(2)}
              </p>
              <button onClick={() => onRemoveItem(item.id)} className="text-gray-400 hover:text-red-500 transition">
                <i className="fa-solid fa-trash-can"></i>
              </button>
            </div>
          ))
        )}
      </div>

      <div className="p-4 border-t border-gray-200 mt-auto space-y-3">
        <button 
          onClick={onToggleInstallationFee}
          className={`w-full py-2 px-3 rounded-lg text-sm font-semibold transition-colors flex items-center justify-center border ${
              isInstallationFeeApplied 
              ? 'bg-teal-100 text-teal-800 hover:bg-teal-200 border-teal-200' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border-gray-300'
          }`}
        >
            <i className={`fa-solid ${isInstallationFeeApplied ? 'fa-toggle-on text-xl text-teal-500' : 'fa-toggle-off text-xl'} mr-3`}></i>
            {isInstallationFeeApplied ? 'Installation Fee Added' : 'Add Installation Fee'} (₹{INSTALLATION_FEE_AMOUNT.toFixed(2)})
        </button>

        <div className="space-y-2 pt-3 border-t border-gray-200">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal</span>
              <span className="font-medium">₹{subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>GST (18%)</span>
              <span className="font-medium">₹{gstAmount.toFixed(2)}</span>
            </div>
            {isInstallationFeeApplied && (
              <div className="flex justify-between text-gray-700">
                <span>Installation Fee</span>
                <span className="font-medium">₹{installationFee.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-2xl font-bold text-gray-900 border-t border-gray-300 pt-2 mt-2">
              <span>Total</span>
              <span>₹{total.toFixed(2)}</span>
            </div>
        </div>
      </div>
      
      <div className="p-4 grid grid-cols-3 gap-3 bg-gray-50 border-t border-gray-200 rounded-b-lg">
        <button 
          onClick={onClearBill}
          className="w-full bg-red-500 text-white font-semibold py-3 rounded-lg hover:bg-red-600 transition-colors shadow"
        >
          New Bill
        </button>
        <button 
          onClick={onSaveBill}
          disabled={isBillEmpty}
          className="w-full bg-gray-500 text-white font-semibold py-3 rounded-lg hover:bg-gray-600 transition-colors disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed shadow"
        >
          Save Bill
        </button>
        <button 
          onClick={() => window.print()}
          disabled={isBillEmpty}
          className="w-full bg-blue-500 text-white font-semibold py-3 rounded-lg hover:bg-blue-600 transition-colors disabled:bg-blue-300 disabled:cursor-not-allowed shadow"
        >
          Print Bill
        </button>
      </div>
    </div>
  );
};

export default BillingSection;