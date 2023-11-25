import React, { useState } from 'react';
import { useColorMode } from '@docusaurus/theme-common';

const Slideshow = ({ style, slideClassName, slides }) => {
    const [currentPosition, setCurrentPosition] = useState(0);

    const goToNextSlide = () => {
        setCurrentPosition((prevPosition) => (prevPosition + 1) % slides.length);
    };

    const goToPrevSlide = () => {
        setCurrentPosition((prevPosition) => (prevPosition - 1 + slides.length) % slides.length);
    };

    const { isDarkTheme } = useColorMode();
    let img = null;

    if (isDarkTheme) {
        // Dark mode is enabled
        // console.log('Dark mode is enabled');
        img = slides[currentPosition].darkImg;
    } else {
        // Dark mode is not enabled
        // console.log('Dark mode is not enabled');
        img = slides[currentPosition].img;
    }

    let buttons = null;

    if(slides.length > 1) {
        buttons = <div style={{display: "flex", flexDirection: "row-reverse", margin: "5px"}}>
            <div style={{display: "flex", marginRight: "5px"}}>
                <button className="button button--primary" onClick={goToNextSlide}>Next</button>
            </div>
            <div style={{display: "flex", marginRight: "5px"}}>
                <button className="button button--primary" onClick={goToPrevSlide}>Previous</button>
            </div>
        </div>
    }

    return (
        <div style={style} >
            {slides[currentPosition].title}
            <div className={slideClassName}>
                <div style={{display: "flex", maxWidth:"600px", minWidth:"600px", paddingRight:"10px"}}>
                    {slides[currentPosition].text}
                </div>
                <div>
                    <img style={{maxWidth: "100%"}} src={img} alt={`Slide ${currentPosition + 1}`} />
                </div>
            </div>
            {buttons}
        </div>
    );
};

export default Slideshow;
