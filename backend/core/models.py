from django.db import models

# Create your models here.
class Vendedor(models.Model):
    id = models.AutoField(primary_key=True)  # Campo ID automático
    nombre = models.CharField(max_length=100)  # Nombre completo del vendedor
    sigla = models.CharField(max_length=10, unique=True)  # Sigla única para identificar al vendedor

    def __str__(self):
        return f"{self.nombre} ({self.sigla})"  # Mostrar nombre y sigla en el admin
    
class Cliente(models.Model):
    id = models.AutoField(primary_key=True)  # Campo ID automático
    nombre = models.CharField(max_length=100)  # Nombre del cliente
    vendedor = models.ForeignKey(
        Vendedor,  # Relación con el modelo de usuario (empleado/vendedor)
        on_delete=models.SET_NULL,  # Si el vendedor se elimina, dejar el campo como NULL
        null=True,
        blank=True,
        related_name='clientes'  # Permite acceder a los clientes de un vendedor con user.clientes
    )
    direccion = models.CharField(max_length=255)  # Dirección del cliente
    telefono = models.CharField(max_length=20, blank=True)
    email = models.EmailField(blank=True)

    def __str__(self):
        return self.nombre  # Mostrar el nombre del cliente en el admin de Django
    

class Producto(models.Model):
    id = models.AutoField(primary_key=True)  # Campo ID automático
    nombre = models.CharField(max_length=100, verbose_name="Nombre del producto")
    descripcion = models.TextField(blank=True, null=True, verbose_name="Descripción")
    precio_por_kilo = models.DecimalField(max_digits=10, decimal_places=2, verbose_name="Precio por kilo")

    def stock_actual(self):
        entradas = self.facturas_entrada.aggregate(total=models.Sum('cantidad'))['total'] or 0
        salidas = self.ventas.aggregate(total=models.Sum('cantidad'))['total'] or 0
        ajustes = self.ajustesI.aggregate(total=models.Sum('cantidad'))['total'] or 0
        return entradas - salidas + ajustes

    facturas_entrada = models.ForeignKey(
        'DetalleFactura', 
        on_delete=models.CASCADE, 
        related_name='productos', 
        blank=True, 
        null=True
    )
    ventas = models.ForeignKey(
        'DetallePedido', 
        on_delete=models.CASCADE, 
        related_name='productos', 
        blank=True, 
        null=True
    )
    ajustesI = models.ForeignKey(
        'AjusteInventario', 
        on_delete=models.CASCADE, 
        related_name='productos', 
        blank=True, 
        null=True
    )






    categoria = models.CharField(
        max_length=50, blank=True, null=True, choices=[
            ("al vacio", "Al Vacio"),
            ("congelado", "Congelado")
        ],
        verbose_name="Categoría"
    )
    estado = models.CharField(
        max_length=20, choices=[("disponible", "Disponible"), ("agotado", "Agotado")],
        default="disponible", verbose_name="Estado del producto"
    )
    detalles_pedido = models.ManyToManyField(
        'Pedido',
        through='DetallePedido',
        related_name='productos',
        verbose_name="Detalles del pedido"
    )

    def __str__(self):
        return self.nombre


class AjusteInventario(models.Model):
    TIPO_AJUSTE = [
        ("merma", "Merma"),
        ("exceso", "Exceso"),
        ("ajuste", "Ajuste Manual"),
    ]

    producto = models.ForeignKey(Producto, on_delete=models.CASCADE, related_name="ajustes")
    cantidad = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        verbose_name="Cantidad ajustada (puede ser positiva o negativa)"
    )
    tipo = models.CharField(max_length=20, choices=TIPO_AJUSTE, verbose_name="Tipo de ajuste")
    razon = models.TextField(blank=True, null=True, verbose_name="Razón del ajuste")
    fecha = models.DateField(auto_now_add=True, verbose_name="Fecha del ajuste")

    def __str__(self):
        return f"Ajuste de {self.producto.nombre} - {self.cantidad} ({self.tipo})"


    



class Pedido(models.Model):
    id = models.AutoField(primary_key=True)  # Campo ID automático
    cliente = models.ForeignKey(
        'Cliente', on_delete=models.CASCADE, verbose_name="Cliente"
    )
    vendedor = models.ForeignKey(
        'Vendedor', on_delete=models.SET_NULL, null=True, verbose_name="Vendedor"
    )
    fecha = models.DateTimeField(auto_now_add=True, verbose_name="Fecha del pedido")
    estado = models.CharField(
        max_length=20,
        choices=[
            ("pendiente", "Pendiente"),
            ("completado", "Completado"),
            ("cancelado", "Cancelado")
        ],
        default="pendiente",
        verbose_name="Estado del pedido"
    )

    def __str__(self):
        return f"Pedido #{self.id} - Cliente: {self.cliente.nombre}"
    


