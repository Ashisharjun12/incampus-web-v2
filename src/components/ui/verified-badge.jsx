import React from 'react';

const VerifiedBadge = ({ size = "default", className = "" }) => {
  const sizeClasses = {
    small: "w-3 h-3",
    default: "w-[18px] h-[18px]", 
    large: "w-5 h-5"
  };

  return (
    <span 
      title="Verified" 
      className={`inline-flex items-center justify-center ${className}`}
    >
      <svg
        aria-label="Verified"
        className={`${sizeClasses[size]} ml-0.5`}
        fill="rgb(0, 149, 246)"
        role="img"
        viewBox="0 0 40 40"
      >
        <path
          d="M19.998 3.094 14.638 0l-2.972 5.15H5.432v6.354L0 14.64 3.094 20 0 25.359l5.432 3.137v5.905h6.234L14.638 40l5.36-3.094L25.358 40l2.972-5.15h6.234v-6.354L40 25.359 36.906 20 40 14.64l-5.432-3.137V5.15h-6.234L25.358 0l-5.36 3.094Zm7.415 11.225 2.254 2.287-11.43 11.5-6.835-6.93 2.244-2.258 4.587 4.581 9.18-9.18Z"
          fillRule="evenodd"
        />
      </svg>
    </span>
  );
};

export default VerifiedBadge;