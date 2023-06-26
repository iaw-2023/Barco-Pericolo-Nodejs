const express = require('express');
const cors = require('cors');
var mercadopago = require('mercadopago');
mercadopago.configurations.setAccessToken("TEST-6716197673678148-061813-89d329da1afea2ed238b6392c2b1148d-295492865");
const app = express();

app.use(cors());
app.use(express.json());

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://bltnpoukibscmpjgvdtc.supabase.co';
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJsdG5wb3VraWJzY21wamd2ZHRjIiwicm9sZSI6ImFub24iLCJpYXQiOjE2ODI5NjU4NDEsImV4cCI6MTk5ODU0MTg0MX0.LjLMP0JW5Cj83eB-1rX2QLcUCkk_9T6y8oVUS1MBNHw";

const supabase = createClient(supabaseUrl, supabaseKey);

/**
   * Obtener pedidos de un cliente con paginación.
   *
   * @OA\Get(
   *     path="/pedidos/{idCliente}",
   *     tags={"Pedidos"},
   *     summary="Obtiene los pedidos de un cliente con paginación",
   *     operationId="obtenerPedidosCliente",
   *     @OA\Parameter(
   *         name="idCliente",
   *         in="path",
   *         description="ID del cliente",
   *         required=true,
   *         @OA\Schema(
   *             type="integer",
   *             format="int64"
   *         )
   *     ),
   *     @OA\Parameter(
   *         name="perPage",
   *         in="query",
   *         description="Cantidad de elementos por página",
   *         required=false,
   *         @OA\Schema(
   *             type="integer",
   *             format="int32",
   *             default=10
   *         )
   *     ),
   *     @OA\Parameter(
   *         name="page",
   *         in="query",
   *         description="Número de página",
   *         required=false,
   *         @OA\Schema(
   *             type="integer",
   *             format="int32",
   *             default=1
   *         )
   *     ),
   *     @OA\Response(
   *         response=200,
   *         description="OK",
   *         @OA\JsonContent(
   *             @OA\Property(
   *                 property="productosPorPedido",
   *                 description="Lista de productos por pedido",
   *                 type="array",
   *                 @OA\Items(
   *                     @OA\Property(
   *                         property="id_pedido",
   *                         description="ID del pedido",
   *                         type="integer",
   *                         format="int64"
   *                     ),
   *                     @OA\Property(
   *                         property="productos",
   *                         description="Lista de productos",
   *                         type="array",
   *                         @OA\Items(
   *                             @OA\Property(
   *                                 property="id",
   *                                 description="ID del producto",
   *                                 type="integer",
   *                                 format="int64"
   *                             ),
   *                             @OA\Property(
   *                                 property="nombre",
   *                                 description="Nombre del producto",
   *                                 type="string"
   *                             ),
   *                             @OA\Property(
   *                                 property="precio",
   *                                 description="Precio del producto",
   *                                 type="number",
   *                                 format="float"
   *                             ),
   *                             @OA\Property(
   *                                 property="cantidad",
   *                                 description="Cantidad del producto",
   *                                 type="integer",
   *                                 format="int32"
   *                             )
   *                         )
   *                     )
   *                 )
   *             ),
   *             @OA\Property(
   *                 property="totalPaginas",
   *                 description="Número total de páginas",
   *                 type="integer",
   *                 format="int32"
   *             )
   *         )
   *     ),
   *     @OA\Response(
   *         response=404,
   *         description="Cliente no encontrado",
   *         @OA\JsonContent(
   *             @OA\Property(
   *                 property="message",
   *                 description="Mensaje de error",
   *                 type="string"
   *             )
   *         )
   *     )
   * )
*/ 
exports.obtenerPedidosCliente = async (req, res) => {
    try {
      const { idCliente } = req.params;
      const page = req.query.page || 1;
      const perPage = 10;
  
      const { data: cliente, error: clienteError } = await supabase
        .from('cliente')
        .select('*')
        .eq('id', idCliente)
        .single();
  
      if (clienteError) {
        console.error('Error al obtener el cliente:', clienteError);
        return res.status(500).json({ message: 'Error en el servidor' });
      }
  
      if (!cliente) {
        return res.status(404).json({ message: 'Cliente no encontrado' });
      }
  
      const { data: pedidos, error: pedidosError } = await supabase
        .from('pedido')
        .select('*')
        .eq('id_cliente', idCliente)
        .range((page - 1) * perPage, page * perPage - 1)
        .order('id', { ascending: false });;
  
      if (pedidosError) {
        console.error('Error al obtener los pedidos:', pedidosError);
        return res.status(500).json({ message: 'Error en el servidor' });
      }
  
      const { data: totalPedidos } = await supabase
        .from('pedido')
        .select('*')
        .eq('id_cliente', idCliente);
  
      const totalPaginas = Math.ceil(totalPedidos.length / perPage);
  
      const productosPorPedido = [];
  
      for (const pedido of pedidos) {
        const { data: detalles, error: detallesError } = await supabase
          .from('pedido_detalle')
          .select('*')
          .eq('id_pedido', pedido.id);
  
        if (detallesError) {
          console.error('Error al obtener los detalles del pedido:', detallesError);
          return res.status(500).json({ message: 'Error en el servidor' });
        }
  

        const productos = [];

        for (const detalle of detalles) {
            const { data: producto, error: productoError } = await supabase
                .from('producto')
                .select('nombre, precio')
                .eq('id', detalle.id_producto)
                .single();

            if (productoError) {
                console.error('Error al obtener el producto:', productoError);
                return res.status(500).json({ message: 'Error en el servidor' });
            }

            if (!producto) {
                console.error('Producto no encontrado');
                return res.status(404).json({ message: 'Producto no encontrado' });
            }

            productos.push({
                id: detalle.id_producto,
                nombre: producto.nombre,
                precio: producto.precio,
                cantidad: detalle.cantidad,
            });
        }
  
        productosPorPedido.push({
          id_pedido: pedido.id,
          id_pago_mp: pedido.id_pago_mp,
          productos: productos,
        });
      }
  
      return res.json({
        productosPorPedido: productosPorPedido,
        totalPaginas: totalPaginas,
      });
    } catch (error) {
      console.error('Error al obtener los pedidos del cliente:', error);
      return res.status(500).json({ message: 'Error en el servidor' });
    }
};

