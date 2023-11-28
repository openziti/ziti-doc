import React, { useState, useEffect } from 'react';
import { useColorMode } from '@docusaurus/theme-common';

const Slideshow = ({ style, slideClassName, slideTitle, slides }) => {
    const viewAllSlides = "View All";
    const viesAsSlideshow = "View as Slideshow"
    const {colorMode, setColorMode} = useColorMode();
    const [currentPosition, setCurrentPosition] = useState(0);
    const [nextDisabled, setNextDisabled] = useState(false);
    const [previousDisabled, setPreviousDisabled] = useState(true);
    const [showAll, setShowAll] = useState(false);
    const [showAllText, setShowAllText] = useState(viewAllSlides);
    const [scrollPos, setScrollPos] = useState(0);

    const goToNextSlide = () => {
        if(currentPosition === slides.length - 1) {
        } else {
            setCurrentPosition(currentPosition + 1);
        }
        enableButtons(currentPosition + 1);
    };

    const goToPrevSlide = () => {
        if(currentPosition === 0) {
        } else {
            setCurrentPosition(currentPosition - 1);
        }
        enableButtons(currentPosition - 1);
    };

    const enableButtons = (nextPos) => {
        console.debug("enableButtons.currentPosition: " + currentPosition + " : " + slides.length);
        setPreviousDisabled(nextPos === 0);
        setNextDisabled(nextPos === slides.length - 1);
    }

    const showAllToggle = () => {
        if(showAll) {
            setShowAllText(viewAllSlides);
            setShowAll(false);
        } else {
            setShowAllText(viesAsSlideshow);
            setShowAll(true);
        }
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
                <button disabled={nextDisabled} className="button button--primary" onClick={goToNextSlide}>Next</button>
            </div>
            <div style={{display: "flex", marginRight: "5px"}}>
                <button disabled={previousDisabled} className="button button--primary" onClick={goToPrevSlide}>Previous</button>
            </div>
        </div>
    }

    const handleOnWheel = (e) => {
        const curScroll = Math.max(scrollPos + e.deltaY, 0);
        const effectivePage = Math.floor(curScroll / 100);
        console.debug("effectivePage:" + effectivePage + " : " + ", curScroll:" + curScroll);
        if(curScroll < 0) {
            setScrollPos(0);
        } else if( effectivePage > slides.length) {
            setScrollPos(100 * slides.length);
        } else {
            if(effectivePage < slides.length && effectivePage >= 0) {
                console.debug("effectivePage:" + effectivePage + " : " + ", currentPos:" + currentPosition);
                setScrollPos(curScroll);
                setCurrentPosition(effectivePage);

                console.debug("handleOnWheel.currentPosition: " + currentPosition)
                enableButtons(effectivePage);
            }
        }
    };

    const [hovered, setHovered] = useState(false);
    const handleMouseEnter = () => {
        setHovered(true);
    };
    const handleMouseLeave = () => {
        setHovered(false);
    };

    const isDark = () => {
        return colorMode === 'dark';
    }
    const getImg = (slide) => {
        if (isDark()) {
            return slide.darkImg;
        }
        return slide.img;
    }

    const renderSlide = (slide) => {
        const img = getImg(slide);
        return <>
            {slide.title}
            <div className={slideClassName}>
                <div style={{display: "flex", maxWidth:"600px", minWidth:"600px", paddingRight:"10px"}}>
                    {slide.text}
                </div>
                <div>
                    <img style={{maxWidth: "100%"}} src={img} alt={slide.text} />
                </div>
            </div>
        </>
    };

    const slideShow = <div style={style} onWheel={handleOnWheel}>
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
    </div>;

    const allSlides = slides.map(slide => renderSlide(slide));

    return (
        <>
            <div style={{display: "flex", justifyContent:"space-between"}}>
                {slideTitle}
                <div style={{display: "flex", marginRight: "5px", height:"36px"}}>
                    <button className="button button--primary" onClick={showAllToggle}>{showAllText}</button>
                </div>
            </div>
            <div>
                {showAll ? allSlides : slideShow}
            </div>
        </>
    );
};

export default Slideshow;
