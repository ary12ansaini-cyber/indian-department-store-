import React from 'react';
import { Product } from '../types';

interface ProductGridProps {
  products: Product[];
  onAddProduct: (product: Product) => void;
}

const ProductGrid: React.FC<ProductGridProps> = ({ products, onAddProduct }) => {
  return (
    <div className="bg-gray-800 border border-gray-700 p-4 rounded-lg flex-grow overflow-y-auto" style={{maxHeight: 'calc(100vh - 210px)'}}>
      {products.length === 0 ? (
        <div className="flex items-center justify-center h-full">
            <p className="text-gray-400 text-lg">No products found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {products.map(product => (
            <div
              key={product.id}
              className={`border border-gray-700 rounded-lg flex flex-col text-center transition-shadow group bg-gray-800 overflow-hidden ${!product.isGeneratingImage ? 'hover:border-gray-500 cursor-pointer' : 'cursor-wait'}`}
              onClick={() => !product.isGeneratingImage && onAddProduct(product)}
            >
              <div className="relative h-32 bg-gray-700">
                {product.isGeneratingImage ? (
                   <div className="w-full h-full flex items-center justify-center bg-gray-700">
                     <i className="fa-solid fa-spinner fa-spin text-4xl text-gray-500" aria-label="Generating image"></i>
                   </div>
                ) : product.imageUrl ? (
                  <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <i className="fa-solid fa-tags text-4xl text-gray-600"></i>
                  </div>
                )}
                {!product.isGeneratingImage && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <span className="text-white font-bold text-lg">Add to Bill</span>
                  </div>
                )}
              </div>

              <div className="p-2 flex-grow flex flex-col justify-between">
                <div>
                  <h3 className="font-semibold text-white text-sm truncate" title={product.name}>{product.name}</h3>
                  <p className="text-xs text-gray-400">{product.category}</p>
                </div>
                <div className="mt-2">
                  <p className="text-md font-bold text-white">₹{product.price.toFixed(2)}</p>
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