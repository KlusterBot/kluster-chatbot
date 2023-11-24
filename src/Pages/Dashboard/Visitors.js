import * as React from 'react';
import './Dashboard.css';
import { green,red,blue,purple,orange } from '@mui/material/colors';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import IconButton from '@mui/material/IconButton';
import Icon from '@mui/material/Icon';
import Box from '@mui/material/Box';
import AccountCircle from '@mui/icons-material/AccountCircle';
import LockIcon from '@material-ui/icons/Lock';
import BatteryFullIcon from '@material-ui/icons/BatteryFull';
import DevicesIcon from '@material-ui/icons/Devices';
import LanguageIcon from '@material-ui/icons/Language';
import NetworkCellIcon from '@material-ui/icons/NetworkCell';
import ArrowDownwardIcon from '@material-ui/icons/ArrowDownward';
import EditIcon from '@material-ui/icons/Edit';
import {Link} from 'react-router-dom';
import {useState, useEffect} from 'react';
import LoadingButton from '@mui/lab/LoadingButton';
import {useParams, useLocation, useNavigate} from 'react-router-dom';
import req from '../../fetch.js';
import {api} from '../../config.js';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert, { AlertProps } from '@mui/material/Alert';
import PersistentDrawerLeft from '../../Components/Menu';
import Paper from '@mui/material/Paper';
import Badge from '@mui/material/Badge';
import Skeleton from '@mui/material/Skeleton';
import Grid from '@mui/material/Grid';
import {io} from 'socket.io-client';
import Stack from '@mui/material/Stack';
import CircularProgress from '@mui/material/CircularProgress';


