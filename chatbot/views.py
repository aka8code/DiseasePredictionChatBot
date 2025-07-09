from django.shortcuts import render

# turns func into api
from rest_framework.decorators import api_view
#returns json https responses
from rest_framework.response import Response
from rest_framework import status
from .models import Symptom
from .serializers import SymptomSerializer

from django.http import HttpResponse
from django.http import JsonResponse

def hello(request):
    return HttpResponse("Helllllooooooooo")

@api_view(['GET','POST'])

def symptom_list(request):
    if request.method == 'GET':
        symptoms = Symptom.objects.all()
        serializer = SymptomSerializer(symptoms, many=True)
        return Response(serializer.data)
    
    elif request.method == 'POST':
        # Takes the JSON input sent by user (e.g. { "name": "fever" }) and converts it to a SymptomSerializer object for validation.
        serializer = SymptomSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
def ping(request):
    return JsonResponse({'message': 'pong! Django is working ✅'})