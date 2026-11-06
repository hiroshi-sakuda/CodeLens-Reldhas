import './bundles/course/codelens/styles.css';
import './bundles/course/codelens/tokens.css';
import './bundles/course/codelens/legacy-palette.css';
import React from 'react';
import { createRoot } from 'react-dom/client';
import Shell from './bundles/course/codelens/Shell';
createRoot(document.getElementById('root')!).render(<React.StrictMode><Shell /></React.StrictMode>);
