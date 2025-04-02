import { getDatabase, ref, get, remove } from "./modules/newFirebase.js";

// Funktion för att kontrollera om timestampen är äldre än 2 dagar
const isMessageOld = (timestamp) => {
    const messageDate = new Date(timestamp); // Konverterar timestamp till ett datumobjekt
    const currentDate = new Date(); // Hämtar dagens datum
    const timeDifference = currentDate - messageDate; // Beräknar tidsdifferensen
    const twoDaysInMillis = 2 * 24 * 60 * 60 * 1000; // 2 dagar i millisekunder
    return timeDifference > twoDaysInMillis; // Om meddelandet är äldre än 2 dagar, returnera true
};

// Funktion för att radera gamla meddelanden
const deleteOldMessages = async (messageId) => {
    const db = getDatabase();
    const messageRef = ref(db, `messages/${messageId}/timestamp`); // Hämtar timestamp från Firebase
    
    try {
        const snapshot = await get(messageRef); // Hämtar data från Firebase
        if (snapshot.exists()) { // Om meddelandet finns i Firebase
            const timestamp = snapshot.val(); // Hämtar timestamp-värdet
            console.log(`Checking message ${messageId}, Timestamp: ${timestamp}`);
            
            // Kontrollera om meddelandet är äldre än 2 dagar
            if (isMessageOld(timestamp)) {
                console.log(`Message ${messageId} is old, deleting...`);
                await remove(ref(db, `messages/${messageId}`)); // Tar bort meddelandet från Firebase
                console.log(`Message ${messageId} deleted.`);
            } else {
                console.log(`Message ${messageId} is not old.`);
            }
        } else {
            console.log(`Message ${messageId} not found in Firebase.`);
        }
    } catch (error) {
        console.error("Error fetching message timestamp:", error); // Loggar eventuella fel
    }
};

// Testa funktionen med ett exempel-messageId (ersätt med ett riktigt messageId)
deleteOldMessages('someMessageId'); 
