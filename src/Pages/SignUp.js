import * as React from "react";
import "./App.css";
import { green } from "@mui/material/colors";
import Button from "@mui/material/Button";
import Avatar from "@mui/material/Avatar";
import IconButton from "@mui/material/IconButton";
import Icon from "@mui/material/Icon";
import Box from "@mui/material/Box";
import Input from "@mui/material/Input";
import InputLabel from "@mui/material/InputLabel";
import InputAdornment from "@mui/material/InputAdornment";
import FormControl from "@mui/material/FormControl";
import TextField from "@mui/material/TextField";
import AccountCircle from "@mui/icons-material/AccountCircle";
import LockIcon from "@material-ui/icons/Lock";
import PersonIcon from "@material-ui/icons/Person";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import LoadingButton from "@mui/lab/LoadingButton";
import req from "../fetch.js";
import { api } from "../config.js";
import Snackbar from "@mui/material/Snackbar";
import MuiAlert, { AlertProps } from "@mui/material/Alert";

function SignUp() {
    const navigate = useNavigate();
    const LockIconStyle = {
        color: "grey",
        marginRight: "10px",
    };
    const linkStyles = {
        textDecoration: "none",
    };

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setLoading] = useState(false);
    const [isOpen, setOpen] = useState(false);
    const [modalType, setModalType] = useState("success");
    const [modalMessage, setModalMessage] = useState("");

    const handleClose = (
        event?: React.SyntheticEvent | Event,
        reason?: string
    ) => {
        if (reason === "clickaway") {
            return;
        }

        setOpen(false);
    };

    const onSubmit = async () => {
        setLoading(true);
        console.log(name, email, password);
        try {
            const response = await req(api + "/api/auth/register", {
                method: "POST",
                body: JSON.stringify({
                    email,
                    password,
                    name,
                }),
            });
            const result = await response.json();

            if (result.success) {
                setLoading(false);
                setModalType("success");
                setModalMessage(result.message);
                setOpen(true);

                // Redirect to Dashboard
                setTimeout(() => {
                    // Store Token to localstorage
                    localStorage.setItem("token", result.data.accessToken);
                    window.cookieStore.set("token", result.data.accessToken);
                    // Store User data
                    localStorage.setItem("user", JSON.stringify(result.data));

                    document.location.href = "/dashboard";
                    // navigate("/dashboard");
                }, 2000);
            } else {
                setLoading(false);
                setModalType("error");
                setModalMessage(result.message);
                setOpen(true);
            }
        } catch (error) {
            setLoading(false);
            setModalType("error");
            setModalMessage("An Error Occurred!");
            setOpen(true);
        }
    };

    return (
        <div className="page">
            <img className="login-illu" alt="Logo" src="illus/login.png" />
            <section>
                <h1 className="header">Sign Up</h1>
                <div className="inputCover">
                    <Box sx={{ display: "flex", alignItems: "flex-end" }}>
                        <PersonIcon
                            style={LockIconStyle}
                            sx={{ color: "action.active", mr: 1, my: 0.5 }}
                        />
                        <TextField
                            className="textInput"
                            onInput={(event) => {
                                setName(event.target.value);
                            }}
                            label="Name"
                            variant="standard"
                        />
                    </Box>
                    <br />
                    <Box sx={{ display: "flex", alignItems: "flex-end" }}>
                        <AccountCircle
                            sx={{ color: "action.active", mr: 1, my: 0.5 }}
                        />
                        <TextField
                            type="email"
                            className="textInput"
                            onInput={(event) => {
                                setEmail(event.target.value);
                            }}
                            label="Email ID"
                            variant="standard"
                        />
                    </Box>
                    <br />
                    <Box sx={{ display: "flex", alignItems: "flex-end" }}>
                        <LockIcon
                            style={LockIconStyle}
                            sx={{ color: "action.active", mr: 1, my: 0.5 }}
                        />
                        <TextField
                            type="password"
                            className="textInput"
                            onInput={(event) => {
                                setPassword(event.target.value);
                            }}
                            label="Password"
                            variant="standard"
                        />
                    </Box>
                    <LoadingButton
                        loading={isLoading}
                        onClick={onSubmit}
                        className="largeBtn loginBtn"
                        variant="contained"
                        color="success"
                        disableElevation
                    >
                        Continue
                    </LoadingButton>
                </div>
            </section>
            <p id="infoText" style={{ textAlign: "center" }}>
                Have an account?{" "}
                <Link style={linkStyles} to="/login" className="green">
                    Login
                </Link>
            </p>
            <footer>
                By clicking "Continue" you agree to Kluster's{" "}
                <font className="green">Terms and Condition</font>.
            </footer>
            <Snackbar
                onClose={handleClose}
                open={isOpen}
                autoHideDuration={6000}
            >
                <MuiAlert
                    onClose={handleClose}
                    elevation={6}
                    variant="filled"
                    severity={modalType}
                    sx={{ width: "100%" }}
                >
                    {modalMessage}
                </MuiAlert>
            </Snackbar>
        </div>
    );
}

export default SignUp;
