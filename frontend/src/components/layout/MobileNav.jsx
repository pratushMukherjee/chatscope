import { Link, useLocation } from 'react-router-dom';

const navItems = [
  {
    path: '/',
    label: 'Chat',
    icon: 'M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z',
  },
  {
    path: '/documents',
    label: 'Docs',
    icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
  },
  {
    path: '/templates',
    label: 'Templates',
    icon: 'M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z',
  },
];

export default function MobileNav() {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 flex items-center justify-around py-2 px-4 lg:hidden z-10">
      {navItems.map((item) => {
        const isActive =
          item.path === '/'
            ? location.pathname === '/' || location.pathname.startsWith('/c/')
            : location.pathname === item.path;
        return (
          <Link
            key={item.path}
            to={item.path}
            className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg transition-colors ${
              isActive
                ? 'text-primary-600'
                : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={item.icon} />
            </svg>
            <span className="text-[10px] font-medium">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
