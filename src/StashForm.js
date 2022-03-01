import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

import firebase from "firebase/compat/app";
import { firebaseAuth, firestore } from "./Firebase.js";

const geofire = require("geofire-common");

function StashForm() {
  const navigate = useNavigate();
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
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      uid,
    });
    setPosting(false);
    navigate(-1);
  };

  function postStash(e) {
    e.preventDefault();
    getCurrentPosition();
  }

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
        <Link
          className="location bg-red-500 hover:bg-red-700 px-5 py-2 text-sm leading-3 rounded-full font-semibold text-white"
          to="/"
        >
          Cancel
        </Link>
      </div>
    </div>
  );
}

export default StashForm;
