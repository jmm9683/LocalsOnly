import React, { useState, useEffect, Fragment } from "react";
import { Link } from "react-router-dom";
import { Tab, Switch } from "@headlessui/react";

import { firebaseAuth, firestore } from "./Firebase.js";

import {
  getCurrentUser,
  openAccountSharing,
  closeAccountSharing,
  getUserStashes,
  deleteUserStash,
  getFollowers,
  getFollowing,
  getDisplayName,
  deleteUserFollowing,
  deleteUserFollower,
} from "./Users.js";

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

function ManageAccount() {
  const { uid } = firebaseAuth.currentUser;
  const [userInfo, setUserInfo] = useState({});
  const [stashList, setStashList] = useState([]);
  const [followerList, setFollowerList] = useState([]);
  const [followingList, setFollowingList] = useState([]);
  const [sharingOpen, setSharingOpen] = useState(false);
  const [sharingLink, setSharingLink] = useState("Closed Account");
  const [copyButtonText, setCopyButtonText] = useState("Copy");
  let [data, setData] = useState({
    "My Stashes": [],
    Tourists: [],
    Locals: [],
  });
  useEffect(() => {
    updateSharingInfo();
  }, [userInfo]);

  useEffect(() => {
    if (uid) {
      const stashData = getUserStashes(uid);
      stashData.then(async (value) => {
        if (value.docs != undefined) {
          let myStashes = [];
          for (const doc of value.docs) {
            const lat = doc.get("latitude");
            const lng = doc.get("longitude");
            const title = doc.get("title");
            const category = doc.get("category");
            const description = doc.get("description");
            const googleMapsLink =
              "https://maps.google.com/?q=" + lat + "," + lng;
            myStashes.push({
              lat: lat,
              lng: lng,
              title: title,
              category: category,
              description: description,
              googleMapsLink: googleMapsLink,
              disabled: false,
              id: doc.id,
            });
          }
          setStashList(myStashes);
        }
      });
      const followerData = getFollowers(uid);
      followerData.then(async (value) => {
        let thisFollowerList = [];
        if (value.data()) {
          const followers = value.data();
          Object.keys(followers).forEach(async function (uid) {
            if (followers[uid] == true) {
              await getDisplayName(uid).then(async (value) => {
                thisFollowerList.push({
                  uid: uid,
                  displayName: value.get("displayName"),
                  disabled: false,
                });
                setFollowerList(thisFollowerList);
              });
            }
          });
        }
      });
      const followingData = getFollowing(uid);
      followingData.then(async (value) => {
        let thisFollowingList = [];
        if (value.data()) {
          const following = value.data();
          Object.keys(following).forEach(async function (uid) {
            if (following[uid] == true) {
              await getDisplayName(uid).then(async (value) => {
                thisFollowingList.push({
                  uid: uid,
                  displayName: value.get("displayName"),
                  disabled: false,
                });
                setFollowingList(thisFollowingList);
              });
            }
          });
        }

        setUserInfo(getCurrentUser());
      });
    }
  }, []);
  function deleteStash(id) {
    const stashData = deleteUserStash(uid, id);
    stashData.then(() => {
      let updatedStashes = stashList.map((stash) =>
        stash.id === id
          ? { ...stash, disabled: true, googleMapsLink: "" }
          : stash
      );
      setStashList(updatedStashes);
    });
  }
  function deleteFollower(id) {
    const followerData = deleteUserFollower(uid, id);
    followerData.then(() => {
      const followingData = deleteUserFollowing(id, uid);
      followingData.then(() => {
        let updatedFollower = followerList.map((tourist) =>
          tourist.uid === id ? { ...tourist, disabled: true } : tourist
        );
        setFollowerList(updatedFollower);
      });
    });
  }
  function deleteFollowing(id) {
    const followingData = deleteUserFollowing(uid, id);
    followingData.then(() => {
      const followerData = deleteUserFollower(id, uid);
      followerData.then(() => {
        let updatedFollowing = followingList.map((local) =>
          local.uid === id ? { ...local, disabled: true } : local
        );
        setFollowingList(updatedFollowing);
      });
    });
  }

  function copyShareLink() {
    navigator.clipboard.writeText(sharingLink);
    setCopyButtonText("Copied!");
  }
  function sharingToggle() {
    if (!sharingOpen) {
      //opening accoutn
      openAccountSharing(uid).then(() => {
        setUserInfo(getCurrentUser());
        updateSharingInfo();
      });
    }
    if (sharingOpen) {
      //closing account
      closeAccountSharing(uid, userInfo.sharingLink).then(() => {
        setUserInfo(getCurrentUser());
        updateSharingInfo();
      });
    }
    setSharingOpen(!sharingOpen);
    setCopyButtonText("Copy");
  }
  function updateSharingInfo() {
    if (userInfo.sharingLink != undefined && userInfo.sharingLink != false) {
      setSharingLink(
        window.location.hostname + "/?followingLink=" + userInfo.sharingLink
      );
      setSharingOpen(userInfo.sharingLinkFlag);
    } else {
      setSharingLink("Closed Account");
      setSharingOpen(userInfo.sharingLinkFlag);
    }
  }
  return (
    <div className="w-full">
      <div className="flex items-center justify-center md:gap-4 mb-4 w-full h-full">
        <label for="title" className="text-sm font-medium text-white my-auto">
          Sharing Link
          <input
            disabled={true}
            type="text"
            id="title"
            name="title"
            value={sharingLink}
            className="bg-slate-700 text-white text-center"
          />
        </label>

        <button
          disabled={!sharingOpen}
          className={`${
            !sharingOpen
              ? "bg-slate-700 text-slate-500 w-40"
              : "bg-slate-800 hover:bg-slate-700 text-white w-40"
          }
          px-5 py-3 text-sm leading-3 rounded-lg font-semibold  mt-5 `}
          onClick={() => {
            copyShareLink();
          }}
        >
          {copyButtonText}
        </button>

        <Switch
          checked={sharingOpen}
          onChange={() => {
            sharingToggle();
          }}
          className={`${sharingOpen ? "bg-green-500" : "bg-red-500"}
          relative inline-flex flex-shrink-0 h-[26px] w-[50px] border-2 mt-5 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus-visible:ring-2  focus-visible:ring-white focus-visible:ring-opacity-75`}
        >
          <span className="sr-only">Use setting</span>
          <span
            aria-hidden="true"
            className={`${sharingOpen ? "translate-x-6" : "translate-x-0"}
            pointer-events-none inline-block h-[22px] w-[22px] rounded-full bg-white shadow-lg transform ring-0 transition ease-in-out duration-200`}
          />
        </Switch>
      </div>
      <Tab.Group>
        <Tab.List className="flex p-1 space-x-1 bg-slate-900/20 rounded-xl">
          {Object.keys(data).map((data) => (
            <Tab
              key={data}
              className={({ selected }) =>
                classNames(
                  "w-full py-2.5 text-sm leading-5 font-medium text-slate-700 rounded-lg",
                  "focus:outline-none focus:ring-2 ring-offset-2 ring-offset-slate-400 ring-white ring-opacity-60",
                  selected
                    ? "bg-white shadow"
                    : "text-slate-100 hover:bg-white/[0.12] hover:text-white"
                )
              }
            >
              {data}
            </Tab>
          ))}
        </Tab.List>
        <Tab.Panels className="mt-2 no-scrollbar h-80 overflow-auto container mx-auto flex flex-col">
          {Object.keys(data).map((key, idx) => (
            <Tab.Panel
              key={idx}
              className={classNames(
                " rounded-xl p-3",
                "focus:outline-none focus:ring-2 ring-offset-2 ring-offset-slate-400 ring-white ring-opacity-60"
              )}
            >
              <ul>
                {key == "My Stashes" &&
                  stashList.map(function (item) {
                    return (
                      <li className="flex flex-row mb-2 bg-slate-800  bg-opacity-50 rounded-lg shadow w-full">
                        <div className="select-none flex flex-1 items-center p-4 w-full">
                          <a
                            className={
                              item.disabled
                                ? "flex flex-1 cursor-default pointer-events-none w-5/6"
                                : "flex flex-1 select-none cursor-pointer w-5/6"
                            }
                            href={item.googleMapsLink}
                            target={item.disabled ? "" : "_blank"}
                          >
                            <div className="flex flex-col w-10 h-10 justify-center items-center mr-4">
                              <div className="mx-auto h-10 w-10">
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  viewBox="0 0 512 512"
                                  className="fill-green-700 "
                                >
                                  <path d="M408 120C408 174.6 334.9 271.9 302.8 311.1C295.1 321.6 280.9 321.6 273.2 311.1C241.1 271.9 168 174.6 168 120C168 53.73 221.7 0 288 0C354.3 0 408 53.73 408 120zM288 152C310.1 152 328 134.1 328 112C328 89.91 310.1 72 288 72C265.9 72 248 89.91 248 112C248 134.1 265.9 152 288 152zM425.6 179.8C426.1 178.6 426.6 177.4 427.1 176.1L543.1 129.7C558.9 123.4 576 135 576 152V422.8C576 432.6 570 441.4 560.9 445.1L416 503V200.4C419.5 193.5 422.7 186.7 425.6 179.8zM150.4 179.8C153.3 186.7 156.5 193.5 160 200.4V451.8L32.91 502.7C17.15 508.1 0 497.4 0 480.4V209.6C0 199.8 5.975 190.1 15.09 187.3L137.6 138.3C140 152.5 144.9 166.6 150.4 179.8H150.4zM327.8 331.1C341.7 314.6 363.5 286.3 384 255V504.3L192 449.4V255C212.5 286.3 234.3 314.6 248.2 331.1C268.7 357.6 307.3 357.6 327.8 331.1L327.8 331.1z" />
                                </svg>
                              </div>
                            </div>
                            <div className="flex-1 pl-1 w-1/3">
                              <div className="font-medium text-white">
                                {item.title}
                              </div>
                              <div className="text-gray-200 text-sm">
                                {item.description}
                              </div>
                            </div>
                          </a>
                          <div className="text-gray-200 text-xs w-1/3 text-right">
                            {!item.disabled && (
                              <button
                                className="location bg-red-800 hover:bg-red-700 w-11/12 max-w-[100px] py-2 sm:py-1 text-xs sm:text-sm leading-3 rounded-full font-semibold text-white"
                                onClick={() => {
                                  deleteStash(item.id);
                                }}
                              >
                                Remove
                              </button>
                            )}
                            {item.disabled && (
                              <button
                                disabled={true}
                                className="location bg-slate-700 w-11/12 max-w-[100px] py-2 sm:py-1 text-xs sm:text-sm leading-3 rounded-full font-semibold text-white"
                              >
                                Removed
                              </button>
                            )}
                          </div>
                        </div>
                      </li>
                    );
                  })}
                {key == "Tourists" &&
                  followerList.map(function (item) {
                    return (
                      <li className="flex flex-row mb-2 bg-slate-800  bg-opacity-50 rounded-lg shadow">
                        <div className="select-none cursor-pointer flex flex-1 items-center p-4">
                          <div className="flex flex-col w-10 h-10 justify-center items-center mr-4">
                            <div className="mx-auto h-10 w-10">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="fill-green-700"
                                viewBox="0 0 512 512"
                              >
                                <path d="M240 96c26.5 0 48-21.5 48-48S266.5 0 240 0C213.5 0 192 21.5 192 48S213.5 96 240 96zM80.01 287.1c7.31 0 13.97-4.762 15.87-11.86L137 117c.3468-1.291 .5125-2.588 .5125-3.866c0-7.011-4.986-13.44-12.39-15.13C118.4 96.38 111.7 95.6 105.1 95.6c-36.65 0-70 23.84-79.32 59.53L.5119 253.3C.1636 254.6-.0025 255.9-.0025 257.2c0 7.003 4.961 13.42 12.36 15.11L76.01 287.5C77.35 287.8 78.69 287.1 80.01 287.1zM368 160h-15.1c-8.875 0-15.1 7.125-15.1 16V192h-34.75l-46.75-46.75C243.4 134.1 228.6 128 212.9 128C185.9 128 162.5 146.3 155.9 172.5L129 280.3C128.4 282.8 128 285.5 128 288.1c0 8.325 3.265 16.44 9.354 22.53l86.62 86.63V480c0 17.62 14.37 32 31.1 32s32-14.38 32-32v-82.75c0-17.12-6.625-33.13-18.75-45.25l-46.87-46.88c.25-.5 .5-.875 .625-1.375l19.1-79.5l22.37 22.38C271.4 252.6 279.5 256 288 256h47.1v240c0 8.875 7.125 16 15.1 16h15.1C376.9 512 384 504.9 384 496v-320C384 167.1 376.9 160 368 160zM81.01 472.3c-.672 2.63-.993 5.267-.993 7.86c0 14.29 9.749 27.29 24.24 30.89C106.9 511.8 109.5 512 112 512c14.37 0 27.37-9.75 30.1-24.25l25.25-101l-52.75-52.75L81.01 472.3z" />
                              </svg>
                            </div>
                          </div>
                          <div className="flex-1 pl-1 w-1/3">
                            <div className="font-medium text-white">
                              {item.displayName}
                            </div>
                          </div>
                          <div className="text-gray-200 text-xs w-1/3 text-right">
                            {!item.disabled && (
                              <button
                                className="location bg-red-800 hover:bg-red-700 w-11/12 max-w-[100px] py-2 sm:py-1 text-xs sm:text-sm leading-3 rounded-full font-semibold text-white"
                                onClick={() => {
                                  deleteFollower(item.uid);
                                }}
                              >
                                Remove
                              </button>
                            )}
                            {item.disabled && (
                              <button
                                disabled={true}
                                className="location bg-slate-700 w-11/12 max-w-[100px] py-2 sm:py-1 text-xs sm:text-sm leading-3 rounded-full font-semibold text-white"
                              >
                                Removed
                              </button>
                            )}
                          </div>
                        </div>
                      </li>
                    );
                  })}
                {key == "Locals" &&
                  followingList.map(function (item) {
                    return (
                      <li className="flex flex-row mb-2 bg-slate-800  bg-opacity-50 rounded-lg shadow">
                        <div className="select-none cursor-pointer flex flex-1 items-center p-4">
                          <div className="flex flex-col w-10 h-10 justify-center items-center mr-4">
                            <div className="mx-auto h-10 w-10">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="fill-green-700"
                                viewBox="0 0 512 512"
                              >
                                <path d="M352 128C352 198.7 294.7 256 224 256C153.3 256 96 198.7 96 128C96 57.31 153.3 0 224 0C294.7 0 352 57.31 352 128zM209.1 359.2L176 304H272L238.9 359.2L272.2 483.1L311.7 321.9C388.9 333.9 448 400.7 448 481.3C448 498.2 434.2 512 417.3 512H30.72C13.75 512 0 498.2 0 481.3C0 400.7 59.09 333.9 136.3 321.9L175.8 483.1L209.1 359.2z" />
                              </svg>
                            </div>
                          </div>
                          <div className="flex-1 pl-1 w-1/3">
                            <div className="font-medium text-white">
                              {item.displayName}
                            </div>
                          </div>
                          <div className="text-gray-200 text-xs w-1/3 text-right">
                            {!item.disabled && (
                              <button
                                className="location bg-red-800 hover:bg-red-700 w-11/12 max-w-[100px] py-2 sm:py-1 text-xs sm:text-sm leading-3 rounded-full font-semibold text-white"
                                onClick={() => {
                                  deleteFollowing(item.uid);
                                }}
                              >
                                Remove
                              </button>
                            )}
                            {item.disabled && (
                              <button
                                disabled={true}
                                className="location bg-slate-700 w-11/12 max-w-[100px] py-2 sm:py-1 text-xs sm:text-sm leading-3 rounded-full font-semibold text-white"
                              >
                                Removed
                              </button>
                            )}
                          </div>
                        </div>
                      </li>
                    );
                  })}
                {key == "My Stashes" && stashList.length == 0 && (
                  <div className="text-white pt-32 text-center">
                    <div>You have no stashes.</div>
                  </div>
                )}

                {key == "Tourists" && followerList.length == 0 && (
                  <div className="text-white pt-32 text-center">
                    <div>No tourists found following your stashes.</div>
                  </div>
                )}
                {key == "Locals" && followingList.length == 0 && (
                  <div className="text-white pt-32 text-center">
                    <div>You are not following any locals.</div>
                  </div>
                )}
              </ul>
            </Tab.Panel>
          ))}
        </Tab.Panels>
      </Tab.Group>
      <div className="grid gap-4 justify-items-center py-2">
        <Link
          className="location bg-slate-800 hover:bg-slate-700 px-5 py-2 text-sm leading-3 rounded-full font-semibold text-white"
          to="/"
        >
          Back
        </Link>
      </div>
    </div>
  );
}

export default ManageAccount;
