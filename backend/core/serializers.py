from rest_framework import serializers
from .models import Producto, Pedido, DetallePedido, Cliente, PagoFactura, Factura, DetalleFactura

class ClienteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Cliente
        fields = ['id', 'nombre', 'vendedor', 'direccion']

class ProductoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Producto
        fields = ['id', 'nombre', 'precio_por_kilo']

class DetallePedidoSerializer(serializers.ModelSerializer):
    producto = ProductoSerializer()

    class Meta:
        model = DetallePedido
        fields = ['id', 'producto', 'cantidad_unidades', 'cantidad_kilos', 'total_venta']

class PedidoSerializer(serializers.ModelSerializer):
    detalles = DetallePedidoSerializer(many=True)
    cliente = serializers.PrimaryKeyRelatedField(queryset=Cliente.objects.all())
    vendedor = serializers.PrimaryKeyRelatedField(queryset=Cliente.objects.all())

    class Meta:
        model = Pedido
        fields = ['id', 'cliente', 'vendedor', 'fecha', 'estado', 'detalles']

    def create(self, validated_data):
        detalles_data = validated_data.pop('detalles')
        pedido = Pedido.objects.create(**validated_data)
        for detalle_data in detalles_data:
            DetallePedido.objects.create(pedido=pedido, **detalle_data)
        return pedido

class DetalleFacturaSerializer(serializers.ModelSerializer):
    producto = ProductoSerializer()

    class Meta:
        model = DetalleFactura
        fields = ['producto', 'cantidad_kilos', 'costo_total']

class PagoFacturaSerializer(serializers.ModelSerializer):
    class Meta:
        model = PagoFactura
        fields = ['fecha_de_pago', 'monto_del_pago']

class FacturaSerializer(serializers.ModelSerializer):
    detalles = DetalleFacturaSerializer(many=True)
    pago_factura = PagoFacturaSerializer(read_only=True)

    class Meta:
        model = Factura
        fields = ['proveedor', 'fecha', 'numero_factura', 'detalles', 'pago_factura', 'total', 'subtotal', 'iva']
