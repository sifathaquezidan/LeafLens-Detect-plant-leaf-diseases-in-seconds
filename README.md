# Leaf Disease Detection Web Application (LeafLens)

LeafLens is a deep learning–based web application that detects plant leaf diseases from images using a Convolutional Neural Network (CNN). Users can upload a leaf image or capture one using their device camera (PC or mobile), and the system predicts the disease name along with confidence scores. The application is designed with a modern, plant-inspired user interface and works seamlessly across desktop and mobile browsers.

# Features

Image upload from device (PC & mobile)

Camera capture using device camera

Responsive and animated plant-themed UI

CNN-based plant disease classification

Top-1 and Top-3 predictions with confidence

Rejection of non-leaf images using confidence threshold

FastAPI backend for real-time inference

Works on desktop, tablet, and mobile browsers

# Model Details

The system uses a Convolutional Neural Network (CNN) trained for plant leaf disease classification.

Framework: PyTorch

Deployment format: TorchScript (.pt)

Input image size: 160 × 160 RGB

Image normalization: ImageNet mean and standard deviation

Total classes: 52 (disease + healthy categories)

Explainability: Grad-CAM visualizations generated for all classes

The trained model is exported as a TorchScript file for efficient deployment in the backend.

# Supported Crops and Diseases

The model supports multiple crops and their diseases, including:

Apple, Banana, Bean, Blueberry, Corn, Grape, Mango, Pepper, Potato, Rice, Strawberry, Tomato

Examples of detected diseases include Apple Scab, Banana Sigatoka, Mango Anthracnose, Rice Leaf Blast, Tomato Leaf Curl Virus, and Healthy leaf detection for all supported crops.

# Project Structure
leaf-disease-webapp/
│
├── frontend/
│   ├── index.html
│   ├── styles.css
│   └── app.js
│
├── backend/
│   ├── server.py
│   ├── requirements.txt
│   ├── labels.json
│   ├── models/
│   │   └── leaf_cnn_scripted.pt
│   └── start_backend.bat
│
├── .gitignore
└── README.md

# Installation and Setup
Prerequisites

Python 3.10 or higher

Git

VS Code (recommended)

Backend Setup
cd backend
python -m venv .venv
.venv\Scripts\Activate.ps1
pip install -r requirements.txt
python -m uvicorn server:app --host 127.0.0.1 --port 8000


Backend health check:

http://127.0.0.1:8000/health

Frontend Setup

Open the frontend folder in VS Code, right-click index.html, and choose Open with Live Server.

The interface will open at:

http://127.0.0.1:5500/index.html

# Model File

The trained model file is not included in the repository due to GitHub file size limits.

Download the model from GitHub Releases and place it in:

backend/models/


Model file name:

leaf_cnn_scripted.pt

# How the System Works

User uploads or captures a leaf image

Image is sent to the FastAPI backend

Image preprocessing (resize and normalization)

CNN model performs inference

Backend returns predicted disease and confidence

Frontend displays the result visually

# Handling Invalid Inputs

If the uploaded image does not appear to be a leaf or the prediction confidence is too low, the system rejects the input and displays a user-friendly error message. This prevents incorrect predictions for non-leaf images such as humans or objects.

# Testing

The system has been tested with:

Real plant leaf images

Non-leaf images (correctly rejected)

Desktop browsers (Chrome, Edge)

Mobile browsers (Android)

# Future Enhancements

Disease treatment and prevention suggestions

Cloud deployment (Render / Railway)

Conversion to ONNX or TensorFlow.js for browser-only inference

Multilingual support

Farmer advisory dashboard

# Academic Significance

This project demonstrates practical application of:

Machine Learning

Deep Learning using CNNs

Model deployment

Web development

AI in agriculture

It is suitable for final-year projects, capstone projects, and academic demonstrations.

# Author

Sifat Haque Zifan
Leaf Disease Detection Web Application
Department of Computer Science & Engineering | North South University

#License

This project is developed for educational and research purposes.
