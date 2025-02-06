from django.urls import path
from .views import InventarioView
from .views import PedidoListView
from rest_framework.routers import DefaultRouter
from .views import PedidoViewSet  # Importamos el viewset
from .views import PedidoViewSet
from .views import CrearPedido
from .views import ClienteListView




urlpatterns = [
    path('inventario/', InventarioView.as_view(), name='inventario'),
    path('pedidos/', PedidoListView.as_view(), name='pedido-list'),
    path('pedidos/crear/', CrearPedido.as_view(), name='crear-pedido'),
    path('clientes/', ClienteListView.as_view(), name='clientes-list'),
]