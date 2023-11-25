import * as React from "react";
import "./App.css";
import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";

function Index() {
    const [params, setParams] = useSearchParams();
    const navigate = useNavigate();

    useEffect(() => {
        if (params.get("token")) {
            localStorage.setItem("token", params.get("token"));
            window.location.href = "/";
        }
        navigate("/chat");
    }, []);

    return <div className="page" style={{ background: "white" }}></div>;
}

export default Index;
