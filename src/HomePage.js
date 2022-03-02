import React from "react";
import { Link } from "react-router-dom";

function HomePage() {
  return (
    <div className=" grid gap-4 justify-items-center mt-32">
      <Link
        className="stashes bg-green-500 hover:bg-green-700 px-5 py-2 rounded-full bg-[url(img/radar.svg)] h-56 w-56"
        to="/stashes"
      ></Link>
      <Link
        className="location bg-red-500 hover:bg-red-700 px-5 py-2 bg-[url(img/mark.svg)] rounded-full w-20 h-8"
        to="/add-stash"
      ></Link>
    </div>
  );
}

export default HomePage;
