import React, { useState, useEffect, Fragment } from "react";
import { Link } from "react-router-dom";
import { Tab, Switch } from "@headlessui/react";

import { firebaseAuth, firestore } from "./Firebase.js";

import {
  getCurrentUser,
  setDisplayName,
  getUserStashes,
  deleteUserStash,
  getFollowers,
  getFollowing,
} from "./Users.js";

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

function ManageAccount() {
  const { uid } = firebaseAuth.currentUser;
  const [sharingLink, setSharingLink] = useState(false);
  let [data, setData] = useState({
    "My Stashes": [],
    Tourists: [],
    Locals: [],
  });
  // useEffect(() => {
  //   if (uid) {
  //     const stashData = getUserStashes(uid);
  //     stashData.then((value) => {
  //       if (value.docs != undefined) {
  //         let myStashes = [];
  //         for (const doc of value.docs) {
  //           const lat = doc.get("latitude");
  //           const lng = doc.get("longitude");
  //           const title = doc.get("title");
  //           const category = doc.get("category");
  //           const description = doc.get("description");
  //           const googleMapsLink =
  //             "https://maps.google.com/?q=" + lat + "," + lng;
  //           myStashes.push({
  //             lat: lat,
  //             lng: lng,
  //             title: title,
  //             category: category,
  //             description: description,
  //             googleMapsLink: googleMapsLink,
  //             disabled: false,
  //             id: doc.id,
  //           });
  //         }
  //         setData({ ...data, "My Stashes": myStashes });
  //       }
  //     });
  //     const followerData = getFollowers(uid);
  //     followerData.then((value) => {
  //       if (value.docs != undefined) {
  //         let myFollowers = [];
  //         for (const doc of value.docs) {
  //           const user = doc.get("uid");
  //           const displayName = doc.get("displayName");
  //           if (user && displayName) {
  //             myFollowers.push({
  //               uid: uid,
  //               displayName: displayName,
  //               disabled: false,
  //               id: doc.id,
  //             });
  //           }
  //         }
  //         setData({ ...data, Tourists: myFollowers });
  //       }
  //     });
  //     const followingData = getFollowing(uid);
  //     followingData.then((value) => {
  //       if (value.docs != undefined) {
  //         let myFollowing = [];
  //         for (const doc of value.docs) {
  //           const user = doc.get("uid");
  //           const displayName = doc.get("displayName");
  //           if (user && displayName) {
  //             myFollowing.push({
  //               uid: uid,
  //               displayName: displayName,
  //               disabled: false,
  //               id: doc.id,
  //             });
  //           }
  //         }
  //         setData({ ...data, Locals: myFollowing });
  //       }
  //     });
  //   }
  // }, []);
  function deleteStash(id) {
    const stashData = deleteUserStash(uid, id);
    stashData.then(() => {
      let updatedStashes = data["My Stashes"].map((stash) =>
        stash.id === id
          ? { ...stash, disabled: true, googleMapsLink: "" }
          : stash
      );
      console.log(updatedStashes);
      setData({ ...data, "My Stashes": updatedStashes });
    });
  }
  return (
    <div className="mt-8 sm:mx-auto">
      <div className="flex items-center justify-center gap-4 mb-4">
        <label for="title" className="font-medium text-white flex-none">
          Sharing Link:
        </label>
        <input
          disabled={true}
          type="text"
          id="title"
          name="title"
          value="links"
          className="bg-slate-700 text-white"
        />
        <button
          disabled={false}
          className={`${
            false ? "bg-slate-700" : "bg-slate-800 hover:bg-slate-700 "
          }
          px-5 py-2 text-sm leading-3 rounded-lg font-semibold text-white`}
        >
          Copy
        </button>
        <Switch
          checked={sharingLink}
          onChange={setSharingLink}
          className={`${sharingLink ? "bg-green-500" : "bg-red-500"}
          relative inline-flex flex-shrink-0 h-[26px] w-[50px] border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus-visible:ring-2  focus-visible:ring-white focus-visible:ring-opacity-75`}
        >
          <span className="sr-only">Use setting</span>
          <span
            aria-hidden="true"
            className={`${sharingLink ? "translate-x-6" : "translate-x-0"}
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
        <Tab.Panels className="mt-2 no-scrollbar h-80 overflow-auto container mx-auto flex flex-col w-screen max-w-lg">
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
                  data[key].map(function (item) {
                    return (
                      <li className="flex flex-row mb-2 bg-slate-800  bg-opacity-50 rounded-lg shadow w-full">
                        <div className="select-none flex flex-1 items-center p-4 ">
                          <a
                            className={
                              item.disabled
                                ? "flex flex-1 cursor-default pointer-events-none"
                                : "flex flex-1 select-none cursor-pointer"
                            }
                            href={item.googleMapsLink}
                            target={item.disabled ? "" : "_blank"}
                          >
                            <div className="flex flex-col w-10 h-10 justify-center items-center mr-4">
                              <div className="mx-auto h-10 w-10">
                                <svg
                                  className="fill-green-700"
                                  viewBox="0 0 25 25"
                                  xmlns="http://www.w3.org/2000/svg"
                                >
                                  <path
                                    fill-rule="evenodd"
                                    clip-rule="evenodd"
                                    d="M12 3c2.131 0 4 1.73 4 3.702 0 2.05-1.714 4.941-4 8.561-2.286-3.62-4-6.511-4-8.561 0-1.972 1.869-3.702 4-3.702zm0-2c-3.148 0-6 2.553-6 5.702 0 3.148 2.602 6.907 6 12.298 3.398-5.391 6-9.15 6-12.298 0-3.149-2.851-5.702-6-5.702zm0 8c-1.105 0-2-.895-2-2s.895-2 2-2 2 .895 2 2-.895 2-2 2zm12 14h-24l4-8h3.135c.385.641.798 1.309 1.232 2h-3.131l-2 4h17.527l-2-4h-3.131c.435-.691.848-1.359 1.232-2h3.136l4 8z"
                                  />
                                </svg>
                              </div>
                            </div>
                            <div className="flex-1 pl-1 mr-16">
                              <div className="font-medium text-white">
                                {item.title}
                              </div>
                              <div className="text-gray-200 text-sm">
                                {item.description}
                              </div>
                            </div>
                          </a>
                          <div className="text-gray-200 text-xs">
                            {!item.disabled && (
                              <button
                                className="location bg-red-800 hover:bg-red-700 px-5 py-2 text-sm leading-3 rounded-full font-semibold text-white"
                                onClick={() => {
                                  deleteStash(item.id);
                                }}
                              >
                                Delete
                              </button>
                            )}
                            {item.disabled && (
                              <button
                                disabled={true}
                                className="location bg-slate-700 px-5 py-2 text-sm leading-3 rounded-full font-semibold text-white"
                              >
                                Removed
                              </button>
                            )}
                          </div>
                        </div>
                      </li>
                    );
                  })}
                {(key == "Tourists" || key == "Locals") &&
                  data[key].map(function (item) {
                    return (
                      <li className="flex flex-row mb-2 bg-slate-800  bg-opacity-50 rounded-lg shadow">
                        <div className="select-none cursor-pointer flex flex-1 items-center p-4">
                          <div className="flex flex-col w-10 h-10 justify-center items-center mr-4">
                            <div className="mx-auto h-10 w-10">
                              <svg
                                className="fill-green-700"
                                viewBox="0 0 25 25"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  fill-rule="evenodd"
                                  clip-rule="evenodd"
                                  d="M12 3c2.131 0 4 1.73 4 3.702 0 2.05-1.714 4.941-4 8.561-2.286-3.62-4-6.511-4-8.561 0-1.972 1.869-3.702 4-3.702zm0-2c-3.148 0-6 2.553-6 5.702 0 3.148 2.602 6.907 6 12.298 3.398-5.391 6-9.15 6-12.298 0-3.149-2.851-5.702-6-5.702zm0 8c-1.105 0-2-.895-2-2s.895-2 2-2 2 .895 2 2-.895 2-2 2zm12 14h-24l4-8h3.135c.385.641.798 1.309 1.232 2h-3.131l-2 4h17.527l-2-4h-3.131c.435-.691.848-1.359 1.232-2h3.136l4 8z"
                                />
                              </svg>
                            </div>
                          </div>
                          <div className="flex-1 pl-1 mr-16">
                            <div className="font-medium text-white">
                              {item.displayName}
                            </div>
                          </div>
                          <div className="text-gray-200 text-xs">
                            <button className="location bg-red-800 hover:bg-red-700 px-5 py-2 text-sm leading-3 rounded-full font-semibold text-white">
                              Remove
                            </button>
                          </div>
                        </div>
                      </li>
                    );
                  })}
                {data[key].length == 0 && (
                  <div className="text-white pt-32 text-center">
                    {key == "My Stashes" && <div>You have no stashes.</div>}
                    {key == "Tourists" && (
                      <div>No tourists found following your stashes.</div>
                    )}
                    {key == "Locals" && (
                      <div>You are not following any locals.</div>
                    )}
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
