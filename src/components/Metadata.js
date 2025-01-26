import React, { useState, useEffect, useRef } from 'react';
import { AlertCircle, Book, Loader, MessageCircle } from 'lucide-react';
import { createClient } from "@supabase/supabase-js";
import './Metadata.css';

const supabaseUrl = process.env.REACT_APP_supabaseUrl;
const supabaseKey = process.env.REACT_APP_supabaseKey;
const supabase = createClient(supabaseUrl, supabaseKey);

const Alert = ({ variant = "default", title, children }) => {
  // ... Alert component remains the same
};

const ProcessingAnimation = () => (
  <div className="processing-info mt-4 p-4 bg-gray-100 rounded-lg shadow-md">
    <div className="flex items-center justify-between">
      <div className="flex items-center">
        <div>
          <p className="text-gray-800 font-semibold text-lg">
            Generating chapter summary...
          </p>
          <p className="text-gray-600 text-sm">
            This may take a few moments.
          </p>
        </div>
      </div>
      <div className="processing-animation">
        <div className="dot"></div>
        <div className="dot"></div>
        <div className="dot"></div>
      </div>
    </div>
  </div>
);

const ChatScreen = ({ selectedText, chapterId, onClose }) => {
  // ... ChatScreen component remains the same
};

const MetadataDisplay = ({ metadata, chapterId, bookId, onMetadataUpdate }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [requestStatus, setRequestStatus] = useState('idle');
  const [selectedText, setSelectedText] = useState('');
  const [showChat, setShowChat] = useState(false);
  const metadataRef = useRef(null);
  const chatInputRef = useRef(null);

  useEffect(() => {
    const handleTextSelection = () => {
      const selection = window.getSelection();
      const selectedText = selection.toString().trim();
  
      if (
        chatInputRef.current && 
        (selection.anchorNode && chatInputRef.current.contains(selection.anchorNode))
      ) {
        return;
      }
  
      if (selectedText !== '') {
        setSelectedText(selectedText);
        console.log("Selected Text (from event):", selectedText);
      } 
    };
  
    document.addEventListener('selectionchange', handleTextSelection);
  
    return () => {
      document.removeEventListener('selectionchange', handleTextSelection);
    };
  }, []);

  useEffect(() => {
    console.log("Selected Text (from state):", selectedText);
  }, [selectedText]);

  const fetchUpdatedMetadata = async () => {
    try {
      const { data, error } = await supabase
        .from('chapter_contents')
        .select('metadata')
        .eq('id', chapterId)
        .single();

      if (error) throw error;

      if (data && data.metadata) {
        onMetadataUpdate(data.metadata);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error fetching updated metadata:', error);
      return false;
    }
  };

  const generateMetadata = async () => {
    setIsGenerating(true);
    setRequestStatus('requested');

    try {
      const apiUrl = `https://thebookapp-production-eb6d.up.railway.app/summary?key=${chapterId}`;
      const response = await fetch(apiUrl);
      
      await fetchUpdatedMetadata();
      setRequestStatus('success');
    } catch (error) {
      console.error('Error generating metadata:', error);
      setRequestStatus('error');
    } finally {
      await fetchUpdatedMetadata();
      setRequestStatus('success');
      setIsGenerating(false);
    }
  };

  useEffect(() => {
    if (!metadata && requestStatus === 'idle') {
      generateMetadata();
    }
  }, [metadata, requestStatus]);

  const isFormat1 = (metadata) => {
    return metadata && metadata.Key_Themes !== undefined;
  };

  const renderFormat1 = (parsedMetadata) => {
    return (
      <div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-start gap-4">
            <div className="flex-1">
              <div className="flex items-center">
                <h4 className="text-xl font-semibold text-gray-800 mr-2">Key Themes</h4>
              </div>
              <p className="text-gray-600 leading-relaxed">
                {parsedMetadata.Key_Themes || 'No key themes available'}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-start gap-4">
            <div className="flex-1">
              <h4 className="text-xl font-semibold text-gray-800 mb-3">Case Studies</h4>
              <p className="text-gray-600 leading-relaxed">
                {parsedMetadata.Case_Studies || 'No case studies available'}
              </p>
            </div>
          </div>
        </div>

        {parsedMetadata.QUADs && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-start gap-4">
              <div className="flex-1">
                <h4 className="text-xl font-semibold text-gray-800 mb-6">Key Questions & Answers</h4>
                {renderQUADs(parsedMetadata.QUADs, 'Key Questions')}
              </div>
            </div>
          </div>
        )}

        {parsedMetadata.Deeper_QUADs && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-start gap-4">
              <div className="flex-1">
                <h4 className="text-xl font-semibold text-gray-800 mb-6">Deeper Analysis</h4>
                {renderQUADs(parsedMetadata.Deeper_QUADs, 'Deeper Analysis')}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderFormat2 = (parsedMetadata) => {
    return (
      <div>
        {parsedMetadata.themes && (
          <div className="bg-white rounded-lg shadow-md p-6">
            {parsedMetadata.themes.map((theme, index) => (
              <div key={index} className="mb-6">
                <h4 className="text-xl font-semibold text-gray-800">{theme.theme.topic}</h4>
                <p className="text-gray-600 leading-relaxed">{theme.theme.text}</p>
              </div>
            ))}
          </div>
        )}

        {parsedMetadata.case_studies && (
          <div className="bg-white rounded-lg shadow-md p-6">
            {parsedMetadata.case_studies.map((caseStudy, index) => (
              <div key={index} className="mb-6">
                <h4 className="text-xl font-semibold text-gray-800">{caseStudy.case_study.topic}</h4>
                <p className="text-gray-600 leading-relaxed">{caseStudy.case_study.text}</p>
              </div>
            ))}
          </div>
        )}

        {parsedMetadata.QUADs && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-start gap-4">
              <div className="flex-1">
                <h4 className="text-xl font-semibold text-gray-800 mb-6">Key Questions & Answers</h4>
                {renderQUADs(parsedMetadata.QUADs, 'Key Questions')}
              </div>
            </div>
          </div>
        )}

        {parsedMetadata.Deeper_QUADs && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-start gap-4">
              <div className="flex-1">
                <h4 className="text-xl font-semibold text-gray-800 mb-6">Deeper Analysis</h4>
                {renderQUADs(parsedMetadata.Deeper_QUADs, 'Deeper Analysis')}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderQUADs = (quads, title) => {
    if (Array.isArray(quads)) {
      return (
        <div className="space-y-6">
          {quads.map((qa, idx) => (
            <div key={idx} className="bg-gray-100 rounded-lg p-6">
              <div className="flex gap-4 mb-4 items-start">
                <h5 className="font-medium text-gray-800">{qa.question}</h5>
              </div>
              <div className="ml-12">
                <p className="text-gray-600 leading-relaxed">{qa.answer}</p>
              </div>
            </div>
          ))}
        </div>
      );
    } else if (typeof quads === 'object') {
      const pairs = Object.keys(quads).reduce((pairs, key) => {
        if (key.startsWith('Question_')) {
          const num = key.split('_')[1];
          const answerKey = `Answer_${num}`;
          if (quads[answerKey]) {
            pairs.push({
              question: quads[key],
              answer: quads[answerKey],
              index: num
            });
          }
        }
        return pairs;
      }, []);

      if (pairs.length === 0) {
        return (
          <Alert title="No Questions Available">
            No valid question-answer pairs found for {title}.
          </Alert>
        );
      }

      return (
        <div className="space-y-6">
          {pairs.map((qa, idx) => (
            <div key={idx} className="bg-gray-100 rounded-lg p-6">
              <div className="flex gap-4 mb-4 items-start">
                <h5 className="font-medium text-gray-800">{qa.question}</h5>
              </div>
              <div className="ml-12">
                <p className="text-gray-600 leading-relaxed">{qa.answer}</p>
              </div>
            </div>
          ))}
        </div>
      );
    } else {
      return (
        <Alert variant="warning" title="Invalid Section Data">
          The {title} section is not in the correct format.
        </Alert>
      );
    }
  };

  if (!metadata || isGenerating) {
    return (
      <div className="p-6 space-y-6">
        <ProcessingAnimation />
        {requestStatus === 'error' && (
          <div className="mt-4">
            <Alert variant="error" title="Error Generating Summary">
              There was an error generating the summary. 
              <button 
                onClick={generateMetadata}
                className="mt-2 text-red-600 hover:text-red-800 font-medium"
              >
                Click here to try again
              </button>
            </Alert>
          </div>
        )}
      </div>
    );
  }

  const parsedMetadata = typeof metadata === 'string' ? JSON.parse(metadata) : metadata;

  return (
    <div ref={metadataRef}>
      {selectedText && (
        <button
          onClick={() => setShowChat(true)}
          className="chat-button"
        >
          <MessageCircle size={24} />
        </button>
      )}
      {showChat && (
        <ChatScreen
          selectedText={selectedText}
          chapterId={chapterId}
          onClose={() => setShowChat(false)}
          chatInputRef={chatInputRef}
        />
      )}

      {isFormat1(parsedMetadata) ? renderFormat1(parsedMetadata) : renderFormat2(parsedMetadata)}
    </div>
  );
};

export default MetadataDisplay;