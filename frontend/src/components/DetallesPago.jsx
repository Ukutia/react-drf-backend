import React from "react";
import { Box, Typography } from "@mui/material";

const DetallesPago = ({ pago }) => {
console.log(pago);
  return (
    <Box p={3} sx={{ backgroundColor: '#f0f0f0', borderRadius: '8px' }}>
      <Typography variant="h5" gutterBottom sx={{ color: 'black' }}>
        Detalles del Pago
      </Typography>
      <Typography variant="body1" sx={{ color: 'black' }}>
        Fecha de Pago: {pago.fecha_de_pago}
      </Typography>
      <Typography variant="body1" sx={{ color: 'black' }}>
        Monto del Pago: ${pago.monto_del_pago}
      </Typography>
    </Box>
  );
};

export default DetallesPago;