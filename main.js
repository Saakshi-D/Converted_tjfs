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



async function detectGesture() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Get the image data from the canvas
    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);

    // Preprocess the image data
    const inputTensor = preprocessImage(imgData);

    // Make a prediction using the loaded model
    const prediction = await model.predict(inputTensor);

    // Process the prediction result and display it on the canvas
    displayPrediction(prediction, inputTensor);

    // Call the detectGesture function recursively for real-time processing
    requestAnimationFrame(detectGesture);
}


// Function to preprocess image data
function preprocessImage(imgData) {
    // Convert ImageData to a TensorFlow tensor
    const tensor = tf.browser.fromPixels(imgData).toFloat();

    // Resize the tensor to match the input size expected by the model
    const resizedTensor = tf.image.resizeBilinear(tensor, [150, 300]);

    // Normalize the tensor to values between 0 and 1
    const normalizedTensor = resizedTensor.div(255.0);

    // Expand dimensions to match the batch size
    const batchedTensor = normalizedTensor.expandDims(0);

    return batchedTensor;
}


// Function to send image data to the server for prediction
async function sendImageForPrediction(imageData) {
    const response = await fetch('http://localhost:5000/predict', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ imageData: Array.from(imageData.data) }), // Convert TypedArray to regular array
    });

    const prediction = await response.json();

    // Process the prediction and update the canvas as needed
    updateCanvasWithPrediction(prediction);
}


// Function to display prediction result on the canvas
async function displayPrediction(prediction, inputTensor) {
    const classIndex = prediction.argMax().dataSync()[0];
    const className = classNames[classIndex];
    ctx.font = '24px Arial';
    ctx.fillStyle = 'red';
    ctx.fillText(`Gesture: ${className}`, 10, 30);

    // Send the preprocessed inputTensor to the server for prediction
    sendImageForPrediction(inputTensor);
}

