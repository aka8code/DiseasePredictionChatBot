import joblib  # to save ML model, encoder and features list
import os
import numpy as np

# Base directory (project root)
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_DIR = os.path.join(BASE_DIR, 'data')

df = joblib.load(os.path.join(DATA_DIR, 'processed_dataset.pkl'))[0]
feature_list = list(df.columns)

# load model, label_encoder 
model = joblib.load(os.path.join(DATA_DIR, 'disease_prediction_model.pkl'))
label_encoder = joblib.load(os.path.join(DATA_DIR, 'label_encoder.pkl'))

# symptom synonyms mapping to handle variations in user input
SYMPTOM_MAPPING = {
    "cold": "chills",
    "fever": "fever",
    "headache": "headache",
    "cough": "cough",
    "runny nose": "runny_nose",
    "sore throat": "throat_irritation",
    "vomiting": "vomiting",
    "nausea": "nausea",
    "diarrhea": "diarrhoea",
    "rash": "skin_rash",
    "sneeze": "continuous_sneezing",
    "smell loss": "loss_of_smell",
}

def predict_disease(symptoms: list[str]) -> str:
    
    # map synonyms and lowercase/strip inputs
    mapped_symptoms = set()
    for symptom in symptoms:
        key = symptom.lower().strip()
        if key in SYMPTOM_MAPPING:
            mapped_symptoms.add(SYMPTOM_MAPPING[key])
        elif key in feature_list:
            mapped_symptoms.add(key)

    # creating input VECTOR
    input_vector = [1 if symptom in mapped_symptoms else 0 for symptom in feature_list]
    # eg feature_list = ["fever", "cough", "headache"]
    # and input = ["fever", "headache"] 
    # then input vector = [1, 0, 1]

    prediction = model.predict([input_vector])[0]
    # [0] means get the first prediction value as predict returns an array/list

    disease = label_encoder.inverse_transform([prediction])[0]
    # converts numeric label back to string label, eg. 4 to "Malaria"
    
    return disease
