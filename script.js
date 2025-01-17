let score = 0; // Initialize the score
let currentCell = null; // Track which cell was clicked
const guessedCards = new Set();

const GRID_CRITERIA = {
    // Row: 1800 DEF
    "cell-1": { "atk__exact": 0, "defense__exact": 1800 },
    "cell-2": { "type__contains": "Flip Effect Monster", "defense__exact": 1800 },
    "cell-3": { "attribute__iexact": "FIRE", "defense__exact": 1800 },

    // Row: Tuner Monster
    "cell-4": { "atk__exact": 0, "type__exact": "Tuner Monster" },
    "cell-5": { "type__exact": "Tuner Monster", "type__contains": "Flip Effect Monster" },
    "cell-6": { "type__exact": "Tuner Monster", "attribute__iexact": "FIRE" },

    // Row: Level 2 Monster
    "cell-7": { "level__exact": 2, "atk__exact": 0 },
    "cell-8": { "level__exact": 2, "type__contains": "Flip Effect Monster" },
    "cell-9": { "level__exact": 2, "attribute__iexact": "FIRE" },
};



// Function to open the form
function openForm(cellId) {
    currentCell = cellId; // Save the ID of the clicked cell
    document.getElementById("input-field").value = ""; // Clear input field
    document.getElementById("popup-form").style.display = "block";
    document.getElementById("overlay").style.display = "block";
}

// Function to close the form
function closeForm() {
    document.getElementById("popup-form").style.display = "none";
    document.getElementById("overlay").style.display = "none";
}

function showToast(message) {
    const toast = document.getElementById('toast');
    toast.innerText = message;
    toast.classList.add('show');

    // Remove the toast after 3 seconds
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}


//const BACKEND_ENDPOINT = 'https://ygo-grid-backend.onrender.com/api/validate-card/';

console.log("Backend Endpoint:", BASE_URL);


// Awesomplete Integration
document.addEventListener("DOMContentLoaded", function () {
    const inputField = document.getElementById("input-field");

    if (!inputField) {
        console.error("Input field not found!");
        return;
    }

    console.log("Input field found:", inputField);

    const awesomplete = new Awesomplete(inputField, {
        minChars: 2, // Show suggestions after typing 2 characters
        maxItems: 20, // Limit to 10 suggestions
    });
    console.log("Awesomplete initialized:", awesomplete);

    inputField.addEventListener("input", function () {
        const query = inputField.value;
    
        if (query.length > 1) { // Trigger fetch only for meaningful input
            const url = `${BASE_URL}/api/autocomplete/?q=${encodeURIComponent(query)}`;
            console.log(`Fetching suggestions from: ${url}`); // Debugging log
    
            fetch(url)
                .then(response => response.json())
                .then(data => {
                    console.log("Suggestions received:", data); // Debugging log
                    awesomplete.list = data; // Populate Awesomplete with API data
                })
                .catch(error => {
                    console.error("Error fetching suggestions:", error);
                });
        }
    });    
});

function submitAnswer() {
    const inputField = document.getElementById("input-field").value;

    

    if (inputField.trim() !== "") {

        if (guessedCards.has(inputField.toLowerCase())) {
            showToast(`"${inputField}" has already been guessed! Try another card.`);
            return;
        }

        const criteria = GRID_CRITERIA[currentCell];
        if (!criteria) {
            showToast("Invalid cell. Please try again.");
            return;
        }

        console.log("Selected Cell:", currentCell);
        console.log("Criteria Sent:", criteria); // Log for debugging

        fetch(`${BASE_URL}/api/validate-card/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                name: inputField,
                criteria, // Send the full criteria dictionary
            }),
        })
            .then(response => response.json())
            .then(data => {
                console.log("Response:", data); // Log for debugging
                if (data.message === "Valid guess!") {
                    // Add 'validated' class to the grid item
                    const cell = document.querySelector(`[onclick="openForm('${currentCell}')"]`);
                    if (cell) {
                        cell.classList.add("validated"); // Add the validated class
                    }
                    //alert(`Correct! ${data.card_name} was validated.`);
                    // above comented out so we dont have alert box anymore

                    // Add the guessed card to the Set to prevent future duplicates
                    guessedCards.add(inputField.toLowerCase());

                    // increment the score
                    score++
                    document.getElementById("score").textContent = score;

                } else {
                    showToast(data.message || "Invalid guess.");
                }
            })
            .catch(error => {
                console.error("Error:", error);
                showToast(`Error connecting to the server:\n\n${error.message}`);
            });

        closeForm();
    } else {
        showToast("Please enter a guess!");
    }
}
