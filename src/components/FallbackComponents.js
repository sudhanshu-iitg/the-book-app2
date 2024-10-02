import React from 'react';
import { UserX, BookX,AlertOctagon  } from 'lucide-react';

export const NotLoggedInFallback = ({ onSignInClick }) => (
  <div className="fallback-container">
    <UserX size={48} className="fallback-icon" />
    <h2>You're not logged in</h2>
    <p>Sign in to see your books</p>
    <button onClick={onSignInClick} className="sign-in-button">Sign In</button>
  </div>
);

export const NoBooksFoundFallback = () => (
  <div className="fallback-container">
    <BookX size={48} style={{marginBottom: '1rem'}} className="fallback-icon" />
    <h2>No books found</h2>
    <p>We are working on improving this experience right now.</p>
  </div>
);
export const ErrorFallback = ({ message }) => (
  <div className="fallback-container">
    <AlertOctagon size={48} style={{marginBottom: '1rem'}} className="fallback-icon" />
    <h2>Oops! Something went wrong</h2>
    <p>{message}</p>
    <p>Please try again later or contact support if the problem persists.</p>
  </div>
);