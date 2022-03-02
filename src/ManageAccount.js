import React, { useState, useEffect, Fragment } from "react";
import { Link } from "react-router-dom";
import { Tab, Switch } from "@headlessui/react";

import { firebaseAuth, firestore } from "./Firebase.js";

import {
  getCurrentUser,
  setDisplayName,
  getUserStashes,
  getFollowers,
  getFollowing,
} from "./Users.js";

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

function ManageAccount() {
  const [sharingLink, setSharingLink] = useState(false);
  let [data, setData] = useState({
    "My Stashes": [],
    Tourists: [],
    Locals: [],
  });
  useEffect(() => {
    const { uid } = firebaseAuth.currentUser;
    if (uid) {
      const stashData = getUserStashes(uid);
      stashData.then((value) => {
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
            if (lat && lng) {
              myStashes.push({
                lat: lat,
                lng: lng,
                title: title,
                category: category,
                description: description,
                googleMapsLink: googleMapsLink,
                id: doc.id,
              });
            }
          }
          setData({ ...data, "My Stashes": myStashes });
        }
      });
      const followerData = getFollowers(uid);
      followerData.then((value) => {
        if (value.docs != undefined) {
          // data.Tourists.push(value.docs);
        }
      });
      const followingData = getFollowing(uid);
      followingData.then((value) => {
        if (value.docs != undefined) {
          // data.Locals.push(value.docs);
        }
      });
    }
  }, []);

  return (
    <div className="mt-8 sm:mx-auto w-96">
      <Switch
        checked={sharingLink}
        onChange={setSharingLink}
        className={`${sharingLink ? "bg-teal-900" : "bg-teal-700"}
          relative inline-flex flex-shrink-0 h-[38px] w-[74px] border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus-visible:ring-2  focus-visible:ring-white focus-visible:ring-opacity-75`}
      >
        <span className="sr-only">Use setting</span>
        <span
          aria-hidden="true"
          className={`${sharingLink ? "translate-x-9" : "translate-x-0"}
            pointer-events-none inline-block h-[34px] w-[34px] rounded-full bg-white shadow-lg transform ring-0 transition ease-in-out duration-200`}
        />
      </Switch>
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
        <Tab.Panels className="mt-2 no-scrollbar h-80 overflow-auto ">
          {Object.values(data).map((data, idx) => (
            <Tab.Panel
              key={idx}
              className={classNames(
                " rounded-xl p-3",
                "focus:outline-none focus:ring-2 ring-offset-2 ring-offset-slate-400 ring-white ring-opacity-60"
              )}
            >
              <ul>
                {data.map((data) => (
                  <li className="flex flex-row mb-2 bg-slate-800  bg-opacity-50 rounded-lg shadow">
                    <div className="select-none cursor-pointer flex flex-1 items-center p-4">
                      <a
                        className="select-none cursor-pointer flex flex-1 items-center"
                        href={data.googleMapsLink}
                        target="_blank"
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
                            {data.title}
                          </div>
                          <div className="text-gray-200 text-sm">
                            {data.description}
                          </div>
                        </div>
                        <div className="text-gray-200 text-xs">
                          <button className="location bg-red-800 hover:bg-red-700 px-5 py-2 text-sm leading-3 rounded-full font-semibold text-white">
                            Delete
                          </button>
                        </div>
                      </a>
                    </div>
                  </li>
                ))}
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
