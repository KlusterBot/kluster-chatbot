import * as React from 'react';
import { alpha, styled } from '@mui/material/styles';
import Switch from '@mui/material/Switch';
import { green } from '@mui/material/colors';

const BotSwitch = styled(Switch)(({ theme }) => ({
  '& .MuiSwitch-switchBase.Mui-checked': {
    color: "var(--theme)",
    '&:hover': {
      backgroundColor: alpha(green[500], theme.palette.action.hoverOpacity),
    },
  },
  '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
    backgroundColor: "var(--theme)",
  },
}));

export default BotSwitch;