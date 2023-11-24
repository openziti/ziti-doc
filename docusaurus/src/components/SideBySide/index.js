import React from 'react';

const SideBySide = ({left, right}) => {
    return (
        <>
            <div>
                {left}
            </div>
            <div>
                {right}
            </div>
        </>
    );
};

export default SideBySide;