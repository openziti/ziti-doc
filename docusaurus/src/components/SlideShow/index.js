import React, { useState } from 'react';
import { useColorMode } from '@docusaurus/theme-common';

const Slideshow = ({ style, slideClassName, slides }) => {
    const {colorMode, setColorMode} = useColorMode();
    const [currentPosition, setCurrentPosition] = useState(0);
    const [nextDisabled, setNextDisabled] = useState(false);
    const [previousDisabled, setPreviousDisabled] = useState(true);

    const goToNextSlide = () => {
        if(currentPosition === slides.length - 1) {
            setNextDisabled(true);
        } else {
            setPreviousDisabled(false);
            setCurrentPosition(currentPosition + 1);
        }
    };

    const goToPrevSlide = () => {
        if(currentPosition === 0) {
            setPreviousDisabled(true);
        } else {
            setNextDisabled(false);
            setCurrentPosition(currentPosition - 1);
        }
    };

    const showAllToggle = () => {

    };

    let img = null;

    if (colorMode === 'dark') {
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
                <button disabled={nextDisabled} className="button button--primary" onClick={showAllToggle}>Show All Slides</button>
            </div>
            <div style={{display: "flex", marginRight: "5px"}}>
                <button disabled={nextDisabled} className="button button--primary" onClick={goToNextSlide}>Next</button>
            </div>
            <div style={{display: "flex", marginRight: "5px"}}>
                <button disabled={previousDisabled} className="button button--primary" onClick={goToPrevSlide}>Previous</button>
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
