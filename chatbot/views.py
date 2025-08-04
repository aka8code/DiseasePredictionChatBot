from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
import os
import joblib
import json
import spacy

from difflib import get_close_matches
from ml.predictor import predict_disease

# Load NLP model
nlp = spacy.load("en_core_web_md")

# Ping view
def ping(request):
    return JsonResponse({'message': 'pong! Django is working ✅'})

# Get all symptoms from dataset
def get_all_symptoms():
    feature_path = os.path.join('data', 'processed_dataset.pkl')
    with open(feature_path, 'rb') as f:
        dataset = joblib.load(f)

    if isinstance(dataset, tuple):
        dataset = dataset[0]

    return [s.lower() for s in list(dataset.columns)]

# Predict disease from selected symptoms
@csrf_exempt
def predict_disease_api(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            symptoms = data.get('symptoms', [])
            if not symptoms or not isinstance(symptoms, list):
                return JsonResponse({'error': 'symptoms should be a non-empty list'}, status=400)

            predicted_disease = predict_disease(symptoms)
            return JsonResponse({'predicted_disease': predicted_disease})

        except json.JSONDecodeError:
            return JsonResponse({'error': 'Invalid JSON'}, status=400)

    return JsonResponse({'error': 'Only POST method allowed'}, status=405)

# Preprocess query (lemmatization, etc.)
def preprocess_symptom(text):
    doc = nlp(text.lower())
    tokens = [token.lemma_ for token in doc if not token.is_stop and token.is_alpha]
    return " ".join(tokens)

# Extract relevant symptoms from user input using similarity
def extract_symptoms_from_text(text, all_symptoms, threshold=0.7):
    doc = nlp(text.lower())
    extracted = []

    for symptom in all_symptoms:
        symptom_doc = nlp(symptom)
        sim_score = doc.similarity(symptom_doc)
        if sim_score >= threshold:
            extracted.append((symptom, sim_score))

    # Sort and return unique symptoms
    extracted = sorted(extracted, key=lambda x: x[1], reverse=True)
    return list({s[0] for s in extracted})

# Fuzzy symptom suggestion (used in chat interface)
@csrf_exempt
def fuzzy_symptom_search(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            query = data.get('query', '').lower()
            all_symptoms = get_all_symptoms()

            # Option 1: if query is short, use string fuzzy
            if len(query.split()) <= 2:
                matches = get_close_matches(query, all_symptoms, n=5, cutoff=0.3)
            else:
                # Option 2: for sentence, use similarity
                matches = extract_symptoms_from_text(query, all_symptoms)

            return JsonResponse({'matches': matches})

        except json.JSONDecodeError:
            return JsonResponse({'error': 'Invalid JSON'}, status=400)

    return JsonResponse({'error': 'Only POST method allowed'}, status=405)

# Return all symptoms (or top matches if query string is given)
def symptom_list_view(request):
    all_symptoms = get_all_symptoms()
    query = request.GET.get('q', '').lower()

    if query:
        suggestions = get_close_matches(query, all_symptoms, n=5, cutoff=0.3)
        return JsonResponse({"symptoms": suggestions})

    return JsonResponse({"symptoms": all_symptoms})

@csrf_exempt
def extract_and_predict(request):
    """
    Extract valid symptoms from a sentence and return predicted disease.
    """
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            sentence = data.get('sentence', '').lower()

            # Load symptom list
            feature_path = os.path.join('data', 'processed_dataset.pkl')
            with open(feature_path, 'rb') as f:
                dataset = joblib.load(f)

            if isinstance(dataset, tuple):
                dataset = dataset[0]

            all_symptoms = [s.lower() for s in list(dataset.columns)]

            # Simple NLP: check if any known symptom is in the sentence
            extracted = [symptom for symptom in all_symptoms if symptom in sentence]

            if not extracted:
                return JsonResponse({
                    'extracted_symptoms': [],
                    'predicted_disease': 'Unknown',
                    'message': 'No valid symptoms found'
                }, status=200)

            predicted_disease = predict_disease(extracted)

            return JsonResponse({
                'extracted_symptoms': extracted,
                'predicted_disease': predicted_disease
            })

        except json.JSONDecodeError:
            return JsonResponse({'error': 'Invalid JSON'}, status=400)

    return JsonResponse({'error': 'Only POST method allowed'}, status=405)
