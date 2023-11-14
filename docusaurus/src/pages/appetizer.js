import React from "react";
import AsciinemaWidget from '../../src/components/AsciinemaWidget';

function App() {
    return <>
        <AsciinemaWidget fit={false} src="/appetizer.cast" rows={20} loop={true} autoplay={1} preload={true} />
    </>;
}
export default App;
