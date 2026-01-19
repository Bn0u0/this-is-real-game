import React from 'react';
import ReactDOM from 'react-dom/client';
import '../app/index.css'; // Shared styles (Tailwind)
import { ArtLabApp } from './ArtLabApp.tsx';

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <ArtLabApp />
    </React.StrictMode>
);
