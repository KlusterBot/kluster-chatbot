import * as React from 'react';
import './App.css';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import {useEffect, useState} from 'react'

function Loader(props) {
    return (
    <div className="loader" style={props.style}>
        <Box sx={{ display: 'flex' }}>
          <CircularProgress color="success" />
        </Box>
    </div>
  );
}

function Loader1(props) {
    return (
    <div className="loader1" style={props.style}>
        <Box sx={{ display: 'flex' }}>
          <CircularProgress color="success" />
        </Box>
    </div>
  );
}

export {Loader,Loader1};