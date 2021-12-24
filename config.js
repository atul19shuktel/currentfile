import firebase from 'firebase'
require('firebase/firestore')

const firebaseConfig = {
    apiKey: "AIzaSyDCJ_V-f4OCswSrLZv88cS_WfyrN4pariE",
    authDomain: "elib-9b333.firebaseapp.com",
    projectId: "elib-9b333",
    storageBucket: "elib-9b333.appspot.com",
    messagingSenderId: "275416341217",
    appId: "1:275416341217:web:e41e380b4f9de10acc35a0"
  };
  
  firebase.initializeApp(firebaseConfig);
  export default firebase.firestore()