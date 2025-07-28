from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
from difflib import get_close_matches
import os
import joblib
import json

from ml.predictor import predict_disease

# Ping view to test server availability
def ping(request):
    return JsonResponse({'message': 'pong! Django is working ✅'})


@csrf_exempt
def predict_disease_api(request):
    """
    Endpoint to receive a list of symptoms and return a predicted disease.
    Expects a POST request with JSON body: { "symptoms": ["fever", "cough"] }
    """
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


def get_all_symptoms():
    """
    Loads and returns the list of symptom features from the preprocessed dataset.
    """
    feature_path = os.path.join('data', 'processed_dataset.pkl')
    with open(feature_path, 'rb') as f:
        dataset = joblib.load(f)

    # If dataset is a tuple like (X, y), extract the features (X)
    if isinstance(dataset, tuple):
        dataset = dataset[0]


    return [s.lower() for s in list(dataset.columns)]


def symptom_list_view(request):
    """
    Returns a fuzzy-matched list of symptoms based on query string.
    If no query, returns the full list.
    """
    all_symptoms = get_all_symptoms()
    query = request.GET.get('q', '').lower()

    if query:
        # Return top 5 closest symptom suggestions
        suggestions = get_close_matches(query, all_symptoms, n=5, cutoff=0.3)
        return JsonResponse({"symptoms": suggestions})

    return JsonResponse({"symptoms": all_symptoms})

@csrf_exempt
@csrf_exempt
def fuzzy_symptom_search(request):
    """
    Accepts a POST request with JSON body: { "query": "fevr" }
    Returns closest matching symptoms.
    """
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            query = data.get('query', '').lower()

            feature_path = os.path.join('data', 'processed_dataset.pkl')
            with open(feature_path, 'rb') as f:
                dataset = joblib.load(f)

            if isinstance(dataset, tuple):
                dataset = dataset[0]

            all_symptoms = [s.lower() for s in list(dataset.columns)]

            matches = get_close_matches(query, all_symptoms, n=5, cutoff=0.3)
            return JsonResponse({'matches': matches})

        except json.JSONDecodeError:
            return JsonResponse({'error': 'Invalid JSON'}, status=400)

    return JsonResponse({'error': 'Only POST method allowed'}, status=405)
