import NotificationsIcon from '@mui/icons-material/Notifications';
import { IconButton } from '@mui/material';

const NotificationBell = ({ onClick }: { onClick?: () => void }) => (
  <IconButton onClick={onClick} color="inherit">
    <NotificationsIcon />
  </IconButton>
);

export default NotificationBell; 