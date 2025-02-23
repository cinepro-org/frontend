import React from "react";
import "../styles/HomePage.css";
import { Link } from "react-router-dom";

function HomePage() {
  return (
    <div className="homepage">
      <header className="header">
        <h1>Welcome to CinePro</h1>
      </header>
      <main className="main-content">
        <p>If you're looking for a movie, go to <Link to={"/movie"}><code>/movie/:movieID</code></Link></p>
      </main>
    </div>
  );
}

export default HomePage;