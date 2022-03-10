import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

import firebase from "firebase/compat/app";
import { firebaseAuth, firestore } from "./Firebase.js";

import Alert from "./Alert.js";

const geofire = require("geofire-common");

function StashForm() {
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
        alert(false);
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
    navigate("/");
  };

  function postStash(e) {
    e.preventDefault();
    getCurrentPosition();
  }

  return (
    <div className="mx-auto w-full">
      <div className="absolute top-1 w-11/12 left-1/2 transform -translate-x-1/2 max-w-md">
        {alertLocationFlag && (
          <Alert
            alertLocationFlag={alertLocationFlag}
            alertFollowingFLag={false}
          ></Alert>
        )}
      </div>
      <div
        id="stashForm"
        className="stashForm-container bg-slate-800 bg-opacity-90 py-8 px-6 shadow rounded-lg sm:px-10"
      >
        <form
          className="mb-0 space-y-6"
          onSubmit={postStash}
          onChange={() => {}}
        >
          <div>
            <label for="title" className="block text-sm font-medium text-white">
              Stash Title
            </label>
            <div className="mt-1">
              <input
                type="text"
                id="title"
                name="title"
                value={title}
                className="bg-slate-700 text-white"
                onChange={(e) => setTitle(e.target.value)}
                maxLength="15"
                required
              />
            </div>
          </div>
          <div>
            <label
              for="category-select"
              className="block text-sm font-medium text-white"
            >
              Stash Category
            </label>
            <div className="mt-1">
              <select
                name="category-select"
                id="category-select"
                className="bg-slate-700 text-white"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option className="text-white" value="any">
                  Anything
                </option>
                <option className="text-white" value="drink">
                  Drink
                </option>
                <option className="text-white" value="food">
                  Food
                </option>
                <option className="text-white" value="outdoors">
                  Outdoors
                </option>
              </select>
            </div>
          </div>
          <div>
            <div className="mt-1">
              <label
                for="description"
                className="block text-sm font-medium text-white"
              >
                Description
              </label>
              <textarea
                name="description"
                id="description"
                rows="2.5"
                cols="15"
                className="bg-slate-700 text-white"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                maxLength="20"
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
