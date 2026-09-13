"use client";

import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from "react";
import { VaultItem } from "@/types";
import { useAuth } from "./AuthContext";
import { usePin } from "./PinContext";
import { isFirebaseConfigured, db } from "@/lib/firebase";
import {
  deriveKey,
  encryptText,
  decryptText,
} from "@/lib/crypto";
import {
  collection,
  doc,
  getDocs,
  setDoc,
  deleteDoc,
  updateDoc,
} from "firebase/firestore";

interface VaultContextType {
  items: VaultItem[];
  filteredItems: VaultItem[];
  loading: boolean;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  addItem: (
    item: Omit<VaultItem, "id" | "createdAt" | "updatedAt">
  ) => Promise<VaultItem | null>;
  updateItem: (id: string, updates: Partial<VaultItem>) => Promise<boolean>;
  deleteItem: (id: string) => Promise<boolean>;
  refreshVault: () => Promise<void>;
}

const VaultContext = createContext<VaultContextType>({
  items: [],
  filteredItems: [],
  loading: false,
  searchQuery: "",
  setSearchQuery: () => {},
  addItem: async () => null,
  updateItem: async () => false,
  deleteItem: async () => false,
  refreshVault: async () => {},
});

export function VaultProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const { isUnlocked } = usePin();
  const [items, setItems] = useState<VaultItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [masterKey, setMasterKey] = useState<CryptoKey | null>(null);

  // Initialize client encryption key for user
  useEffect(() => {
    let active = true;
    async function initKey() {
      if (!user) {
        setMasterKey(null);
        return;
      }
      try {
        // Derive client-side AES-GCM-256 key
        const key = await deriveKey(user.uid, `salt_vault_${user.uid}`);
        if (active) setMasterKey(key);
      } catch (err) {
        console.error("Master key derivation failed:", err);
      }
    }
    initKey();
    return () => {
      active = false;
    };
  }, [user]);

  const loadVault = useCallback(async () => {
    if (!user || !masterKey || !isUnlocked) {
      return;
    }

    setLoading(true);

    if (isFirebaseConfigured && db) {
      try {
        const vaultCol = collection(db, "users", user.uid, "vault");
        const snap = await getDocs(vaultCol);
        const decryptedList: VaultItem[] = [];

        for (const docSnap of snap.docs) {
          const data = docSnap.data();
          let decryptedPass = "";
          let decryptedNotes = "";

          try {
            decryptedPass = await decryptText(data.password, data.iv, masterKey);
          } catch {
            decryptedPass = "[Decryption Error]";
          }

          if (data.notes) {
            try {
              decryptedNotes = await decryptText(data.notes, data.iv, masterKey);
            } catch {
              decryptedNotes = "";
            }
          }

          decryptedList.push({
            id: docSnap.id,
            title: data.title || "",
            username: data.username || "",
            password: decryptedPass,
            url: data.url || "",
            notes: decryptedNotes,
            category: data.category || "login",
            favorite: Boolean(data.favorite),
            createdAt: data.createdAt?.toMillis?.() || data.createdAt || Date.now(),
            updatedAt: data.updatedAt?.toMillis?.() || data.updatedAt || Date.now(),
          });
        }

        decryptedList.sort((a, b) => b.updatedAt - a.updatedAt);
        setItems(decryptedList);
      } catch (err) {
        console.error("Failed to load vault from Firestore:", err);
      }
    } else {
      // Local Demo Storage
      const rawStored = localStorage.getItem(`keyora_vault_${user.uid}`);
      if (rawStored) {
        try {
          const rawItems = JSON.parse(rawStored);
          const decryptedList: VaultItem[] = [];

          for (const raw of rawItems) {
            let decryptedPass = "";
            let decryptedNotes = "";
            try {
              decryptedPass = await decryptText(raw.password, raw.iv, masterKey);
            } catch {
              decryptedPass = raw.password; // Fallback if plain demo
            }

            if (raw.notes) {
              try {
                decryptedNotes = await decryptText(raw.notes, raw.iv, masterKey);
              } catch {
                decryptedNotes = raw.notes;
              }
            }

            decryptedList.push({
              ...raw,
              password: decryptedPass,
              notes: decryptedNotes,
            });
          }

          decryptedList.sort((a, b) => b.updatedAt - a.updatedAt);
          setItems(decryptedList);
        } catch (err) {
          console.error("Local vault parsing error:", err);
          setItems([]);
        }
      } else {
        // Populate rich starter demo items if vault is empty in demo mode
        const demoDefaults: VaultItem[] = [
          {
            id: "vault_demo_1",
            title: "Google Workspace",
            username: user.email || "alex.rivera@gmail.com",
            password: "K9$vL2@mQ7!xZ8#p",
            url: "accounts.google.com",
            notes: "Main work and cloud account",
            category: "login",
            favorite: true,
            createdAt: Date.now() - 86400000 * 2,
            updatedAt: Date.now() - 86400000 * 2,
          },
          {
            id: "vault_demo_2",
            title: "GitHub Enterprise",
            username: "alex-developer",
            password: "X7#mQ9!vL2@pK8$z",
            url: "github.com",
            notes: "Personal access token stored in note",
            category: "login",
            favorite: true,
            createdAt: Date.now() - 86400000,
            updatedAt: Date.now() - 86400000,
          },
          {
            id: "vault_demo_3",
            title: "Figma Design Cloud",
            username: user.email || "alex.rivera@gmail.com",
            password: "W4@yB8^qN1*rT5#e",
            url: "figma.com",
            notes: "Team license administrator",
            category: "login",
            favorite: false,
            createdAt: Date.now(),
            updatedAt: Date.now(),
          },
        ];

        // Encrypt and persist starter items
        (async () => {
          const encryptedList = [];
          for (const itm of demoDefaults) {
            const { ciphertext, iv } = await encryptText(itm.password, masterKey);
            const notesEnc = itm.notes
              ? (await encryptText(itm.notes, masterKey)).ciphertext
              : "";
            encryptedList.push({
              ...itm,
              password: ciphertext,
              notes: notesEnc,
              iv,
            });
          }
          localStorage.setItem(
            `keyora_vault_${user.uid}`,
            JSON.stringify(encryptedList)
          );
          setItems(demoDefaults);
        })();
      }
    }

    setLoading(false);
  }, [user, masterKey, isUnlocked]);

  useEffect(() => {
    if (isUnlocked && masterKey) {
      loadVault();
    } else {
      setItems([]);
    }
  }, [isUnlocked, masterKey, loadVault]);

  const addItem = async (
    itemData: Omit<VaultItem, "id" | "createdAt" | "updatedAt">
  ): Promise<VaultItem | null> => {
    if (!user || !masterKey) return null;

    try {
      const id = "key_" + Math.random().toString(36).substring(2, 11);
      const timestamp = Date.now();
      const { ciphertext: encryptedPass, iv } = await encryptText(
        itemData.password,
        masterKey
      );

      let encryptedNotes = "";
      if (itemData.notes) {
        encryptedNotes = (await encryptText(itemData.notes, masterKey)).ciphertext;
      }

      const newItem: VaultItem = {
        ...itemData,
        id,
        createdAt: timestamp,
        updatedAt: timestamp,
      };

      if (isFirebaseConfigured && db) {
        const itemRef = doc(db, "users", user.uid, "vault", id);
        await setDoc(itemRef, {
          title: itemData.title,
          username: itemData.username,
          password: encryptedPass,
          notes: encryptedNotes,
          url: itemData.url || "",
          category: itemData.category || "login",
          favorite: Boolean(itemData.favorite),
          iv,
          createdAt: timestamp,
          updatedAt: timestamp,
        });
      } else {
        const rawStored = localStorage.getItem(`keyora_vault_${user.uid}`);
        const currentList = rawStored ? JSON.parse(rawStored) : [];
        currentList.unshift({
          title: itemData.title,
          username: itemData.username,
          password: encryptedPass,
          notes: encryptedNotes,
          url: itemData.url || "",
          category: itemData.category || "login",
          favorite: Boolean(itemData.favorite),
          iv,
          id,
          createdAt: timestamp,
          updatedAt: timestamp,
        });
        localStorage.setItem(
          `keyora_vault_${user.uid}`,
          JSON.stringify(currentList)
        );
      }

      setItems((prev) => [newItem, ...prev]);
      return newItem;
    } catch (err) {
      console.error("Failed to add vault item:", err);
      return null;
    }
  };

  const updateItem = async (id: string, updates: Partial<VaultItem>): Promise<boolean> => {
    if (!user || !masterKey) return false;

    try {
      const timestamp = Date.now();
      let encryptedPass: string | undefined;
      let encryptedNotes: string | undefined;
      let newIv: string | undefined;

      if (updates.password) {
        const enc = await encryptText(updates.password, masterKey);
        encryptedPass = enc.ciphertext;
        newIv = enc.iv;
      }

      if (updates.notes) {
        const enc = await encryptText(updates.notes, masterKey);
        encryptedNotes = enc.ciphertext;
      }

      if (isFirebaseConfigured && db) {
        const itemRef = doc(db, "users", user.uid, "vault", id);
        const docUpdates: Record<string, unknown> = { updatedAt: timestamp };
        if (updates.title !== undefined) docUpdates.title = updates.title;
        if (updates.username !== undefined) docUpdates.username = updates.username;
        if (updates.url !== undefined) docUpdates.url = updates.url;
        if (updates.category !== undefined) docUpdates.category = updates.category;
        if (updates.favorite !== undefined) docUpdates.favorite = updates.favorite;
        if (encryptedPass !== undefined) {
          docUpdates.password = encryptedPass;
          docUpdates.iv = newIv;
        }
        if (encryptedNotes !== undefined) docUpdates.notes = encryptedNotes;

        await updateDoc(itemRef, docUpdates);
      } else {
        const rawStored = localStorage.getItem(`keyora_vault_${user.uid}`);
        if (rawStored) {
          const list = JSON.parse(rawStored);
          const idx = list.findIndex((i: { id: string }) => i.id === id);
          if (idx !== -1) {
            list[idx] = {
              ...list[idx],
              ...updates,
              ...(encryptedPass ? { password: encryptedPass, iv: newIv } : {}),
              ...(encryptedNotes ? { notes: encryptedNotes } : {}),
              updatedAt: timestamp,
            };
            localStorage.setItem(
              `keyora_vault_${user.uid}`,
              JSON.stringify(list)
            );
          }
        }
      }

      setItems((prev) =>
        prev.map((itm) => (itm.id === id ? { ...itm, ...updates, updatedAt: timestamp } : itm))
      );
      return true;
    } catch (err) {
      console.error("Failed to update vault item:", err);
      return false;
    }
  };

  const deleteItem = async (id: string): Promise<boolean> => {
    if (!user) return false;
    try {
      if (isFirebaseConfigured && db) {
        await deleteDoc(doc(db, "users", user.uid, "vault", id));
      } else {
        const rawStored = localStorage.getItem(`keyora_vault_${user.uid}`);
        if (rawStored) {
          const list = JSON.parse(rawStored);
          const filtered = list.filter((i: { id: string }) => i.id !== id);
          localStorage.setItem(
            `keyora_vault_${user.uid}`,
            JSON.stringify(filtered)
          );
        }
      }

      setItems((prev) => prev.filter((i) => i.id !== id));
      return true;
    } catch (err) {
      console.error("Failed to delete vault item:", err);
      return false;
    }
  };

  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return items;
    const q = searchQuery.toLowerCase();
    return items.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        item.username.toLowerCase().includes(q) ||
        (item.url && item.url.toLowerCase().includes(q))
    );
  }, [items, searchQuery]);

  return (
    <VaultContext.Provider
      value={{
        items,
        filteredItems,
        loading,
        searchQuery,
        setSearchQuery,
        addItem,
        updateItem,
        deleteItem,
        refreshVault: loadVault,
      }}
    >
      {children}
    </VaultContext.Provider>
  );
}

export const useVault = () => useContext(VaultContext);
