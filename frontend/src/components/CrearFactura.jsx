import React, { useState, useEffect, useCallback } from 'react';
import { Snackbar } from '@mui/material';
import {
  TextField,
  Button,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Box,
  Typography,
} from '@mui/material';

const AgregarFactura = () => {
  const [productos, setProductos] = useState([]);
  const [proveedor, setProveedor] = useState('');
  const [fecha, setFecha] = useState('');
  const [numeroFactura, setNumeroFactura] = useState('');
  const [detalles, setDetalles] = useState([
    { producto: '', cantidadKilos: '', cantidadUnidades: '', costoPorKilo: '', costo_por_kilo: 0 },
  ]);
  const [mensaje, setMensaje] = useState('');
  const [costoFacturaTotal, setCostoFacturaTotal] = useState(0);  // Nuevo estado para el costo total de la factura

  // Fetch productos al cargar el componente
  useEffect(() => {
    const fetchProductos = async () => {
      try {
        const response = await fetch("http://localhost:8000/api/productos/");
        const data = await response.json();
        if (Array.isArray(data)) {
          setProductos(data);
        } else {
          console.error('Error: La respuesta no es un array', data);
        }
      } catch (error) {
        console.error('Error al obtener productos:', error);
      }
    };

    fetchProductos();
  }, []);

  // Manejo de cambios en los detalles de la factura
  const handleChange = useCallback((index, event) => {
    const values = [...detalles];
    values[index][event.target.name] = event.target.value;

    // Recalcular el costo total de ese detalle
    values[index].costoTotal = parseFloat(values[index].cantidadKilos) * parseFloat(values[index].costoPorKilo);

    setDetalles(values);
    actualizarCostoFactura(values);
  }, [detalles]);

  // Agregar un nuevo detalle a la factura
  const agregarDetalle = () => {
    const nuevoDetalle = { producto: '', cantidadKilos: '', cantidadUnidades: '', costoPorKilo: '', costoTotal: 0 };
    setDetalles([...detalles, nuevoDetalle]);
  };

  // Eliminar un detalle de la factura
  const eliminarDetalle = (index) => {
    const values = [...detalles];
    values.splice(index, 1);
    setDetalles(values);
    actualizarCostoFactura(values);
  };

  // Actualizar el costo total de la factura sumando los costos de cada detalle
  const actualizarCostoFactura = (detalles) => {
    const total = detalles.reduce((sum, detalle) => sum + parseFloat(detalle.costoTotal || 0), 0);
    setCostoFacturaTotal(total);
  };

  // Validación de datos del formulario
  const validarFactura = () => {
    if (!proveedor || !fecha || !numeroFactura) {
      setMensaje('Por favor complete todos los campos obligatorios.');
      return false;
    }
    for (let detalle of detalles) {
      if (!detalle.producto || !detalle.cantidadKilos || !detalle.costoPorKilo) {
        setMensaje('Por favor complete todos los detalles de los productos.');
        return false;
      }
    }
    return true;
  };

  // Enviar los datos del formulario
  const handleSubmit = async (e) => {
    e.preventDefault(); 


    if (!validarFactura()) return;

    const facturaData = {
      proveedor,
      fecha,
      numero_factura: numeroFactura,
      detalles: detalles.map(detalle => ({
        producto: detalle.producto,
        cantidad_kilos: parseFloat(detalle.cantidadKilos),
        cantidad_unidades: parseFloat(detalle.cantidadUnidades),
        costo_por_kilo: parseFloat(detalle.costoPorKilo),
        costo_total: detalle.costoTotal,  // Usar el costo total calculado
      })),
    };

    // Verificar los datos antes de enviarlos
    console.log("Datos enviados:", facturaData);

    console.log(JSON.stringify(facturaData))

    try {
      const response = await fetch("http://localhost:8000/api/facturas/crear", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(facturaData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error del servidor:", errorData);
        setMensaje('Error al crear la factura: ' + errorData.detail || 'Error desconocido');
      } else {
        const data = await response.json();
        setMensaje(data.status || 'Factura creada con éxito');
        // Limpiar el formulario después de la creación
        setProveedor('');
        setFecha('');
        setNumeroFactura('');
        setDetalles([{ producto: '', cantidadKilos: '', cantidadUnidades: '', costoPorKilo: '', costoTotal: 0 }]);
        setCostoFacturaTotal(0);  // Resetear el costo total de la factura
      }
    } catch (error) {
      setMensaje('Error al crear la factura: ' + error.message);
    }
  };

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>
        Agregar Factura de Entrada
      </Typography>
      <form onSubmit={handleSubmit}>
        <Box mb={2}>
          <TextField
            label="Proveedor"
            variant="outlined"
            fullWidth
            value={proveedor}
            onChange={(e) => setProveedor(e.target.value)}
            required
          />
        </Box>
        <Box mb={2}>
          <TextField
            label="Fecha"
            type="date"
            variant="outlined"
            fullWidth
            InputLabelProps={{ shrink: true }}
            value={fecha}
            onChange={(e) => setFecha(e.target.value)}
            required
          />
        </Box>
        <Box mb={2}>
          <TextField
            label="Número de Factura"
            variant="outlined"
            fullWidth
            value={numeroFactura}
            onChange={(e) => setNumeroFactura(e.target.value)}
            required
          />
        </Box>

        <Typography variant="h6" gutterBottom>
          Detalles de la Factura
        </Typography>
        {detalles.map((detalle, index) => (
          <Box key={index} mb={3}>
            <FormControl fullWidth>
              <InputLabel>Producto</InputLabel>
              <Select
                name="producto"
                value={detalle.producto}
                onChange={(e) => handleChange(index, e)}
                required
              >
                {Array.isArray(productos) &&
                  productos.map((producto) => (
                    <MenuItem key={producto.id} value={producto.id}>
                      {producto.nombre}
                    </MenuItem>
                  ))}
              </Select>
            </FormControl>
            <Box display="flex" justifyContent="space-between" mt={2}>
              <TextField
                label="Cantidad en Kilos"
                type="number"
                name="cantidadKilos"
                value={detalle.cantidadKilos}
                onChange={(e) => handleChange(index, e)}
                required
                fullWidth
              />
              <TextField
                label="Cantidad en Unidades"
                type="number"
                name="cantidadUnidades"
                value={detalle.cantidadUnidades}
                onChange={(e) => handleChange(index, e)}
                required
                fullWidth
              />
              <TextField
                label="Costo por Kilo"
                type="number"
                name="costoPorKilo"
                value={detalle.costoPorKilo}
                onChange={(e) => handleChange(index, e)}
                required
                fullWidth
              />
            </Box>
            <Button
              variant="outlined"
              color="secondary"
              onClick={() => eliminarDetalle(index)}
              fullWidth
              sx={{ mt: 2 }}
            >
              Eliminar Producto
            </Button>
          </Box>
        ))}
        <Button
          variant="contained"
          color="primary"
          onClick={agregarDetalle}
          fullWidth
          sx={{ mb: 2 }}
        >
          Agregar Producto
        </Button>
        <Button type="submit" variant="contained" color="primary" fullWidth>
          Crear Factura
        </Button>
      </form>

      {/* Mostrar el mensaje con Snackbar */}
      <Snackbar
        open={!!mensaje}
        autoHideDuration={6000}
        onClose={() => setMensaje('')}
        message={mensaje}
      />

      <Typography variant="h6" mt={3}>
        Costo Total de la Factura: ${costoFacturaTotal.toFixed(2)}
      </Typography>
    </Box>
  );
};

export default AgregarFactura;
