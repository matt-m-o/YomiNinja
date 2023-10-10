import { ReactNode, useEffect, useState } from 'react'
import CssBaseline from '@mui/material/CssBaseline';
import { styled, createTheme, ThemeProvider } from '@mui/material/styles';
import { AppBar, Drawer } from '../components/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Box from '@mui/material/Box';
import React from 'react';
import MenuIcon from '@mui/icons-material/Menu';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import Divider from '@mui/material/Divider';
import { ListItemIcon, ListItemText, SxProps, Tab, Tabs, Theme } from '@mui/material';
import TabContext from '@mui/lab/TabContext';
import TabPanel from'@mui/lab/TabPanel';
import TabList from '@mui/lab/TabList';
import { defaultTheme } from './Theme';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanelCustom(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`vertical-tabpanel-${index}`}
      aria-labelledby={`vertical-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `vertical-tab-${index}`,
    'aria-controls': `vertical-tabpanel-${index}`,
  };
}

export type LayoutProps = {
  contents: {

    tabLabel: {
      text: string,
      icon: JSX.Element,
    },
    tabContent: JSX.Element

  }[]
}

export default function Layout( { contents }: LayoutProps) {  

  const [ open, setOpen ] = useState(false);
  const toggleDrawer = () => {
    setOpen(!open);
  };

  // Tabs
  const [ activeTab, setActiveTab ] = React.useState('0');
  const handleChange = (event: React.SyntheticEvent, newValue: string) => {
    setActiveTab(newValue);
  };  

  const toolbarVariant = 'dense';
  const tabSx: SxProps<Theme> = {
    display: 'flex',
    alignItems: 'flex-start',
    width: 'max-content',
    minWidth: '-webkit-fill-available',
    overflow: 'hidden',
    paddingTop: '5px',
    paddingBottom: '5px'
  };

  const tabLabelStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center'
  }
  
  const tabLabelsComponents = contents.map( item => (
    <div style={tabLabelStyle}>
      <ListItemIcon sx={{ minWidth: '48px' }}>
        {item.tabLabel.icon}
      </ListItemIcon>
      <ListItemText primary={item.tabLabel.text} sx={{ paddingTop: '1px' }} />
    </div>
  ));

  return (
    <TabContext value={activeTab}>
      <Box sx={{ display: 'flex', height: '100vh' }}>
  
        <CssBaseline />
  
        <AppBar position="absolute" open={open}>
          <Toolbar variant={toolbarVariant}
            sx={{              
              pr: '24px', // keep right padding when drawer closed
              backgroundColor: (theme) =>
              theme.palette.mode === 'light'
                ? theme.palette.grey[100]
                : theme.palette.grey[1000],
                
            }}
          >
  
            <IconButton
              edge="start"
              color="inherit"
              aria-label="open drawer"
              onClick={toggleDrawer}
              sx={{
                marginRight: '36px',
                ...(open && { display: 'none' }),
              }}
            >
              <MenuIcon />
            </IconButton>
  
            <Typography
              component="h1"
              variant="h6"
              color="inherit"
              noWrap
              sx={{ flexGrow: 1 }}
            >
              { contents[activeTab].tabLabel.text }
            </Typography>
  
            {/* <IconButton color="inherit">
              <Badge badgeContent={6} color="secondary">
                <NotificationsIcon />
              </Badge>
            </IconButton> */}
  
          </Toolbar>
        </AppBar>
        
        <Drawer variant="permanent" open={open}>
          <Toolbar variant={toolbarVariant}
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              px: [1],              
            }}
          >
            <IconButton onClick={toggleDrawer}>
              <ChevronLeftIcon />
            </IconButton>
          </Toolbar>
          <Divider />          

          <TabList
            orientation="vertical"
            variant="standard"            
            onChange={handleChange}
            aria-label="Vertical tabs example"
            TabIndicatorProps={{
              sx: {
                width: 5,
                backgroundColor: defaultTheme.palette.action.active
              }
            }}
            sx={{
              borderRight: 1,
              borderColor: 'divider',
              "& button.Mui-selected": { backgroundColor: 'dimgray' }
            }}          
          >
            { tabLabelsComponents.map( ( component, idx ) => (
              <Tab label={component} {...a11yProps(0)} sx={tabSx} key={idx} value={idx.toString()}/>
            ))}
          </TabList>

        </Drawer>
        
        <Box
          component="main"
          sx={{
            backgroundColor: (theme) =>
              theme.palette.mode === 'light'
                ? theme.palette.grey[100]
                : theme.palette.grey[1000],
            flexGrow: 1,          
            height: '100vh',
            overflow: 'auto',
          }}
        >
          <Toolbar variant={toolbarVariant}/> {/* Just to make sure the content won't get covered by the actual toolbar  */}          

          { contents.map( ( { tabContent }, idx ) => (
            <TabPanel value={idx.toString()} key={idx}>
              {tabContent}              
            </TabPanel>
          ))}
          
        </Box>
      </Box>
    </TabContext>
  );
}
