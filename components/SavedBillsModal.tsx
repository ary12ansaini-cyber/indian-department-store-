import React from 'react';
import { SavedBill } from '../types';

interface SavedBillsModalProps {
  bills: SavedBill[];
  onLoadBill: (billId: number) => void;
  onDeleteBill: (billId: number) => void;
  onClose: () => void;
}

const SavedBillsModal: React.FC<SavedBillsModalProps> = ({ bills, onLoadBill, onDeleteBill, onClose }) => {
    
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
    >
      <div
        className="bg-white rounded-lg shadow-xl w-full max-w-2xl flex flex-col border border-gray-200"
        style={{ maxHeight: '90vh' }}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-4 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800">Saved Bills</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600" aria-label="Close saved bills modal">
            <i className="fa-solid fa-times text-xl"></i>
          </button>
        </div>
        <div className="flex-grow overflow-y-auto p-4">
          {bills.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center text-gray-500 py-12">
              <i className="fa-solid fa-folder-open text-5xl mb-4"></i>
              <p className="text-xl">No saved bills found.</p>
              <p className="text-sm">Save a bill to see it here later.</p>
            </div>
          ) : (
            <ul className="space-y-3">
              {bills.map(bill => (
                <li key={bill.id} className="bg-gray-100 p-3 rounded-lg flex items-center justify-between flex-wrap gap-2">
                  <div className="flex-grow">
                    <p className="font-semibold text-gray-800">
                      Bill from {formatDate(bill.date)}
                    </p>
                    <p className="text-sm text-gray-600">
                      {bill.items.length} item(s)
                      {bill.isInstallationFeeApplied && (
                        <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                          + Fee
                        </span>
                      )}
                      {' - '}Total: <span className="font-bold">₹{bill.total.toFixed(2)}</span>
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => onLoadBill(bill.id)}
                      className="bg-blue-500 text-white font-semibold py-2 px-3 rounded-lg hover:bg-blue-600 transition-colors text-sm"
                    >
                      <i className="fa-solid fa-upload mr-1"></i> Load
                    </button>
                    <button
                      onClick={() => onDeleteBill(bill.id)}
                      className="bg-red-500 text-white font-semibold py-2 px-3 rounded-lg hover:bg-red-600 transition-colors text-sm"
                    >
                       <i className="fa-solid fa-trash-can mr-1"></i> Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default SavedBillsModal;