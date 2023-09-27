import MuiAppBar, { AppBarProps as MuiAppBarProps,  } from '@mui/material/AppBar';
import { styled, createTheme, ThemeProvider } from '@mui/material/styles';
import MuiDrawer from '@mui/material/Drawer';


const drawerWidth: number = 180;


interface AppBarProps extends MuiAppBarProps {
  open?: boolean;
}

export const AppBar = styled( 
  MuiAppBar,
  { shouldForwardProp: (prop) => prop !== 'open' }
)<AppBarProps>( ({ theme, open }) => ({
    
  zIndex: theme.zIndex.drawer + 1,
  transition: theme.transitions.create(
    ['width', 'margin'],
    {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
    }
  ),
  ...( open && {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(
      ['width', 'margin'],
      {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.enteringScreen,
      }
    ),
  }),
}));


export const Drawer = styled(
  MuiDrawer, 
  { shouldForwardProp: (prop) => prop !== 'open' }
)(
  ({ theme, open }) => ({
    '& .MuiDrawer-paper': {
      position: 'relative',
      whiteSpace: 'nowrap',
      width: drawerWidth,
      transition: theme.transitions.create(
        'width',
        {
          easing: theme.transitions.easing.sharp,
          duration: theme.transitions.duration.enteringScreen,
        }
      ),
      boxSizing: 'border-box',
      ...( !open && {
          overflowX: 'hidden',
          transition: theme.transitions.create(
              'width',
              {
                  easing: theme.transitions.easing.sharp,
                  duration: theme.transitions.duration.leavingScreen,
              }
          ),
          width: theme.spacing(7),
          [theme.breakpoints.up('sm')]: {
              width: theme.spacing(8),
          },
      }),
    },
  }),
);