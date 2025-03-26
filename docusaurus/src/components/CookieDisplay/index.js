import React, { useEffect, useState } from 'react';

const CookieDisplay = () => {
    const [cookies, setCookies] = useState('');

    useEffect(() => {
        // Get cookies from document.cookie
        const allCookies = document.cookie;
        setCookies(allCookies);
    }, []);

    return (
        <div>
            <h2>Cookies:</h2>
            <pre>{cookies}</pre>
        </div>
    );
};

export default CookieDisplay;
