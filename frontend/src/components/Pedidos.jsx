import React, { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Collapse,
  IconButton,
  Paper,
  Box,
} from "@mui/material";
import { KeyboardArrowDown, KeyboardArrowUp } from "@mui/icons-material";

const Pedidos = () => {
  const [pedidos, setPedidos] = useState([]);
  const [selectedPedidoId, setSelectedPedidoId] = useState(null);

  useEffect(() => {
    const fetchPedidos = async () => {
      try {
        const response = await fetch("http://localhost:8000/api/pedidos/");
        const data = await response.json();
        setPedidos(data);
      } catch (error) {
        console.error("Error fetching pedidos:", error);
      }
    };

    fetchPedidos();
  }, []);

  // Componente de fila colapsable para el detalle del pedido
  const Row = ({ pedido }) => {
    const [open, setOpen] = useState(false);

    return (
      <>
        <TableRow hover onClick={() => setOpen(!open)}>
          <TableCell>
            <IconButton aria-label="expand row" size="small">
              {open ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
            </IconButton>
          </TableCell>
          <TableCell>{pedido.id}</TableCell>
          <TableCell>{pedido.cliente}</TableCell>
          <TableCell>{new Date(pedido.fecha).toLocaleString()}</TableCell>
          <TableCell>{pedido.estado}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell colSpan={5} style={{ paddingBottom: 0, paddingTop: 0 }}>
            <Collapse in={open} timeout="auto" unmountOnExit>
              <Box margin={1}>
                <h4>Detalles del Pedido</h4>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Producto</TableCell>
                      <TableCell>Kilos</TableCell>
                      <TableCell>Unidades</TableCell>
                      <TableCell>Precio Total</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {pedido.detalles && Array.isArray(pedido.detalles) ? (
                      pedido.detalles.map((detalle) => (
                        <TableRow key={detalle.id}>
                          <TableCell>{detalle.producto.nombre}</TableCell> 
                          <TableCell>{detalle.cantidad_kilos}</TableCell>
                          <TableCell>{detalle.cantidad_unidades}</TableCell>
                          <TableCell>${detalle.precio_total}</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={4}>Sin detalles</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </Box>
            </Collapse>
          </TableCell>
        </TableRow>
      </>
    );
  };

  return (
    <div>
      <h2>Pedidos</h2>
      <TableContainer component={Paper}>
        <Table aria-label="collapsible table">
          <TableHead>
            <TableRow>
              <TableCell />
              <TableCell>ID Pedido</TableCell>
              <TableCell>Cliente</TableCell>
              <TableCell>Fecha</TableCell>
              <TableCell>Estado</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {pedidos.map((pedido) => (
              <Row key={pedido.id} pedido={pedido} />
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
};

export default Pedidos;
