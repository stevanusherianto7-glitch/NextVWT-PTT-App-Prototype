import { createRoot } from 'react-dom/client';
import App from './app/App.tsx';
import './styles/index.css';
import { usePTTStore } from './app/store/usePTTStore.ts';

if (typeof window !== 'undefined') {
  (window as unknown as Record<string, unknown>).__store__ = usePTTStore;
}

createRoot(document.getElementById('root')!).render(<App />);
