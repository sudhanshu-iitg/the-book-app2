import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './index.css';
import App from './App';
import Categories from './components/Categories';
import BookDetails from './components/BookDetails';
import ChapterDetails from './components/chapter details new';
import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter>
    <Routes> 
         <Route path="/" element={<App />} /> 
         <Route path="/:categoryId" element = {<App />} />
         <Route path="/books/:bookId" element={<App />} /> 
         <Route path="/books/:bookId/chapters/:chapterId" element={<App />} />
         <Route path="/:categoryId/books/:bookId/:chapterId" element={<ChapterDetails/>} /> 

    </Routes>
    {/* <App /> */}
    </BrowserRouter>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
