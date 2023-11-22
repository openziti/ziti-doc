import React from 'react';

const SideBySide = ({left, right}) => {
    return (
        <div style={{display: "flex", justifyContent:"space-between"}}>
            <div style={{display: 'flex', alignItems: "center", padding: "10px"}}>
                {left}
            </div>
            <div style={{display: "flex"}}>
                {right}
            </div>
        </div>
    );
};

export default SideBySide;