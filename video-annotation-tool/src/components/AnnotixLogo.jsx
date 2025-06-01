import React from "react";

// The AnnotixIcon SVG
const AnnotixIcon = ({ size = 40, className = "" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={{ display: "inline-block", verticalAlign: "middle" }}
  >
    <defs>
      <linearGradient id="clipboardGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#3B82F6" />
        <stop offset="100%" stopColor="#1E40AF" />
      </linearGradient>
      <linearGradient id="speechGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#10B981" />
        <stop offset="100%" stopColor="#059669" />
      </linearGradient>
    </defs>
    {/* Main clipboard */}
    <rect
      x="15"
      y="12"
      width="50"
      height="70"
      rx="6"
      ry="6"
      fill="url(#clipboardGradient)"
      stroke="#1E40AF"
      strokeWidth="2"
    />
    {/* Clipboard clip */}
    <rect
      x="25"
      y="8"
      width="30"
      height="8"
      rx="4"
      ry="4"
      fill="#F3F4F6"
      stroke="#1E40AF"
      strokeWidth="2"
    />
    {/* Speech bubble with annotation lines */}
    <path
      d="M30 35 L75 35 Q85 35 85 45 L85 55 Q85 65 75 65 L45 65 L35 75 L35 65 Q30 65 30 55 L30 45 Q30 35 40 35 Z"
      fill="url(#speechGradient)"
      stroke="#059669"
      strokeWidth="2"
    />
    {/* Text lines inside speech bubble */}
    <line x1="38" y1="42" x2="65" y2="42" stroke="white" strokeWidth="2" strokeLinecap="round" />
    <line x1="38" y1="48" x2="70" y2="48" stroke="white" strokeWidth="2" strokeLinecap="round" />
    <line x1="38" y1="54" x2="60" y2="54" stroke="white" strokeWidth="2" strokeLinecap="round" />
    <line x1="38" y1="60" x2="55" y2="60" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
    {/* Pen/pencil */}
    <g transform="rotate(45 75 25)">
      <rect
        x="70"
        y="15"
        width="10"
        height="25"
        rx="2"
        fill="#F59E0B"
        stroke="#D97706"
        strokeWidth="1"
      />
      <rect
        x="71"
        y="38"
        width="8"
        height="6"
        fill="#DC2626"
      />
      <circle cx="75" cy="18" r="2" fill="#FEF3C7" />
    </g>
    {/* Subtle shadow/glow effect */}
    <ellipse
      cx="50"
      cy="85"
      rx="25"
      ry="5"
      fill="#000000"
      opacity="0.1"
    />
  </svg>
);

// The Annotix logo with icon and text
const AnnotixLogo = ({ iconSize = window.innerWidth <= 768 ? 40 : 70, style = {} }) => (
  <span style={{ 
    display: "flex", 
    alignItems: "center",
    ...style 
  }}>
    <AnnotixIcon size={iconSize} />
    <span
      style={{
        fontFamily: '"Montserrat", "Roboto", Arial, sans-serif',
        fontWeight: 1400,
        fontSize: window.innerWidth <= 768 ? "2rem" : "4rem",
        letterSpacing: "-1.5px",
        color: "#fff",
        textShadow: "0 2px 8px #0006, 0 1px 0rgb(82, 121, 20)",
        background: "linear-gradient(90deg, #facc15 10%,rgb(70, 174, 50) 90%)",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
        display: "inline-block",
        marginLeft: window.innerWidth <= 768 ? 10 : 18
      }}
    >
      Annotix
    </span>
  </span>
);

export default AnnotixLogo;