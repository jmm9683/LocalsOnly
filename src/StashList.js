import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

import { firebaseAuth, firestore } from "./Firebase.js";

import { getFollowing, getDisplayName } from "./Users.js";

import Alert from "./Alert.js";

const geofire = require("geofire-common");

function StashList({ search }) {
  const [alertLocationFlag, setAlertLocationFlag] = useState(false);

  const alert = (flag) => {
    setAlertLocationFlag(!flag);
    setTimeout(
      function () {
        setAlertLocationFlag(false);
      }.bind(this),
      5000
    );
  };

  const [position, setPosition] = useState("");
  const [positionHash, setPositionHash] = useState("");

  //QUERYING
  const [range, setRange] = useState(80.4672); //50 miles max
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
        alert(false);
        return error;
      }
    );
  }

  const stashQuery = async (e) => {
    const { uid } = firebaseAuth.currentUser;
    const followingData = getFollowing(uid);
    let following = [];
    let users = [];
    await followingData.then(async (value) => {
      if (value.data()) {
        following = value.data();
        following = { ...following, [uid]: true };
      } else {
        following = { [uid]: true };
      }
    });
    let userPromises = [];
    Object.keys(following).forEach(async function (uid) {
      if (following[uid] == true) {
        userPromises.push(getDisplayName(uid));
      }
    });
    Promise.all(userPromises).then((snapshot) => {
      setStashes([]);
      for (const snap of snapshot) {
        let displayName = snap.get("displayName");
        const userStashes = firestore
          .collection("stashes")
          .doc(snap.id)
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
          const q = userStashes
            .orderBy("positionHash")
            .startAt(b[0])
            .endAt(b[1]);
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
                const distanceInKm = geofire.distanceBetween(
                  [lat, lng],
                  center
                );
                const distanceInM = distanceInKm * 1000;
                const distanceInMiles = distanceInKm * 0.621371;
                let visibilityInM = radiusInM;
                if (doc.get("visibility") != undefined) {
                  visibilityInM = doc.get("visibility") * 1000;
                }
                if (distanceInM <= radiusInM && distanceInM <= visibilityInM) {
                  matchingDocs.push({
                    doc: doc,
                    dist: distanceInMiles,
                    displayName: displayName,
                  });
                }
              }
            }

            return matchingDocs;
          })
          .then((matchingDocs) => {
            Object.keys(matchingDocs).forEach((doc) => {
              setStashes((stashes) => [...stashes, matchingDocs[doc]]);
            });
            setQuery(false);
          });
      }
    });
  };

  return (
    <div>
      <div className="absolute top-1 w-11/12 left-1/2 transform -translate-x-1/2 max-w-md">
        {alertLocationFlag && (
          <Alert
            alertLocationFlag={alertLocationFlag}
            alertFollowingFLag={false}
          ></Alert>
        )}
      </div>
      <div id="stashList" className="stashForm-container">
        <div className="no-scrollbar flex flex-col container mt-10 mx-auto h-96 overflow-auto">
          {query ? (
            <div className="text-white pt-32 text-center">
              Searching for Nearby Stashes...
            </div>
          ) : (
            <ul>
              {stashes.length > 0 &&
                stashes
                  .sort((a, b) => a.dist - b.dist)
                  .map(function (stash) {
                    let googleMapsLink =
                      "https://maps.google.com/?q=" +
                      stash.doc.get("latitude") +
                      "," +
                      stash.doc.get("longitude");
                    return (
                      <li className="flex flex-row mb-2 bg-slate-800 hover:bg-slate-700  bg-opacity-50 rounded-lg shadow w-full">
                        <div className="select-none cursor-pointer flex flex-1 items-center p-4 w-full">
                          <a
                            className="select-none cursor-pointer flex flex-1 items-center w-full"
                            href={googleMapsLink}
                            target="_blank"
                          >
                            <div className="flex flex-col justify-center items-center w-10 h-10 mr-4">
                              <div className="mx-auto w-10 h-10">
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  viewBox="0 0 512 512"
                                  className="fill-green-700"
                                >
                                  <path d="M408 120C408 174.6 334.9 271.9 302.8 311.1C295.1 321.6 280.9 321.6 273.2 311.1C241.1 271.9 168 174.6 168 120C168 53.73 221.7 0 288 0C354.3 0 408 53.73 408 120zM288 152C310.1 152 328 134.1 328 112C328 89.91 310.1 72 288 72C265.9 72 248 89.91 248 112C248 134.1 265.9 152 288 152zM425.6 179.8C426.1 178.6 426.6 177.4 427.1 176.1L543.1 129.7C558.9 123.4 576 135 576 152V422.8C576 432.6 570 441.4 560.9 445.1L416 503V200.4C419.5 193.5 422.7 186.7 425.6 179.8zM150.4 179.8C153.3 186.7 156.5 193.5 160 200.4V451.8L32.91 502.7C17.15 508.1 0 497.4 0 480.4V209.6C0 199.8 5.975 190.1 15.09 187.3L137.6 138.3C140 152.5 144.9 166.6 150.4 179.8H150.4zM327.8 331.1C341.7 314.6 363.5 286.3 384 255V504.3L192 449.4V255C212.5 286.3 234.3 314.6 248.2 331.1C268.7 357.6 307.3 357.6 327.8 331.1L327.8 331.1z" />
                                </svg>
                              </div>
                            </div>
                            <div className="flex-1 w-3/6">
                              <div className="font-medium text-white break-words">
                                {stash.doc.get("title")}
                              </div>
                              <div className="text-gray-200 text-sm break-words">
                                {stash.doc.get("description")}
                              </div>
                            </div>
                            <div className="text-gray-200 text-xs mr-1 text-right break-words w-2/6">
                              <div>{stash.dist.toFixed(1)} miles</div>
                              <div>{stash.displayName}</div>
                            </div>
                          </a>
                        </div>
                      </li>
                    );
                  })}
              {stashes.length == 0 && (
                <div className="text-white pt-32 text-center">
                  No Nearby Stashes
                </div>
              )}
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
