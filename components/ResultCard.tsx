
import React from 'react';
import { MatchResult } from '../types';
import { MapPinIcon } from './icons/MapPinIcon';
import { StarIcon } from './icons/StarIcon';

interface ResultCardProps {
    result: MatchResult;
    isTopMatch: boolean;
    onGetMoreInfo: (location: MatchResult) => void;
}

const ConfidenceBar: React.FC<{ score: number }> = ({ score }) => {
    const percentage = Math.round(score * 100);
    return (
        <div className="w-full bg-gray-600 rounded-full h-2.5">
            <div 
                className="bg-gradient-to-r from-teal-400 to-cyan-500 h-2.5 rounded-full" 
                style={{ width: `${percentage}%` }}
            ></div>
        </div>
    );
};

export const ResultCard: React.FC<ResultCardProps> = ({ result, isTopMatch, onGetMoreInfo }) => {
  return (
    <div className={`bg-gray-800 rounded-lg shadow-lg overflow-hidden transition-all duration-300 ${isTopMatch ? 'border-2 border-cyan-500' : 'border-2 border-transparent'} relative`}>
        {isTopMatch && (
            <div className="absolute top-0 right-0 bg-cyan-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg flex items-center gap-1">
                <StarIcon className="w-4 h-4" />
                <span>Top Match</span>
            </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-5">
            <div className="md:col-span-2">
                <img src={result.satellite_image_url} alt={`Satellite view of ${result.region_name}`} className="w-full h-48 md:h-full object-cover" />
            </div>
            <div className="md:col-span-3 p-4 flex flex-col justify-between">
                <div>
                    <h3 className="text-xl font-bold text-white">{result.region_name}</h3>
                    <p className="text-gray-400">{result.country}</p>
                    
                    <div className="flex items-center gap-2 text-sm text-gray-400 mt-2">
                        <MapPinIcon className="w-4 h-4 text-cyan-400" />
                        <span>{result.latitude.toFixed(4)}, {result.longitude.toFixed(4)}</span>
                    </div>

                    <p className="text-gray-300 mt-3 text-sm">{result.description}</p>
                </div>

                <div className="mt-4">
                    <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-medium text-gray-300">Confidence</span>
                        <span className="text-sm font-bold text-cyan-300">{(result.similarity_score * 100).toFixed(1)}%</span>
                    </div>
                    <ConfidenceBar score={result.similarity_score} />
                     <button 
                        onClick={() => onGetMoreInfo(result)}
                        className="mt-4 w-full bg-gray-700 hover:bg-gray-600 text-cyan-300 font-semibold py-2 px-4 rounded-md transition-colors text-sm"
                    >
                        Learn More
                    </button>
                </div>
            </div>
        </div>
    </div>
  );
};
