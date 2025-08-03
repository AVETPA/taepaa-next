// src/hooks/useMembership.js
import { useState, useEffect } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../utils/firebase";
import useAuth from "./useAuth";

export default function useMembership() {
  const { user } = useAuth();
  const [isMember, setIsMember] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.uid) return;

    const fetchStatus = async () => {
      const docRef = doc(db, "trainerProfiles", user.uid);
      const snapshot = await getDoc(docRef);
      if (snapshot.exists()) {
        const data = snapshot.data();
        setIsMember(data.membershipActive === true);
      }
      setLoading(false);
    };

    fetchStatus();
  }, [user]);

  return { isMember, loading };
}
