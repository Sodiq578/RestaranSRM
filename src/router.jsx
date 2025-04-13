import { createBrowserRouter } from 'react-router-dom';
import App from './App';
import Dashboard from './pages/Dashboard';
import Orders from './pages/Orders';
import Menu from './pages/Menu';
import ReportsPage from './pages/ReportsPage';
import Payments from './pages/Payments';
import QRClientMenu from './pages/QRClientMenu';
import Settings from './pages/Settings';

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { path: 'dashboard', element: <Dashboard /> },
      { path: 'orders', element: <Orders /> },
      { path: 'menu', element: <Menu /> },
      { path: 'reports', element: <ReportsPage /> },
      { path: 'payments', element: <Payments /> },
      { path: 'qr-menu', element: <QRClientMenu /> },
      { path: 'settings', element: <Settings /> },
    ],
  },
]);

export default router;