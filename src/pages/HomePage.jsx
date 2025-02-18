import React from "react";
import "./HomePage.css";

function HomePage() {
  return (
    <div className="homepage">
      <header className="header">
        <h1>Welcome to CinePro</h1>
      </header>
      <main className="main-content">
        <p>If you're looking for a movie, go to <code>/movie/:movieID</code></p>
      </main>
    </div>
  );
}

export default HomePage;