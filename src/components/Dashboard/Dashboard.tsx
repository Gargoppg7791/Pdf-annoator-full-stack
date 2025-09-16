import React, { useState, useEffect } from 'react';
import { PDF } from '../../types';
import { pdfAPI } from '../../utils/api';
import PDFUpload from './PDFUpload';
import PDFList from './PDFList';
import { FileText, Upload, Library } from 'lucide-react';

const Dashboard: React.FC = () => {
  const [pdfs, setPdfs] = useState<PDF[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'library' | 'upload'>('library');

  useEffect(() => {
    loadPDFs();
  }, []);

  const loadPDFs = async () => {
    try {
      const response = await pdfAPI.list();
      setPdfs(response.data);
    } catch (error) {
      console.error('Failed to load PDFs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUploadSuccess = (newPdf: PDF) => {
    setPdfs([newPdf, ...pdfs]);
    setActiveTab('library');
  };

  const handleDelete = (pdfId: string) => {
    setPdfs(pdfs.filter(pdf => pdf.id !== pdfId));
  };

  const handleRename = (pdfId: string, newName: string) => {
    setPdfs(pdfs.map(pdf => 
      pdf.id === pdfId ? { ...pdf, originalName: newName } : pdf
    ));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <div className="flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mx-auto mb-4">
          <FileText className="w-8 h-8 text-blue-600" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">PDF Annotator</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Upload, annotate, and manage your PDF documents with powerful highlighting tools. 
          Your annotations are automatically saved and synced across sessions.
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('library')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'library'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Library className="w-4 h-4" />
                <span>My Library ({pdfs.length})</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('upload')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'upload'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Upload className="w-4 h-4" />
                <span>Upload PDF</span>
              </div>
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'library' ? (
            <PDFList 
              pdfs={pdfs} 
              onDelete={handleDelete}
              onRename={handleRename}
            />
          ) : (
            <PDFUpload onUploadSuccess={handleUploadSuccess} />
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;