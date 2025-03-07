from django.contrib import admin

# Register your models here.
from core import models

admin.site.register(models.Vendedor)
admin.site.register(models.Producto)
admin.site.register(models.Cliente)
admin.site.register(models.Pedido)
admin.site.register(models.DetallePedido)
admin.site.register(models.DetalleFactura)
admin.site.register(models.Factura)
admin.site.register(models.PagoFactura)
admin.site.register(models.EntradaProducto)
admin.site.register(models.FacturaDetallePedido)