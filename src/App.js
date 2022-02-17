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

  const messagesRef = firestore.collection('userStashes');

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

    await messagesRef.add({
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

  return (<>
    <div>
      { !showStashForm ? <button className="location" onClick={toggleStashForm}>Get Location</button> : null }
      { showStashForm ? 
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
        </div> 
      : null }
    </div>
  </>)
}


export default App;
