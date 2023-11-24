import * as React from 'react';
import './App.css';
import { green } from '@mui/material/colors';
import Avatar from '@mui/material/Avatar';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';
import EditIcon from '@mui/icons-material/Edit';
import Box from '@mui/material/Box';
import Input from '@mui/material/Input';
import InputLabel from '@mui/material/InputLabel';
import InputAdornment from '@mui/material/InputAdornment';
import FormControl from '@mui/material/FormControl';
import TextField from '@mui/material/TextField';
import AccountCircle from '@mui/icons-material/AccountCircle';
import PublicIcon from '@mui/icons-material/Public';
import PhoneIcon from '@mui/icons-material/Phone';
import ColorLensIcon from '@mui/icons-material/ColorLens';
import LoadingButton from '@mui/lab/LoadingButton';
import Switch from '@mui/material/Switch';
import {Link} from 'react-router-dom';
import {useState, useEffect} from 'react';
import req from '../fetch.js';
import {api} from '../config.js';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert, { AlertProps } from '@mui/material/Alert';
import PersistentDrawerLeft from '../Components/Menu';
import {Loader1} from './Loader.js';


function Profile() {
  const [loaderState, setLoaderState] = useState("none");
  const [user, setUser] = useState(null);

  const [name, setName] = useState("");
  const [website, setWebsite] = useState("");
  const [callable, setCallable] = useState("");
  const [about, setAbout] = useState("");
  const [theme, setTheme] = useState("");
  const [logo, setLogo] = useState("");
  const [botToken, setBotToken] = useState("");
  
  
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

  const onSave = async () => {
      setLoading(true);
      try {
        const response = await req(api + "/api/me/update/", {
          method: "POST",
          body: JSON.stringify({
              name,
              website,
              about,
              callable,
              theme
          })
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
        setModalMessage(error.message);
        setOpen(true);
      }
  }

  useEffect(function(){
        (async () => {
            try {
              const response = await req(api + "/api/me");
              const result = await response.json();

              if(result.success){
                  console.log(result.data);
                  setUser(result.data);
                  let user = result.data;

                  setName(user.company);
                  setWebsite(user.website);
                  setAbout(user.about);
                  setCallable(user.callable);
                  setTheme(user.theme);
                  setLogo(user.logo);
                  setBotToken(user.token);
              }
            }catch(e){
              setLoading(false);
              setModalType("error");
              setModalMessage(e.message);
              setOpen(true);
            }
        })();
  },[]);

  useEffect(() => {
    setTimeout(() => {
        setOpen(false);
    },5000);
  }, [isOpen])

  const handleSwitchChange = (value) => {
      setCallable(value == true ? "true" : "false");
  }

  const uploadFile = () => {
      let file = document.createElement("input");
      file.type = "file";
      file.onchange = async () => {
          if(file.files[0]){
              let photo = file.files[0]
              let formData = new FormData();
     
              formData.append("logo", photo);
              const token = localStorage.getItem("token") || "";
              try {
                  let response = await fetch(api + '/api/upload', { method: "POST", body: formData, headers: {"Authorization": "Bearer " + token} });
                  let result = await response.json();

                  setLogo(result.data.filename + "?cache=" + Math.random());
                  setLoading(false);
                  setModalType("success");
                  setModalMessage(result.message);
                  setOpen(true);
              } catch (error) {
                  setLoading(false);
                  setModalType("error");
                  setModalMessage(error.message);
                  setOpen(true);
              }
          }else{
              console.log(file.files);
          }
      }
      file.click();
  }
  
  return (
    <div className="page">
      <Loader1 style={loaderStyles}/>
      <PersistentDrawerLeft/>
      <br/>
      <br/>

      <div id="body">
        <Paper elevation={2} sx={{margin:"10px", padding: "10px", display: "flex"}}>
          <Grid container spacing={2} direction="row" justifyContent="flex-start" alignItems="center">  
            <Grid>
              <Avatar onClick={uploadFile} src={api + "/logo/" + logo || ""} id="companyLogo" sx={{width: 120, height: 120, bgcolor: "#CFCFCF", padding: "10px", margin: "10px", marginTop: "25px", marginLeft: "20px"}}/>
            </Grid>
            <Grid item xs={6}>
              <h3>{name || ""}</h3>
              <p>{user?.name || ""}</p>
            </Grid>
          </Grid>
        </Paper>
        <Paper elevation={2} sx={{margin:"10px", padding: "10px"}}>
          <center className="inputCover" style={{ marginBottom: "10px"}}>
            <h2>Update Info</h2>
            <Box sx={{ display: 'flex', alignItems: 'flex-end' }}>
              <AccountCircle sx={{ color: 'action.active', mr: 1, my: 0.5 }} />
              <TextField value={name} className="textInput" onChange={(event) => {setName(event.target.value)}} label="Company Name" variant="standard" />
            </Box>
            <br/>
            <Box sx={{ display: 'flex', alignItems: 'flex-end' }}>
              <PublicIcon sx={{ color: 'action.active', mr: 1, my: 0.5 }} />
              <TextField value={website} className="textInput" onChange={(event) => {setWebsite(event.target.value)}} label="Company Website" variant="standard" />
            </Box>
            <br/>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <PhoneIcon sx={{ color: 'action.active', mr: 1, my: 0.5 }} />
              <label>Visitors can call</label>
              <Switch checked={callable == "true" ? true : false} onChange={(event) => {handleSwitchChange(event.target.checked)}}/>
            </Box>
            <br/>
            <TextField
                id="outlined-multiline-static"
                label="About Company"
                multiline
                rows={4}
                onChange={(event) => {setAbout(event.target.value)}}
                value={about}
              />
            <br/>
            <TextField
              id="outlined-read-only-input"
              label="Bot Token"
              value={botToken}
              InputProps={{
                readOnly: true,
              }}
              onClick={(e) => { e.target.select()}}
            />
            <br/>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: "space-between" }}>
                <b style={{ display: "flex"}}><ColorLensIcon sx={{ color: 'action.active', mr:1 }}/> {theme}</b>
                <Input id="colorSelector" type="color" value={theme} onChange={(event) => {setTheme(event.target.value)}} style={{width: "50%"}} />
            </Box>
            <br/>
            <LoadingButton loading={isLoading} onClick={onSave} className="largeBtn loginBtn" variant="contained" color="success" disableElevation>
              Save
            </LoadingButton>
          </center>
        </Paper>
      </div>
      
      <Snackbar onClose={handleClose} open={isOpen} autoHideDuration={6000}>
        <MuiAlert onClose={handleClose} elevation={6} variant="filled" severity={modalType} sx={{ width: '100%' }}>
          {modalMessage}
        </MuiAlert>
      </Snackbar>
    </div>
  );
}


export default Profile;
