
import React, { useState, useCallback } from 'react';
import { analyzeImage, getMoreInfo } from './services/geminiService';
import { AnalysisResult, MatchResult, GroundingChunk } from './types';
import { ImageUploader } from './components/ImageUploader';
import { ResultsDisplay } from './components/ResultsDisplay';
import { Loader } from './components/Loader';
import { WorldIcon } from './components/icons/WorldIcon';

// Define Modal component here to avoid re-rendering issues
interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    isLoading: boolean;
    title: string;
    content: string;
    sources: GroundingChunk[];
}

const InfoModal: React.FC<ModalProps> = ({ isOpen, onClose, isLoading, title, content, sources }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b border-gray-700 flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-cyan-400">{title}</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">&times;</button>
                </div>
                <div className="p-6">
                    {isLoading ? (
                        <div className="flex justify-center items-center h-48">
                            <Loader />
                        </div>
                    ) : (
                        <>
                            <p className="text-gray-300 whitespace-pre-wrap">{content}</p>
                            {sources && sources.length > 0 && (
                                <div className="mt-6">
                                    <h3 className="text-lg font-semibold text-cyan-300 mb-2">Sources:</h3>
                                    <ul className="list-disc list-inside space-y-1">
                                        {sources.map((source, index) => source.web && (
                                            <li key={index}>
                                                <a href={source.web.uri} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">
                                                    {source.web.title || source.web.uri}
                                                </a>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default function App() {
    const [uploadedImageFile, setUploadedImageFile] = useState<File | null>(null);
    const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
    const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [modalContent, setModalContent] = useState<{ title: string; content: string; sources: GroundingChunk[] } | null>(null);
    const [isModalLoading, setIsModalLoading] = useState<boolean>(false);

    const handleImageUpload = useCallback(async (file: File) => {
        setUploadedImageFile(file);
        setUploadedImageUrl(URL.createObjectURL(file));
        setAnalysisResult(null);
        setError(null);
        setIsLoading(true);

        try {
            const result = await analyzeImage(file);
            setAnalysisResult(result);
        } catch (e) {
            console.error(e);
            setError("Sorry, I couldn't analyze that image. Please try another one.");
        } finally {
            setIsLoading(false);
        }
    }, []);
    
    const handleGetMoreInfo = useCallback(async (location: MatchResult) => {
        const locationName = `${location.region_name}, ${location.country}`;
        setIsModalOpen(true);
        setIsModalLoading(true);
        setModalContent({ title: locationName, content: '', sources: [] });

        try {
            const { text, sources } = await getMoreInfo(locationName);
            setModalContent({ title: locationName, content: text, sources });
        } catch (e) {
            console.error(e);
            setModalContent({ title: locationName, content: 'Could not fetch more information.', sources: [] });
        } finally {
            setIsModalLoading(false);
        }
    }, []);

    const handleReset = () => {
        setUploadedImageFile(null);
        setUploadedImageUrl(null);
        setAnalysisResult(null);
        setError(null);
        setIsLoading(false);
    };

    return (
        <div className="min-h-screen bg-gray-900 font-sans text-gray-200 p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">
                <header className="text-center mb-8">
                    <div className="flex items-center justify-center gap-4">
                        <WorldIcon className="w-12 h-12 text-cyan-400" />
                        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-teal-500">
                            Find My Spot
                        </h1>
                    </div>
                    <p className="mt-4 text-lg text-gray-400 max-w-2xl mx-auto">
                        Upload a photo of a place, and let AI tell you where it is.
                    </p>
                </header>
                
                <main>
                    {!analysisResult && !isLoading && (
                        <ImageUploader onImageUpload={handleImageUpload} disabled={isLoading} />
                    )}

                    {isLoading && (
                        <div className="text-center p-10">
                            <Loader />
                            <p className="mt-4 text-lg text-cyan-300 animate-pulse">Analyzing your spot...</p>
                        </div>
                    )}
                    
                    {error && (
                         <div className="text-center p-10 bg-red-900/20 border border-red-500 rounded-lg max-w-md mx-auto">
                            <p className="text-red-400">{error}</p>
                            <button onClick={handleReset} className="mt-4 bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded transition-colors">
                                Try Again
                            </button>
                        </div>
                    )}
                    
                    {analysisResult && uploadedImageUrl && (
                        <ResultsDisplay
                            userImage={uploadedImageUrl}
                            analysis={analysisResult}
                            onGetMoreInfo={handleGetMoreInfo}
                            onReset={handleReset}
                        />
                    )}
                </main>

                <InfoModal 
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    isLoading={isModalLoading}
                    title={modalContent?.title || ''}
                    content={modalContent?.content || ''}
                    sources={modalContent?.sources || []}
                />
            </div>
        </div>
    );
}
