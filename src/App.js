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
    <div className="App">
       <header>
        <SignOut />
      </header>

      <section>
        {user ? <HomePage /> : <SignIn />}
      </section>

    </div>
  );
}

function SignIn() {

  const signInWithGoogle = () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider);
  }

  return (
    <>
      <button className="sign-in" onClick={signInWithGoogle}>Sign in with Google</button>
    </>
  )

}

function SignOut() {
  return auth.currentUser && (
    <button className="sign-out" onClick={() => auth.signOut()}>Sign Out</button>
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
    const radiusInM = 8.04672 * 1000;

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
          <button className="stashes" onClick={getStashes}>Stashes</button>
          <button className="location" onClick={toggleStashForm}>Get Location</button>
        </div> 

        : 
        
        <div>
            <div id="stashForm" className="stashForm-container">
              <form onSubmit={postStash}  onChange={() => {}}>
                  <label>
                    Describe Your Find:
                  </label>
                  <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} />
                  <select value={category} onChange={(e) => setCategory(e.target.value)}>
                      <option value="any">Anything</option>
                      <option value="drink">Drink</option>
                      <option value="food">Food</option>
                      <option value="outdoors">Outdoors</option>
                    </select>
                  <textarea
                    rows="2.5"
                    cols="15"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                  <input type="submit" value="Submit"/>
                </form>
            </div>
            <button className="location" onClick={toggleStashForm}>Cancel</button> 
        </div>  }
    </div>
  </>)
}


export default App;
