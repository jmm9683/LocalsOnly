import './App.css';

import React, { useRef, useState } from 'react';

import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';
import 'firebase/compat/auth';
import 'firebase/compat/analytics';

import { useAuthState } from 'react-firebase-hooks/auth';
import { useCollectionData } from 'react-firebase-hooks/firestore';

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

  const messagesRef = firestore.collection('userStashes');

  const [position, setPosition] = useState('');
   
  function getCurrentPosition() {
    navigator.geolocation.getCurrentPosition(
      function(position) {
        console.log(position);
        setPosition(position);
      },
  
      function(error) {
        console.error("Error Code = " + error.code + " - " + error.message);
        return(error);
      }
    );
  }

  const savePosition = async (e) => {
    getCurrentPosition() 

    const { uid, photoURL } = auth.currentUser;

    await messagesRef.add({
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
      timestamp: position.timestamp,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      uid
    })

  }
 

  return (<>
    <div>
      <button className="location" onClick={() => savePosition()}>Get Location</button>
    </div>
  </>)
}


export default App;
