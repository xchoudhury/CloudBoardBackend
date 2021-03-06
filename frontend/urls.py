from django.conf.urls import url, include
from django.contrib import admin
from django.urls import path
from . import views

urlpatterns = [
    path('', views.homepage),
    path('faq', views.faq),
    path('reset', views.reset),
    path('password/reset/confirm', views.reset),
    path('update', views.update)
]
