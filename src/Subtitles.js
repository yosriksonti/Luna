import React from 'react';
import './Subtitles.css';

const Subtitles = ({ text }) => {
    if (text === "") {
        return null; // Don't render anything if text is empty
    }

    return (
        <div className="subtitles-container">
            <p className="subtitles-text">{text}</p>
        </div>
    );
}

export default Subtitles;