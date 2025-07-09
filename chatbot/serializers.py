from rest_framework import serializers
from . models import Symptom

# ModelSerializer : auto generates fields based on model
class SymptomSerializer(serializers.ModelSerializer):
    class Meta:     
        model= Symptom
        fields = ['id', 'name']