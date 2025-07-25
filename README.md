# 🩺 Disease Prediction ChatBot

An interactive chatbot-style web application that predicts possible diseases based on symptoms entered by the user. Built using **Django**, **machine learning**, and a simple **chat-like interface** for ease of use and learning.

---

## 📌 Features

- 🤖 Conversational interface for symptom input  
- 🧠 Disease prediction using machine learning  
- 🛠 Built with Django (Backend) + React (Frontend)  

---

## 📂 Project Structure

```
DiseasePredictionChatBot/
│
├── backend/                  # Django backend
│   ├── ml/                  # ML scripts: preprocessing + training
│   ├── chatbot/             # Django app
│   ├── models/              # Trained ML models
│   └── manage.py
│
├── frontend/                # React frontend (optional)
│
├── data/                    # Dataset + processed files
│   ├── disease_symptoms.csv
│   ├── processed_dataset.pkl
│   └── label_encoder.pkl
│
├── README.md
└── requirements.txt
```

---

## 🧪 Dataset

This project uses the **Diseases and Symptoms** dataset from Kaggle:

🔗 [https://www.kaggle.com/datasets/dhivyeshrk/diseases-and-symptoms-dataset](https://www.kaggle.com/datasets/dhivyeshrk/diseases-and-symptoms-dataset)

### 🗂️ Dataset Placement

- Download and rename it to: `disease_symptoms.csv`
- Place it in the `data/` directory like so:

```bash
data/disease_symptoms.csv
```

---

## ⚙️ Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/aka8code/DiseasePredictionChatBot.git
cd DiseasePredictionChatBot
```

### 2. Set Up Virtual Environment (Recommended)

```bash
python3 -m venv venv
source venv/bin/activate        # For macOS/Linux
# .\venv\Scripts\activate    # For Windows
```

### 3. Install Required Packages

```bash
pip install -r requirements.txt
```

---

## 🧠 Run Machine Learning Pipeline

### Step 1: Prepare the Dataset

```bash
python backend/ml/prepare_dataset.py
```

This generates:
- `data/processed_dataset.pkl`
- `data/label_encoder.pkl`

### Step 2: Train the Model

```bash
python backend/ml/model_training.py
```

This generates:
- `backend/models/disease_prediction_model.pkl`

---

## 🚀 Run the Django App (Backend)

Step into backend folder:

```bash
cd backend
```

Apply Migrations:

```bash
python manage.py makemigrations
python manage.py migrate
```

Run Server:

```bash
python manage.py runserver
```

The API will be running at:  
🔗 http://127.0.0.1:8000/
