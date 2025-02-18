import "./styles/App.css";

import * as React from "react";
import * as ReactDOM from "react-dom";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

import Homepage from "./pages/HomePage";
import Movie from "./pages/Movie";
import WatchMovie from "./pages/WatchMovie";
import NotFound from "./pages/NotFound";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Homepage />,
  },
  {
    path: "/movie",
    element: <Movie />,
  },
  {
    path: "/movie/:movieId",
    element: <WatchMovie />,
  },
  {
    path: "*",
    element: <NotFound />,
  }
]);

function App() {
  return (
    <div className="App">
      <RouterProvider router={router} />
    </div>
  );
}

export default App;
