# ml/predictor.py

import joblib
import numpy as np

# Load everything
model = joblib.load("data/disease_prediction_model.pkl")
symptom_index = joblib.load("data/symptom_index.pkl")
label_encoder = joblib.load("data/label_encoder.pkl")

# Ensure consistent symptom order
all_symptoms = list(symptom_index.keys())

def predict_disease(symptoms: list):
    """
    symptoms: List of symptom strings provided by the user
    returns: Predicted disease (string)
    """
    input_vector = [0] * len(all_symptoms)
    
    for symptom in symptoms:
        formatted = symptom.strip().lower().replace(' ', '_')
        if formatted in symptom_index:
            input_vector[symptom_index[formatted]] = 1

    prediction_encoded = model.predict([input_vector])[0]
    prediction = label_encoder.inverse_transform([prediction_encoded])[0]
    
    return prediction
