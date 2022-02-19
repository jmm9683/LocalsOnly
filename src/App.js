import './App.css';

import React, { useRef, useState, useEffect } from 'react';

import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';
import 'firebase/compat/auth';
import 'firebase/compat/analytics';

import { useAuthState } from 'react-firebase-hooks/auth';
import { useCollectionData } from 'react-firebase-hooks/firestore';
 
const geofire = require('geofire-common');

firebase.initializeApp({
  apiKey: "AIzaSyDjt6b4uyV7S1Fgwz_au0Q6IUu1lUEwEhw",
  authDomain: "localsonly-734fb.firebaseapp.com",
  projectId: "localsonly-734fb",
  storageBucket: "localsonly-734fb.appspot.com",
  messagingSenderId: "31276590151",
  appId: "1:31276590151:web:cfa057d0c031a44447bd62",
  measurementId: "G-GKS29HW05G"

})

const auth = firebase.auth();
const firestore = firebase.firestore();
const analytics = firebase.analytics();

function App() {

  const [user] = useAuthState(auth);


  return (
    <div className="App min-h-screen bg-gradient-to-r from-slate-800 via-slate-600 to-slate-800
       py-6 flex flex-col justify-center relative overflow-hidden sm:py-12">
      <div className="absolute inset-0 bg-[url(img/grid.svg)] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]"></div>
      <div className="relative px-6 pt-5 pb-8 bg-white shadow-xl ring-1 ring-gray-900/5 max-w-lg mx-auto rounded-lg">
        <header className="grid grid-cols-4 place-items-end">
          <SignOut />
        </header>
        <section className="flex flex-col justify-center relative">
          {user ? <HomePage /> : <SignIn />}
        </section>
      </div>
       
    </div>
  );
}

function SignIn() {

  const signInWithGoogle = () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider);
  }

  return (
    <div>
      <button className="sign-in bg-slate-500 hover:bg-slate-700 px-5 py-2 text-sm leading-3 rounded-full font-semibold text-white" onClick={signInWithGoogle}>Sign in with Google</button>
    </div>
  )

}

function SignOut() {
  return auth.currentUser && (
    <div className="col-start-4">
      <button className="sign-out bg-red-500 hover:bg-red-700 px-5 py-2 text-sm leading-3 rounded-full font-semibold text-white"  onClick={() => auth.signOut()}>X</button>
    </div>
  )
}


function HomePage() {

  const [showStashForm, setShowStashForm] = useState(false)
  const toggleStashForm = () => setShowStashForm(!showStashForm)

  //POSTING DATA
  const [position, setPosition] = useState('');
  const [positionHash, setPositionHash] = useState('');

  const [category, setCategory] = useState('any');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
   
  const [posting, setPosting] = useState(false);
  useEffect(() => {
    if (posting) {
      savePosition();
    }
  }, [posting]);

  function getCurrentPosition() {
    navigator.geolocation.getCurrentPosition(
      function(position) {
        setPosition(position);
        setPositionHash(geofire.geohashForLocation([position.coords.latitude,position.coords.longitude]));
        setPosting(true);
      },
      function(error) {
        console.error("Error Code = " + error.code + " - " + error.message);
        return(error);
      }
    );
    
  }

  const savePosition = async (e) => {

    const { uid } = auth.currentUser;
    const userStashes = firestore.collection('stashes').doc(uid).collection('stashes');
    await userStashes.add({
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
      positionHash: positionHash,
      title: title,
      category: category,
      description: description,
      category_positionHash: category + "_" + positionHash,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      uid
    })
    setPosting(false);
  }

  function postStash(e) {
    e.preventDefault();
    getCurrentPosition()
    toggleStashForm();
  }

  //QUERYING
  const [range, setRange] = useState(3.21869);
  const [query, setQuery] = useState(false);
  useEffect(() => {
    if (query) {
      stashQuery();
    }
  }, [query]);

  function getCurrentPositionQuery() {
    navigator.geolocation.getCurrentPosition(
      function(position) {
        setPosition(position);
        setPositionHash(geofire.geohashForLocation([position.coords.latitude,position.coords.longitude]));
        setQuery(true);
      },
      function(error) {
        console.error("Error Code = " + error.code + " - " + error.message);
        return(error);
      }
    );
    
  }

  const stashQuery = async (e) => {
    const { uid } = auth.currentUser;
    const userStashes = firestore.collection('stashes').doc(uid).collection('stashes');
    // Find Stasthes within 5mi (8.04672km)
    const center = [position.coords.latitude,position.coords.longitude];
    const radiusInM = range * 1000;

    // Each item in 'bounds' represents a startAt/endAt pair. We have to issue
    // a separate query for each pair. There can be up to 9 pairs of bounds
    // depending on overlap, but in most cases there are 4.
    const bounds = geofire.geohashQueryBounds(center, radiusInM);
    const promises = [];
    for (const b of bounds) {
      const q =userStashes.orderBy('positionHash')
        .startAt(b[0])
        .endAt(b[1]);
      promises.push(q.get());
    }
    // Collect all the query results together into a single list
    Promise.all(promises).then((snapshots) => {
      const matchingDocs = [];

      for (const snap of snapshots) {
        for (const doc of snap.docs) {
          const lat = doc.get('latitude');
          const lng = doc.get('longitude');

          // We have to filter out a few false positives due to GeoHash
          // accuracy, but most will match
          const distanceInKm = geofire.distanceBetween([lat, lng], center);
          const distanceInM = distanceInKm * 1000;
          if (distanceInM <= radiusInM) {
            matchingDocs.push(doc);
          }
        }
      }

      return matchingDocs;
    }).then((matchingDocs) => {
      setQuery(false);
      for (const doc of matchingDocs){
        console.log(doc.get('latitude'));
      }
    });
  }

  function getStashes(e) {
    getCurrentPositionQuery()
  }

  return (<>
    <div>
      { !showStashForm ? 
        <div>
          <select value={range} onChange={(e) => setRange(e.target.value)}>
            <option value="3.21869">2mi</option>
            <option value="8.04672">5mi</option>
            <option value="16.0934">10mi</option>
          </select>
          <br/>
          <button className="stashes bg-green-500 hover:bg-green-700 px-5 py-2 text-sm leading-5 rounded-full font-semibold text-white" onClick={getStashes}>Stashes</button>
          <br/>
          <button className="location bg-amber-500 hover:bg-amber-700 px-5 py-2 text-sm leading-5 rounded-full font-semibold text-white" onClick={toggleStashForm}>Get Location</button>
        </div> 

        : 
        
        <div>
            <div id="stashForm" className="stashForm-container">
              <form onSubmit={postStash}  onChange={() => {}}>
                  <label className="text-3xl font-bold">
                    Describe Your Find:
                  </label>
                  <br/>
                  <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} />
                  <br/>
                  <select value={category} onChange={(e) => setCategory(e.target.value)}>
                      <option value="any">Anything</option>
                      <option value="drink">Drink</option>
                      <option value="food">Food</option>
                      <option value="outdoors">Outdoors</option>
                    </select>
                    <br/>
                  <textarea
                    rows="2.5"
                    cols="15"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                  <br/>
                  <input type="submit" className="bg-sky-500 hover:bg-sky-700 px-5 py-2 text-sm leading-5 rounded-full font-semibold text-white" value="Submit"/>
                </form>
            </div>
            <br/>
            <button className="location bg-red-500 hover:bg-red-700 px-5 py-2 text-sm leading-3 rounded-full font-semibold text-white" onClick={toggleStashForm}>Cancel</button> 
        </div>  }
    </div>
  </>)
}


export default App;
