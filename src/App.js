import "./App.css";

import React from "react";
import firebase from "firebase/compat/app";
import { firebaseAuth } from "./Firebase.js";

import { Outlet } from "react-router-dom";

import { useAuthState } from "react-firebase-hooks/auth";

import {
  currentUser,
  setDisplayName,
  getFollowers,
  getFollowing,
  setCurrentUser,
} from "./Users.js";

function App() {
  const [user] = useAuthState(firebaseAuth);

  if (user) {
    const userData = currentUser(user.uid);
    userData.then((value) => {
      if (value.get("displayName") == undefined) {
        setDisplayName(user.uid, user.displayName);
      }
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
  }

  return (
    <div
      className="App min-h-screen bg-gradient-to-r from-zinc-800 via-zinc-700 to-zinc-800
       py-6 flex flex-row relative overflow-hidden "
    >
      <div className="absolute inset-0 bg-[url(img/topograph.svg)] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]"></div>
      <header className="relative place-items-begin pl-3 md:pl-6">
        <SignOut />
      </header>
      <div className="relative flex w-full items-center justify-center mt-9 md:mt-0">
        <section className="min-h-96">{user ? <Outlet /> : <SignIn />}</section>
      </div>
      <div className="pr-9 md:pr-12"></div>
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
  if (firebaseAuth.currentUser) {
    return (
      <div className="">
        <button
          className="sign-out bg-red-500 hover:bg-red-700 rounded-md bg-[url(img/signout.svg)] h-6 w-6"
          onClick={() => firebaseAuth.signOut()}
        ></button>
      </div>
    );
  } else {
    return <div className="pr-6 md:pr-6"></div>;
  }
}

export default App;
