import React, { useState } from 'react';
import { PDF } from '../../types';
import { pdfAPI } from '../../utils/api';
import { FileText, Calendar, Trash2, Edit3, Eye, MoreVertical } from 'lucide-react';

interface PDFListProps {
  pdfs: PDF[];
  onDelete: (pdfId: string) => void;
  onRename: (pdfId: string, newName: string) => void;
}

const PDFList: React.FC<PDFListProps> = ({ pdfs, onDelete, onRename }) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  const handleDelete = async (pdf: PDF) => {
    if (window.confirm(`Are you sure you want to delete "${pdf.originalName}"?`)) {
      try {
        await pdfAPI.delete(pdf.id);
        onDelete(pdf.id);
      } catch (error) {
        console.error('Failed to delete PDF:', error);
      }
    }
  };

  const handleRename = async (pdf: PDF) => {
    if (editName.trim() && editName !== pdf.originalName) {
      try {
        await pdfAPI.rename(pdf.id, editName.trim());
        onRename(pdf.id, editName.trim());
      } catch (error) {
        console.error('Failed to rename PDF:', error);
      }
    }
    setEditingId(null);
    setEditName('');
  };

  const startEdit = (pdf: PDF) => {
    setEditingId(pdf.id);
    setEditName(pdf.originalName);
    setActiveMenu(null);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (pdfs.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mx-auto mb-4">
          <FileText className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No PDFs uploaded yet</h3>
        <p className="text-gray-500 mb-6">
          Upload your first PDF document to start annotating
        </p>
        <button
          onClick={() => {/* Switch to upload tab */}}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <FileText className="w-4 h-4 mr-2" />
          Upload PDF
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">Your PDF Library</h2>
        <p className="text-sm text-gray-500">{pdfs.length} document{pdfs.length !== 1 ? 's' : ''}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {pdfs.map((pdf) => (
          <div
            key={pdf.id}
            className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center space-x-3 flex-1 min-w-0">
                <div className="flex items-center justify-center w-10 h-10 bg-red-100 rounded-lg flex-shrink-0">
                  <FileText className="w-5 h-5 text-red-600" />
                </div>
                <div className="flex-1 min-w-0">
                  {editingId === pdf.id ? (
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      onBlur={() => handleRename(pdf)}
                      onKeyPress={(e) => e.key === 'Enter' && handleRename(pdf)}
                      className="w-full px-2 py-1 text-sm font-medium border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      autoFocus
                    />
                  ) : (
                    <h3 className="font-medium text-gray-900 truncate">
                      {pdf.originalName}
                    </h3>
                  )}
                </div>
              </div>
              
              <div className="relative">
                <button
                  onClick={() => setActiveMenu(activeMenu === pdf.id ? null : pdf.id)}
                  className="p-1 text-gray-400 hover:text-gray-600 rounded"
                >
                  <MoreVertical className="w-4 h-4" />
                </button>
                
                {activeMenu === pdf.id && (
                  <div className="absolute right-0 top-8 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                    <button
                      onClick={() => window.open(`/pdf/${pdf.id}`, '_blank')}
                      className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
                    >
                      <Eye className="w-4 h-4" />
                      <span>Open</span>
                    </button>
                    <button
                      onClick={() => startEdit(pdf)}
                      className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
                    >
                      <Edit3 className="w-4 h-4" />
                      <span>Rename</span>
                    </button>
                    <button
                      onClick={() => handleDelete(pdf)}
                      className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Delete</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center text-xs text-gray-500 mb-3">
              <Calendar className="w-3 h-3 mr-1" />
              <span>Uploaded {formatDate(pdf.uploadDate)}</span>
            </div>

            <button
              onClick={() => window.open(`/pdf/${pdf.id}`, '_blank')}
              className="w-full bg-blue-50 text-blue-600 py-2 px-3 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors"
            >
              Open & Annotate
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PDFList;