from django.urls import path
from . import views

urlpatterns = [
    path('', views.index, name='index'),
    path('upload/', views.upload_file, name='upload'),
    path('api/chart-data/', views.chart_data, name='chart_data'),
    path('api/table-data/', views.table_data, name='table_data'),
    path('api/opportunity-scores/', views.opportunity_scores, name='opportunity_scores'),
    path('api/profit-calc/', views.profit_calc, name='profit_calc'),
]
