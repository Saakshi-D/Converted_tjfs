// Access webcam and display video
const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');


navigator.mediaDevices.getUserMedia({ video: true })
    .then((stream) => {
        video.srcObject = stream;
    })
    .catch((error) => {
        console.error('Error accessing webcam:', error);
    });

// Load the model
let model;
(async () => {
    const hostedModelURL = 'https://raw.githubusercontent.com/Saakshi-D/Converted_tjfs/main/model.json';
    model = await tf.loadLayersModel(hostedModelURL);
    console.log('Model loaded');
    detectGesture(); // Start detecting gestures
})();

// Initialize the classNames array (replace with your actual class names)
const classNames = ["SOS Signal Detected...", "SOS Signal Detected...", "SOS Signal Detected...", "SOS Signal Detected...", "SOS Signal Detected...", "SOS Signal Detected...", "SOS Signal Detected...", "SOS Signal Detected...", "SOS Signal Detected...", "SOS Signal Detected..." ]; // Add your gesture class names

// Function to process frames
async function detectGesture() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);

    // Preprocess the image data if necessary
    const inputTensor = preprocessImage(imgData);

    // Make a prediction using the loaded model
    const prediction = await model.predict(inputTensor);

    // Process the prediction result and display it on the canvas
    displayPrediction(prediction);

    // Call the detectGesture function recursively for real-time processing
    requestAnimationFrame(detectGesture);
}

// Function to preprocess image data
function preprocessImage(imgData) {
    // Convert the image data to a TensorFlow tensor and preprocess as needed
    const tensor = tf.browser.fromPixels(imgData).expandDims().toFloat();
    // Perform any required preprocessing here
    return tensor;
}

// Function to display prediction result on the canvas
function displayPrediction(prediction) {
    const classIndex = prediction.argMax().dataSync()[0];
    const className = classNames[classIndex];
    ctx.font = '24px Arial';
    ctx.fillStyle = 'red';
    ctx.fillText(`Gesture: ${className}`, 10, 30);
}