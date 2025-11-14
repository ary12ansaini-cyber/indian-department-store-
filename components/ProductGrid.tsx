import React from 'react';
import { Product, User } from '../types';
import EditablePrice from './EditablePrice';

interface ProductGridProps {
  products: Product[];
  onAddProduct: (product: Product) => void;
  onUpdatePrice: (productId: number, newPrice: number) => void;
  onOpenImageEditor: (product: Product) => void;
  currentUser: User | null;
}

const ProductGrid: React.FC<ProductGridProps> = ({ products, onAddProduct, onUpdatePrice, onOpenImageEditor, currentUser }) => {
  return (
    <div className="bg-white border border-gray-200 p-4 rounded-lg flex-grow overflow-y-auto shadow-inner" style={{maxHeight: 'calc(100vh - 210px)'}}>
      {products.length === 0 ? (
        <div className="flex items-center justify-center h-full">
            <p className="text-gray-500 text-lg">No products found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {products.map(product => (
            <div
              key={product.id}
              className={`border border-gray-200 rounded-lg flex flex-col text-center transition-all group bg-white overflow-hidden ${!product.isGeneratingImage ? 'hover:shadow-lg hover:border-blue-400 transform hover:-translate-y-1' : ''}`}
            >
              <div
                 className="relative h-32 bg-gray-100"
              >
                {product.isGeneratingImage ? (
                   <div className="w-full h-full flex items-center justify-center bg-gray-200">
                     <i className="fa-solid fa-spinner fa-spin text-4xl text-gray-400" aria-label="Generating image"></i>
                   </div>
                ) : product.imageUrl ? (
                  <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <i className="fa-solid fa-tags text-4xl text-gray-300"></i>
                  </div>
                )}
                {!product.isGeneratingImage && (
                  <div 
                    className="absolute inset-0 bg-blue-500 bg-opacity-75 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 cursor-pointer"
                    onClick={() => onAddProduct(product)}
                  >
                    <span className="text-white font-bold text-lg">Add to Bill</span>
                  </div>
                )}
                {currentUser && !product.isGeneratingImage && product.imageUrl && (
                    <button
                        onClick={() => onOpenImageEditor(product)}
                        className="absolute top-2 right-2 bg-white bg-opacity-80 text-gray-700 hover:bg-opacity-100 hover:text-blue-500 rounded-full w-8 h-8 flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
                        title="Edit Image with AI"
                    >
                        <i className="fa-solid fa-wand-magic-sparkles"></i>
                    </button>
                )}
              </div>

              <div className="p-2 flex-grow flex flex-col justify-between">
                <div>
                  <h3 className="font-semibold text-gray-800 text-sm truncate" title={product.name}>{product.name}</h3>
                  <p className="text-xs text-gray-500">{product.category}</p>
                </div>
                <div className="mt-2">
                  <EditablePrice 
                    price={product.price}
                    currentUser={currentUser}
                    onPriceChange={(newPrice) => onUpdatePrice(product.id, newPrice)}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductGrid;