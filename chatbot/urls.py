from django.urls import path
from . import views
from . views import symptom_list
from . views import ping

urlpatterns = [
    path('hello/', views.hello, name='hello'),
    path('symptoms/', symptom_list, name='symptom-list'),
    path('ping/', ping),
]