import { Navigate, Outlet } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import Navbar from '../components/common/Navbar';

const PrivateRoute = () => {
  const { user } = useAuth();

  return !user?.name ? (
    <Navigate to='/' />
  ) : (
    <div className='bg-blue-100 min-h-screen'>
      <Navbar />
      <Outlet />
    </div>
  );
};

export default PrivateRoute;
