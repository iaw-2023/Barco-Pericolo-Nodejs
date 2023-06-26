const express = require('express');
const cors = require('cors');

const app = express();

const apiProductosController = require('./apiProductosController');
const apiCategoriasController = require('./apiCategoriasController');
const apiPedidosController = require('./apiPedidosController');
const apiClientesController = require('./apiClientesController');

app.use(cors());
app.use(express.json());

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

app.get('/', function(req, res){
  res.send('<h1>Backend de Node.js para Barco-Pericolo-React</h1>');
}
); 

// Rutas relacionadas a las categorias
app.get('/apiv2/categorias', apiCategoriasController.getCategorias);
app.get('/apiv2/categorias/:idCategoria', apiCategoriasController.show);

// Rutas relacionadas a los productos
app.get('/apiv2/productos', apiProductosController.getProductos);
app.get('/apiv2/productos/:idCategoria', apiProductosController.getProductosCategoria);

// Rutas relacionadas a los pedidos
app.get('/apiv2/pedidos/:idCliente', apiPedidosController.obtenerPedidosCliente);
app.post('/apiv2/pedidos', apiPedidosController.crearPedido);
app.post("/apiv2/process_payment", apiPedidosController.process_payment);

// Rutas relacionadas a los clientes
app.get('/apiv2/clientes', apiClientesController.obtenerClientes);
app.get('/apiv2/clientes/:idCliente', apiClientesController.obtenerClientePorId);
app.get('/apiv2/login', apiClientesController.loginDeCliente);
app.post('/apiv2/crearCliente', apiClientesController.crearCliente);
app.post('/apiv2/nuevaContrasenia', apiClientesController.cambiarContrasenia);

// Iniciar el servidor
const port = process.env.PORT || 4000;
app.listen(port, () => {
  console.log(`Servidor iniciado en el puerto ${port}`);
});
