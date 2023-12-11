import React, { useEffect, useState } from "react";

const Expire = props => {
    const [visible, setVisible] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {setVisible(false); }, props.delay);
        return () => clearTimeout(timer)
    }, [props.delay]);

    return visible ? <div className={props.className}>{props.children}</div> : <div />;
};

export default Expire;