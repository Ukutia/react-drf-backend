from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import Producto, Pedido, FacturaDetallePedido, Vendedor, DetallePedido, Cliente, Factura, DetalleFactura, PagoFactura, EntradaProducto
from .serializers import ProductoSerializer, PedidoSerializer, ClienteSerializer, FacturaSerializer, PagoFacturaSerializer, VendedorSerializer
from rest_framework.exceptions import ValidationError
from django.db import transaction
from django.utils import timezone
from decimal import Decimal


class ProductosView(APIView):
    def get(self, request):
        productos = Producto.objects.filter(estado='disponible')
        serializer = ProductoSerializer(productos, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

class CrearProducto(APIView):
    def post(self, request, *args, **kwargs):
        data = request.data
        nombre = data.get('nombre')
        descripcion = data.get('descripcion')
        precio_por_kilo = data.get('precio_por_kilo')
        categoria = data.get('categoria')
        estado = data.get('estado')

        if not nombre or not precio_por_kilo:
            return Response({'error': 'Faltan datos obligatorios'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            producto = Producto.objects.create(
                nombre=nombre,
                descripcion=descripcion,
                precio_por_kilo=precio_por_kilo,
                categoria=categoria,
                estado=estado
            )
            return Response(ProductoSerializer(producto).data, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

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

        vendedor_id = data.get('vendedor')
        vendedor = Vendedor.objects.get(id=vendedor_id)

        if not cliente_id or not detalles:
            return Response({'error': 'Faltan datos obligatorios'}, status=status.HTTP_400_BAD_REQUEST)

        if not isinstance(detalles, list) or len(detalles) == 0:
            return Response({'error': 'Los detalles deben ser una lista no vacía'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            with transaction.atomic():
                pedido = Pedido.objects.create(cliente_id=cliente_id)
                total_pedido = 0

                for detalle in detalles:
                    producto_id = detalle.get('producto')
                    kilos = detalle.get('cantidad_kilos')
                    unidades = detalle.get('cantidad_unidades')


                    producto = Producto.objects.get(id=producto_id)
                    
                    stockProducto = DetalleFactura.objects.filter(producto=producto).aggregate(total=Sum('cantidad_unidades'))['total'] or 0

                    if unidades > stockProducto:
                        raise ValidationError("No hay suficiente stock disponible para el producto")
                    
                    if not producto_id:
                        raise ValidationError("El ID del producto es obligatorio")

                    try:
                        producto = Producto.objects.get(id=producto_id)
                    except Producto.DoesNotExist:
                        return Response({'error': f"Producto con ID {producto_id} no existe"}, status=status.HTTP_404_NOT_FOUND)



                    # Calcular el costo del producto en base a FIFO
                    entradas = EntradaProducto.objects.filter(producto=producto).order_by('fecha_entrada')
                    costo_total = 0
                    cantidad_restante_unidades = unidades
                    facturas_usadas = []
                    facturas_cantidades = {}

                    for entrada in entradas:
                        if cantidad_restante_unidades <= 0:
                            break
                        if entrada.cantidad_unidades >= cantidad_restante_unidades:
                            costo_total += cantidad_restante_unidades * entrada.costo_por_kilo
                            entrada.cantidad_unidades -= cantidad_restante_unidades
                            entrada.save()
                            facturas_usadas.append(entrada.factura)
                            facturas_cantidades[entrada.factura.numero_factura] = cantidad_restante_unidades
                            cantidad_restante_unidades = 0
                        else:
                            costo_total += cantidad_restante_unidades * entrada.costo_por_kilo
                            cantidad_restante_unidades -= entrada.cantidad_unidades
                            facturas_usadas.append(entrada.factura)
                            facturas_cantidades[entrada.factura.numero_factura] = entrada.cantidad_unidades
                            entrada.delete()

                        if entrada.cantidad_unidades == 0:
                            entrada.delete()


                    if kilos is None: 
                        kilos = 0 # Si no hay kilos, se deja en 0
                        costo_total = 0
                        total_venta = 0
                        pedido.estado = "Reservado"
                        costoXkilo = 0
                    else:   
                        costoXkilo = costo_total / unidades
                        total_venta = kilos * producto.precio_por_kilo
                        total_pedido += total_venta
                        pedido.estado = "Preparado"




                    

                    detalle_pedido = DetallePedido.objects.create(
                        pedido=pedido,
                        producto=producto,
                        cantidad_kilos=kilos,
                        cantidad_unidades=unidades,
                        total_costo=costo_total,
                        total_venta=total_venta,
                        costo_por_kilo=costoXkilo,
                        precio_venta=producto.precio_por_kilo
                    )

                    # Agregar las facturas usadas al detalle del pedido
                    detalle_pedido.facturas.set(facturas_usadas)

                    # Agregar la cantidad de unidades usadas de cada factura
                    for factura_id, cantidad in facturas_cantidades.items():
                        FacturaDetallePedido.objects.create(
                            detallepedido=detalle_pedido,
                            factura_id=factura_id,
                            cantidad_unidades=cantidad
                        )
                pedido.vendedor = vendedor
                pedido.total = total_pedido
                pedido.save()

                return Response(PedidoSerializer(pedido).data, status=status.HTTP_201_CREATED)

        except ValidationError as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({'error': f'Error al crear el pedido o detalles: {str(e)}'}, status=status.HTTP_400_BAD_REQUEST)
        



class ActualizarKilosPedido(APIView):
    def post(self, request, pedido_id, *args, **kwargs):
        try:
            pedido = Pedido.objects.get(id=pedido_id)
            detalles_data = request.data.get('detalles', [])
            total_pedido = 0
            with transaction.atomic():
                for detalle_data in detalles_data:
                    producto_id = detalle_data.get('producto')
                    cantidad_kilos = detalle_data.get('cantidad_kilos')

                    detalle = DetallePedido.objects.get(pedido=pedido, producto_id=producto_id)
                    detalle.cantidad_kilos = cantidad_kilos
                    detalle.save()

                    total_pedido += detalle.total_venta
                pedido.total = total_pedido
                pedido.save()

                

            return Response({'status': 'Kilos actualizados exitosamente'}, status=status.HTTP_200_OK)
        except Pedido.DoesNotExist:
            return Response({'error': 'Pedido no encontrado'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
        

class VendedorListView(APIView):
    def get(self, request):
        vendedores = Vendedor.objects.all()
        serializer = VendedorSerializer(vendedores, many=True)
        return Response(serializer.data)

class ClienteListView(APIView):
    def get(self, request):
        clientes = Cliente.objects.all()
        serializer = ClienteSerializer(clientes, many=True)
        return Response(serializer.data)

class CrearCliente(APIView):
    def post(self, request, *args, **kwargs):
        data = request.data
        nombre = data.get('nombre')
        direccion = data.get('direccion')
        telefono = data.get('telefono')
        email = data.get('email')
        vendedor_id = data.get('vendedor')

        if not nombre or not direccion or not vendedor_id:
            return Response({'error': 'Faltan datos obligatorios'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            vendedor = Vendedor.objects.get(id=vendedor_id)
            cliente = Cliente.objects.create(
                nombre=nombre,
                direccion=direccion,
                telefono=telefono,
                email=email,
                vendedor=vendedor
            )
            return Response(ClienteSerializer(cliente).data, status=status.HTTP_201_CREATED)
        except Vendedor.DoesNotExist:
            return Response({'error': 'Vendedor no encontrado'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

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
                        costo_por_kilo=costo_por_kilo,
                        cantidad_unidades=cantidad_unidades
                    )

                    EntradaProducto.objects.create(
                        factura=factura,
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

class CancelarPedido(APIView):
    def post(self, request, *args, **kwargs):
        pedido_id = request.data.get('pedido_id')

        if not pedido_id:
            return Response({'error': 'El ID del pedido es obligatorio'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            with transaction.atomic():
                pedido = Pedido.objects.get(id=pedido_id)

                if (pedido.estado == "Anulado"):
                    return Response({'error': 'El pedido ya está Anulado'}, status=status.HTTP_400_BAD_REQUEST)

                # Revertir las unidades de los productos a las facturas correspondientes
                for detalle in pedido.detalles.all():
                    for factura in detalle.facturas.all():
                        relaciones_facturas = FacturaDetallePedido.objects.filter(detallepedido_id=detalle.id)

                        for relacion in relaciones_facturas:
                            factura = relacion.factura
                            cantidad_usada = relacion.cantidad_unidades
                        

                        

                        
                            # Crear una nueva entrada de producto con una fecha anterior a la más antigua existente
                            fecha_mas_antigua = EntradaProducto.objects.filter(producto=detalle.producto).order_by('fecha_entrada').first().fecha_entrada
                            nueva_fecha = fecha_mas_antigua - timezone.timedelta(seconds=1)
                            
                            EntradaProducto.objects.create(
                                factura=factura,
                                producto=detalle.producto,
                                cantidad_kilos=detalle.cantidad_kilos,
                                cantidad_unidades=cantidad_usada,
                                costo_por_kilo=factura.detalles.get(producto=detalle.producto).costo_por_kilo,
                                fecha_entrada=nueva_fecha
                            )

                # Actualizar el estado del pedido a "Anulado"
                pedido.detalles.all().delete()
                pedido.estado = "Anulado"
                pedido.save()

                return Response({'status': 'Pedido Anulado exitosamente'}, status=status.HTTP_200_OK)

        except Pedido.DoesNotExist:
            return Response({'error': f'Pedido con ID {pedido_id} no existe'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({'error': f'Error al cancelar el pedido: {str(e)}'}, status=status.HTTP_400_BAD_REQUEST)
        


class ObtenerPedido(APIView):
    def get(self, request, pedido_id, *args, **kwargs):
        try:
            pedido = Pedido.objects.get(id=pedido_id)
            serializer = PedidoSerializer(pedido)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Pedido.DoesNotExist:
            return Response({'error': 'Pedido no encontrado'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
        

from django.db.models import Sum

class StockProductos(APIView):
    def get(self, request, *args, **kwargs):
        productos = Producto.objects.all()
        stock_data = []

        for producto in productos:
            entradas_unidades = DetalleFactura.objects.filter(producto=producto).aggregate(total=Sum('cantidad_unidades'))['total'] or 0
            salidas_unidades = DetallePedido.objects.filter(producto=producto).aggregate(total=Sum('cantidad_unidades'))['total'] or 0
            entradas_kilos = DetalleFactura.objects.filter(producto=producto).aggregate(total=Sum('cantidad_kilos'))['total'] or 0
            salidas_kilos = DetallePedido.objects.filter(producto=producto).aggregate(total=Sum('cantidad_kilos'))['total'] or 0
            unidades_rervadas = DetallePedido.objects.filter(cantidad_kilos=0).aggregate(total=Sum('cantidad_unidades'))['total'] or 0
            
            stock_actual_unidades = entradas_unidades - salidas_unidades
            stock_actual_kilos = entradas_kilos - salidas_kilos
            stock_data.append({
                'producto': producto.nombre,
                'precio_por_kilo': producto.precio_por_kilo,
                'disponibles': stock_actual_unidades,
                'stock': stock_actual_unidades+unidades_rervadas,
                'reservas': unidades_rervadas,
                'kilos_actuales': stock_actual_kilos
            })

        return Response(stock_data, status=status.HTTP_200_OK)

class UpdateProducto(APIView):
    def put(self, request, producto_id, *args, **kwargs):
        try:
            producto = Producto.objects.get(id=producto_id)
            data = request.data
            producto.precio_por_kilo = data.get('precio_por_kilo', producto.precio_por_kilo)
            producto.save()
            return Response(ProductoSerializer(producto).data, status=status.HTTP_200_OK)
        except Producto.DoesNotExist:
            return Response({'error': 'Producto no encontrado'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)