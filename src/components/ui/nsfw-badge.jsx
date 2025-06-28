import React from 'react';

const NSFWBadge = ({ size = "small", className = "" }) => {
  const base = "inline-flex items-center justify-center font-bold uppercase";
  const sizeStyles = {
    small: "text-xs px-2 py-0.5 rounded-lg",
    default: "text-sm px-3 py-1 rounded-lg",
    large: "text-base px-4 py-1.5 rounded-lg"
  };
  // Muted red background
  const bg = "bg-[#a15b5b] text-white";

  return (
    <span
      title="NSFW"
      className={`${base} ${sizeStyles[size]} ${bg} ${className}`}
    >
      NSFW
    </span>
  );
};

export default NSFWBadge; 