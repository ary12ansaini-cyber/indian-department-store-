import React from 'react';
import { Product } from '../types';

interface AISuggestionsProps {
    suggestions: Product[];
    isLoading: boolean;
    onAddSuggestion: (product: Product) => void;
}

const AISuggestions: React.FC<AISuggestionsProps> = ({ suggestions, isLoading, onAddSuggestion }) => {
    if (!isLoading && suggestions.length === 0) {
        return null;
    }

    return (
        <div className="p-4 border-b border-gray-700 bg-gray-900/50">
            <h3 className="text-sm font-semibold text-gray-300 mb-3 flex items-center">
                <i className="fa-solid fa-wand-magic-sparkles mr-2 text-white"></i>
                AI Suggestions
            </h3>
            {isLoading ? (
                <div className="flex space-x-2 animate-pulse">
                    {[...Array(3)].map((_, i) => (
                         <div key={i} className="w-1/3 h-10 bg-gray-700 rounded-md"></div>
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-3 gap-2">
                    {suggestions.map(product => (
                        <button 
                          key={product.id}
                          onClick={() => onAddSuggestion(product)}
                          className="text-left p-2 bg-gray-700 border border-gray-600 rounded-md hover:bg-gray-600 hover:border-gray-500 transition-all text-xs group"
                        >
                            <div className="flex items-center space-x-2">
                               {product.imageUrl && (
                                 <img src={product.imageUrl} alt={product.name} className="w-8 h-8 object-cover rounded"/>
                               )}
                               <div>
                                 <p className="font-semibold text-gray-200 truncate">{product.name}</p>
                                 <p className="text-gray-400">₹{product.price.toFixed(2)}</p>
                               </div>
                               <i className="fa-solid fa-plus text-white opacity-0 group-hover:opacity-100 ml-auto transition-opacity"></i>
                            </div>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export default AISuggestions;