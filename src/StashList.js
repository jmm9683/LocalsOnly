import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

import { firebaseAuth, firestore } from "./Firebase.js";

const geofire = require("geofire-common");

function StashList({ search }) {
  const [position, setPosition] = useState("");
  const [positionHash, setPositionHash] = useState("");

  //QUERYING
  const [range, setRange] = useState(16.0934);
  const [query, setQuery] = useState(search);
  const [getCoords, setGetCoords] = useState(false);
  const [stashes, setStashes] = useState([]);
  useEffect(() => {
    if (query) {
      getCurrentPositionQuery();
    }
  }, [query]);
  useEffect(() => {
    if (getCoords) {
      stashQuery();
    }
  }, [getCoords]);

  function getCurrentPositionQuery() {
    navigator.geolocation.getCurrentPosition(
      function (position) {
        setPosition(position);
        setPositionHash(
          geofire.geohashForLocation([
            position.coords.latitude,
            position.coords.longitude,
          ])
        );
        setGetCoords(true);
      },
      function (error) {
        console.error("Error Code = " + error.code + " - " + error.message);
        return error;
      }
    );
  }

  const stashQuery = async (e) => {
    const { uid } = firebaseAuth.currentUser;
    const userStashes = firestore
      .collection("stashes")
      .doc(uid)
      .collection("stashes");
    // Find Stasthes within 10mi (16.0934km)
    const center = [position.coords.latitude, position.coords.longitude];
    const radiusInM = range * 1000;

    // Each item in 'bounds' represents a startAt/endAt pair. We have to issue
    // a separate query for each pair. There can be up to 9 pairs of bounds
    // depending on overlap, but in most cases there are 4.
    const bounds = geofire.geohashQueryBounds(center, radiusInM);
    const promises = [];
    for (const b of bounds) {
      const q = userStashes.orderBy("positionHash").startAt(b[0]).endAt(b[1]);
      promises.push(q.get());
    }
    // Collect all the query results together into a single list
    Promise.all(promises)
      .then((snapshots) => {
        const matchingDocs = [];

        for (const snap of snapshots) {
          for (const doc of snap.docs) {
            const lat = doc.get("latitude");
            const lng = doc.get("longitude");

            // We have to filter out a few false positives due to GeoHash
            // accuracy, but most will match
            const distanceInKm = geofire.distanceBetween([lat, lng], center);
            const distanceInM = distanceInKm * 1000;
            const distanceInMiles = (distanceInKm * 0.621371).toFixed(1);
            if (distanceInM <= radiusInM) {
              matchingDocs.push({ doc: doc, dist: distanceInMiles });
            }
          }
        }

        return matchingDocs;
      })
      .then((matchingDocs) => {
        setQuery(false);
        if (matchingDocs.length == 0) {
          matchingDocs.push({ empty: true });
        }
        setStashes(matchingDocs);
      });
  };

  return (
    <div className=" w-screen max-w-lg">
      <div id="stashList" className="stashForm-container">
        <div className="no-scrollbar flex flex-col container mt-10 mx-auto w-full items-center h-96 overflow-auto">
          {query ? (
            <div className="text-white pt-32 text-center">
              Searching for Nearby Stashes...
            </div>
          ) : (
            <ul className="flex flex-col w-full">
              {stashes.map(function (stash) {
                if (stash.empty == true) {
                  return (
                    <div className="text-white pt-32 text-center">
                      No Nearby Stashes
                    </div>
                  );
                }

                let googleMapsLink =
                  "https://maps.google.com/?q=" +
                  stash.doc.get("latitude") +
                  "," +
                  stash.doc.get("longitude");
                return (
                  <li className="flex flex-row mb-2 bg-slate-800 hover:bg-slate-700  bg-opacity-50 rounded-lg shadow">
                    <div className="select-none cursor-pointer flex flex-1 items-center p-4">
                      <a
                        className="select-none cursor-pointer flex flex-1 items-center"
                        href={googleMapsLink}
                        target="_blank"
                      >
                        <div className="flex flex-col w-10 h-10 justify-center items-center mr-4">
                          <div className="mx-auto h-10 w-10">
                            <svg
                              className="fill-green-700"
                              viewBox="0 0 25 25"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                fill-rule="evenodd"
                                clip-rule="evenodd"
                                d="M12 3c2.131 0 4 1.73 4 3.702 0 2.05-1.714 4.941-4 8.561-2.286-3.62-4-6.511-4-8.561 0-1.972 1.869-3.702 4-3.702zm0-2c-3.148 0-6 2.553-6 5.702 0 3.148 2.602 6.907 6 12.298 3.398-5.391 6-9.15 6-12.298 0-3.149-2.851-5.702-6-5.702zm0 8c-1.105 0-2-.895-2-2s.895-2 2-2 2 .895 2 2-.895 2-2 2zm12 14h-24l4-8h3.135c.385.641.798 1.309 1.232 2h-3.131l-2 4h17.527l-2-4h-3.131c.435-.691.848-1.359 1.232-2h3.136l4 8z"
                              />
                            </svg>
                          </div>
                        </div>
                        <div className="flex-1 pl-1 mr-16">
                          <div className="font-medium text-white">
                            {stash.doc.get("title")}
                          </div>
                          <div className="text-gray-200 text-sm">
                            {stash.doc.get("description")}
                          </div>
                        </div>
                        <div className="text-gray-200 text-xs">
                          <div>
                            {stash.doc.get("category")} - {stash.dist} miles
                          </div>
                          <div>Jake Morrissey</div>
                        </div>
                      </a>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
        <div className="grid gap-4 justify-items-center py-2">
          <Link
            className="location bg-red-500 hover:bg-red-700 px-5 py-2 text-sm leading-3 rounded-full font-semibold text-white"
            to="/"
          >
            Back
          </Link>
        </div>
      </div>
    </div>
  );
}

export default StashList;
