import { initializeApp } from "firebase/app";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyCfHc_ZiRQ-ljkkDVHKw7Kzswjce4kypUg",
  authDomain: "taskup-d4ab6.firebaseapp.com",
  projectId: "taskup-d4ab6",
  storageBucket: "taskup-d4ab6.appspot.com",
  messagingSenderId: "348022720129",
  appId: "1:348022720129:web:e0c094398b19f9fa4bef80",
};

const app = initializeApp(firebaseConfig);
const storage = getStorage(app);

export { storage, ref, uploadBytes, getDownloadURL };
