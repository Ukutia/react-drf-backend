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
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import Factura, DetalleFactura, Producto
from .serializers import FacturaSerializer
from rest_framework.exceptions import ValidationError

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.exceptions import ValidationError
from .models import Factura, Producto, DetalleFactura

from rest_framework.exceptions import ValidationError
from django.db import transaction
# Create your views here.

class ProductosView(APIView):
    def get(self, request):
        productos = Producto.objects.filter(estado='disponible')
        serializer = ProductoSerializer(productos, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    

class PedidoListView(APIView):
    def get(self, request):
        pedidos = Pedido.objects.all()
        serializer = PedidoSerializer(pedidos, many=True)
        return Response(serializer.data)
    
from rest_framework import viewsets
from rest_framework.response import Response
from rest_framework.decorators import action
from .models import Pedido, DetallePedido, Producto, DetalleFactura

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import Pedido, DetallePedido, Producto, DetalleFactura

class CrearPedidoAPIView(APIView):

    def post(self, request, *args, **kwargs):
        data = request.data
        cliente = data['cliente']
        vendedor = data['vendedor']
        estado = data['estado']
        detalles = data['detalles']

        try:
            # Crear el pedido
            pedido = Pedido.objects.create(cliente=cliente, vendedor=vendedor, estado=estado)

            # Crear los detalles del pedido y registrar las ventas asociadas
            for detalle in detalles:
                producto = Producto.objects.get(id=detalle['producto'])

                # Calcular el costo acumulado (FIFO)
                costo_acumulado = 0
                cantidad_por_vender = detalle['cantidad_kilos']
                entradas = DetalleFactura.objects.filter(producto=producto).order_by('fecha')

                for entrada in entradas:
                    if cantidad_por_vender <= 0:
                        break

                    if entrada.cantidad >= cantidad_por_vender:
                        costo_acumulado += cantidad_por_vender * entrada.costo_por_kilo
                        entrada.cantidad -= cantidad_por_vender
                        entrada.save()
                        cantidad_por_vender = 0
                    else:
                        costo_acumulado += entrada.cantidad * entrada.costo_por_kilo
                        cantidad_por_vender -= entrada.cantidad
                        entrada.cantidad = 0
                        entrada.save()

                # Calcular el costo por kilo
                costo_por_kilo = costo_acumulado / detalle['cantidad_kilos']

                # Crear el detalle del pedido
                detalle_pedido = DetallePedido.objects.create(
                    pedido=pedido,
                    producto_id=detalle['producto'],
                    cantidad_kilos=detalle['cantidad_kilos'],
                    cantidad_unidades=detalle['cantidad_unidades'],
                    precio_total=detalle['precio_total']
                )

                # Registrar la venta asociada
                precio_venta = detalle['precio_total'] / detalle['cantidad_kilos']
                margen = (precio_venta - costo_por_kilo) * detalle['cantidad_kilos']

                DetallePedido.objects.create(
                    producto=producto,
                    cantidad=detalle['cantidad_kilos'],
                    precio_venta=precio_venta,
                    costo_por_kilo=costo_por_kilo,
                    total_venta=detalle['precio_total'],
                    margen=margen,
                )

            return Response({'status': 'Pedido creado exitosamente!'}, status=status.HTTP_201_CREATED)
        
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)



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


class CrearFacturaEntrada(APIView):

    def post(self, request, *args, **kwargs):
        data = request.data
        proveedor = data.get('proveedor')
        fecha = data.get('fecha')
        numero_factura = data.get('numero_factura')
        detalles = data.get('detalles')

        # Validar que los campos obligatorios estén presentes
        if not proveedor or not fecha or not numero_factura or not detalles:
            raise ValidationError("Faltan datos obligatorios")

        # Verificar que los detalles sean una lista válida
        if not isinstance(detalles, list) or len(detalles) == 0:
            raise ValidationError("Los detalles deben ser una lista no vacía")

        # Inicializar las variables para el cálculo
        subtotal = 0
        iva = 0
        total_con_iva = 0

        try:
            with transaction.atomic():
                # Crear la factura
                factura = Factura.objects.create(
                    proveedor=proveedor,
                    fecha=fecha,
                    numero_factura=numero_factura,
                    subtotal=subtotal,
                    iva=iva,
                    total=total_con_iva,
                )

                # Procesar los detalles de la factura
                for detalle in detalles:
                    producto_id = detalle.get('producto')
                    cantidad_kilos = detalle.get('cantidad_kilos')
                    cantidad_unidades = detalle.get('cantidad_unidades')
                    costo_por_kilo = detalle.get('costo_por_kilo')

                    if not producto_id:
                        raise ValidationError("El ID del producto es obligatorio")
                    if not cantidad_kilos:
                        raise ValidationError("La cantidad de kilos es obligatoria")
                    if not costo_por_kilo:
                        raise ValidationError("El costo por kilo es obligatorio")


                    try:
                        producto = Producto.objects.get(id=producto_id)
                    except Producto.DoesNotExist:
                        return Response({'error': f"Producto con ID {producto_id} no existe"}, status=status.HTTP_404_NOT_FOUND)

                    # Calcular el costo total para el detalle
                    costo_total = costo_por_kilo * cantidad_kilos

                    # Crear el detalle de factura
                    DetalleFactura.objects.create(
                        factura=factura,
                        producto=producto,
                        cantidad_kilos=cantidad_kilos,
                        cantidad_unidades=cantidad_unidades,
                        costo_por_kilo=costo_por_kilo,
                        costo_total=costo_total,
                    )

                    # Actualizar el subtotal, IVA y total
                    subtotal += costo_total
                    iva += costo_total * 0.19  # Asumir 19% de IVA
                    total_con_iva = subtotal + iva

                # Actualizar la factura con el subtotal, IVA y total con IVA
                factura.subtotal = subtotal
                factura.iva = iva
                factura.total = total_con_iva
                factura.save()

                return Response({
                    'status': 'Factura de entrada creada exitosamente!',
                    'factura_id': factura.numero_factura,
                    'subtotal': subtotal,
                    'iva': iva,
                    'total_con_iva': total_con_iva,
                }, status=status.HTTP_201_CREATED)

        except Exception as e:
            return Response({'error': f'Error al crear la factura o detalles: {str(e)}'}, status=status.HTTP_400_BAD_REQUEST)


class FacturaListView(APIView):
    def get(self, request):
        facturas = Factura.objects.all()
        serializer = FacturaSerializer(facturas, many=True)
        return Response(serializer.data)