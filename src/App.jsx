import "./styles/App.css";

import "react";
import { createBrowserRouter, RouterProvider , Outlet } from "react-router-dom";

import Homepage from "./pages/HomePage";
import Movie from "./pages/Movie";
import WatchMovie from "./pages/WatchMovie";
import NotFound from "./pages/NotFound";
import Sidebar from "./components/ui/sidebar/Sidebar";
import PlayerPage from "./pages/PlayerPage";
import DetailsPage from "./pages/DetailsPage";


const MainLayout = () => {
  return (
    <div style={{ display: 'flex' }}>
      
      <Sidebar />
      <div style={{ flex: 1 }}>
        <Outlet /> {/* This is where the page content will be rendered */}
      </div>
    </div>
  );
};



const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    children: [
      {
        index: true,
        element: <Homepage />,
      },
      {
    path: "/movie",
    element: <Movie />,
  },
  {
    path: "/:title/details/:id",
    element: <DetailsPage />,
  },
  {
    path: "/movie/:movieId",
    element: <WatchMovie />,
  },
  {
    path: "/stream/:title/:id",
    element: <PlayerPage />,
  },
  {
    path: "/stream/:title/:id/:season/:episode",
    element: <PlayerPage />,
  },
  {
    path: "*",
    element: <NotFound />,
  }
      // ... other routes
    ],
  },
]);

const App = () => {
  return <RouterProvider router={router} />;
};

export default App;
