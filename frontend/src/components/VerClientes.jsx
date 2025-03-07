import React, { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography } from '@mui/material';

const VerClientes = () => {
  const [clientes, setClientes] = useState([]);

  useEffect(() => {
    const fetchClientes = async () => {
      try {
        const response = await fetch("http://localhost:8000/api/clientes/");
        const data = await response.json();
        setClientes(data);
      } catch (error) {
        console.error("Error fetching clientes:", error);
      }
    };

    fetchClientes();
  }, []);

  return (
    <TableContainer component={Paper}>
      <Typography variant="h4" gutterBottom>
        Lista de Clientes
      </Typography>
      <Table aria-label="clientes table">
        <TableHead>
          <TableRow>
            <TableCell>Nombre</TableCell>
            <TableCell>Dirección</TableCell>
            <TableCell>Teléfono</TableCell>
            <TableCell>Email</TableCell>
            <TableCell>Vendedor</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {clientes.map((cliente) => (
            <TableRow key={cliente.id}>
              <TableCell>{cliente.nombre}</TableCell>
              <TableCell>{cliente.direccion}</TableCell>
              <TableCell>{cliente.telefono}</TableCell>
              <TableCell>{cliente.email}</TableCell>
              <TableCell>{cliente.vendedor.nombre}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default VerClientes;
