import "./App.css";

import React from "react";
import firebase from "firebase/compat/app";
import { firebaseAuth } from "./Firebase.js";

import { Outlet } from "react-router-dom";

import { useAuthState } from "react-firebase-hooks/auth";

import {
  getCurrentUser,
  setDisplayName,
  getFollowers,
  getFollowing,
} from "./Users.js";

function App() {
  const [user] = useAuthState(firebaseAuth);

  // if (user) {
  //   const userData = getCurrentUser(user.uid);
  //   userData.then((value) => {
  //     if (value.get("displayName") == undefined) {
  //       setDisplayName(user.uid, user.displayName);
  //     }
  //   });
  //   const followerData = getFollowers(user.uid);
  //   followerData.then((value) => {
  //     console.log(value);
  //   });
  //   const followingData = getFollowing(user.uid);
  //   followingData.then((value) => {
  //     console.log(value);
  //   });
  // }

  return (
    <div
      className="App min-h-screen bg-gradient-to-r from-zinc-800 via-zinc-700 to-zinc-800
       py-6 flex flex-col justify-center relative overflow-hidden sm:py-12"
    >
      <div className="absolute inset-0 bg-[url(img/topograph.svg)] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]"></div>
      <div className="relative px-6 pt-5 pb-8 mx-auto">
        <header className="grid grid-cols-4 place-items-begin">
          <SignOut />
        </header>
        <section className="min-h-96">{user ? <Outlet /> : <SignIn />}</section>
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
    <div>
      <button
        className="sign-in bg-green-700 hover:bg-green-900 px-5 py-2 text-sm leading-3 rounded-full font-semibold text-white"
        onClick={signInWithGoogle}
      >
        Sign in with Google
      </button>
    </div>
  );
}

function SignOut() {
  return (
    firebaseAuth.currentUser && (
      <div className="col-start-1">
        <button
          className="sign-out bg-red-500 hover:bg-red-700 rounded-md bg-[url(img/signout.svg)] h-6 w-6"
          onClick={() => firebaseAuth.signOut()}
        ></button>
      </div>
    )
  );
}

export default App;
