import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Document, Page, pdfjs } from 'react-pdf';
import { PDF, Highlight } from '../../types';
import { pdfAPI, highlightAPI } from '../../utils/api';
import ViewerControls from './ViewerControls';
import HighlightLayer from './HighlightLayer';
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, ArrowLeft, FileText } from 'lucide-react';

// Configure PDF.js worker using local import
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.js',
  import.meta.url
).toString();

const PDFViewer: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [pdf, setPdf] = useState<PDF | null>(null);
  const [loading, setLoading] = useState(true);
  const [highlights, setHighlights] = useState<Highlight[]>([]);
  const [selectedColor, setSelectedColor] = useState<string>('#FFFF00');
  const [isSelecting, setIsSelecting] = useState<boolean>(false);
  const [scale, setScale] = useState<number>(1.0);
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState<number>(1);

  const colors = [
    { name: 'Yellow', value: '#FFFF00' },
    { name: 'Green', value: '#00FF00' },
    { name: 'Blue', value: '#00BFFF' },
    { name: 'Pink', value: '#FF69B4' },
    { name: 'Orange', value: '#FFA500' },
  ];

  useEffect(() => {
    if (id) {
      loadPdf();
    }
  }, [id]);

  useEffect(() => {
    if (pdf) {
      loadHighlights();
    }
  }, [pdf]);

  const loadPdf = async () => {
    try {
      setLoading(true);
      const response = await pdfAPI.get(id!);
      setPdf(response.data);
    } catch (error) {
      console.error('Failed to load PDF:', error);
      setPdf(null);
    } finally {
      setLoading(false);
    }
  };

  const loadHighlights = async () => {
    try {
      const response = await highlightAPI.list(pdf!.id);
      setHighlights(response.data);
    } catch (error) {
      console.error('Failed to load highlights:', error);
    }
  };

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
  };

  const handleTextSelection = async () => {
    if (!isSelecting) return;
    
    const selection = window.getSelection();
    if (!selection || selection.toString().trim() === '') return;

    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    const pageElement = document.querySelector('.react-pdf__Page');
    
    if (!pageElement) return;
    
    const pageRect = pageElement.getBoundingClientRect();

    const highlight: Omit<Highlight, 'id' | 'timestamp'> = {
      pdfId: pdf!.id,
      userId: '',
      pageNumber: pageNumber,
      text: selection.toString(),
      position: {
        x: (rect.left - pageRect.left) / scale,
        y: (rect.top - pageRect.top) / scale,
        width: rect.width / scale,
        height: rect.height / scale,
      },
      color: selectedColor,
    };

    try {
      const response = await highlightAPI.create(highlight);
      setHighlights([...highlights, response.data]);
      selection.removeAllRanges();
    } catch (error) {
      console.error('Failed to create highlight:', error);
    }
  };

  const deleteHighlight = async (highlightId: string) => {
    try {
      await highlightAPI.delete(highlightId);
      setHighlights(highlights.filter(h => h.id !== highlightId));
    } catch (error) {
      console.error('Failed to delete highlight:', error);
    }
  };

  const zoomIn = () => {
    setScale(Math.min(3.0, scale + 0.2));
  };

  const zoomOut = () => {
    setScale(Math.max(0.5, scale - 0.2));
  };

  const goToPrevPage = () => {
    setPageNumber(Math.max(1, pageNumber - 1));
  };

  const goToNextPage = () => {
    setPageNumber(Math.min(numPages, pageNumber + 1));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading PDF...</p>
        </div>
      </div>
    );
  }

  if (!pdf) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">PDF Not Found</h2>
          <p className="text-gray-600 mb-6">The requested PDF could not be loaded or does not exist.</p>
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Library
          </button>
        </div>
      </div>
    );
  }

  const currentPageHighlights = highlights.filter(h => h.pageNumber === pageNumber);

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/')}
                className="flex items-center px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Library
              </button>
              <div className="h-6 w-px bg-gray-300"></div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">{pdf.originalName}</h1>
                <p className="text-sm text-gray-500">
                  Page {pageNumber} of {numPages} • {Math.round(scale * 100)}% zoom
                </p>
              </div>
            </div>
            
            <ViewerControls
              colors={colors}
              selectedColor={selectedColor}
              onColorChange={setSelectedColor}
              onToggleSelection={() => setIsSelecting(!isSelecting)}
              isSelecting={isSelecting}
            />
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white border-b border-gray-200 px-6 py-3">
        <div className="flex items-center justify-center space-x-4">
          {/* Page Navigation */}
          <div className="flex items-center bg-gray-50 rounded-lg p-1">
            <button
              onClick={goToPrevPage}
              disabled={pageNumber <= 1}
              className="p-2 text-gray-700 hover:bg-white hover:shadow-sm rounded-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            
            <div className="px-4 py-2 text-sm font-medium text-gray-900 bg-white rounded-md shadow-sm border min-w-[100px] text-center">
              {pageNumber} / {numPages}
            </div>
            
            <button
              onClick={goToNextPage}
              disabled={pageNumber >= numPages}
              className="p-2 text-gray-700 hover:bg-white hover:shadow-sm rounded-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Zoom Controls */}
          <div className="flex items-center bg-gray-50 rounded-lg p-1">
            <button
              onClick={zoomOut}
              className="p-2 text-gray-700 hover:bg-white hover:shadow-sm rounded-md transition-all"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            
            <div className="px-4 py-2 text-sm font-medium text-gray-900 bg-white rounded-md shadow-sm border min-w-[80px] text-center">
              {Math.round(scale * 100)}%
            </div>
            
            <button
              onClick={zoomIn}
              className="p-2 text-gray-700 hover:bg-white hover:shadow-sm rounded-md transition-all"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* PDF Viewer */}
      <div className="flex-1 overflow-auto bg-gray-100 p-8">
        <div className="flex justify-center">
          <div 
            className={`relative ${isSelecting ? 'cursor-text' : 'cursor-default'}`}
            onMouseUp={handleTextSelection}
          >
            {pdf.dataUrl && (
              <Document
                file={pdf.dataUrl}
                onLoadSuccess={onDocumentLoadSuccess}
                loading={
                  <div className="flex items-center justify-center h-96 bg-white rounded-lg shadow-lg">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                      <p className="text-gray-600">Loading PDF...</p>
                    </div>
                  </div>
                }
                error={
                  <div className="flex items-center justify-center h-96 bg-white rounded-lg shadow-lg">
                    <div className="text-center">
                      <FileText className="w-12 h-12 text-red-400 mx-auto mb-4" />
                      <p className="text-red-600">Failed to load PDF</p>
                    </div>
                  </div>
                }
              >
                <div className="relative bg-white shadow-2xl rounded-lg overflow-hidden">
                  <Page
                    pageNumber={pageNumber}
                    scale={scale}
                    loading={
                      <div className="flex items-center justify-center h-96 bg-gray-50">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                      </div>
                    }
                  />
                  <HighlightLayer
                    highlights={currentPageHighlights}
                    onDeleteHighlight={deleteHighlight}
                    scale={scale}
                  />
                </div>
              </Document>
            )}
          </div>
        </div>
      </div>

      {/* Status Bar */}
      {isSelecting && (
        <div className="bg-blue-50 border-t border-blue-200 px-6 py-2">
          <div className="flex items-center justify-center">
            <p className="text-blue-700 text-sm font-medium">
              Selection mode active - Select text to highlight with {colors.find(c => c.value === selectedColor)?.name.toLowerCase()} color
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default PDFViewer;