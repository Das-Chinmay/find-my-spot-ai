
import React, { useCallback, useState } from 'react';
import { UploadIcon } from './icons/UploadIcon';

interface ImageUploaderProps {
  onImageUpload: (file: File) => void;
  disabled: boolean;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageUpload, disabled }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onImageUpload(e.target.files[0]);
    }
  };

  const handleDragEnter = useCallback((e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onImageUpload(e.dataTransfer.files[0]);
    }
  }, [onImageUpload]);

  return (
    <div className="max-w-2xl mx-auto">
        <label
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            className={`flex justify-center w-full h-64 px-4 transition bg-gray-800 border-2 ${isDragging ? 'border-cyan-400' : 'border-gray-600'} border-dashed rounded-md appearance-none cursor-pointer hover:border-gray-500 focus:outline-none`}
        >
            <span className="flex items-center space-x-2">
                <UploadIcon className="w-12 h-12 text-gray-500" />
                <span className="font-medium text-gray-400">
                    Drop an image, or{' '}
                    <span className="text-cyan-400 underline">browse</span>
                </span>
            </span>
            <input
                type="file"
                name="file_upload"
                className="hidden"
                accept="image/png, image/jpeg, image/webp"
                onChange={handleFileChange}
                disabled={disabled}
            />
        </label>
    </div>
  );
};
