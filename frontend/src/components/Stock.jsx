import React, { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  IconButton,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';

const StockProductos = ({ cond }) => {
  const [stock, setStock] = useState([]);
  const [showColumns, setShowColumns] = useState(false);

  useEffect(() => {
    const fetchStock = async () => {
      try {
        const response = await fetch("http://localhost:8000/api/stock/");
        const data = await response.json();
        setStock(data);
      } catch (error) {
        console.error("Error fetching stock:", error);
      }
    };

    fetchStock();
  }, []);

  const toggleColumns = () => {
    setShowColumns(!showColumns);
  };

  const formatNumber = (number) => {
    return number.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const formatInteger = (number) => {
    return Math.round(number).toLocaleString('de-DE');
  };

  return (
    <>
      {cond && (
        <Typography variant="h5" gutterBottom>
          Stock de Productos
          <IconButton onClick={toggleColumns}>
            {showColumns ? <VisibilityOff /> : <Visibility />}
          </IconButton>
        </Typography>
      )}
      <TableContainer component={Paper} style={{ maxWidth: '100%', maxHeight: '80vh' }}>
        <Table aria-label="stock table">
          <TableHead>
            <TableRow>
              <TableCell>Producto</TableCell>
              <TableCell>$Kilo</TableCell>
              <TableCell align="left">Unidades</TableCell>
              <TableCell>Kilos</TableCell>
              {showColumns && <TableCell>Stock</TableCell>}
              {showColumns && <TableCell>Reservas</TableCell>}
            </TableRow>
          </TableHead>
          <TableBody>
            {stock.map((item) => (
              <TableRow
                key={item.producto}
                style={{ backgroundColor: item.disponibles === 0 ? '#ffcccc' : 'inherit' }}
              >
                <TableCell component="th" scope="row">
                  {item.producto}
                </TableCell>
                <TableCell align="left">${formatInteger(item.precio_por_kilo)}</TableCell>
                <TableCell align="left">{formatInteger(item.disponibles)}</TableCell>
                <TableCell align="left">{formatNumber(item.kilos_actuales)}</TableCell>
                {showColumns && <TableCell align="left">{formatInteger(item.stock)}</TableCell>}
                {showColumns && <TableCell align="left">{formatInteger(item.reservas)}</TableCell>}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
};

export default StockProductos;