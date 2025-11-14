import React, { useState } from 'react';
import { Product } from '../types';
import { GoogleGenAI, Modality } from '@google/genai';

interface ImageEditorModalProps {
  product: Product;
  onClose: () => void;
  onSaveImage: (productId: number, newImageUrl: string) => void;
}

const ImageEditorModal: React.FC<ImageEditorModalProps> = ({ product, onClose, onSaveImage }) => {
  const [prompt, setPrompt] = useState('');
  const [editedImageUrl, setEditedImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  const handleEditImage = async () => {
    if (!prompt.trim() || !product.imageUrl) return;
    setIsLoading(true);
    setError('');
    setEditedImageUrl(null);

    try {
      // Fetch the original image, as we need its raw data
      const imageResponse = await fetch(product.imageUrl);
      if (!imageResponse.ok) throw new Error('Failed to fetch original image.');
      const imageBlob = await imageResponse.blob();
      const base64Data = await blobToBase64(imageBlob);
      
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [
            { inlineData: { data: base64Data, mimeType: imageBlob.type } },
            { text: prompt },
          ],
        },
        config: {
          responseModalities: [Modality.IMAGE],
        },
      });

      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          const base64ImageBytes: string = part.inlineData.data;
          const imageUrl = `data:image/png;base64,${base64ImageBytes}`;
          setEditedImageUrl(imageUrl);
          break;
        }
      }
    } catch (err) {
      console.error('Image editing failed:', err);
      setError('Sorry, the image could not be edited. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = () => {
    if (editedImageUrl) {
      onSaveImage(product.id, editedImageUrl);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4" onClick={onClose} aria-modal="true" role="dialog">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl flex flex-col border border-gray-200" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center p-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-800">Edit Image: {product.name}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600" aria-label="Close image editor">
            <i className="fa-solid fa-times text-xl"></i>
          </button>
        </div>
        <div className="p-4 flex flex-col md:flex-row gap-4">
          <div className="md:w-1/2 relative flex items-center justify-center bg-gray-100 rounded-md overflow-hidden min-h-64">
             <img src={editedImageUrl || product.imageUrl} alt={product.name} className="max-h-full max-w-full object-contain" />
             {isLoading && (
                <div className="absolute inset-0 bg-white bg-opacity-80 flex flex-col items-center justify-center text-center p-4">
                    <i className="fa-solid fa-spinner fa-spin text-4xl text-blue-500 mb-4"></i>
                    <p className="font-semibold text-gray-700">Editing image...</p>
                </div>
             )}
          </div>
          <div className="md:w-1/2 flex flex-col">
            <label htmlFor="edit-prompt" className="font-semibold text-gray-700 mb-2">Editing Prompt</label>
            <textarea
              id="edit-prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g., 'Add a retro filter' or 'Make the background blue'"
              className="w-full p-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-gray-900 shadow-sm flex-grow"
              rows={4}
            />
            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
            <button
              onClick={handleEditImage}
              disabled={isLoading || !prompt.trim()}
              className="w-full mt-4 bg-blue-500 text-white font-semibold py-3 rounded-lg hover:bg-blue-600 transition-colors disabled:bg-blue-300 disabled:cursor-not-allowed shadow"
            >
              {isLoading ? 'Generating...' : 'Generate Edit'}
            </button>
          </div>
        </div>
        <div className="p-4 flex justify-end gap-3 bg-gray-50 border-t border-gray-200 rounded-b-lg">
          <button onClick={onClose} className="bg-gray-200 text-gray-800 font-semibold py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors">Cancel</button>
          <button
            onClick={handleSave}
            disabled={!editedImageUrl || isLoading}
            className="bg-green-500 text-white font-semibold py-2 px-4 rounded-lg hover:bg-green-600 transition-colors disabled:bg-green-300 disabled:cursor-not-allowed"
          >
            Save Image
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImageEditorModal;
