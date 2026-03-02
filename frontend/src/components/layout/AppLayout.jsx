import { Outlet } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';
import MobileNav from './MobileNav';

export default function AppLayout() {
  return (
    <div className="h-screen flex overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        <main className="flex-1 overflow-y-auto pb-14 lg:pb-0">
          <Outlet />
        </main>
        <MobileNav />
      </div>
    </div>
  );
}
