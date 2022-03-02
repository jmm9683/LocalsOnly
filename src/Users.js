import React, { useState, useEffect } from "react";
import firebase from "firebase/compat/app";
import { firebaseAuth, firestore } from "./Firebase.js";

let currentUser = {};

export const getCurrentUser = async function (uid) {
  const userCollection = firestore.collection("users").doc(uid);
  return await userCollection.get();
};

export const thisCurrentUser = function () {
  return currentUser;
};

export const setDisplayName = async function (uid, displayName) {
  currentUser.displayName = displayName;
  const displayNameCollection = firestore.collection("users").doc(uid);
  const currentDisplayName = await displayNameCollection.set({
    displayName: displayName,
  });
};

export const getUserStashes = async function (uid) {
  const userStashes = firestore
    .collection("stashes")
    .doc(uid)
    .collection("stashes");
  return await userStashes.get();
};

export const getFollowers = async function (uid) {
  const followersCollection = firestore.collection("followers").doc(uid);
  return await followersCollection.get();
};

export const getFollowing = async function (uid) {
  const followingCollection = firestore.collection("following").doc(uid);
  return await followingCollection.get();
};
