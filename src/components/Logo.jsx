import { h } from 'preact';

export function Logo() {
  return (
    <div className="flex items-center">
      <svg 
        className="w-8 h-8 text-romantic-primary" 
        viewBox="0 0 24 24" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <path 
          d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" 
          fill="currentColor"
        />
      </svg>
      <span className="ml-2 text-xl font-bold text-romantic-dark">Romantic Dates</span>
    </div>
  );
}
