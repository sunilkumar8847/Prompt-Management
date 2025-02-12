import { Route, Routes } from 'react-router-dom';
import App from '../App';
import Home from '../pages/Home';
import FAQ from '../pages/FAQ';
import Settings from '../pages/Settings';
import NotFound from '../pages/NotFound';
import Login from '../pages/Login';
import Dashboard from '../pages/Dashboard';

const RouterProvider = () => {
  return (
    <Routes>
      <Route path='/'>
        <Route index element={<Login />} />
        <Route path='/' element={<App />}>
          <Route path='home' element={<Home />} />
          <Route path='dashboard' element={<Dashboard />} />
          <Route path='settings' element={<Settings />} />
          <Route path='faq' element={<FAQ />} />
          <Route path='*' element={<NotFound />} />
        </Route>
      </Route>
    </Routes>
  );
};

export default RouterProvider;
