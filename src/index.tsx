import { createRoot } from 'react-dom/client';
import './index.css';
import { App } from './components/App/app';

const container = document.getElementById('root');
createRoot(container!).render(<App/>);

