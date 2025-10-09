import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import './ThemeToggle.css';

const ThemeToggle = () => {
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <button className="theme-toggle" onClick={toggleTheme} aria-label="Toggle theme">
      <div className={`toggle-container ${isDarkMode ? 'dark' : 'light'}`}>
        <div className="toggle-slider">
          {isDarkMode ? (
            <svg className="toggle-icon" viewBox="0 0 24 24" fill="currentColor">
              <path d="M21.64,13l-3.63,3.63a1,1,0,0,1-1.41,0L13,13a1,1,0,0,1,0-1.41l3.63-3.63a1,1,0,0,1,1.41,0L21.64,11.59A1,1,0,0,1,21.64,13ZM12,2.05a10,10,0,1,0,10,10A10,10,0,0,0,12,2.05ZM12,20a8,8,0,1,1,8-8A8,8,0,0,1,12,20Z"/>
            </svg>
          ) : (
            <svg className="toggle-icon" viewBox="0 0 24 24" fill="currentColor">
              <path d="M5.64,17l-.71.71a1,1,0,0,0,0,1.41,1,1,0,0,0,1.41,0l.71-.71A1,1,0,0,0,5.64,17ZM5,12a1,1,0,0,0-1-1H3a1,1,0,0,0,0,2H4A1,1,0,0,0,5,12Zm7-7a1,1,0,0,0,1-1V3a1,1,0,0,0-2,0V4A1,1,0,0,0,12,5ZM5.64,7.05a1,1,0,0,0,.7.29,1,1,0,0,0,.71-.29,1,1,0,0,0,0-1.41l-.71-.71A1,1,0,0,0,4.93,6.34Zm12,.29a1,1,0,0,0,.7-.29l.71-.71a1,1,0,1,0-1.41-1.41L17,5.64a1,1,0,0,0,0,1.41A1,1,0,0,0,17.66,7.34ZM21,11H20a1,1,0,0,0,0,2h1a1,1,0,0,0,0-2Zm-9,8a1,1,0,0,0-1,1v1a1,1,0,0,0,2,0V20A1,1,0,0,0,12,19ZM18.36,17A1,1,0,0,0,17,18.36l.71.71a1,1,0,0,0,1.41,0,1,1,0,0,0,0-1.41ZM12,6.5A5.5,5.5,0,1,0,17.5,12,5.51,5.51,0,0,0,12,6.5Zm0,9A3.5,3.5,0,1,1,15.5,12,3.5,3.5,0,0,1,12,15.5Z"/>
            </svg>
          )}
        </div>
      </div>
    </button>
  );
};

export default ThemeToggle;