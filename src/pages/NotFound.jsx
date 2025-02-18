import React from "react";
import "../styles/NotFound.css";

function NotFound() {
  return (
    <div className="not-found">
      <h1>404 - Page Not Found</h1>
      <p>Sorry, the page you are looking for does not exist.</p>
      <p>Go back to the <a href="/">homepage</a></p>
    </div>
  );
}

export default NotFound;