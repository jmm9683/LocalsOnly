import React, { useState, useEffect } from "react";
import firebase from "firebase/compat/app";
import { firebaseAuth, firestore } from "./Firebase.js";
import { useNavigate } from "react-router-dom";
let thisCurrentUser = {};

export const currentUser = async function (uid) {
  const userCollection = firestore.collection("users").doc(uid);
  return await userCollection.get();
};

export const getCurrentUser = function () {
  return thisCurrentUser;
};
export const setCurrentUser = function (
  uid,
  displayName,
  sharingLinkFlag,
  sharingLink
) {
  thisCurrentUser.uid = uid;
  thisCurrentUser.displayName = displayName;
  thisCurrentUser.sharingLinkFlag = sharingLinkFlag;
  thisCurrentUser.sharingLink = sharingLink;
};

export const setDisplayName = async function (uid, displayName) {
  thisCurrentUser.displayName = displayName;
  const userCollection = firestore.collection("users").doc(uid);
  const currentDisplayName = await userCollection.set({
    displayName: displayName,
  });
};

export const openAccountSharing = async function (uid) {
  const sharingLink = firestore.collection("sharingLink");
  await sharingLink
    .add({
      uid: uid,
    })
    .then(async (value) => {
      const userCollection = firestore.collection("users").doc(uid);
      await userCollection.update({
        sharingLinkFlag: true,
        sharingLink: value.id,
      });
      thisCurrentUser.sharingLinkFlag = true;
      thisCurrentUser.sharingLink = value.id;
    });
};

export const closeAccountSharing = async function (uid, link) {
  const sharingLink = firestore.collection("sharingLink").doc(link);
  await sharingLink.delete().then(async (value) => {
    const userCollection = firestore.collection("users").doc(uid);
    await userCollection.update({
      sharingLinkFlag: false,
      sharingLink: false,
    });
    thisCurrentUser.sharingLinkFlag = false;
    thisCurrentUser.sharingLink = false;
  });
};

export const getUserStashes = async function (uid) {
  const userStashes = firestore
    .collection("stashes")
    .doc(uid)
    .collection("stashes");
  return await userStashes.get();
};

export const deleteUserStash = async function (uid, id) {
  const userStashes = firestore
    .collection("stashes")
    .doc(uid)
    .collection("stashes")
    .doc(`${id}`);
  return await userStashes.delete();
};

export const getFollowers = async function (uid) {
  const followersCollection = firestore.collection("followers").doc(uid);
  return await followersCollection.get();
};

export const getFollowing = async function (uid) {
  const followingCollection = firestore.collection("following").doc(uid);
  return await followingCollection.get();
};

export const followUser = async function (uid, link) {
  const sharingLink = firestore.collection("sharingLink").doc(link);
  await sharingLink
    .get()
    .then(async (value) => {
      const followingID = value.get("uid");
      if (followingID == undefined) {
        throw "Following Link Disabled";
      }
      const following = firestore.collection("following").doc(uid);
      await following.set(
        {
          [followingID]: true,
        },
        { merge: true }
      );
      const follower = firestore.collection("followers").doc(followingID);
      await follower.set(
        {
          [uid]: true,
        },
        { merge: true }
      );
    })
    .catch(function (error) {
      console.log(error);
    });
};
