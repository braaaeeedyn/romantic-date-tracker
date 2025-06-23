import { h } from 'preact';
import { useEffect, useRef } from 'preact/hooks';
import './FloatingHearts.css';

const HEARTS = ['❤️', '💖', '💝', '💗', '💓', '💞', '💕'];

export function FloatingHearts() {
  const containerRef = useRef(null);
  const cleanupRef = useRef([]);

  const createHeart = () => {
    if (!containerRef.current) return null;
    
    try {
      const heart = document.createElement('div');
      heart.className = 'floating-heart';
      
      // Random heart emoji
      const randomHeart = HEARTS[Math.floor(Math.random() * HEARTS.length)];
      heart.textContent = randomHeart;
      
      // Random position across the full width of the screen
      heart.style.left = `${Math.random() * 100}%`;
      
      // Random style
      const styleNum = Math.floor(Math.random() * 7) + 1;
      heart.classList.add(`heart-style-${styleNum}`);
      
      // Random size
      const size = 16 + Math.random() * 20; // Between 16px and 36px
      heart.style.fontSize = `${size}px`;
      
      // Random animation duration (3-6 seconds)
      const duration = 3 + Math.random() * 3;
      
      // Random horizontal movement (-50px to 50px)
      const xMovement = (Math.random() - 0.5) * 100;
      
      // Set up the animation
      heart.style.animation = `float-up ${duration}s linear forwards`;
      heart.style.setProperty('--x-movement', `${xMovement}px`);
      
      // Add to DOM
      containerRef.current.appendChild(heart);
      
      // Remove heart after animation completes
      const timeoutId = setTimeout(() => {
        if (heart.parentNode === containerRef.current) {
          containerRef.current.removeChild(heart);
        }
        cleanupRef.current = cleanupRef.current.filter(id => id !== timeoutId);
      }, duration * 1000);
      
      cleanupRef.current.push(timeoutId);
      return heart;
    } catch (error) {
      console.error('Error creating heart:', error);
      return null;
    }
  };

  useEffect(() => {
    // Create initial hearts
    const createInitialHearts = () => {
      for (let i = 0; i < 15; i++) {
        setTimeout(createHeart, i * 300);
      }
    };
    
    // Start creating hearts
    createInitialHearts();
    const interval = setInterval(createHeart, 500);
    
    // Cleanup
    return () => {
      clearInterval(interval);
      cleanupRef.current.forEach(clearTimeout);
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };
  }, []);

  return (
    <div 
      ref={containerRef}
      className="floating-hearts-container"
      aria-hidden="true"
    />
  );
}
