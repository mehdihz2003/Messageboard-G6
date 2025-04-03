import { initializeApp } from "firebase/app";
import { getDatabase, ref, push, get, update, remove, onValue } from "firebase/database";
import { deleteOldMessages } from "./autodeleteOldMessages.js";


const firebaseConfig = {
    apiKey: "AIzaSyBkhDaFysGKdVS5xq5MQUMy0sgFImUbz_o",
    authDomain: "messageboard-g6.firebaseapp.com",
    databaseURL: "https://messageboard-g6-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "messageboard-g6",
    storageBucket: "messageboard-g6.appspot.com",
    messagingSenderId: "189203259901",
    appId: "1:189203259901:web:dafe90dd08ad6150d87994"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// ✅ Kör radering av gamla meddelanden vid sidans start
deleteOldMessages(db);

export async function addMessageToFirebase(message, user, color,) {
    let dateString=new Date(Date.now()).toString()
    const messageData = {
        message,
        user,
        like: 0,
        dislike: 0,
        color,
        banned: false,
        dateString,
    };

    const messagesRef = ref(db, "messages");
    const newMessageRef = await push(messagesRef, messageData);
    return { id: newMessageRef.key, ...messageData };
}

export async function fetchMessagesFromFirebase() {
    const messagesRef = ref(db, "messages");
    const snapshot = await get(messagesRef);

    if (!snapshot.exists()) {
        return [];
    }

    const data = snapshot.val();
    return Object.keys(data).map((key) => ({ id: key, ...data[key] }));
}

export async function updateLikeDislikeFirebase(messageId, type) {
    const messageRef = ref(db, `messages/${messageId}`);
    const snapshot = await get(messageRef);

    if (!snapshot.exists()) {
        throw new Error("Message not found");
    }

    const messageData = snapshot.val();
    const updatedData = {
        like: type === "like" ? (messageData.like || 0) + 1 : messageData.like,
        dislike: type === "dislike" ? (messageData.dislike || 0) + 1 : messageData.dislike,
    };

    await update(messageRef, updatedData);
}

export async function addBannedUsersToFirebase(user) {
    const bannedUsersRef = ref(db, "bannedUsers");
    const newBannedUsersRef = await push(bannedUsersRef, { user });
    return { id: newBannedUsersRef.key, user };
}

export async function fetchBannedUsersFromFirebase() {
    const bannedUsersRef = ref(db, "bannedUsers");
    const snapshot = await get(bannedUsersRef);

    if (!snapshot.exists()) {
        return [];
    }

    const data = snapshot.val();
    return Object.keys(data).map((key) => ({ id: key, ...data[key] }));
}

export async function patchBanned(id, banned) {
    const messageRef = ref(db, `messages/${id}`);
    await update(messageRef, { banned });
    return { id, banned };
}

export async function deleteMessageFromFirebase(messageId) {
    try {
        const messageRef = ref(db, `messages/${messageId}`);
        await remove(messageRef);
        console.log("Message deleted successfully");
    } catch (error) {
        console.error("Error deleting message:", error);
    }
}

export function listenForMessageChanges(callback) {
    const messagesRef = ref(db, "messages");

    onValue(messagesRef, (snapshot) => {
        if (!snapshot.exists()) {
            callback([]);
            return;
        }

        const data = snapshot.val();
        const messages = Object.keys(data).map((key) => ({ id: key, ...data[key] }));

        callback(messages);
    });
}
