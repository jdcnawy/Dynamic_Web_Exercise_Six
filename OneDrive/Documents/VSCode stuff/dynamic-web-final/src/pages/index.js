import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { getDocs, getFirestore, collection, where, query, onSnapshot } from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import PostCard from "@/app/components/PostCard";
import styles from "../app/components/components.module.css";

export default function Dashboard() {
  const router = useRouter();
  const [allPosts, setAllPosts] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const auth = getAuth();

    // Listen for changes in authentication state
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // User is signed in
        setCurrentUser(user.uid);
      } else {
        // No user is signed in
        setCurrentUser(null);
        router.push("/login");
      }
    });

    // Cleanup function
    return () => {
      unsubscribe();
    };
  }, [router]);

  useEffect(() => {
    if (currentUser) {
      const db = getFirestore();
      const q = query(collection(db, "posts"), where("userId", "==", currentUser));

      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const postsArray = [];
        querySnapshot.forEach((post) => {
          postsArray.push({ id: post.id, ...post.data() });
        });
        setAllPosts(postsArray);
      });

      return () => {
        unsubscribe();
      };
    }
  }, [currentUser]);

  return (
    <main className={styles.Dashboard}>
      <h1>Dashboard</h1>
      {allPosts.map((post, i) => (
        <PostCard post={post} key={i} />
      ))}
    </main>
  );
}
