const express = require('express');
const app = express();

//const apiProductosController = require('./apiProductosController');
const apiCategoriasController = require('./apiCategoriasController');
const apiPedidosController = require('./apiPedidosController');
const apiClientesController = require('./apiClientesController');

app.use(express.json());

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// Rutas relacionadas a los productos
app.get('/apiv2/categorias', apiCategoriasController.getCategorias);
app.get('/apiv2/categorias/:idCategoria', apiCategoriasController.show);

// Rutas relacionadas a los pedidos
app.get('/apiv2/pedidos/:idCliente', apiPedidosController.obtenerPedidosCliente);
app.post('/apiv2/pedidos', apiPedidosController.crearPedido);

// Rutas relacionadas a los clientes
app.get('/apiv2/clientes', apiClientesController.obtenerClientes);
app.get('/apiv2/clientes/:idCliente', apiClientesController.obtenerClientePorId);
app.get('/apiv2/login', apiClientesController.loginDeCliente);
app.post('/apiv2/crearCliente', apiClientesController.crearCliente);
app.post('/apiv2/nuevaContrasenia', apiClientesController.cambiarContrasenia);

// Iniciar el servidor
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Servidor iniciado en el puerto ${port}`);
});
