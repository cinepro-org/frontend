import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Search, TvMinimal, Compass, Library, Cog, Armchair, Popcorn, Cat } from 'lucide-react';

// Defines the items that will appear in the sidebar
const sidebarItems = [
  // { label: 'Search', icon: Search, route: '/search' },
  { label: 'Home', icon: Armchair, route: '/' },
  { label: 'Anime', icon: Cat, route: '/anime' },
  { label: 'Movies', icon: Popcorn, route: '/movies' },
  { label: 'Shows', icon: TvMinimal, route: '/shows' },
  { label: 'Discover', icon: Compass, route: '/discover' },
  { label: 'Library', icon: Library, route: '/library' },
  // { label: 'Settings', icon: Cog, route: '/settings' },
];

/**
 * Main Sidebar component that displays navigation links.
 * It's fixed on the left and provides tooltips on hover for each item.
 */
export default function Sidebar() {
  return (
    <div className="relative z-0">
      {/*
        The main sidebar container.
        It's fixed to the left, takes full screen height, and has a fixed width.
        Icons are centered vertically and horizontally.
      */}
      <div
        className={`
          fixed left-0 top-0 bottom-0 z-50 w-15  h-screen flex gap-3 flex-col items-center justify-center px-2
          transition-all duration-300 ease-in-out rounded-r-lg
        `}
      >
       
        {sidebarItems.map((item, index) => (
          <SidebarItem
            key={index}
            label={item.label}
            Icon={item.icon}
            route={item.route}
          />
        ))}
      </div>
    </div>
  );
}

/**
 * Individual item component for the Sidebar.
 * Displays an icon and shows a tooltip with the label on hover.
 */
function SidebarItem({ label, Icon, route }) {
  const navigate = useNavigate(); // Hook to programmatically navigate
  const location = useLocation(); // Hook to get current URL location
  const isActive = location.pathname === route; // Checks if the current item's route matches the current URL

  return (
    <div
      className={`
        flex w-full h-12 p-3 mb-1 rounded-lg transition-all duration-200 relative group cursor-pointer
        flex-col items-center justify-center // Ensures icons are centered when sidebar is compact
        ${isActive ? 'bg-gray-100/10 scale-105 text-white' : 'bg-transparent hover:bg-gray-700/50'}
      `}
      onClick={() => navigate(route)} // Navigates to the item's route when clicked
    >
      <Icon
        className={`
          w-6 h-6 transition-colors duration-200
          ${isActive ? 'stroke-gray-500 text-white' : 'stroke-white text-white'}
        `}
        strokeWidth={isActive ? 2 : 1.5} // Sets a thicker stroke for the active icon
      />

      {/*
        Tooltip that displays the item's label on hover.
        It's positioned to the right of the icon and styled to appear as a small speech bubble.
      */}
      <span
        className={`
          absolute -left-9.5 ml-5  px-2 py-3 w-20 h-6 flex items-center justify-center text-white text-xs  rounded whitespace-nowrap
          opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none
          -bottom-9 -translate-y-1/2 z-99999
          // Styles for the tooltip arrow
          before:content-[''] before:absolute before:right-full before:top-1/2 before:-translate-y-1/2
          before:border-8 before:border-y-transparent before:border-l-transparent before:border-r-white
        `}
      >
        {label}
      </span>

      
      {isActive && (
        <span className="absolute top-3 left-0 top-0 h-1/2 w-1 bg-red-500 rounded-lg"></span>
      )}
    </div>
  );
}
