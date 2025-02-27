import React, { useState } from "react";
import {
  TextField,
  Button,
  Box,
  Typography,
  FormControl,
} from "@mui/material";
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';

const PagarFactura = ({ factura, onPagoCreado }) => {
  const [fechaDePago, setFechaDePago] = useState("");
  const [montoDelPago, setMontoDelPago] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();

    const nuevoPago = {
      factura: factura.numero_factura,
      fecha_de_pago: fechaDePago,
      monto_del_pago: montoDelPago,
    };

    fetch("http://localhost:8000/api/facturas/pagar/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(nuevoPago),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Pago creado:", data);
        onPagoCreado(data);
      })
      .catch((error) => {
        console.error("Error al crear el pago:", error);
      });
  };

  return (

      <form onSubmit={handleSubmit}>
        <Typography variant="h5" gutterBottom sx={{ color: 'black' }}>
          Pagar Factura N°{factura.numero_factura} - {factura.proveedor}
        </Typography>
        <FormControl fullWidth margin="normal">
          <TextField
            label="Fecha de Pago"
            type="date"
            value={fechaDePago}
            onChange={(e) => setFechaDePago(e.target.value)}
            required
            sx={{
              backgroundColor: '#f0f0f0',
              '& .MuiInputBase-input': {
                color: 'black', // Color del texto
              },
              '& .MuiOutlinedInput-root': {
                '& fieldset': {
                  borderColor: 'black', // Color del borde
                },
                '&:hover fieldset': {
                  borderColor: 'black', // Color del borde al pasar el mouse
                },
                '&.Mui-focused fieldset': {
                  borderColor: 'black', // Color del borde al enfocar
                },
              },
              '& .MuiInputLabel-root': {
                color: 'black', // Color del label
              },
              '& .MuiSvgIcon-root': {
                color: 'black', // Color del icono del calendario
              },
            }}
            InputLabelProps={{
              shrink: true,
            }}
          />
        </FormControl>
        <FormControl fullWidth margin="normal">
          <TextField
            label="Monto del Pago"
            type="number"
            value={montoDelPago}
            onChange={(e) => setMontoDelPago(e.target.value)}
            required
            sx={{
              backgroundColor: '#f0f0f0',
              '& .MuiInputBase-input': {
                color: 'black', // Color del texto
              },
              '& .MuiOutlinedInput-root': {
                '& fieldset': {
                  borderColor: 'black', // Color del borde
                },
                '&:hover fieldset': {
                  borderColor: 'black', // Color del borde al pasar el mouse
                },
                '&.Mui-focused fieldset': {
                  borderColor: 'black', // Color del borde al enfocar
                },
              },
              '& .MuiInputLabel-root': {
                color: 'black', // Color del label
              },
            }}
          />
        </FormControl>
        <Button type="submit" variant="contained" color="primary">
          Pagar
        </Button>
      </form>
  );
};

export default PagarFactura;