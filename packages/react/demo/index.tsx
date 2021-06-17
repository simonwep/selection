import React from 'react';
import ReactDOM from 'react-dom';
import {SelectionArea} from '../src';
import './index.css'

ReactDOM.render(
    <React.StrictMode>
        <App/>
    </React.StrictMode>,
    document.getElementById('root')
);

function App() {
    return (
        <SelectionArea>

        </SelectionArea>
    );
}
