import * as React from 'react';
import './App.css';
import { green } from '@mui/material/colors';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import IconButton from '@mui/material/IconButton';
import Icon from '@mui/material/Icon';
import Box from '@mui/material/Box';
import Input from '@mui/material/Input';
import InputLabel from '@mui/material/InputLabel';
import InputAdornment from '@mui/material/InputAdornment';
import FormControl from '@mui/material/FormControl';
import TextField from '@mui/material/TextField';
import AccountCircle from '@mui/icons-material/AccountCircle';
import LockIcon from '@material-ui/icons/Lock';
import {Link} from 'react-router-dom';
import {useState, useEffect} from 'react';
import LoadingButton from '@mui/lab/LoadingButton';
import req from '../fetch.js';
import {api} from '../config.js';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert, { AlertProps } from '@mui/material/Alert';
import PersistentDrawerLeft from '../Components/Menu';
import {Loader1} from './Loader.js';
import {FundWidget} from '../Components/Head'


function Fund() {
  const [loaderState, setLoaderState] = useState("none");
  
  let loaderStyles = {
      display: loaderState,
  }

  useEffect(() => {
      const token = localStorage.getItem("token");
      if(token){
          setLoaderState("flex");
          (async () => {
              try {
              const response = await req(api + "/api/auth/validate", {
                method: "POST",
                body: JSON.stringify({})
              })
              const result = await response.json();
              
              if(result.success){
                if(!result.data.verified){
                    localStorage.setItem("email",result.data.email);
                    document.location.href = "/email";
                }else{
                    localStorage.setItem("user",JSON.stringify(result.data));
                    setLoaderState("none");
                }
              }else{
                document.location.href = "/login";
              }
            } catch (error) {
                
            }
          })();
      }else{
        document.location.href = "/login";
      }
  },[]);
  
  const LockIconStyle = {
    color: 'grey',
    marginRight: '10px'
  }
  const linkStyles = {
    textDecoration: "none"
  }

  const [isLoading, setLoading] = useState(false);
  const [isOpen, setOpen] = useState(false);
  const [modalType, setModalType] = useState("success");
  const [modalMessage, setModalMessage] = useState("");

  const handleClose = (event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }

    setOpen(false);
  };

  const onResend = async () => {
      setLoading(true);
      try {
        const response = await req(api + "/api/auth/email", {
          method: "POST",
          body: JSON.stringify({})
        })
        const result = await response.json();

        if(result.success){
          setLoading(false);
          setModalType("success");
          setModalMessage(result.message);
          setOpen(true);

        }else{
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
  }
  
  return (
    <div className="page">
      <Loader1 style={loaderStyles}/>
      <PersistentDrawerLeft/>
      <br/>
      <br/>

      <div id="home_body">
          <FundWidget/>
      </div>
      
      <Snackbar onClose={handleClose} open={isOpen} autoHideDuration={6000}>
        <MuiAlert onClose={handleClose} elevation={6} variant="filled" severity={modalType} sx={{ width: '100%' }}>
          {modalMessage}
        </MuiAlert>
      </Snackbar>
    </div>
  );
}


export default Fund;
