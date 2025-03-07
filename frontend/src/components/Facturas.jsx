import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Collapse,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  IconButton,
  Modal,
  Button,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import "bootstrap-icons/font/bootstrap-icons.css";
import PagarFactura from "./PagarFactura";
import DetallesPago from "./DetallesPago";
import { useNavigate } from 'react-router-dom';

const Facturas = () => {
  const [facturas, setFacturas] = useState([]);
  const [expandedId, setExpandedId] = useState(null);
  const [selectedFactura, setSelectedFactura] = useState(null);
  const [selectedPago, setSelectedPago] = useState(null);
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetch("http://localhost:8000/api/facturas")
      .then((response) => response.json())
      .then((data) => setFacturas(data))
      .catch((error) => console.error("Error fetching facturas:", error));
  }, []);

  const handleExpandClick = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const handleIconClick = (factura) => {
    if (factura.pago_factura === null) {
      setSelectedFactura(factura);
      setOpen(true);
    } else {
      console.log(factura.pago_factura);
      setSelectedPago(factura.pago_factura);
      setOpen(true);
    }
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedFactura(null);
    setSelectedPago(null);
  };

  return (
    <Box p={3} sx={{ overflowX: 'auto' }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h4" gutterBottom>
          Lista de Facturas
        </Typography>
        <Button variant="contained" color="primary" onClick={() => navigate('/facturas/crear')}>
          Crear Factura
        </Button>
      </Box>
      {facturas.length === 0 ? (
        <Typography>No hay facturas disponibles.</Typography>
      ) : (
        facturas.map((factura) => {
          const isPaid = factura.pago_factura !== null;
          return (
            <Card
              key={factura.numero_factura}
              sx={{ mb: 2, minWidth: '100%', backgroundColor: isPaid ? 'white' : 'orange' }}
            >
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Typography variant="h6">
                    Factura N°{factura.numero_factura} - {factura.proveedor}
                  </Typography>
                  <Box display="flex" alignItems="center">
                    {isPaid ? (
                      <i className="bi bi-check2-circle" style={{ color: 'green', marginLeft: '8px', cursor: 'pointer' }} onClick={() => handleIconClick(factura)}></i>
                    ) : (
                      <i className="bi bi-bag-dash" style={{ color: 'red', marginLeft: '8px', cursor: 'pointer' }} onClick={() => handleIconClick(factura)}></i>
                    )}
                    <IconButton onClick={() => handleExpandClick(factura.numero_factura)}>
                      <ExpandMoreIcon />
                    </IconButton>
                  </Box>
                </Box>
                <Collapse in={expandedId === factura.numero_factura} timeout="auto" unmountOnExit>
                  <Box mt={2}>
                    <Typography mt={1}>Fecha: {factura.fecha}</Typography>
                    <Typography>SubTotal: ${factura.subtotal}</Typography>
                    <Typography>IVA: ${factura.iva}</Typography>
                    <Typography>Total: ${factura.total}</Typography>
                  </Box>
                  <h4>Detalles de la Factura</h4>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Producto</TableCell>
                        <TableCell>Unidades</TableCell>
                        <TableCell>Kilos</TableCell>
                        <TableCell>Neto por Kilo</TableCell>
                        <TableCell>Neto Total</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {factura.detalles && Array.isArray(factura.detalles) ? (
                        factura.detalles.map((detalle) => (
                          <TableRow key={detalle.id}>
                            <TableCell>{detalle.producto.nombre}</TableCell>
                            <TableCell>{detalle.cantidad_unidades}</TableCell>
                            <TableCell>{detalle.cantidad_kilos}</TableCell>
                            <TableCell>${detalle.costo_por_kilo}</TableCell>
                            <TableCell>${detalle.costo_total}</TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={5}>Sin detalles</TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </Collapse>
              </CardContent>
            </Card>
          );
        })
      )}
      <Modal open={open} onClose={handleClose}>
        <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 400, bgcolor: 'background.paper', boxShadow: 24, p: 4 }}>
          {selectedFactura && <PagarFactura factura={selectedFactura} onPagoCreado={() => { setOpen(false); setSelectedFactura(null); }} />}
          {selectedPago && <DetallesPago pago={selectedPago} />}
        </Box>
      </Modal>
    </Box>
  );
};

export default Facturas;