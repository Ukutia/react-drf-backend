from django.urls import path
from .views import InventarioView

urlpatterns = [
    path('inventario/', InventarioView.as_view(), name='inventario'),
]