class DetallePedido(models.Model):
    pedido = models.ForeignKey(Pedido, on_delete=models.CASCADE, related_name="detalles", verbose_name="Pedido")
    producto = models.ForeignKey(Producto, on_delete=models.CASCADE, verbose_name="Producto")
    cantidad_kilos = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True, verbose_name="Cantidad en kilos")
    cantidad_unidades = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True, verbose_name="Cantidad en Unidades")
    precio_venta = models.DecimalField(max_digits=10, decimal_places=2, verbose_name="Precio de venta (por kilo)")
    costo_por_kilo = models.DecimalField(max_digits=10, decimal_places=2, verbose_name="Costo por kilo en la venta")
    total_venta = models.DecimalField(max_digits=10, decimal_places=2, verbose_name="Total de la venta")
    fecha = models.DateField(auto_now_add=True, verbose_name="Fecha de venta")

    def save(self, *args, **kwargs):
        # Calcular el total de la venta
        self.total_venta = self.cantidad_kilos * self.precio_venta
        
        # Calcular el margen según la fórmula: (Precio de venta - Costo por kilo) × Cantidad vendida
        self.margen = (self.precio_venta - self.costo_por_kilo) * self.cantidad_kilos
        
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.producto.nombre} - {self.cantidad_kilos} kg"

    class Meta:
        verbose_name = "Detalle del pedido"
        verbose_name_plural = "Detalles de pedidos"


class Factura(models.Model):
    proveedor = models.CharField(max_length=100, verbose_name="Proveedor")
    fecha = models.DateField(verbose_name="Fecha de la factura")
    numero_factura = models.CharField(max_length=50, unique=True, verbose_name="Número de factura" ,primary_key=True)
    subtotal = models.DecimalField(max_digits=10, decimal_places=2, verbose_name="Subtotal")
    iva = models.DecimalField(max_digits=10, decimal_places=2, verbose_name="IVA")
    total = models.DecimalField(max_digits=10, decimal_places=2, verbose_name="Total sin IVA")

    def __str__(self):
        return f"Factura {self.numero_factura} - {self.proveedor} - {self.fecha}"

    class Meta:
        verbose_name = "Factura"
        verbose_name_plural = "Facturas"
        ordering = ['-fecha']


class DetalleFactura(models.Model):
    factura = models.ForeignKey(
        Factura, on_delete=models.CASCADE, related_name="detalles", verbose_name="Factura"
    )
    producto = models.ForeignKey(
        Producto, on_delete=models.CASCADE, verbose_name="Producto"
    )
    cantidad_kilos = models.DecimalField(
        max_digits=10, decimal_places=2, verbose_name="Cantidad en kilos"
    )
    cantidad_unidades = models.DecimalField(
        max_digits=10, decimal_places=0, verbose_name="Cantidad en Unidades"
    )
    costo_por_kilo = models.DecimalField(max_digits=10, decimal_places=2, verbose_name="Costo por kilo")
    costo_total = models.DecimalField(max_digits=10, decimal_places=2, verbose_name="Costo total")

    def __str__(self):
        return f"Factura {self.factura.numero_factura} - {self.producto.nombre} - {self.cantidad_kilos} kg"

    class Meta:
        verbose_name = "Detalle de factura"
        verbose_name_plural = "Detalles de facturas"


class PagoVendedor(models.Model):
    id = models.AutoField(primary_key=True)  # ID automático
    vendedor = models.ForeignKey(
        Vendedor, on_delete=models.CASCADE, related_name="pagos", verbose_name="Vendedor"
    )
    monto = models.DecimalField(
        max_digits=10, decimal_places=2, verbose_name="Monto del pago"
    )
    comprobante = models.ImageField(
        upload_to="comprobantes_pagos/", blank=True, null=True, verbose_name="Comprobante (Foto)"
    )
    comentario = models.TextField(
        blank=True, null=True, verbose_name="Comentario"
    )
    fecha = models.DateTimeField(auto_now_add=True, verbose_name="Fecha del pago")

    def __str__(self):
        return f"Pago de {self.vendedor.nombre} - {self.monto} - {self.fecha.strftime('%d/%m/%Y')}"

    class Meta:
        verbose_name = "Pago del Vendedor"
        verbose_name_plural = "Pagos de Vendedores"
        ordering = ['-fecha']




