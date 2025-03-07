from django.urls import path
from .views import ProductosView, PedidoListView, CrearPedido, ActualizarKilosPedido, ClienteListView, CrearCliente, CrearFacturaEntrada, FacturaListView, CrearPagoFactura, CancelarPedido, ObtenerPedido, StockProductos, VendedorListView, CrearProducto, UpdateProducto

urlpatterns = [
    path('productos/', ProductosView.as_view(), name='productos'),
    path('productos/crear/', CrearProducto.as_view(), name='crear_producto'),
    path('productos/<int:producto_id>/', UpdateProducto.as_view(), name='actualizar_producto'),
    path('pedidos/', PedidoListView.as_view(), name='pedidos'),
    path('pedidos/crear/', CrearPedido.as_view(), name='crear_pedido'),
    path('pedidos/actualizar_kilos/<int:pedido_id>/', ActualizarKilosPedido.as_view(), name='actualizar_kilos_pedido'),
    path('clientes/', ClienteListView.as_view(), name='clientes'),
    path('clientes/crear/', CrearCliente.as_view(), name='crear_cliente'),
    path('facturas/crear/', CrearFacturaEntrada.as_view(), name='crear_factura'),
    path('facturas/', FacturaListView.as_view(), name='facturas'),
    path('facturas/pagar/', CrearPagoFactura.as_view(), name='pagar_factura'),
    path('pedidos/cancelar/', CancelarPedido.as_view(), name='cancelar_pedido'),
    path('pedidos/<int:pedido_id>/', ObtenerPedido.as_view(), name='obtener_pedido'),
    path('stock/', StockProductos.as_view(), name='stock_productos'),
    path('vendedores/', VendedorListView.as_view(), name='vendedores'),
]