import React from "react";
import { Link } from "react-router-dom";

function HomePage() {
  return (
    <>
      <h1>Don't you know how to use this?</h1>
      <Link to={"/movies"}></Link>
      <p>I you're looking for a movie, go to /movie/:movieID</p>
    </>
  );
}

export default HomePage;
