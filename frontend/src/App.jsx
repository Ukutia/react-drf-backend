import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AppBar, Toolbar, Typography, IconButton, Menu, MenuItem, Drawer, List, ListItem, ListItemText, Button, CssBaseline } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import AccountCircle from "@mui/icons-material/AccountCircle";
import Inventory from "./components/Inventario";
import Pedidos from "./components/Pedidos";
import CrearPedido from "./components/CrearPedido";
import AgregarFactura from "./components/CrearFactura";
import Facturas from "./components/Facturas";
import StockProductos from "./components/Stock";
import PagarFactura from "./components/PagarFactura";
import Home from "./vistas/Home";
import AgregarCliente from "./components/AgregarCliente";
import VerClientes from "./components/VerClientes";
import VerProductos from "./components/VerProductos";
import AgregarProducto from "./components/AgregarProducto";
import "./App.css";

function App() {
  const [anchorEl, setAnchorEl] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false); // Simulate login state
  const [userName, setUserName] = useState("John Doe"); // Simulate user name

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen);
  };

  const handleLogin = () => {
    // Simulate login action
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    // Simulate logout action
    setIsLoggedIn(false);
    setAnchorEl(null);
  };

  return (
    <Router>
      <CssBaseline />
      <AppBar position="fixed" sx={{ backgroundColor: "white", color: "black" }}>
        <Toolbar>
          <IconButton edge="start" color="inherit" aria-label="menu" onClick={handleDrawerToggle}>
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" textAlign='center' style={{ flexGrow: 1 }}>
            MeatME
          </Typography>
          {isLoggedIn ? (
            <div>
              <IconButton
                aria-label="account of current user"
                aria-controls="menu-appbar"
                aria-haspopup="true"
                onClick={handleMenu}
                color="inherit"
              >
                <AccountCircle />
                <Typography variant="body1" style={{ marginLeft: "8px" }}>
                  {userName}
                </Typography>
              </IconButton>
              <Menu
                id="menu-appbar"
                anchorEl={anchorEl}
                anchorOrigin={{
                  vertical: "top",
                  horizontal: "right",
                }}
                keepMounted
                transformOrigin={{
                  vertical: "top",
                  horizontal: "right",
                }}
                open={Boolean(anchorEl)}
                onClose={handleClose}
              >
                <MenuItem onClick={handleClose}>Perfil</MenuItem>
                <MenuItem onClick={handleLogout}>Cerrar Sesión</MenuItem>
              </Menu>
            </div>
          ) : (
            <Button color="inherit" onClick={handleLogin}>
              Iniciar Sesión
            </Button>
          )}
        </Toolbar>
      </AppBar>
      <Drawer
        variant="persistent"
        anchor="left"
        open={drawerOpen}
        sx={{
          width: 0,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: 188,
            top: '64px', // Adjust for the height of the AppBar
            backgroundColor: '#f0f0f0',
          },
        }}
      >
        <List>
          <ListItem button component="a" href="/">
            <ListItemText primary="Inicio" />
          </ListItem>
          <ListItem button component="a" href="/productos">
            <ListItemText primary="Productos" />
          </ListItem>
          <ListItem button component="a" href="/productos/crear">
            <ListItemText primary="Agregar Producto" />
          </ListItem>
          <ListItem button component="a" href="/pedidos">
            <ListItemText primary="Pedidos" />
          </ListItem>
          <ListItem button component="a" href="/pedidos/crear">
            <ListItemText primary="Crear Pedido" />
          </ListItem>
          <ListItem button component="a" href="/facturas/crear">
            <ListItemText primary="Crear Factura" />
          </ListItem>
          <ListItem button component="a" href="/facturas">
            <ListItemText primary="Facturas" />
          </ListItem>
          <ListItem button component="a" href="/stock">
            <ListItemText primary="Stock" />
          </ListItem>
          <ListItem button component="a" href="/clientes">
            <ListItemText primary="Clientes" />
          </ListItem>
          <ListItem button component="a" href="/clientes/crear">
            <ListItemText primary="Agregar Cliente" />
          </ListItem>
        </List>
      </Drawer>
      <main className={drawerOpen ? "contentShift" : "content"} style={{ alignItems: 'flex-start',  top: '64px' }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/productos" element={<VerProductos />} />
          <Route path="/productos/crear" element={<AgregarProducto />} />
          <Route path="/pedidos" element={<Pedidos />} />
          <Route path="/pedidos/crear" element={<CrearPedido />} />
          <Route path="/facturas/crear" element={<AgregarFactura />} />
          <Route path="/facturas" element={<Facturas />} />
          <Route path="/facturas/pagar" element={<PagarFactura />} />
          <Route path="/stock" element={<StockProductos />} />
          <Route path="/clientes" element={<VerClientes />} />
          <Route path="/clientes/crear" element={<AgregarCliente />} />
        </Routes>
      </main>
    </Router>
  );
}

export default App;
