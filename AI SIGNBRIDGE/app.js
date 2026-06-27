// Paste the URL provided by Teachable Machine export panel
const URL = "https://teachablemachine.withgoogle.com/models/_VYYllhM4/"; 

let model, webcam, labelContainer, maxPredictions;
const startBtn = document.getElementById('start-btn');
const loadingText = document.getElementById('loading-text');
const translatedText = document.getElementById('translated-text');

// Load the image model and setup the webcam
async function init() {
    startBtn.style.display = 'none'; // Hide button after click
    loadingText.innerText = "Loading Model...";

    const modelURL = URL + "model.json";
    const metadataURL = URL + "metadata.json";

    // Load the model and metadata
    model = await tmImage.load(modelURL, metadataURL);
    maxPredictions = model.getTotalClasses();

    loadingText.innerText = "Starting Camera...";

    // Convenience function to setup a webcam
    const flip = true; // whether to flip the webcam
    webcam = new tmImage.Webcam(400, 400, flip); // width, height, flip
    await webcam.setup(); // request access to the webcam
    await webcam.play();
    
    loadingText.style.display = 'none'; // Hide loading text
    window.requestAnimationFrame(loop);

    // Append elements to the DOM
    document.getElementById("webcam-container").appendChild(webcam.canvas);
    
    labelContainer = document.getElementById("prediction-list");
    for (let i = 0; i < maxPredictions; i++) { // div for class labels
        labelContainer.appendChild(document.createElement("div"));
    }
}

async function loop() {
    webcam.update(); // update the webcam frame
    await predict();
    window.requestAnimationFrame(loop);
}

// Run the webcam image through the image model
async function predict() {
    // predict can take in an image, video or canvas html element
    const prediction = await model.predict(webcam.canvas);
    
    let highestPredictionName = "";
    let highestPredictionValue = 0;

    for (let i = 0; i < maxPredictions; i++) {
        const className = prediction[i].className;
        const probability = prediction[i].probability.toFixed(2);
        
        // Display probability list on UI
        labelContainer.childNodes[i].innerHTML = `
            <div class="prediction-bar">
                <strong>${className}:</strong> ${(probability * 100).toFixed(0)}%
            </div>
        `;

        // Track the prediction with the highest confidence score
        if (prediction[i].probability > highestPredictionValue) {
            highestPredictionValue = prediction[i].probability;
            highestPredictionName = className;
        }
    }

    // Display the final translated result if confidence is high (above 75%)
    if (highestPredictionValue > 0.75) {
        translatedText.innerText = highestPredictionName.toUpperCase();
    } else {
        translatedText.innerText = "...";
    }
}

// Event Listener
startBtn.addEventListener('click', init);