from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import Producto, Pedido, DetallePedido, Cliente, Factura, DetalleFactura, PagoFactura,EntradaProducto
from .serializers import ProductoSerializer, PedidoSerializer, ClienteSerializer, FacturaSerializer, PagoFacturaSerializer
from rest_framework.exceptions import ValidationError
from django.db import transaction

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

class CrearPedido(APIView):
    def post(self, request, *args, **kwargs):
        data = request.data
        cliente_id = data.get('cliente')
        detalles = data.get('detalles')

        if not cliente_id or not detalles:
            return Response({'error': 'Faltan datos obligatorios'}, status=status.HTTP_400_BAD_REQUEST)

        if not isinstance(detalles, list) or len(detalles) == 0:
            return Response({'error': 'Los detalles deben ser una lista no vacía'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            with transaction.atomic():
                pedido = Pedido.objects.create(cliente_id=cliente_id)

                for detalle in detalles:
                    producto_id = detalle.get('producto')
                    cantidad = detalle.get('cantidad_kilos')

                    if not producto_id:
                        raise ValidationError("El ID del producto es obligatorio")
                    if cantidad is None:
                        raise ValidationError("La cantidad es obligatoria")

                    try:
                        producto = Producto.objects.get(id=producto_id)
                    except Producto.DoesNotExist:
                        return Response({'error': f"Producto con ID {producto_id} no existe"}, status=status.HTTP_404_NOT_FOUND)

                    # Calcular el costo del producto en base a FIFO
                    entradas = EntradaProducto.objects.filter(producto=producto).order_by('fecha_entrada')
                    costo_total = 0
                    cantidad_restante = cantidad

                    for entrada in entradas:
                        if cantidad_restante <= 0:
                            break
                        if entrada.cantidad_kilos >= cantidad_restante:
                            costo_total += cantidad_restante * entrada.costo_por_kilo
                            entrada.cantidad_kilos -= cantidad_restante
                            entrada.save()
                            cantidad_restante = 0
                        else:
                            costo_total += entrada.cantidad_kilos * entrada.costo_por_kilo
                            cantidad_restante -= entrada.cantidad_kilos
                            entrada.delete()

                    if cantidad_restante > 0:
                        raise ValidationError("No hay suficiente stock disponible para el producto")

                    DetallePedido.objects.create(
                        pedido=pedido,
                        producto=producto,
                        cantidad_kilos=cantidad,
                        precio_total=costo_total
                    )

                return Response(PedidoSerializer(pedido).data, status=status.HTTP_201_CREATED)

        except ValidationError as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({'error': f'Error al crear el pedido o detalles: {str(e)}'}, status=status.HTTP_400_BAD_REQUEST)
class ClienteListView(APIView):
    def get(self, request):
        clientes = Cliente.objects.all()
        serializer = ClienteSerializer(clientes, many=True)
        return Response(serializer.data)

class CrearFacturaEntrada(APIView):
    def post(self, request, *args, **kwargs):
        data = request.data
        proveedor = data.get('proveedor')
        fecha = data.get('fecha')
        numero_factura = data.get('numero_factura')
        detalles = data.get('detalles')

        if not proveedor or not fecha or not numero_factura or not detalles:
            raise ValidationError("Faltan datos obligatorios")

        if not isinstance(detalles, list) or len(detalles) == 0:
            raise ValidationError("Los detalles deben ser una lista no vacía")

        subtotal = 0
        iva = 0
        total_con_iva = 0

        try:
            with transaction.atomic():
                factura = Factura.objects.create(
                    proveedor=proveedor,
                    fecha=fecha,
                    numero_factura=numero_factura,
                    subtotal=subtotal,
                    iva=iva,
                    total=total_con_iva,
                )

                for detalle in detalles:
                    producto_id = detalle.get('producto')
                    cantidad_kilos = detalle.get('cantidad_kilos')
                    costo_por_kilo = detalle.get('costo_por_kilo')
                    cantidad_unidades = detalle.get('cantidad_unidades')

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

                    costo_total = costo_por_kilo * cantidad_kilos

                    DetalleFactura.objects.create(
                        factura=factura,
                        producto=producto,
                        cantidad_kilos=cantidad_kilos,
                        costo_total=costo_total,
                        costo_por_kilo = costo_por_kilo,
                        cantidad_unidades=cantidad_unidades
                    )

                    EntradaProducto.objects.create(
                        producto=producto,
                        cantidad_kilos=cantidad_kilos,
                        costo_por_kilo=costo_por_kilo,
                        cantidad_unidades=cantidad_unidades
                    )

                    subtotal += costo_total
                    iva += costo_total * 0.19
                    total_con_iva = subtotal + iva

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
        return Response(serializer.data, status=status.HTTP_200_OK)

class CrearPagoFactura(APIView):
    def post(self, request, *args, **kwargs):
        data = request.data
        factura_id = data.get('factura')
        fecha_de_pago = data.get('fecha_de_pago')
        monto_del_pago = data.get('monto_del_pago')

        if not factura_id or not fecha_de_pago or not monto_del_pago:
            return Response({'error': 'Faltan datos obligatorios'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            factura = Factura.objects.get(numero_factura=factura_id)
        except Factura.DoesNotExist:
            return Response({'error': f'Factura con ID {factura_id} no existe'}, status=status.HTTP_404_NOT_FOUND)

        pago_factura = PagoFactura.objects.create(
            factura=factura,
            fecha_de_pago=fecha_de_pago,
            monto_del_pago=monto_del_pago
        )

        return Response(PagoFacturaSerializer(pago_factura).data, status=status.HTTP_201_CREATED)