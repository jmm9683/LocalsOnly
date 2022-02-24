import React, { useRef, useState, useEffect } from "react";
import { firebaseAuth, firestore } from "./Firebase.js";

const geofire = require("geofire-common");

function HomePage() {
  const [showStashForm, setShowStashForm] = useState(false);
  const toggleStashForm = () => {
    setShowStashForm(!showStashForm);
    setShowStashList(false);
  };
  const [showStashList, setShowStashList] = useState(false);
  const toggleStashList = () => {
    setShowStashList(!showStashList);
    if (!showStashList) {
      //   getStashes();
    }
    setShowStashForm(false);
  };

  //POSTING DATA
  const [position, setPosition] = useState("");
  const [positionHash, setPositionHash] = useState("");

  const [category, setCategory] = useState("any");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const [posting, setPosting] = useState(false);
  useEffect(() => {
    if (posting) {
      savePosition();
    }
  }, [posting]);

  function getCurrentPosition() {
    navigator.geolocation.getCurrentPosition(
      function (position) {
        setPosition(position);
        setPositionHash(
          geofire.geohashForLocation([
            position.coords.latitude,
            position.coords.longitude,
          ])
        );
        setPosting(true);
      },
      function (error) {
        console.error("Error Code = " + error.code + " - " + error.message);
        return error;
      }
    );
  }

  const savePosition = async (e) => {
    const { uid } = firebaseAuth.currentUser;
    const userStashes = firestore
      .collection("stashes")
      .doc(uid)
      .collection("stashes");
    await userStashes.add({
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
      positionHash: positionHash,
      title: title,
      category: category,
      description: description,
      category_positionHash: category + "_" + positionHash,
      createdAt: firestore.FieldValue.serverTimestamp(),
      uid,
    });
    setPosting(false);
  };

  function postStash(e) {
    e.preventDefault();
    getCurrentPosition();
    toggleStashForm();
  }

  //QUERYING
  const [range, setRange] = useState(3.21869);
  const [query, setQuery] = useState(false);
  useEffect(() => {
    if (query) {
      stashQuery();
    }
  }, [query]);

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
        setQuery(true);
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
    // Find Stasthes within 5mi (8.04672km)
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
            if (distanceInM <= radiusInM) {
              matchingDocs.push(doc);
            }
          }
        }

        return matchingDocs;
      })
      .then((matchingDocs) => {
        setQuery(false);
        for (const doc of matchingDocs) {
          console.log(doc.get("latitude"));
        }
      });
  };

  function getStashes(e) {
    getCurrentPositionQuery();
  }

  if (!showStashForm && showStashList) {
    return (
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div
          id="stashList"
          className="stashForm-container bg-white bg-opacity-90 py-8 px-6 shadow rounded-lg sm:px-10"
        ></div>
        <div className="grid gap-4 justify-items-center py-2">
          <button
            className="location bg-red-500 hover:bg-red-700 px-5 py-2 text-sm leading-3 rounded-full font-semibold text-white"
            onClick={toggleStashList}
          >
            Back
          </button>
        </div>
      </div>
    );
  } else if (showStashForm && !showStashList) {
    return (
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div
          id="stashForm"
          className="stashForm-container bg-white bg-opacity-90 py-8 px-6 shadow rounded-lg sm:px-10"
        >
          <form
            className="mb-0 space-y-6"
            onSubmit={postStash}
            onChange={() => {}}
          >
            <div>
              <label
                for="title"
                className="block text-sm font-medium text-gray-700"
              >
                Stash Title
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
            </div>
            <div>
              <label
                for="category-select"
                className="block text-sm font-medium text-gray-700"
              >
                Stash Category
              </label>
              <div className="mt-1">
                <select
                  name="category-select"
                  id="category-select"
                  className=""
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  <option value="any">Anything</option>
                  <option value="drink">Drink</option>
                  <option value="food">Food</option>
                  <option value="outdoors">Outdoors</option>
                </select>
              </div>
            </div>
            <div>
              <div className="mt-1">
                <label
                  for="description"
                  className="block text-sm font-medium text-gray-700"
                >
                  Description
                </label>
                <textarea
                  name="description"
                  id="description"
                  rows="2.5"
                  cols="15"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
            </div>
            <div>
              <button
                type="submit"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
                value="Submit"
              >
                Submit
              </button>
            </div>
          </form>
        </div>
        <div className="grid gap-4 justify-items-center py-2">
          <button
            className="location bg-red-500 hover:bg-red-700 px-5 py-2 text-sm leading-3 rounded-full font-semibold text-white"
            onClick={toggleStashForm}
          >
            Cancel
          </button>
        </div>
      </div>
    );
  } else {
    return (
      <div className="grid gap-4 justify-items-center">
        {/* <select value={range} onChange={(e) => setRange(e.target.value)}>
          <option value="3.21869">2mi</option>
          <option value="8.04672">5mi</option>
          <option value="16.0934">10mi</option>
        </select>
        <br/> */}
        <button
          className="stashes bg-green-500 hover:bg-green-700 px-5 py-2 rounded-full bg-[url(img/radar.svg)] h-56 w-56"
          onClick={toggleStashList}
        ></button>

        <button
          className="location bg-red-500 hover:bg-red-700 px-5 py-2 bg-[url(img/mark.svg)] rounded-full w-20 h-6"
          onClick={toggleStashForm}
        ></button>
      </div>
    );
  }
}

export default HomePage;
