import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI } from '@google/genai';

interface VideoGeneratorModalProps {
    onClose: () => void;
}

const LOADING_MESSAGES = [
    "Warming up the AI director...",
    "Setting up the virtual scene...",
    "The digital actors are taking their places...",
    "Rendering the first few frames...",
    "Adding special effects and cinematic flair...",
    "Finalizing the masterpiece, almost there!",
];

const VideoGeneratorModal: React.FC<VideoGeneratorModalProps> = ({ onClose }) => {
    const [apiKeyReady, setApiKeyReady] = useState(false);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [prompt, setPrompt] = useState('');
    const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16'>('16:9');
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');
    const [videoUrl, setVideoUrl] = useState<string | null>(null);
    const [error, setError] = useState('');
    const pollingIntervalRef = useRef<number | null>(null);

    useEffect(() => {
        const checkApiKey = async () => {
            if (await window.aistudio.hasSelectedApiKey()) {
                setApiKeyReady(true);
            }
        };
        checkApiKey();

        return () => {
            if (pollingIntervalRef.current) {
                clearInterval(pollingIntervalRef.current);
            }
        };
    }, []);

    useEffect(() => {
        if (isLoading) {
            let messageIndex = 0;
            setLoadingMessage(LOADING_MESSAGES[messageIndex]);
            const intervalId = setInterval(() => {
                messageIndex = (messageIndex + 1) % LOADING_MESSAGES.length;
                setLoadingMessage(LOADING_MESSAGES[messageIndex]);
            }, 5000);
            return () => clearInterval(intervalId);
        }
    }, [isLoading]);

    const handleSelectKey = async () => {
        await window.aistudio.openSelectKey();
        setApiKeyReady(true);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
            setVideoUrl(null);
            setError('');
        }
    };

    const fileToBase64 = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    };

    const handleGenerate = async () => {
        if (!imageFile) {
            setError('Please upload an image first.');
            return;
        }
        setIsLoading(true);
        setError('');
        setVideoUrl(null);
        if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const base64Data = await fileToBase64(imageFile);

            let operation = await ai.models.generateVideos({
                model: 'veo-3.1-fast-generate-preview',
                prompt,
                image: {
                    imageBytes: base64Data,
                    mimeType: imageFile.type,
                },
                config: {
                    numberOfVideos: 1,
                    resolution: '720p',
                    aspectRatio,
                }
            });

            pollingIntervalRef.current = window.setInterval(async () => {
                try {
                    operation = await ai.operations.getVideosOperation({ operation: operation });
                    if (operation.done) {
                        if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);
                        setIsLoading(false);
                        const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
                        if (downloadLink) {
                            const videoResponse = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
                            const videoBlob = await videoResponse.blob();
                            setVideoUrl(URL.createObjectURL(videoBlob));
                        } else {
                            throw new Error('Video generation finished, but no download link was provided.');
                        }
                    }
                } catch (pollError: any) {
                    if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);
                    setIsLoading(false);
                    setError('An error occurred while checking video status. Please try again.');
                    console.error('Polling failed:', pollError);
                     if (pollError.message.includes("Requested entity was not found.")) {
                        setApiKeyReady(false);
                        setError("Your API key is invalid. Please select a valid key.");
                    }
                }
            }, 10000);

        } catch (err: any) {
            setIsLoading(false);
            console.error('Video generation failed:', err);
            setError('Failed to start video generation. Check console for details.');
            if (err.message.includes("Requested entity was not found.")) {
                setApiKeyReady(false);
                setError("Your API key is invalid. Please select a valid key.");
            }
        }
    };

    const renderContent = () => {
        if (!apiKeyReady) {
            return (
                <div className="text-center p-8">
                    <i className="fa-solid fa-key text-4xl text-yellow-500 mb-4"></i>
                    <h3 className="text-xl font-bold mb-2">API Key Required</h3>
                    <p className="text-gray-600 mb-4">To generate videos with Veo, you need to select an API key associated with a project that has billing enabled.</p>
                    <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline text-sm mb-6 block">Learn more about billing</a>
                    <button onClick={handleSelectKey} className="bg-blue-500 text-white font-semibold py-2 px-6 rounded-lg hover:bg-blue-600">
                        Select API Key
                    </button>
                </div>
            );
        }

        if (isLoading) {
            return (
                <div className="text-center p-8">
                    <i className="fa-solid fa-spinner fa-spin text-5xl text-blue-500 mb-6"></i>
                    <h3 className="text-2xl font-bold mb-2 text-gray-800">Animating Your Image...</h3>
                    <p className="text-gray-600 transition-opacity duration-500">{loadingMessage}</p>
                    <p className="text-sm text-gray-500 mt-4">(This can take a few minutes)</p>
                </div>
            )
        }

        if (videoUrl) {
            return (
                <div className="p-4 flex flex-col items-center">
                    <video src={videoUrl} controls autoPlay loop className={`rounded-lg shadow-lg bg-gray-900 w-full`} style={{aspectRatio: aspectRatio.replace(':', ' / ')}} />
                    <button onClick={() => { setVideoUrl(null); setImageFile(null); setImagePreview(null); }} className="mt-4 bg-blue-500 text-white font-semibold py-2 px-5 rounded-lg hover:bg-blue-600 transition-colors">
                        Create Another Video
                    </button>
                </div>
            );
        }

        return (
            <div className="p-4 grid md:grid-cols-2 gap-6">
                <div>
                    <label className="block font-semibold text-gray-700 mb-2">1. Upload an Image</label>
                    <div className="w-full h-64 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center text-center p-2 relative bg-gray-50 hover:border-blue-400 transition-colors">
                        <input type="file" accept="image/*" onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                        {imagePreview ? (
                            <img src={imagePreview} alt="Preview" className="max-h-full max-w-full object-contain rounded" />
                        ) : (
                            <div className="text-gray-500">
                                <i className="fa-solid fa-upload text-3xl mb-2"></i>
                                <p>Click to browse or drag & drop</p>
                            </div>
                        )}
                    </div>
                </div>
                <div>
                    <div className="mb-4">
                        <label htmlFor="vid-prompt" className="font-semibold text-gray-700 mb-2 block">2. Describe the Animation (Optional)</label>
                        <textarea id="vid-prompt" value={prompt} onChange={e => setPrompt(e.target.value)} placeholder="e.g., 'A gentle breeze makes the leaves rustle'" className="w-full p-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-gray-900 shadow-sm" rows={3}></textarea>
                    </div>
                    <div>
                        <label className="font-semibold text-gray-700 mb-2 block">3. Choose Aspect Ratio</label>
                        <div className="flex gap-2">
                            <button onClick={() => setAspectRatio('16:9')} className={`py-2 px-4 rounded-lg border-2 ${aspectRatio === '16:9' ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-white'}`}>16:9 (Landscape)</button>
                            <button onClick={() => setAspectRatio('9:16')} className={`py-2 px-4 rounded-lg border-2 ${aspectRatio === '9:16' ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-white'}`}>9:16 (Portrait)</button>
                        </div>
                    </div>
                    {error && <p className="text-red-500 text-sm mt-4">{error}</p>}
                </div>
            </div>
        );
    };


    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4" onClick={onClose} aria-modal="true" role="dialog">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl flex flex-col border border-gray-200" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center p-4 border-b border-gray-200">
                    <h2 className="text-xl font-bold text-gray-800 flex items-center"><i className="fa-solid fa-film mr-3 text-blue-500"></i>Animate Image with AI</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600" aria-label="Close video generator">
                        <i className="fa-solid fa-times text-xl"></i>
                    </button>
                </div>
                <div>{renderContent()}</div>
                 {apiKeyReady && !isLoading && !videoUrl && (
                    <div className="p-4 flex justify-end gap-3 bg-gray-50 border-t border-gray-200 rounded-b-lg">
                        <button onClick={onClose} className="bg-gray-200 text-gray-800 font-semibold py-2 px-4 rounded-lg hover:bg-gray-300">Cancel</button>
                        <button onClick={handleGenerate} disabled={!imageFile} className="bg-green-500 text-white font-semibold py-2 px-4 rounded-lg hover:bg-green-600 disabled:bg-green-300">
                            Generate Video
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default VideoGeneratorModal;
