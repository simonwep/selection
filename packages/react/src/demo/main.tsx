import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

const App: React.FunctionComponent = () => {
    return (
        <div>
            Hello world
        </div>
    );
};

ReactDOM.render(
    <React.StrictMode>
        <App/>
    </React.StrictMode>,
    document.getElementById('root')
);
