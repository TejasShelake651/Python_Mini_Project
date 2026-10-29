from django.urls import path
from . import views

urlpatterns = [
    path('', views.landing, name='landing'),
    path('studio/', views.index, name='studio'),
    path('app/', views.index, name='index'),
    path('upload/', views.upload_document, name='upload_document'),
    path('sample/', views.load_sample, name='load_sample'),
    path('quiz-submit/<int:doc_id>/', views.submit_quiz, name='submit_quiz'),
    path('copilot/<int:doc_id>/', views.viva_copilot, name='viva_copilot'),
    path('export/<int:doc_id>/', views.export_study_sheet, name='export_study_sheet'),
    path('delete/<int:doc_id>/', views.delete_document, name='delete_document'),
]
