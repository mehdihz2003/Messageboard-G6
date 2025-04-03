import { ref, get, remove, update } from "firebase/database"; // Importera nödvändiga funktioner från Firebase

/// Funktion för att kontrollera om meddelandet är äldre än 2 dagar (eller en kortare tid för test)
export const isMessageOld = (timestamp) => {
    const messageDate = new Date(timestamp); // Konvertera Unix timestamp till ett Date-objekt
    const currentDate = new Date(); // Hämta dagens datum
    const timeDifference = currentDate - messageDate; // Beräkna tidsdifferensen
    const twoDaysInMillis = 2 * 24 * 60 * 60 * 1000; // 2 dagar i millisekunder
    
    console.log("🕒 Kontroll av meddelandeålder:");
    console.log(`📌 Meddelandets tidstämpel: ${messageDate}`);
    console.log(`📌 Aktuellt datum: ${currentDate}`);
    console.log(`⏳ Tidsdifferens i millisekunder: ${timeDifference}`);
    console.log(`⌛ Gräns för radering: ${twoDaysInMillis}`);

    return timeDifference > twoDaysInMillis; // Om meddelandet är äldre än 2 dagar, returnera true
};

// Funktion för att ta bort gamla meddelanden från Firebase
export async function deleteOldMessages(db) {
    console.log("🗑️ deleteOldMessages har startat!");

    const messagesRef = ref(db, "messages");

    try {
        const snapshot = await get(messagesRef); // Hämta alla meddelanden från Firebase

        if (!snapshot.exists()) {
            console.log("⚠️ Inga meddelanden hittades.");
            return;
        }

        const messages = snapshot.val();
        console.log("📩 Hämtade meddelanden:", messages);

        // Loopa igenom alla meddelanden och kontrollera om de är äldre än 2 dagar
        for (const messageId in messages) {
            const message = messages[messageId];
            let timestamp = message.timestamp; // Hämta timestamp istället för dateString

            if (!timestamp) {
                // Om meddelandet saknar timestamp, sätt nuvarande tid
                console.log(`⚠️ Meddelande ${messageId} saknar en giltig timestamp. Använder nu tidsstämpel för nuvarande tid.`);
                timestamp = Date.now(); // Sätt nuvarande tid (Unix timestamp)

                // Uppdatera meddelandet med den nya timestampen
                await update(ref(db, `messages/${messageId}`), { timestamp });

                console.log(`✅ Meddelande ${messageId} har nu fått en giltig timestamp.`);
            }

            console.log(`🕵️‍♂️ Kontrollerar meddelande ${messageId} med timestamp: ${timestamp}`);

            // Om meddelandet är äldre än 2 dagar, ta bort det
            if (isMessageOld(timestamp)) {
                console.log(`🗑️ Tar bort gammalt meddelande ${messageId}...`);
                await remove(ref(db, `messages/${messageId}`)); // Ta bort meddelandet från Firebase
                console.log(`✅ Meddelande ${messageId} har raderats!`);
            } else {
                console.log(`✅ Meddelande ${messageId} är fortfarande nytt.`);
            }
        }
    } catch (error) {
        console.error("❌ Fel vid radering av gamla meddelanden:", error);
    }
} 

