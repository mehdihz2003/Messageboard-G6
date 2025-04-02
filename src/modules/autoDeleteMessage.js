import { getDatabase, ref, get, remove } from "firebase/database";

const isMessageOld = (timestamp) => {
    const messageDate = new Date(timestamp);
    const currentDate = new Date();
    const timeDifference = currentDate - messageDate;
    const twoDays = 2 * 24 * 60 * 60 * 1000; // 2 dagar i millisekunder
    return timeDifference > twoDays;
};

const deleteOldMessages = async (messageId) => {
    const db = getDatabase();
    const messageRef = ref(db, `messages/${messageId}/timestamp`);
    
    try {
        const snapshot = await get(messageRef);
        if (snapshot.exists()) {
            const timestamp = snapshot.val();
            console.log(`Checking message ${messageId}, Timestamp: ${timestamp}`);
            if (isMessageOld(timestamp)) {
                console.log(`Message ${messageId} is old, deleting...`);
                await remove(ref(db, `messages/${messageId}`));
                console.log(`Message ${messageId} deleted.`);
            } else {
                console.log(`Message ${messageId} is not old.`);
            }
        } else {
            console.log(`Message ${messageId} not found in Firebase.`);
        }
    } catch (error) {
        console.error("Error fetching message timestamp:", error);
    }
};

// För att testa:
deleteOldMessages('someMessageId'); // Ersätt med ett riktigt messageId från din Firebase
