import React, { useState, useEffect, useRef } from 'react';
import { Menu, X, BookOpen, FileText, MessageSquare, CreditCard, ArrowLeft, ChevronRight, ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { createClient } from "@supabase/supabase-js";
import './Cards.css';
import { useSwipeable } from 'react-swipeable';
import saveReadingProgress from './saveReadingProgress';

const supabaseUrl = process.env.REACT_APP_supabaseUrl;
const supabaseKey = process.env.REACT_APP_supabaseKey;
const supabase = createClient(supabaseUrl, supabaseKey);

const ContentSection = ({ type, content, onNavigate, isLastChapter, onNextChapter, onCardChange, initialCard, setCurrentCard }) => {
    const [slideDirection, setSlideDirection] = useState(null);

    useEffect(() => {
        setCurrentCard(initialCard);
    }, [initialCard, setCurrentCard]);

    const navigateCards = (direction) => {
        if (direction === 'next' && initialCard < content.length - 1) {
            setSlideDirection('slide-left');
            setCurrentCard((prev) => prev + 1);
        } else if (direction === 'prev' && initialCard > 0) {
            setSlideDirection('slide-right');
            setCurrentCard((prev) => prev - 1);
        }
    };

    const handlers = useSwipeable({
        onSwipedLeft: () => navigateCards('next'),
        onSwipedRight: () => navigateCards('prev'),
        preventDefaultTouchmoveEvent: true,
        trackMouse: true
    });

    const isFirstCard = initialCard === 0;
    const isLastCard = Array.isArray(content) && initialCard === content.length - 1;

    useEffect(() => {
        const timer = setTimeout(() => setSlideDirection(null), 300);
        return () => clearTimeout(timer);
    }, [initialCard]);

    return (
        <div {...handlers}>
            <div className="book-excerpt">
                <div className={`card-content-wrapper ${slideDirection}`}>
                    <h4>{content[initialCard].card_heading}</h4>
                    <div>
                        <p>{content[initialCard].card_content}</p>
                    </div>
                </div>
            </div>
            <div className="card-header">
                <h3 className="card-number">Card {initialCard + 1} of {content.length}</h3>
                <div className="navigation-buttons">
                    <button
                        onClick={() => navigateCards('prev')}
                        className={`nav-button-prev ${isFirstCard ? 'disabled' : ''}`}
                        disabled={isFirstCard}
                    >
                        <ChevronLeft size={16} />
                        {isFirstCard ? 'First' : 'Prev'}
                    </button>
                    {isLastCard ? (
                        <button
                            onClick={onNextChapter}
                            className={`nav-button-next ${isLastChapter ? 'disabled' : ''}`}
                            disabled={isLastChapter}
                        >
                            Next Chapter
                            <ChevronRight size={16} />
                        </button>
                    ) : (
                        <button
                            onClick={() => navigateCards('next')}
                            className="nav-button-next"
                        >
                            Next
                            <ChevronRight size={16} />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ContentSection;