// src/components/PremiumHeader.jsx
import React, { useState } from 'react';
import { FaBars, FaSearch, FaSlidersH } from 'react-icons/fa';
import './PremiumHeader.css';

const PremiumHeader = ({ onMenuClick, onSearchClick, onFilterClick, showChips = true }) => {
  const [activeChip, setActiveChip] = useState('Barchasi');
  const chips = ['Barchasi', "Bo'sh", 'Band', 'Band qilingan', 'Tozalanmoqda'];

  return (
    <div className="premium-header">
      <div className="header-glass">
        <div className="header-content">
          <button className="icon-btn menu-btn" onClick={onMenuClick}>
            <FaBars size={24} />
          </button>
          <div className="header-title">
            <h1>Stollar</h1>
            <p>Restoran stollarini boshqarish</p>
          </div>
          <div className="header-actions">
            <button className="icon-btn" onClick={onSearchClick}>
              <FaSearch size={22} />
            </button>
            <button className="icon-btn" onClick={onFilterClick}>
              <FaSlidersH size={22} />
            </button>
          </div>
        </div>

        {showChips && (
          <div className="chip-scroll">
            <div className="chip-wrapper">
              {chips.map((label) => (
                <button
                  key={label}
                  className={`chip ${activeChip === label ? 'active' : ''}`}
                  onClick={() => setActiveChip(label)}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PremiumHeader;