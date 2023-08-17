import React from "react";
import Layout from "@theme/Layout";
import Wizard from "../components/Wizard";
import { useLocation } from "react-router-dom";


export default function Stepper() {
    const { hash } = useLocation();
    return (
        <Wizard hash={hash.substr(1)}></Wizard>
    )
}