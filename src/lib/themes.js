// Theme configuration for the application
export const themes = [
  { 
    id: 'lilac', 
    name: 'Lilac', 
    bg: 'bg-romantic-lilac',
    text: 'text-romantic-lilac',
    border: 'border-romantic-lilac',
    hover: 'hover:bg-romantic-lilac/80'
  },
  { 
    id: 'mauve', 
    name: 'Mauve', 
    bg: 'bg-romantic-mauve',
    text: 'text-romantic-mauve',
    border: 'border-romantic-mauve',
    hover: 'hover:bg-romantic-mauve/80'
  },
  { 
    id: 'rose', 
    name: 'Rose', 
    bg: 'bg-romantic-rose',
    text: 'text-romantic-rose',
    border: 'border-romantic-rose',
    hover: 'hover:bg-romantic-rose/80'
  },
  { 
    id: 'peach', 
    name: 'Peach', 
    bg: 'bg-romantic-peach',
    text: 'text-romantic-peach',
    border: 'border-romantic-peach',
    hover: 'hover:bg-romantic-peach/80'
  },
  { 
    id: 'passion', 
    name: 'Passion', 
    bg: 'bg-romantic-lavender',
    text: 'text-romantic-lavender',
    border: 'border-romantic-lavender',
    hover: 'hover:bg-romantic-lavender/80'
  },
  { 
    id: 'coral', 
    name: 'Coral', 
    bg: 'bg-romantic-coral',
    text: 'text-romantic-coral',
    border: 'border-romantic-coral',
    hover: 'hover:bg-romantic-coral/80'
  },
  { 
    id: 'sky', 
    name: 'Sky', 
    bg: 'bg-romantic-sky',
    text: 'text-romantic-sky',
    border: 'border-romantic-sky',
    hover: 'hover:bg-romantic-sky/80'
  },
  { 
    id: 'mint', 
    name: 'Mint', 
    bg: 'bg-romantic-mint',
    text: 'text-romantic-mint',
    border: 'border-romantic-mint',
    hover: 'hover:bg-romantic-mint/80'
  }
];

// Default theme ID
export const DEFAULT_THEME = 'lilac';

// Get theme by ID
export function getThemeById(themeId) {
  return themes.find(theme => theme.id === themeId) || themes[0];
}
