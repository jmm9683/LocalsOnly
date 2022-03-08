import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMapLocationDot } from "@fortawesome/free-solid-svg-icons";
import { Link } from "react-router-dom";

function HomePage() {
  return (
    <div className=" grid gap-4 justify-items-center">
      <Link
        className="stashes bg-green-500 hover:bg-green-700 px-5 py-2 rounded-full bg-[url(img/radar.svg)] h-56 w-56"
        to="/stashes"
      ></Link>
      <Link
        className="location bg-red-500 hover:bg-red-700 px-5 py-1 rounded-full w-20 h-8 text-center"
        to="/add-stash"
      >
        <FontAwesomeIcon icon={faMapLocationDot} className="fa-lg" />
      </Link>
    </div>
  );
}

export default HomePage;
