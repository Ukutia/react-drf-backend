import React, { useState, useEffect } from "react";
import {
  TextField,
  Button,
  Box,
  Typography,
  Collapse,
  Card,
  CardContent,
  IconButton,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

const Facturas = () => {
  const [facturas, setFacturas] = useState([]);
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    fetch("http://localhost:8000/api/facturas")
      .then((response) => response.json())
      .then((data) => setFacturas(data))
      .catch((error) => console.error("Error fetching facturas:", error));
  }, []);

  const handleExpandClick = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>
        Lista de Facturas
      </Typography>
      {facturas.length === 0 ? (
        <Typography>No hay facturas disponibles.</Typography>
      ) : (
        facturas.map((factura) => (
          <Card key={factura.id} sx={{ mb: 2 }}>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="h6">Factura #{factura.id}</Typography>
                <IconButton onClick={() => handleExpandClick(factura.numero_factura)}>
                  <ExpandMoreIcon />
                </IconButton>
              </Box>
              <Collapse in={expandedId === factura.id} timeout="auto" unmountOnExit>
                <Box mt={2}>
                  <Typography>Cliente: {factura.cliente}</Typography>
                  <Typography>Total: ${factura.total}</Typography>
                  <Typography>Fecha: {factura.fecha}</Typography>
                </Box>
              </Collapse>
            </CardContent>
          </Card>
        ))
      )}
    </Box>
  );
};

export default Facturas;
