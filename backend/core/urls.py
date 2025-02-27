from django.urls import path
from .views import ProductosView
from .views import PedidoListView
from rest_framework.routers import DefaultRouter
from .views import CrearPedido
from .views import ClienteListView
from .views import CrearPagoFactura
from .views import CrearFacturaEntrada
from .views import FacturaListView



urlpatterns = [
    path('productos/', ProductosView.as_view(), name='producto'),
    path('pedidos/', PedidoListView.as_view(), name='pedido-list'),
    path('pedidos/crear/', CrearPedido.as_view(), name='crear-pedido'),
    path('clientes/', ClienteListView.as_view(), name='clientes-list'),
    path('facturas/crear', CrearFacturaEntrada.as_view(), name='crear-factura'),
    path('facturas/', FacturaListView.as_view(), name='facturas-list'),
    path('facturas/pagar/', CrearPagoFactura.as_view(), name='crear-pago-factura'),
]