function Track(props) {
  const params = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const socket = props.socket;
  
  const LockIconStyle = {
    color: 'grey',
    marginRight: '10px'
  }
  const linkStyles = {
    textDecoration: "none"
  }

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setLoading] = useState(false);
  const [isOpen, setOpen] = useState(false);
  const [modalType, setModalType] = useState("success");
  const [modalMessage, setModalMessage] = useState("");
  const [visitors, setVisitors] = useState([]);
  const [visitor, setVisitor] = useState({});
  const [battery, setBattery] = useState(null);
  const [device, setDevice] = useState(null);
  const [browser, setBrowser] = useState(null);
  const [network, setNetwork] = useState(null);
  const [url, setUrl] = useState("");
  const [country, setCountry] = useState(null);
  const [screenshot, setScreenshot] = useState(null);
  let isConnected = false;

  useEffect(() => {
      const token = localStorage.getItem("token");
      if(token){
          if(params.id){
              // Clear All States
              setUrl(null);
              setBattery(null);
              setNetwork(null);
              setDevice(null);
              setBrowser(null);
              setVisitor({});
              (async () => {
                  try {
                  const response = await req(api + "/api/visitor/" + params.id);
                  const result = await response.json();
                  
                  if(result.success){
                    if(Object.entries(result.data).length == 0){
                        document.location.href = "/visitors";
                    }
                    setVisitor(result.data);
                  }else{
                    setModalMessage(result.message);
                    setModalType("error");
                    setOpen(true);
                  }
                } catch (error) {
                    setModalMessage(error.message);
                    setModalType("error");
                    setOpen(true);
                }
              })();
          }else{
              (async () => {
                  try {
                  const response = await req(api + "/api/visitor/all");
                  const result = await response.json();
                  
                  if(result.success){
                    setVisitors(result.data);
                    console.log(result.data);
                  }else{
                    setModalMessage(result.message);
                    setModalType("error");
                    setOpen(true);
                  }
                } catch (error) {
                    setModalMessage(error.message);
                    setModalType("error");
                    setOpen(true);
                }
              })();
          }
      }

      socket.emit("callInfo", {
          'type': 'deviceInfo',
          'id': params.id,
      });
  },[params.id]);

  useEffect(() => {
      socket.on("info", function(obj){
          if(params.id != obj.id){
              // setUrl(null);
              // setBattery(null);
              // setNetwork(null);
              // setDevice(null);
              // setBrowser(null);
              return;
          }
          // socket.emit("screenshot",params.id);
          setUrl(obj.data.url);
          setBattery(obj.data.battery || {});
          setNetwork(obj.data.network || "");
          setDevice((obj.data.os.name || "") + " " + (obj.data.os.version || ""));
          setBrowser((obj.data.browser.name || "") + " v" + (obj.data.browser.version || ""));
          if(visitor.status && visitor.status !== "online"){
              setVisitor({...visitor, status: "online"});
          }
      })

      socket.on("ipinfo", function(obj){
          if(params.id !== obj.id){
              // setCountry(null);
              return;
          }
          setCountry(obj.data.country.toLowerCase());
      })

      socket.on("offline", function(obj){
          if(obj.id !== params.id){
              return;
          }
          if(visitor.status && visitor.status !== "offline"){
              setVisitor({...visitor, status: "offline"});
          }
      })

      socket.on("screenshot", function(obj){
          // setScreenshot(visitor);
          console.log("Screenshot",obj);
      })
  },[]);

  const handleClose = (event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }

    setOpen(false);
  };

  const onLogin = async () => {
      setLoading(true);
      console.log(email,password);
      try {
        const response = await req(api + "/api/auth/login", {
          method: "POST",
          body: JSON.stringify({
            email,
            password
          })
        })
        const result = await response.json();

        if(result.success){
          setLoading(false);
          setModalType("success");
          setModalMessage(result.message);
          setOpen(true);

          // Store Token to localstorage
          localStorage.setItem("token",result.data.accessToken);

          if(!result.data.verified){
              localStorage.setItem("email",result.data.email);
              document.location.href = "/email";
          }else{
              document.location.href = "/dashboard";
          }
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

const allUsers = () => {
    return (
    <div className="page">
      <PersistentDrawerLeft title="Visitors"/>
      <div className="pagebody">
        <div>
          {visitors.map((visitor,index) => (
              <Paper variant="outlined" className="visitor" key={index}>
                  <Link to={"/visitors/" + visitor.visitor_id}>
                    <Badge badgeContent=" " color={visitor.status == "offline" ? "error" : "success"} anchorOrigin={{
                      vertical: 'bottom',
                      horizontal: 'right',
                    }}>
                     <Avatar className="visitor-img"
                      alt={visitor.name}
                      src={"https://api.dicebear.com/7.x/initials/svg?seed=" + visitor.name}
                      sx={{ width: 50, height: 50, bgcolor: green[100] }}
                    />
                    </Badge>
                    <div className="flex">
                      <span><b>{visitor.name}</b></span>
                      <span>{visitor.email}</span>
                    </div>
                  </Link>
                  <Link className="editBtn" to={"/edit/" + visitor.visitor_id}>
                      <Avatar
                      sx={{ width: 50, height: 50, bgcolor: green[500] }}
                      variant="rounded"
                      onClick={() => {editVisitor(visitor.visitor_id)}}
                      >
                          <EditIcon/>
                     </Avatar>
                </Link>
            </Paper>
          ))}
          {visitors.length == 0 ? noVisitors() : ""}
        </div>
      </div>
      <Snackbar onClose={handleClose} open={isOpen} autoHideDuration={6000}>
        <MuiAlert onClose={handleClose} elevation={6} variant="filled" severity={modalType} sx={{ width: '100%' }}>
          {modalMessage}
        </MuiAlert>
      </Snackbar>
    </div>
  );
}

const editVisitor = (id) => {
    console.log("Editing " + id);
}

const noVisitors = () => {
    return (
        <Paper className="visitor" variant="outlined">
          You have no visitors yet!
        </Paper>
    )
}

const trackUser = (id) => {
    return (
    <div className="page">
      {Object.entries(visitor).length !== 0 ? (<Paper className="visitor" variant="outlined">
          <Badge badgeContent=" " color={visitor.status == "offline" ? "error" : "success"} anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right',
          }}>
           <Avatar className="visitor-img"
            alt={visitor.name}
            src={"https://api.dicebear.com/7.x/initials/svg?seed=" + visitor.name}
            sx={{ width: 50, height: 50, bgcolor: green[100] }}
          />
          </Badge>
          <div className="flex">
            <span><b>{visitor.name}</b> <span className={country !== null ? ("fi fi-" + country) : ""}></span></span>
            <span>{url}</span>
          </div>
      </Paper>) : 
      (<Paper className="visitor" variant="outlined">
          <Skeleton variant="circular" width={50} height={50} />
          <div className="flex">
              <Skeleton variant="text" sx={{ fontSize: '1.5rem' }} width={200} />
              <Skeleton variant="text" sx={{ fontSize: '1rem' }} width={100} />
          </div>
      </Paper>) }
      
      <Grid container className="spacey">
      {battery !== null ? (<Paper className="visitor-info" variant="outlined">
           <Avatar className="visitor-img"
            sx={{ width: 50, height: 50, bgcolor: blue[100] }}
            variant="rounded"
            >
                <BatteryFullIcon/>
           </Avatar>
          <div className="flex">
            <span><b>Battery</b></span>
            <span>{battery}%</span>
          </div>
      </Paper>) : 
      (<Paper className="visitor-info" variant="outlined">
           <Avatar className="visitor-img"
            sx={{ width: 50, height: 50, bgcolor: blue[100] }}
            variant="rounded"
            >
                <BatteryFullIcon/>
           </Avatar>
          <div className="flex">
            <span><b>Battery</b></span>
            <span><Skeleton variant="text" sx={{ fontSize: '1rem' }} width={30} height={30} /></span>
          </div>
      </Paper>) }
      
      {device !== null ? (<Paper className="visitor-info" variant="outlined">
           <Avatar className="visitor-img"
            sx={{ width: 50, height: 50, bgcolor: orange[100] }}
            variant="rounded"
            >
                <DevicesIcon/>
           </Avatar>
          <div className="flex">
            <span><b>Device</b></span>
            <span>{device}</span>
          </div>
      </Paper>) : 
      (<Paper className="visitor-info" variant="outlined">
           <Avatar className="visitor-img"
            sx={{ width: 50, height: 50, bgcolor: orange[100] }}
            variant="rounded"
            >
                <DevicesIcon/>
           </Avatar>
          <div className="flex">
            <span><b>Device</b></span>
            <span><Skeleton variant="text" sx={{ fontSize: '1rem' }} width={50} height={30} /></span>
          </div>
      </Paper>) }
      </Grid>

      <Grid container className="spacey">
      {browser !== null ? (<Paper className="visitor-info" variant="outlined">
           <Avatar className="visitor-img"
            sx={{ width: 50, height: 50, bgcolor: purple[100] }}
            variant="rounded"
            >
                <LanguageIcon/>
           </Avatar>
          <div className="flex">
            <span><b>Browser</b></span>
            <span>{browser}</span>
          </div>
      </Paper>) : 
      (<Paper className="visitor-info" variant="outlined">
           <Avatar className="visitor-img"
            sx={{ width: 50, height: 50, bgcolor: purple[100] }}
            variant="rounded"
            >
                <LanguageIcon/>
           </Avatar>
          <div className="flex">
            <span><b>Browser</b></span>
            <span><Skeleton variant="text" sx={{ fontSize: '1rem' }} width={70} height={30} /></span>
          </div>
      </Paper>) }

        {network !== null ? (<Paper className="visitor-info" variant="outlined">
           <Avatar className="visitor-img"
            sx={{ width: 50, height: 50, bgcolor: red[100] }}
            variant="rounded"
            >
                <NetworkCellIcon/>
           </Avatar>
          <div className="flex">
            <span><b>Network</b></span>
            <span>{network?.toUpperCase() || "Unknown"}</span>
          </div>
      </Paper>) : 
      (<Paper className="visitor-info" variant="outlined">
           <Avatar className="visitor-img"
            sx={{ width: 50, height: 50, bgcolor: red[100] }}
            variant="rounded"
            >
                <NetworkCellIcon/>
           </Avatar>
          <div className="flex">
            <span><b>Network</b></span>
            <span><Skeleton variant="text" sx={{ fontSize: '1rem' }} width={30} height={30} /></span>
          </div>
      </Paper>) }
      </Grid>

      <Grid container>
          <Paper className="visitor-info stack" variant="outlined">
            {screenshot !== null ? (<img src={screenshot} alt="Screenshot" />) : (<Stack sx={{ color: green[500] }} spacing={2} direction="row">
              <CircularProgress color="inherit" />
            </Stack>)}
          </Paper>
      </Grid>

      <Grid container>
          {network !== null ? (<Paper className="visitor-info stack" variant="outlined">
             <Avatar className="visitor-img"
              sx={{ width: 40, height: 40, bgcolor: green[500] }}
              variant="circular"
              >
                  <ArrowDownwardIcon sx={{ width: 20, height: 20 }}/>
             </Avatar>
            <div className="stack">
              <span><b>Network</b></span>
              <span>{network.toUpperCase() || "Unknown"}</span>
            </div>
        </Paper>) : 
        (<Paper className="visitor-info stack" variant="outlined">
             <Avatar className="visitor-img"
              sx={{ width: 50, height: 50, bgcolor: red[100] }}
              variant="circular"
              >
                  <NetworkCellIcon/>
             </Avatar>
            <div className="flex">
              <span><b>Network</b></span>
              <span><Skeleton variant="text" sx={{ fontSize: '1rem' }} width={30} height={30} /></span>
            </div>
        </Paper>) }
      </Grid>
      
      <Snackbar onClose={handleClose} open={isOpen} autoHideDuration={6000}>
        <MuiAlert onClose={handleClose} elevation={6} variant="filled" severity={modalType} sx={{ width: '100%' }}>
          {modalMessage}
        </MuiAlert>
      </Snackbar>
    </div>
  );
}

if(params.id){
    return trackUser(params.id);
}else{
  return allUsers();
}
  
}



export default Track;
