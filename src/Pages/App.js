import * as React from "react";
import "./App.css";
import { green } from "@mui/material/colors";
import Button from "@mui/material/Button";
import Avatar from "@mui/material/Avatar";
import IconButton from "@mui/material/IconButton";
import Icon from "@mui/material/Icon";
import { Link } from "react-router-dom";
import { Loader, Loader1 } from "./Loader.js";
import { useState, useEffect } from "react";
import { api } from "../config.js";
import req from "../fetch";

function Index() {
    const linkStyles = {
        textDecoration: "none",
        color: "white",
    };
    const [loaderState, setLoaderState] = useState("none");

    let loaderStyles = {
        display: loaderState,
    };

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            setLoaderState("flex");
            (async () => {
                try {
                    const response = await req(api + "/api/auth/validate", {
                        method: "POST",
                        body: JSON.stringify({}),
                    });
                    const result = await response.json();

                    if (result.success) {
                        if (!result.data.verified) {
                            localStorage.setItem("email", result.data.email);
                            document.location.href = "/email";
                        } else {
                            localStorage.setItem(
                                "user",
                                JSON.stringify(result.data)
                            );
                            document.location.href = "/chat";
                        }
                    } else {
                        setLoaderState("none");
                    }
                } catch (error) {
                    setLoaderState("none");
                }
            })();
        } else {
            console.log("No Token");
        }
    }, []);

    return (
        <div className="page">
            <Loader1 style={loaderStyles} />
            <Avatar
                className="main-logo"
                alt="Logo"
                src="logo.png"
                sx={{ width: 100, height: 100, bgcolor: green[100] }}
            />
            <h2 id="appname">Kluster</h2>
            <br />
            <Button
                className="largeBtn"
                variant="contained"
                color="success"
                disableElevation
            >
                <Link to="/login" style={linkStyles}>
                    <Icon>mail</Icon> Continue with Email
                </Link>
            </Button>
            <p id="infoText">
                Don't have an account?{" "}
                <Link to="/register" style={linkStyles} className="green">
                    Sign up
                </Link>
            </p>
            <footer>
                By clicking "Continue with Email" you agree to Kluster's{" "}
                <font className="green">Terms and Condition</font>.
            </footer>
        </div>
    );
}

export default Index;