/**
   * @OA\Post(
   *     path="/pedidos",
   *     tags={"Pedidos"},
   *     summary="Crea un nuevo pedido y sus respectivos detalles",
   *     operationId="crearPedido",
   *     @OA\RequestBody(
   *         required=true,
   *         description="Cuerpo de la solicitud en formato JSON",
   *         @OA\MediaType(
   *             mediaType="application/json",
   *             @OA\Schema(
   *                 @OA\Property(
   *                     property="cliente",
   *                     description="ID del cliente",
   *                     type="string",
   *                 ),
   *                 @OA\Property(
   *                     property="productos",
   *                     description="Array de productos",
   *                     type="array",
   *                     @OA\Items(
   *                         @OA\Property(
   *                             property="id_producto",
   *                             description="ID del producto",
   *                             type="string",
   *                         ),
   *                         @OA\Property(
   *                             property="cantidad",
   *                             description="Cantidad del producto",
   *                             type="string",
   *                         ),
   *                     ),
   *                 ),
   *             ),
   *         ),
   *     ),
   *     @OA\Response(
   *         response=200,
   *         description="OK",
   *         @OA\JsonContent(
   *             @OA\Property(
   *                 property="id",
   *                 description="ID del pedido creado",
   *                 type="integer",
   *             ),
   *             @OA\Property(
   *                 property="id_cliente",
   *                 description="ID del cliente del pedido",
   *                 type="string",
   *             ),
   *         ),
   *     ),
   * )
*/
exports.crearPedido = async (req, res) => {
  try {
    // Obtener los datos enviados en el cuerpo de la solicitud
    const data = req.body;

      // Obtener el último ID de la tabla "pedido"
      const { data: maxIdResult, error: maxIdError } = await supabase
          .from('pedido')
          .select('id')
          .order('id', { ascending: false })
          .limit(1);

      if (maxIdError) {
          console.error('Error al obtener el último ID:', maxIdError);
          return res.status(500).json({ message: 'Error en el servidor' });
      }

      // Calcular el nuevo ID sumando 1 al último ID obtenido
      const nuevoId = maxIdResult ? (maxIdResult[0].id + 1) : 1;

      const nuevoPedido = {
          id: nuevoId,
          id_cliente: data.cliente,
          id_pago_mp: data.id_pago,
          created_at: new Date(),
          updated_at: new Date()
        }

    // Crear un nuevo pedido en la tabla "pedido"
    const { error } = await supabase
      .from('pedido')
      .insert([nuevoPedido]);

      if (error) {
          console.error('Error al insertar el pedido:', error);
          return res.status(500).json({ message: 'Error en el servidor' });
      }

    // Actualizar los datos para enviar a "crearPedidoDetalle"
    data.id_pedido = nuevoPedido.id;

    // Derivar la creación de los "PedidoDetalle" a su controlador correspondiente
    for (const producto of data.productos) {
      const pedidoDetalle = {
        id_pedido: data.id_pedido,
        id_producto: producto.id_producto,
        cantidad: producto.cantidad,
        precio: null,
        created_at: new Date(),
        updated_at: new Date()
      };

      // Obtener el precio del producto desde la tabla "producto"
      const { data: db_producto, error: productoError } = await supabase
        .from('producto')
        .select('*')
        .eq('id', producto.id_producto)
        .single();

      if (productoError) {
        console.error('Error al obtener el producto:', productoError);
        throw new Error('Error al obtener el producto');
      }

      if (!db_producto) {
        console.error('Producto no encontrado');
        throw new Error('Producto no encontrado');
      }

      pedidoDetalle.precio = db_producto.precio;

      // Crear el detalle de pedido en la tabla "pedido_detalle"
      await supabase.from('pedido_detalle').insert([pedidoDetalle]);

      // Reducir el stock del producto en la tabla "producto"
      await supabase
      .from('producto')
      .update({ stock: (db_producto.stock - producto.cantidad) })
      .eq('id', producto.id_producto)
    }

    return res.json({
      id: nuevoPedido.id,
      id_cliente: nuevoPedido.id_cliente,
    });
  } catch (error) {
    console.error('Error al crear el pedido:', error);
    return res.status(500).json({ message: 'Error en el servidor' });
  }
};

exports.process_payment = async (req, res) => {
  const { body } = req;
  
  mercadopago.payment.save(body)
    .then(function(response) {
      const { response: data } = response;

      res.status(201).json({
        detail: data.status_detail,
        status: data.status,
        id: data.id
      });
    })
    .catch(function(error) {
      console.log(error);
      const { errorMessage, errorStatus }  = validateError(error);
      res.status(errorStatus).json({ error_message: errorMessage });
    });
};

function validateError(error) {
  let errorMessage = 'Unknown error cause';
  let errorStatus = 400;

  if(error.cause) {
    const sdkErrorMessage = error.cause[0].description;
    errorMessage = sdkErrorMessage || errorMessage;

    const sdkErrorStatus = error.status;
    errorStatus = sdkErrorStatus || errorStatus;
  }

  return { errorMessage, errorStatus };
}