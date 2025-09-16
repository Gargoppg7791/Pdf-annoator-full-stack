import React, { useState, useCallback } from 'react';
import { PDF } from '../../types';
import { pdfAPI } from '../../utils/api';
import { Upload, FileText, CheckCircle, AlertCircle } from 'lucide-react';

interface PDFUploadProps {
  onUploadSuccess: (pdf: PDF) => void;
}

const PDFUpload: React.FC<PDFUploadProps> = ({ onUploadSuccess }) => {
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = async (file: File) => {
    if (file.type !== 'application/pdf') {
      setError('Please select a PDF file');
      return;
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      setError('File size must be less than 10MB');
      return;
    }

    setError('');
    setSuccess('');
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('pdf', file);

      const response = await pdfAPI.upload(formData);
      setSuccess('PDF uploaded successfully!');
      onUploadSuccess(response.data);
    } catch (err: any) {
      setError(err.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Upload PDF Document</h2>
        <p className="text-gray-600">
          Upload a PDF file to start annotating. Maximum file size is 10MB.
        </p>
      </div>

      <div
        className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all ${
          dragActive
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400'
        } ${uploading ? 'opacity-50 pointer-events-none' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          type="file"
          accept=".pdf"
          onChange={handleFileInput}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          disabled={uploading}
        />

        <div className="space-y-4">
          <div className="flex justify-center">
            {uploading ? (
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            ) : (
              <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-full">
                <Upload className="w-6 h-6 text-gray-600" />
              </div>
            )}
          </div>

          <div>
            <p className="text-lg font-medium text-gray-900">
              {uploading ? 'Uploading...' : 'Drop your PDF here, or click to browse'}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Supports PDF files up to 10MB
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className="flex items-center space-x-2 p-4 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {success && (
        <div className="flex items-center space-x-2 p-4 bg-green-50 border border-green-200 rounded-lg">
          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
          <p className="text-green-700">{success}</p>
        </div>
      )}

      <div className="bg-gray-50 rounded-lg p-4">
        <h3 className="font-medium text-gray-900 mb-2">What you can do:</h3>
        <ul className="space-y-1 text-sm text-gray-600">
          <li className="flex items-center space-x-2">
            <FileText className="w-4 h-4" />
            <span>Highlight text across multiple pages</span>
          </li>
          <li className="flex items-center space-x-2">
            <FileText className="w-4 h-4" />
            <span>Choose from multiple highlight colors</span>
          </li>
          <li className="flex items-center space-x-2">
            <FileText className="w-4 h-4" />
            <span>Automatically save and restore annotations</span>
          </li>
          <li className="flex items-center space-x-2">
            <FileText className="w-4 h-4" />
            <span>Zoom and navigate through documents</span>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default PDFUpload;