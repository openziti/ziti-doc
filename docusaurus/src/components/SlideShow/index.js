import React, { useState, useEffect } from 'react';
import { useColorMode } from '@docusaurus/theme-common';

const Slideshow = (props) => {
    const { style, slideClassName, slideTitle, slides, buttonClassName, textClassName, imgClassName } = props;
    const viewAllSlides = "View All";
    const viesAsSlideshow = "View as Slideshow"
    const {colorMode, setColorMode} = useColorMode();
    const [currentPosition, setCurrentPosition] = useState(0);
    const [nextDisabled, setNextDisabled] = useState(false);
    const [previousDisabled, setPreviousDisabled] = useState(true);
    const [showAll, setShowAll] = useState(false);
    const [showAllText, setShowAllText] = useState(viewAllSlides);
    const [scrollPos, setScrollPos] = useState(0);

    const isScrollable = () => {
        const body = document.body;
        const html = document.documentElement;

        const windowHeight = window.innerHeight || html.clientHeight || body.clientHeight;
        const documentHeight = Math.max(
            body.scrollHeight,
            body.offsetHeight,
            html.clientHeight,
            html.scrollHeight,
            html.offsetHeight
        );
        return documentHeight > windowHeight
    }
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
        //console.debug("enableButtons.currentPosition: " + currentPosition + " : " + slides.length);
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

    let buttons = null;
    if(slides.length > 1) {
        buttons = <div style={{display: "flex", flexDirection: "row-reverse", margin: "5px"}}>
            <div style={{display: "flex", marginRight: "5px"}}>
                <button disabled={nextDisabled} className={buttonClassName} onClick={goToNextSlide}>Next</button>
            </div>
            <div style={{display: "flex", marginRight: "5px"}}>
                <button disabled={previousDisabled} className={buttonClassName} onClick={goToPrevSlide}>Previous</button>
            </div>
        </div>
    }

    const handleOnWheel = (e) => {
        if (isScrollable()) {
            //bounce
            //console.log("is scrollable. not enabling scroll wheel on slides");
            return;
        }
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

    const isDark = () => {
        return colorMode === 'dark';
    }
    const getImg = (slide) => {
        if (isDark()) {
            return slide.darkImg;
        }
        return slide.img;
    }

    const renderSlide = (slide, extra) => {
        const img = getImg(slide);
        return <div style={{display: "flex", flexWrap: "wrap", marginTop: "10px"}}>
            {slide.title}
            <div className={slideClassName}>
                <div className={textClassName}>
                    {slide.text}
                </div>
                <div className={imgClassName}>
                    <img style={{maxWidth: "100%"}} src={img} alt={slide.text} />
                    {extra}
                </div>
            </div>
        </div>
    };

    const slideShow = <div style={style} onWheel={handleOnWheel}>
        <div>{renderSlide(slides[currentPosition])}</div>
        {buttons}
    </div>;

    const allSlides = slides.map(slide => renderSlide(slide, <hr/>));

    return (
        <>
            <div style={{display: "flex", justifyContent:"space-between"}}>
                {slideTitle}
                <div style={{display: "flex", marginRight: "5px", height:"36px"}}>
                    <button className={buttonClassName} onClick={showAllToggle}>{showAllText}</button>
                </div>
            </div>
            <div>
                {showAll ? allSlides : slideShow}
            </div>
        </>
    );
};

export default Slideshow;
