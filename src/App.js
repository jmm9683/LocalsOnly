import "./App.css";

import React, { useState } from "react";
import firebase from "firebase/compat/app";
import { firebaseAuth } from "./Firebase.js";
import { Outlet, useSearchParams, useNavigate, Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUserGear,
  faArrowRightFromBracket,
} from "@fortawesome/free-solid-svg-icons";
import { useAuthState } from "react-firebase-hooks/auth";
import Alert from "./Alert.js";
import {
  currentUser,
  setDisplayName,
  followUser,
  getDisplayName,
  setCurrentUser,
} from "./Users.js";

function App() {
  const [alertFollowingSuccessFlag, setAlertFollowingSuccessFlag] =
    useState(false);
  const [alertFollowingFailFlag, setAlertFollowingFailFlag] = useState(false);

  const alertFollowing = (flag, self) => {
    setAlertFollowingFailFlag(!flag);
    setAlertFollowingSuccessFlag(flag);
    setTimeout(
      function () {
        setAlertFollowingFailFlag(false);
        setAlertFollowingSuccessFlag(false);
      }.bind(this),
      5000
    );
  };
  const navigate = useNavigate();
  const [user] = useAuthState(firebaseAuth);
  let [searchParams, setSeachParams] = useSearchParams();

  if (user) {
    const displayName = getDisplayName(user.uid);
    displayName.then((value) => {
      if (value.get("displayName") == undefined) {
        setDisplayName(user.uid, user.displayName);
      }
    });
    const userData = currentUser(user.uid);
    userData.then((value) => {
      if (value.get("sharingLink") != undefined) {
        setCurrentUser(
          user.uid,
          user.displayName,
          value.get("sharingLinkFlag"),
          value.get("sharingLink")
        );
      } else {
        setCurrentUser(user.uid, user.displayName, false, false);
      }
    });
    if (searchParams.get("followingLink")) {
      followUser(user.uid, searchParams.get("followingLink"))
        .then((e) => {
          alertFollowing(true);
          navigate("/");
        })
        .catch((e) => {
          if (e == "Following Yourself") {
            navigate("/");
            return;
          }
          alertFollowing(false);
          navigate("/");
        });
    }
  }

  return (
    <div
      className="App min-h-screen bg-gradient-to-r from-zinc-800 via-zinc-700 to-zinc-800
       py-6 flex flex-row relative overflow-hidden"
    >
      <div className="absolute inset-0 bg-[url(img/topograph.svg)] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]"></div>
      <div className="relative place-items-begin pl-3 md:pl-6">
        <Account />
      </div>
      <div className="relative flex w-full items-center justify-center mt-9 md:mt-0">
        <div className="absolute top-1 w-11/12 left-1/2 transform -translate-x-1/2 max-w-md">
          {(alertFollowingFailFlag || alertFollowingSuccessFlag) && (
            <Alert
              alertFollowingFailFLag={alertFollowingFailFlag}
              alertFollowingSuccessFLag={alertFollowingSuccessFlag}
            ></Alert>
          )}
        </div>
        <div className="min-h-96">{user ? <Outlet /> : <SignIn />}</div>
      </div>
      <div className="relative place-items-begin pr-3 md:pr-6">
        <SignOut />
      </div>
    </div>
  );
}

function SignIn() {
  const signInWithGoogle = () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    firebaseAuth.signInWithPopup(provider);
  };

  return (
    <div className="grid gap-4 justify-items-center text-center w-full">
      <h1 className="font-overpass text-slate-300 text-7xl sm:text-8xl font-semibold">
        !LOCALS!
      </h1>
      <h1 className="font-overpass text-slate-300 text-6xl sm:text-7xl font-semibold ">
        !ONLY!
      </h1>
      <button
        className="font-overpass sign-in bg-slate-500 hover:bg-slate-600 px-5 py-2 text-sm leading-3 rounded-full font-semibold text-white"
        onClick={signInWithGoogle}
      >
        Sign In
      </button>
      <p className="font-overpass text-slate-300 text-xl sm:text-xl">
        Stash and share your favorite local spots.
      </p>
      <p className="font-overpass text-slate-300 text-xl sm:text-xl">
        Your friends will discover your secret spots only when they are in the
        area.
      </p>
    </div>
  );
}

function Account() {
  const navigate = useNavigate();
  if (firebaseAuth.currentUser) {
    return (
      <div>
        <button
          className="bg-green-500 hover:bg-green-700 rounded-md h-6 w-6 mb-3"
          onClick={() => navigate("/account")}
        >
          <FontAwesomeIcon icon={faUserGear} />
        </button>
      </div>
    );
  } else {
    return <div className="pr-6 md:pr-6"></div>;
  }
}
function SignOut() {
  if (firebaseAuth.currentUser) {
    return (
      <button
        className="sign-out bg-red-500 hover:bg-red-700 rounded-md h-6 w-6"
        onClick={() => firebaseAuth.signOut()}
      >
        <FontAwesomeIcon icon={faArrowRightFromBracket} />
      </button>
    );
  } else {
    return <div className="pr-6 md:pr-6"></div>;
  }
}

export default App;
