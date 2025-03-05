import React, { useState, useEffect } from 'react';

const CustomizeDoc = () => {
    const [showForm, setShowForm] = useState(false);
    const [controllerUrl, setControllerUrl] = useState('https://your.controller.com');
    const [userName, setUserName] = useState('clint');

    // Button Style
    const buttonStyle = {
        position: 'absolute',
        top: '20px',
        right: '20px',
        padding: '10px 20px',
        backgroundColor: '#007bff',
        color: 'white',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
        zIndex: 1000,
    };

    // Form Style
    const formStyle = {
        position: 'absolute',
        top: '60px',
        right: '20px',
        padding: '15px',
        backgroundColor: 'white',
        border: '1px solid #ccc',
        borderRadius: '5px',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
        zIndex: 1000,
    };

    // Get cookies and update state
    useEffect(() => {
        const storedControllerUrl = getCookie('controllerUrl') || 'https://your.controller.com';
        const storedUserName = getCookie('userName') || 'clint';
        setControllerUrl(storedControllerUrl);
        setUserName(storedUserName);
    }, []);

    // Handle form submission and set cookies
    const handleSaveSettings = () => {
        const expirationDate = new Date();
        expirationDate.setFullYear(expirationDate.getFullYear() + 1); // Set cookie expiration to 1 year

        document.cookie = `controllerUrl=${controllerUrl}; path=/; expires=${expirationDate.toUTCString()}; SameSite=None; Secure`;
        document.cookie = `userName=${userName}; path=/; expires=${expirationDate.toUTCString()}; SameSite=None; Secure`;

        // Set localStorage with settings
        const settings = {
            edgeControllers: [
                {
                    name: `${userName}`,
                    url: `${controllerUrl}`,
                    default: true
                }
            ]
        };

        localStorage.setItem('ziti.settings', JSON.stringify(settings));
        
        setShowForm(false); // Hide the form after saving
    };

    // Toggle form visibility
    const handleButtonClick = () => {
        setShowForm(!showForm);
    };

    return (
        <>
            <button style={buttonStyle} onClick={handleButtonClick}>
                Customize the Doc Site
            </button>

            {showForm && (
                <div style={formStyle}>
                    <div>
                        <label>
                            Controller URL:
                            <input
                                type="text"
                                value={controllerUrl}
                                onChange={(e) => setControllerUrl(e.target.value)}
                                placeholder="Enter Controller URL"
                                style={{ width: '100%', marginBottom: '10px' }}
                            />
                        </label>
                    </div>
                    <div>
                        <label>
                            Your Name:
                            <input
                                type="text"
                                value={userName}
                                onChange={(e) => setUserName(e.target.value)}
                                placeholder="Enter Your Name"
                                style={{ width: '100%', marginBottom: '10px' }}
                            />
                        </label>
                    </div>
                    <button
                        onClick={handleSaveSettings}
                        style={{
                            backgroundColor: '#28a745',
                            color: 'white',
                            border: 'none',
                            borderRadius: '5px',
                            cursor: 'pointer',
                            padding: '8px 12px',
                        }}
                    >
                        Save Settings
                    </button>
                </div>
            )}
        </>
    );
};

// Get cookie by name
const getCookie = (name) => {
    const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
    return match ? match[2] : null;
};

export default CustomizeDoc;
