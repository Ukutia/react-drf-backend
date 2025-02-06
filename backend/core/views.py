from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework import viewsets
from rest_framework.decorators import action
from .models import Producto, DetallePedido
from .models import Pedido
from .serializers import ProductoSerializer
from .serializers import PedidoSerializer
from .serializers import ClienteSerializer
from .models import Cliente
# Create your views here.

class InventarioView(APIView):
    def get(self, request):
        productos = Producto.objects.filter(estado='disponible')
        serializer = ProductoSerializer(productos, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    

class PedidoListView(APIView):
    def get(self, request):
        pedidos = Pedido.objects.all()
        serializer = PedidoSerializer(pedidos, many=True)
        return Response(serializer.data)
    
class PedidoViewSet(viewsets.ModelViewSet):
    queryset = Pedido.objects.all()
    serializer_class = PedidoSerializer

    @action(detail=False, methods=['post'])
    def create_pedido(self, request):
        data = request.data
        cliente = data['cliente']
        vendedor = data['vendedor']
        estado = data['estado']
        detalles = data['detalles']

        # Crear el pedido
        pedido = Pedido.objects.create(cliente=cliente, vendedor=vendedor, estado=estado)

        # Crear los detalles del pedido
        for detalle in detalles:
            DetallePedido.objects.create(
                pedido=pedido,
                producto_id=detalle['producto'],
                cantidad_kilos=detalle['cantidad_kilos'],
                cantidad_unidades=detalle['cantidad_unidades'],
                precio_total=detalle['precio_total']
            )

        return Response({'status': 'Pedido creado exitosamente!'})
    

class ClienteListView(APIView):
    """
    Vista para obtener la lista de clientes.
    """
    def get(self, request):
        # Obtener todos los clientes de la base de datos
        clientes = Cliente.objects.all()
        # Serializar los datos de los clientes
        serializer = ClienteSerializer(clientes, many=True)
        # Retornar los clientes en formato JSON
        return Response(serializer.data)

class CrearPedido(APIView):
    def post(self, request, *args, **kwargs):
        serializer = PedidoSerializer(data=request.data)
        if serializer.is_valid():
            pedido = serializer.save()
            return Response(PedidoSerializer(pedido).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
