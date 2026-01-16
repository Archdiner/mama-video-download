import React from 'react';

const ChaiCup = () => (
    <svg width="120" height="120" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ margin: '0 auto', display: 'block' }}>
        {/* Steam animation */}
        <g className="steam">
            <path d="M100 40C100 40 110 30 110 20S100 0 100 0" stroke="#bdc3c7" strokeWidth="4" strokeLinecap="round" style={{ opacity: 0.6 }}>
                <animate attributeName="d" values="M100 40C100 40 110 30 110 20S100 0 100 0; M100 35C100 35 90 25 90 15S100 -5 100 -5" dur="3s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.6;0;0.6" dur="3s" repeatCount="indefinite" />
            </path>
            <path d="M85 45C85 45 95 35 95 25S85 5 85 5" stroke="#bdc3c7" strokeWidth="4" strokeLinecap="round" style={{ opacity: 0.6 }}>
                <animate attributeName="d" values="M85 45C85 45 95 35 95 25S85 5 85 5; M85 40C85 40 75 30 75 20S85 0 85 0" dur="2.5s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.6;0;0.6" dur="2.5s" repeatCount="indefinite" />
            </path>
            <path d="M115 45C115 45 125 35 125 25S115 5 115 5" stroke="#bdc3c7" strokeWidth="4" strokeLinecap="round" style={{ opacity: 0.6 }}>
                <animate attributeName="d" values="M115 45C115 45 125 35 125 25S115 5 115 5; M115 40C115 40 105 30 105 20S115 0 115 0" dur="3.5s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.6;0;0.6" dur="3.5s" repeatCount="indefinite" />
            </path>
        </g>

        {/* Cup */}
        <path d="M50 70H150C150 70 155 130 120 150H80C45 130 50 70 50 70Z" fill="url(#cupGradient)" stroke="#8d6e63" strokeWidth="3" />

        {/* Chai Liquid */}
        <path d="M55 75H145C143 85 140 120 120 140H80C60 120 57 85 55 75Z" fill="#D2691E" />
        <ellipse cx="100" cy="75" rx="45" ry="5" fill="#A0522D" />

        {/* Handle */}
        <path d="M150 80C165 80 175 90 175 105C175 120 160 130 148 128" stroke="#8d6e63" strokeWidth="8" strokeLinecap="round" fill="none" />

        {/* Saucer */}
        <path d="M40 150H160" stroke="#8d6e63" strokeWidth="4" strokeLinecap="round" />

        <defs>
            <linearGradient id="cupGradient" x1="50" y1="70" x2="150" y2="150" gradientUnits="userSpaceOnUse">
                <stop stopColor="#FFF8E1" />
                <stop offset="1" stopColor="#FFE0B2" />
            </linearGradient>
        </defs>
    </svg>
);

export default ChaiCup;
