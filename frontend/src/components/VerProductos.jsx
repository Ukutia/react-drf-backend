import React, { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography, IconButton, TextField, Dialog, DialogActions, DialogContent, DialogTitle, Button, Box } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import { useNavigate } from 'react-router-dom';

const VerProductos = () => {
  const [productos, setProductos] = useState([]);
  const [selectedProducto, setSelectedProducto] = useState(null);
  const [newPrecio, setNewPrecio] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProductos = async () => {
      try {
        const response = await fetch("http://localhost:8000/api/productos/");
        const data = await response.json();
        setProductos(data);
      } catch (error) {
        console.error("Error fetching productos:", error);
      }
    };

    fetchProductos();
  }, []);

  const handleOpenDialog = (producto) => {
    setSelectedProducto(producto);
    setNewPrecio(producto.precio_por_kilo);
  };

  const handleCloseDialog = () => {
    setSelectedProducto(null);
    setNewPrecio('');
  };


  
  const formatNumber = (number) => {
    return number.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const formatInteger = (number) => {
    return Math.round(number).toLocaleString('de-DE');
  };


  const handleUpdatePrecio = async () => {
    if (selectedProducto) {
      try {
        const response = await fetch(`http://localhost:8000/api/productos/${selectedProducto.id}/`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ ...selectedProducto, precio_por_kilo: parseFloat(newPrecio) }),
        });

        if (response.ok) {
          const updatedProducto = await response.json();
          setProductos(productos.map((producto) => (producto.id === updatedProducto.id ? updatedProducto : producto)));
          handleCloseDialog();
        } else {
          const errorData = await response.json();
          console.error("Error details:", errorData);
          alert("Error al actualizar el precio.");
        }
      } catch (error) {
        console.error("Error updating precio:", error);
      }
    }
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h4" gutterBottom>
          Lista de Productos
        </Typography>
        <Button variant="contained" color="primary" onClick={() => navigate('/productos/crear')}>
          Agregar Producto
        </Button>
      </Box>
      <TableContainer component={Paper}>
        <Table aria-label="productos table">
          <TableHead>
            <TableRow>
              <TableCell>Nombre</TableCell>
              <TableCell>Precio por Kilo</TableCell>
              <TableCell>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {productos.map((producto) => (
              <TableRow key={producto.id}>
                <TableCell>{producto.nombre}</TableCell>
                <TableCell>${formatInteger(producto.precio_por_kilo)}</TableCell>
                <TableCell>
                  <IconButton onClick={() => handleOpenDialog(producto)}>
                    <EditIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={Boolean(selectedProducto)} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Actualizar Precio</DialogTitle>
        <DialogContent sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '150px' }}>
          <TextField
            label="Nuevo Precio por Kilo"
            type="number"
            value={newPrecio}
            onChange={(e) => setNewPrecio(e.target.value)}
            fullWidth
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="primary">
            Cancelar
          </Button>
          <Button onClick={handleUpdatePrecio} color="primary">
            Actualizar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default VerProductos;
