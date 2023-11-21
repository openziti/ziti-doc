import React from 'react';

const SideBySide = ({text, imagePath, altText}) => {
    return (
        <div style={{display: 'flex'}}>
            <div style={{flex: 2, display: 'flex', alignItems: 'center'}}>
                <p>{text}</p>
            </div>

            <div style={{flex: 3}}>
                <img src={imagePath} alt={altText}
                     style={{display: "flex", alignItems: "center", height: "250px"}}/>
            </div>
        </div>
    );
};

export default SideBySide;