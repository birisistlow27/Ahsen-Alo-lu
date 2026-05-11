import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import fs from 'fs';

const firebaseConfig = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf-8'));
const app = initializeApp(firebaseConfig);
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

async function clear() {
  console.log("Clearing DB...");
  const collections = ['products', 'categories', 'orders'];
  for (const coll of collections) {
    const snapshot = await getDocs(collection(db, coll));
    for (const d of snapshot.docs) {
      await deleteDoc(doc(db, coll, d.id));
      console.log(`Deleted ${coll}/${d.id}`);
    }
  }
  console.log("Done");
  process.exit(0);
}

clear().catch(console.error);
