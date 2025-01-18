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
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const selectedTextRef = useRef(selectedText); // Store the selected text in a ref

  // Update the ref when the selectedText prop changes
  useEffect(() => {
    selectedTextRef.current = selectedText;
  }, [selectedText]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const new_text = 'Ruth Benedict"s *The Chrysanthemum and the Sword';
      const response = await fetch(
        `https://thebookapp-production-eb6d.up.railway.app/chat?key=${encodeURIComponent(chapterId)}&chapter_id=${chapterId}&query=${encodeURIComponent(query)}&selected_text=${encodeURIComponent(selectedTextRef.current)}`
      );
      const data = await response.json();
      console.log(data.docs);
      setResponse(data.docs);
    } catch (error) {
      console.log(chapterId);
      console.log(query);
      console.log(selectedTextRef.current);
      console.error('Error fetching chat response:', error);
      setResponse('Error fetching response. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="chat-screen">
      <div className="chat-content">
        <div className="chat-header">
          <h2>Chat</h2>
          <button onClick={onClose}>&times;</button>
        </div>
        <div className="selected-text-display">
          <p>
            Selected Text: <em>"{selectedTextRef.current}"</em>
          </p>
        </div>
        <form onSubmit={handleSubmit}>
          <textarea
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="chat-input"
            placeholder="Enter your query..."
            rows="3"
          />
          <button
            type="submit"
            className="chat-submit-button"
            disabled={isLoading}
          >
            {isLoading ? 'Sending...' : 'Send'}
          </button>
        </form>
        {response && (
          <div className="chat-response">
            <p>{response}</p>
          </div>
        )}
      </div>
    </div>
  );
};

const MetadataDisplay = ({ metadata, chapterId, bookId, onMetadataUpdate }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [requestStatus, setRequestStatus] = useState('idle');
  const [selectedText, setSelectedText] = useState('');
  const [showChat, setShowChat] = useState(false);
  const metadataRef = useRef(null);

  useEffect(() => {
    const handleTextSelection = () => {
      const selection = window.getSelection();
      const selectedText = selection.toString().trim();
  
      if (selectedText !== '') {
        setSelectedText(selectedText);
        console.log("Selected Text (from event):", selectedText);
      } else {
        setSelectedText('');
      }
    };
  
    const metadataElement = metadataRef.current;
  
    if (metadataElement) {
      metadataElement.addEventListener('mouseup', handleTextSelection);
    }
  
    return () => {
      if (metadataElement) {
        metadataElement.removeEventListener('mouseup', handleTextSelection);
      }
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

  const renderQUADs = (quads, title) => {
    if (!quads || typeof quads !== 'object') {
      return (
        <Alert variant="warning" title="Invalid Section Data">
          The {title} section is not in the correct format.
        </Alert>
      );
    }

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
  };

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
        />
      )}
      <div>
        {/* Key Themes Card */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-start gap-4">
            <div className="flex-1">
              <div className="flex items-center">
                <h4 className="text-xl font-semibold text-gray-800 mr-2">Key Themes</h4>
                <span className="w-2"></span>
              </div>
              <p className="text-gray-600 leading-relaxed">
                {parsedMetadata.Key_Themes || 'No key themes available'}
              </p>
            </div>
          </div>
        </div>

        {/* Case Studies Card */}
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
      </div>

      {/* Key Questions & Answers Section */}
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

      {/* Deeper Analysis Section */}
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

export default MetadataDisplay;