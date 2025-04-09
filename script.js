const API_URL = "https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct";
const API_KEY = "YOUR_HUGGING_FACE_API_KEY"; // Replace with your Hugging Face API key

async function sendMessage() {
    const userInput = document.getElementById("user-input").value;
    if (!userInput) return;

    const chatBox = document.getElementById("chat-box");
    chatBox.innerHTML += `<div class="user-message">${userInput}</div>`;
    document.getElementById("user-input").value = ""; // Clear input

    // Show bot typing effect
    chatBox.innerHTML += `<div class="bot-message typing">Typing...</div>`;
    chatBox.scrollTop = chatBox.scrollHeight;

    // 🚨 If user types "$", trigger emergency location fetch
    if (userInput.trim() === "$") {
        document.querySelector(".typing").remove();
        chatBox.innerHTML += `<div class="bot-message">🚨 Emergency detected! Fetching exact location...</div>`;
        fetchAccurateLocation();
        return;
    }

    // Predefined emergency responses
    const predefinedResponses = {
        "i am unsafe": "Stay calm. Share your live location with a trusted contact. Call emergency services (112 in India).",
        "i feel followed": "Find a crowded place or enter a shop. Call someone and speak loudly. If possible, record your surroundings.",
        "how can i contact the police": "Dial 112 for emergency police assistance. You can also use safety apps like ‘112 India’ for quick access.",
        "self-defense tips": "1. Stay alert.\n2. Keep keys or objects in hand.\n3. Strike vulnerable areas (eyes, nose, groin).\n4. Trust your instincts and run if needed.",
        "suggest a safe route": "Use well-lit and crowded streets. Avoid isolated areas. Share your live location with family.",
    };

    // Check if input matches predefined responses
    const lowerInput = userInput.toLowerCase();
    if (predefinedResponses[lowerInput]) {
        document.querySelector(".typing").remove();
        chatBox.innerHTML += `<div class="bot-message">${predefinedResponses[lowerInput]}</div>`;
        chatBox.scrollTop = chatBox.scrollHeight;
        return;
    }

    // Hugging Face API call for general questions
    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${API_KEY}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ inputs: userInput })
        });

        const result = await response.json();

        // Remove typing effect and add response
        document.querySelector(".typing").remove();
        if (result && result[0] && result[0].generated_text) {
            chatBox.innerHTML += `<div class="bot-message">${result[0].generated_text}</div>`;
        } else {
            chatBox.innerHTML += `<div class="bot-message">Sorry, I couldn't process that. Try again.</div>`;
        }

        chatBox.scrollTop = chatBox.scrollHeight;
    } catch (error) {
        document.querySelector(".typing").remove();
        chatBox.innerHTML += `<div class="bot-message">Error connecting to AI. Please try again later.</div>`;
        console.error("Error:", error);
    }
}

// 🌍 Fetch exact location using GPS
async function fetchAccurateLocation() {
    if (!navigator.geolocation) {
        alert("Geolocation is not supported by your browser.");
        return;
    }

    navigator.geolocation.getCurrentPosition(async (position) => {
        const { latitude, longitude } = position.coords;
        const locationURL = `https://www.google.com/maps?q=${latitude},${longitude}`;

        const chatBox = document.getElementById("chat-box");
        chatBox.innerHTML += `<div class="bot-message">📍 Location found: <br>Latitude: ${latitude} <br>Longitude: ${longitude}</div>`;
        chatBox.innerHTML += `<div class="bot-message">🔗 <a href="${locationURL}" target="_blank">View on Maps</a></div>`;
        
    }, (error) => {
        const chatBox = document.getElementById("chat-box");
        chatBox.innerHTML += `<div class="bot-message">❌ Unable to fetch location. Please enable GPS and try again.</div>`;
        console.error("Geolocation Error:", error);
    }, { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 });
}
