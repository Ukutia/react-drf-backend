import React from 'react';
import { Box, Typography, IconButton } from '@mui/material';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import InventoryIcon from '@mui/icons-material/Inventory';
import { useNavigate } from 'react-router-dom';
import StockProductos from '../components/Stock';

const Home = () => {
  const navigate = useNavigate();

  return (
    <Box className="parent" sx={{ display: 'flex', flexDirection: 'column', height: '100vh', gap: '10px' }}>
      <Box className="div4" sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', backgroundColor: '#c8e6c9', borderRadius: '10px', border: '1px solid #a5d6a7', '&:hover': { backgroundColor: '#a5d6a7' }, padding: '10px' }}>
        <IconButton>
          <InventoryIcon fontSize="large" />
        </IconButton>
        <Typography variant="h6">Stock Disponible</Typography>
        <StockProductos cond={false} />
      </Box>
      <Box className="actions" sx={{ position: 'fixed', bottom: 0, left: 0, right: 0, display: 'flex', justifyContent: 'space-between', padding: '10px' }}>
        <Box className="div1" sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: '#e0f7fa', cursor: 'pointer', borderRadius: '10px', border: '1px solid #b0bec5', '&:hover': { backgroundColor: '#b2ebf2' }, width: '30%' }} onClick={() => navigate('/clientes/crear')}>
          <IconButton>
            <PersonAddIcon fontSize="small" />
          </IconButton>
          <Typography variant="body1">Agregar Cliente</Typography>
        </Box>
        <Box className="div2" sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: '#ffecb3', cursor: 'pointer', borderRadius: '10px', border: '1px solid #ffe082', '&:hover': { backgroundColor: '#ffe082' }, width: '30%' }} onClick={() => navigate('/pedidos/crear')}>
          <IconButton>
            <AddShoppingCartIcon fontSize="small" />
          </IconButton>
          <Typography variant="body1">Agregar Pedido</Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default Home;
