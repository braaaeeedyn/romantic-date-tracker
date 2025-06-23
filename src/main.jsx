import { render } from 'preact';
import { App } from './App';
import { getSetting } from './lib/db';
import './styles/main.css';

// Initialize theme
async function initTheme() {
  try {
    const theme = await getSetting('theme');
    if (theme) {
      document.documentElement.setAttribute('data-theme', theme.value);
    }
  } catch (error) {
    console.error('Failed to load theme:', error);
  }
}

// Initialize the app
async function initApp() {
  await initTheme();
  render(<App />, document.getElementById('app'));
}

initApp();
