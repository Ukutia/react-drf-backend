from django.contrib import admin

# Register your models here.
from core import models

admin.site.register(models.Vendedor)
admin.site.register(models.Producto)
admin.site.register(models.Cliente)
admin.site.register(models.Pedido)
admin.site.register(models.DetallePedido)