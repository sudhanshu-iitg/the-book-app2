import React, { useEffect, useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
// import {Document, Page, pdfjs} from 'react-pdf'

// pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
pdfjsLib.GlobalWorkerOptions.workerSrc = 'pdf.worker.min.js'
function PdfViewer({ pdfUrl}) {
  const [text, setText] = useState('');

  useEffect(() => {
    async function loadPdf() {
      try {
        const pdf = await pdfjsLib.getDocument(pdfUrl).promise;
        let fullText = '';
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          fullText += textContent.items.map(item => item.str).join(' ') + '\n';
        }
        setText(fullText);
      } catch (error) {
        console.error('Error loading PDF:', error);
        console.error(pdfUrl);
        setText("Failed to show PDF");
      }
    }
    loadPdf();
  }, [pdfUrl]);

  return (
    <div>
      <h2>PDF Content</h2>
      <pre>{text}</pre>
    </div>
  );
}

export default PdfViewer;