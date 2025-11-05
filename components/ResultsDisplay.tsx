
import React from 'react';
import { AnalysisResult, MatchResult } from '../types';
import { ResultCard } from './ResultCard';

interface ResultsDisplayProps {
  userImage: string;
  analysis: AnalysisResult;
  onGetMoreInfo: (location: MatchResult) => void;
  onReset: () => void;
}

export const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ userImage, analysis, onGetMoreInfo, onReset }) => {
  return (
    <div className="space-y-8 animate-fade-in">
        <div className="flex justify-center">
            <button onClick={onReset} className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2 px-6 rounded-lg transition-colors text-lg">
                Analyze Another Spot
            </button>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            <div className="lg:col-span-1 space-y-4">
                <div className="bg-gray-800 p-4 rounded-lg shadow-lg">
                    <h2 className="text-2xl font-bold text-gray-200 mb-3 border-b border-gray-700 pb-2">Your Image</h2>
                    <img src={userImage} alt="User upload" className="rounded-md w-full object-cover" />
                </div>
                 <div className="bg-gray-800 p-4 rounded-lg shadow-lg">
                    <h2 className="text-2xl font-bold text-cyan-400 mb-2">AI Summary</h2>
                    <p className="text-gray-300">{analysis.summary}</p>
                </div>
            </div>
            
            <div className="lg:col-span-2 space-y-4">
                {analysis.matches.map((match, index) => (
                    <ResultCard 
                        key={`${match.latitude}-${match.longitude}`} 
                        result={match} 
                        isTopMatch={index === 0}
                        onGetMoreInfo={onGetMoreInfo}
                    />
                ))}
            </div>
        </div>
    </div>
  );
};
