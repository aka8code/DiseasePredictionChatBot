from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
import os
import joblib
import json
from ml.predictor import predict_disease
def ping(request):
    return JsonResponse({'message': 'pong! Django is working ✅'})


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

def get_all_symptoms():
    # Load from the same processed dataset used for training
    feature_path = os.path.join('data', 'processed_dataset.pkl')
    with open(feature_path, 'rb') as f:
        dataset = joblib.load(f)

    # If dataset is a tuple like (X, y), extract the feature DataFrame
    if isinstance(dataset, tuple):
        dataset = dataset[0]  # the features DataFrame (X)

    return list(dataset.columns)

def symptom_list_view(request):
    symptoms = get_all_symptoms()
    return JsonResponse({"symptoms": symptoms})

# from django.shortcuts import render

# # turns func into api
# from rest_framework.decorators import api_view
# #returns json https responses
# from rest_framework.response import Response
# from rest_framework import status
# from .models import Symptom
# from .serializers import SymptomSerializer

# from django.http import HttpResponse
# from django.http import JsonResponse

# def hello(request):
#     return HttpResponse("Helllllooooooooo")

# @api_view(['GET','POST'])

# def symptom_list(request):
#     if request.method == 'GET':
#         symptoms = Symptom.objects.all()
#         serializer = SymptomSerializer(symptoms, many=True)
#         return Response(serializer.data)
    
#     elif request.method == 'POST':
#         # Takes the JSON input sent by user (e.g. { "name": "fever" }) and converts it to a SymptomSerializer object for validation.
#         serializer = SymptomSerializer(data=request.data)
#         if serializer.is_valid():
#             serializer.save()
#             return Response(serializer.data, status=status.HTTP_201_CREATED)
#         return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
