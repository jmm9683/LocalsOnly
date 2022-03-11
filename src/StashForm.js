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

  const [visibility, setVisibility] = useState(16.0934);
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
      visibility: parseFloat(visibility, 10),
      description: description,
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
    <div className="mx-auto w-full max-w-sm">
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
        className="stashForm-container bg-slate-800 bg-opacity-90 py-8 px-6 shadow rounded-lg sm:px-10 "
      >
        <form
          className="mb-0 space-y-3"
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
                required
              />
            </div>
          </div>
          <div>
            <label
              for="visibility-select"
              className="block text-sm font-medium text-white"
            >
              Visibility
            </label>
            <div className="mt-1">
              <select
                name="visibility-select"
                id="visibility-select"
                className="bg-slate-700 text-white"
                value={visibility}
                onChange={(e) => setVisibility(e.target.value)}
              >
                <option className="text-white" value="0.0762">
                  Only Here (0.05 mi)
                </option>
                <option className="text-white" value="0.402336">
                  Close (0.25 mi)
                </option>
                <option className="text-white" value="3.21869">
                  Medium (2 mi)
                </option>
                <option className="text-white" value="16.0934">
                  Far (10 mi)
                </option>
                <option className="text-white" value="80.4672">
                  Max (50 mi)
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
