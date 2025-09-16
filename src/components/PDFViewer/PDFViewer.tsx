import React, { useState, useEffect, useRef } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { PDF, Highlight } from '../../types';
import { highlightAPI } from '../../utils/api';
import ViewerControls from './ViewerControls';
import HighlightLayer from './HighlightLayer';
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from 'lucide-react';

// Set up PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

interface PDFViewerProps {
  pdf: PDF;
}

const PDFViewer: React.FC<PDFViewerProps> = ({ pdf }) => {
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [scale, setScale] = useState<number>(1.0);
  const [highlights, setHighlights] = useState<Highlight[]>([]);
  const [selectedColor, setSelectedColor] = useState<string>('#FFFF00');
  const [isSelecting, setIsSelecting] = useState<boolean>(false);
  const pageRef = useRef<HTMLDivElement>(null);

  const colors = [
    { name: 'Yellow', value: '#FFFF00' },
    { name: 'Green', value: '#00FF00' },
    { name: 'Blue', value: '#00BFFF' },
    { name: 'Pink', value: '#FF69B4' },
    { name: 'Orange', value: '#FFA500' },
  ];

  useEffect(() => {
    loadHighlights();
  }, [pdf.id]);

  const loadHighlights = async () => {
    try {
      const response = await highlightAPI.list(pdf.id);
      setHighlights(response.data);
    } catch (error) {
      console.error('Failed to load highlights:', error);
    }
  };

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
  };

  const handleTextSelection = async () => {
    const selection = window.getSelection();
    if (!selection || selection.toString().trim() === '') return;

    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    const pageRect = pageRef.current?.getBoundingClientRect();

    if (!pageRect) return;

    const highlight: Omit<Highlight, 'id' | 'timestamp'> = {
      pdfId: pdf.id,
      userId: '', // Will be set by backend
      pageNumber,
      text: selection.toString(),
      position: {
        x: rect.left - pageRect.left,
        y: rect.top - pageRect.top,
        width: rect.width,
        height: rect.height,
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

  const goToPrevPage = () => {
    setPageNumber(Math.max(1, pageNumber - 1));
  };

  const goToNextPage = () => {
    setPageNumber(Math.min(numPages, pageNumber + 1));
  };

  const zoomIn = () => {
    setScale(Math.min(3.0, scale + 0.2));
  };

  const zoomOut = () => {
    setScale(Math.max(0.5, scale - 0.2));
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">{pdf.originalName}</h1>
            <p className="text-sm text-gray-500">
              Page {pageNumber} of {numPages}
            </p>
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

      {/* Toolbar */}
      <div className="bg-white border-b border-gray-200 px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={goToPrevPage}
              disabled={pageNumber <= 1}
              className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Previous
            </button>
            
            <span className="text-sm text-gray-700">
              {pageNumber} / {numPages}
            </span>
            
            <button
              onClick={goToNextPage}
              disabled={pageNumber >= numPages}
              className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
              <ChevronRight className="w-4 h-4 ml-1" />
            </button>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={zoomOut}
              className="p-2 text-gray-700 hover:bg-gray-100 rounded-md"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            
            <span className="text-sm text-gray-700 min-w-[60px] text-center">
              {Math.round(scale * 100)}%
            </span>
            
            <button
              onClick={zoomIn}
              className="p-2 text-gray-700 hover:bg-gray-100 rounded-md"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* PDF Viewer */}
      <div className="flex-1 overflow-auto bg-gray-200 p-6">
        <div className="flex justify-center">
          <div 
            ref={pageRef}
            className="relative bg-white shadow-lg"
            onMouseUp={handleTextSelection}
          >
            <Document
              file={pdf.dataUrl || `/api/pdfs/${pdf.id}/file`}
              onLoadSuccess={onDocumentLoadSuccess}
              loading={
                <div className="flex items-center justify-center h-96">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
              }
            >
              <Page 
                pageNumber={pageNumber} 
                scale={scale}
                renderTextLayer={true}
                renderAnnotationLayer={false}
              />
            </Document>
            
            <HighlightLayer
              highlights={highlights.filter(h => h.pageNumber === pageNumber)}
              onDeleteHighlight={deleteHighlight}
              scale={scale}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PDFViewer;