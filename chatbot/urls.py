from django.urls import path
from . import views
# from . views import symptom_list
from . views import ping
from . views import predict_disease_api 
from . views import symptom_list_view

urlpatterns = [
    path('predict/', predict_disease_api,),
    path('symptoms/', views.symptom_list_view),
    path('fuzzy_symptoms/', views.fuzzy_symptom_search), 
    path('ping/', ping),
]