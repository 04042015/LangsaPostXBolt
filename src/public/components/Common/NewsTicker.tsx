import React, { useState, useEffect } from 'react';

const NewsTicker: React.FC = () => {
  const [tickerText, setTickerText] = useState('Selamat datang di LangsaPost - Portal berita terpercaya untuk informasi terkini Langsa dan sekitarnya');

  useEffect(() => {
    fetchTickerText();
  }, []);

  const fetchTickerText = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/settings/public');
      if (response.ok) {
        const settings = await response.json();
        if (settings.news_ticker_text) {
          setTickerText(settings.news_ticker_text);
        }
      }
    } catch (error) {
      console.error('Failed to fetch ticker text:', error);
    }
  };

  return (
    <div className="bg-coral-500 text-white py-2 overflow-hidden">
      <div className="whitespace-nowrap animate-scroll">
        <span className="text-sm font-medium px-4">
          {tickerText}
        </span>
      </div>
    </div>
  );
};

export default NewsTicker;