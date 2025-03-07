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
  Menu,
  MenuItem,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
} from "@mui/material";
import { KeyboardArrowDown, KeyboardArrowUp, MoreVert } from "@mui/icons-material";
import { makeStyles } from '@mui/styles';
import IngresarKilos from './AgregarKilos'; // Importar el componente IngresarKilos
import CrearPedido from './CrearPedido'; // Importar el componente CrearPedido

const useStyles = makeStyles({
  rowCancelled: {
    backgroundColor: '#f8d7da', // Rojo claro para pedidos cancelados
  },
  rowCompleted: {
    backgroundColor: '#d4edda', // Verde claro para pedidos completados
  },
  rowPending: {
    backgroundColor: '#fff3cd', // Amarillo claro para pedidos pendientes
  },
  chipCancelled: {
    backgroundColor: '#ed929a', // Rojo claro para pedidos cancelados
    color: '#721c24',
  },
  chipCompleted: {
    backgroundColor: '#93d2a2', // Verde claro para pedidos completados
    color: '#155724',
  },
  chipPending: {
    backgroundColor: '#ffe180', // Amarillo claro para pedidos pendientes
    color: '#856404',
  },
});

const Pedidos = () => {
  const classes = useStyles();
  const [pedidos, setPedidos] = useState([]);
  const [selectedPedidoId, setSelectedPedidoId] = useState(null);
  const [openDialog, setOpenDialog] = useState(false); // Estado para manejar el diálogo de Agregar Kilos
  const [openCrearPedidoDialog, setOpenCrearPedidoDialog] = useState(false); // Estado para manejar el diálogo de Crear Pedido

  const fetchPedidos = async () => {
    try {
      const response = await fetch("http://localhost:8000/api/pedidos/");
      const data = await response.json();
      setPedidos(data);
    } catch (error) {
      console.error("Error fetching pedidos:", error);
    }
  };

  useEffect(() => {
    fetchPedidos();
  }, []);

  const handleDialogClose = () => {
    setOpenDialog(false);
    fetchPedidos(); // Refrescar los datos de los pedidos
  };

  const handleCrearPedidoDialogClose = () => {
    setOpenCrearPedidoDialog(false);
    fetchPedidos(); // Refrescar los datos de los pedidos
  };

  // Componente de fila colapsable para el detalle del pedido
  const Row = ({ pedido, setSelectedPedidoId }) => {
    const [open, setOpen] = useState(false);
    const [anchorEl, setAnchorEl] = useState(null);

    const handleMenuOpen = (event, pedidoId) => {
      setSelectedPedidoId(pedidoId);
      setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
      setAnchorEl(null);
    };

    const handleMarkAsPaid = async () => {
      // Implementar la lógica para marcar el pedido como pagado
      handleMenuClose();
    };

    const handleCancelOrder = async () => {
      try {
        const response = await fetch("http://localhost:8000/api/pedidos/cancelar/", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ pedido_id: selectedPedidoId }),
        });

        if (response.ok) {
          // Actualizar la lista de pedidos después de cancelar
          setPedidos((prevPedidos) =>
            prevPedidos.map((pedido) =>
              pedido.id === selectedPedidoId ? { ...pedido, estado: "Anulado" } : pedido
            )
          );
        } else {
          console.error("Error canceling order:", await response.json());
        }
      } catch (error) {
        console.error("Error canceling order:", error);
      }

      handleMenuClose();
    };

    const handleAddKilos = () => {
      setOpenDialog(true); // Abrir el diálogo
      handleMenuClose();
    };

    // Determinar la clase de la fila basada en el estado del pedido
    const getRowClass = (estado) => {
      switch (estado) {
        case 'Anulado':
          return classes.rowCancelled;
        case 'Pagado':
          return classes.rowCompleted;
        case 'Reservado':
          return classes.rowPending;
        default:
          return '';
      }
    };

    // Determinar la clase del chip basada en el estado del pedido
    const getChipClass = (estado) => {
      switch (estado) {
        case 'Anulado':
          return classes.chipCancelled;
        case 'Pagado':
          return classes.chipCompleted;
        case 'Reservado':
          return classes.chipPending;
        default:
          return '';
      }
    };

    return (
      <>
        <TableRow hover className={getRowClass(pedido.estado)}>
          <TableCell>
            {pedido.estado !== "Anulado" ? 
            <IconButton aria-label="expand row" size="small" onClick={() => setOpen(!open)}>
              {open ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
            </IconButton>
            : null} 
          </TableCell>
          <TableCell>{pedido.id}</TableCell>
          <TableCell>{pedido.cliente.nombre}</TableCell>
          <TableCell>{pedido.vendedor.sigla}</TableCell>
          <TableCell>{pedido.total}</TableCell>
          <TableCell>{new Date(pedido.fecha).toLocaleString()}</TableCell>
          <TableCell>
            <Chip label={pedido.estado} className={getChipClass(pedido.estado)} />
          </TableCell>
          <TableCell>
            {pedido.estado !== "Anulado" ? 
            <IconButton aria-label="more actions" size="small" onClick={(event) => handleMenuOpen(event, pedido.id)}>
              <MoreVert />
            </IconButton>
            : null}
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
              anchorOrigin={{
                vertical: 'center',
                horizontal: 'right',
              }}
              transformOrigin={{
                vertical: 'center',
                horizontal: 'left',
              }}
            >
              <MenuItem onClick={handleMarkAsPaid}>Marcar como Pagado</MenuItem>
              <MenuItem onClick={handleCancelOrder}>Cancelar Pedido</MenuItem>
              <MenuItem onClick={handleAddKilos}>Agregar Kilos</MenuItem> {/* Nueva opción */}
            </Menu>
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell colSpan={7} style={{ paddingBottom: 0, paddingTop: 0 }}>
            <Collapse in={open} timeout="auto" unmountOnExit>
              <Box margin={1}>
                <h4>Detalles del Pedido</h4>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Producto</TableCell>
                      <TableCell>Kilos</TableCell>
                      <TableCell>Unidades</TableCell>
                      <TableCell>Costo Total</TableCell>
                      <TableCell>Precio Total</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {Array.isArray(pedido.detalles) && pedido.detalles.length > 0 ? (
                      pedido.detalles.map((detalle) => (
                        <TableRow key={detalle.id}>
                          <TableCell>{detalle.producto.nombre}</TableCell>
                          <TableCell>{detalle.cantidad_kilos}</TableCell>
                          <TableCell>{detalle.cantidad_unidades}</TableCell>
                          <TableCell>{detalle.total_costo}</TableCell>
                          <TableCell>${detalle.total_venta}</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5}>Sin detalles</TableCell>
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
    <div style={{ minHeight: '100vh', backgroundColor: '#f0f0f0', paddingBottom: '20px' }}>
      <h2>Pedidos</h2>
      <Button variant="contained" color="primary" onClick={() => setOpenCrearPedidoDialog(true)}>
        Agregar Pedido
      </Button>
      <TableContainer component={Paper}>
        <Table aria-label="collapsible table">
          <TableHead>
            <TableRow>
              <TableCell />
              <TableCell>ID Pedido</TableCell>
              <TableCell>Cliente</TableCell>
              <TableCell>Vendedor</TableCell>
              <TableCell>Total</TableCell>
              <TableCell>Fecha</TableCell>
              <TableCell>Estado</TableCell>
              <TableCell />
            </TableRow>
          </TableHead>
          <TableBody>
            {pedidos.map((pedido) => (
              <Row key={pedido.id} pedido={pedido} setSelectedPedidoId={setSelectedPedidoId} />
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Diálogo para agregar kilos */}
      <Dialog open={openDialog} onClose={handleDialogClose} maxWidth="md" fullWidth>
        <DialogTitle>Agregar Kilos</DialogTitle>
        <DialogContent>
          <IngresarKilos pedidoId={selectedPedidoId} />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose} color="primary">
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Diálogo para crear pedido */}
      <Dialog open={openCrearPedidoDialog} onClose={handleCrearPedidoDialogClose} maxWidth="md" fullWidth>
        <DialogTitle>Crear Pedido</DialogTitle>
        <DialogContent>
          <CrearPedido />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCrearPedidoDialogClose} color="primary">
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default Pedidos;
