import React, { useState, useEffect, useRef} from "react";
import { Helmet } from "react-helmet";

const Home = () => {
    return (
        <div>
            <Helmet>
                <meta charSet="utf-8"/>
                <title>Former OpenZiti Blog</title>
                <link rel="canonical" href="https://blog.openziti.io"/>
                <meta name="description" content="This is where the OpenZiti blog used to be. Please see https://blog.openziti.io"/>
                <meta http-equiv="refresh" content="0; URL=https://blog.openziti.io"/>
            </Helmet>
            <h1>Home Page</h1>
        </div>);
}

export default Home;