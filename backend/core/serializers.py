from rest_framework import serializers
from .models import Producto
from rest_framework import serializers
from .models import Pedido, DetallePedido, Producto
from .models import Cliente

class ClienteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Cliente
        fields = ['id', 'nombre', 'vendedor', 'direccion']

class ProductoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Producto
        fields = [ 'nombre','stock_kilos','precio_por_kilo', 'costo_por_kilo', 'categoria', 'estado']


class DetallePedidoSerializer(serializers.ModelSerializer):
    producto = ProductoSerializer()

    class Meta:
        model = DetallePedido
        fields = ['id', 'producto','cantidad_unidades', 'cantidad_kilos', 'precio_total']

class PedidoSerializer(serializers.ModelSerializer):
    detalles = DetallePedidoSerializer(many=True)
    cliente = serializers.CharField(source='cliente.nombre', read_only=True)
    vendedor_nombre = serializers.CharField(source='vendedor.nombre', read_only=True)

    class Meta:
        model = Pedido
        fields = ['id', 'cliente', 'vendedor_nombre', 'fecha', 'estado', 'detalles']

