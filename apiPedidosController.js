const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://bltnpoukibscmpjgvdtc.supabase.co';
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJsdG5wb3VraWJzY21wamd2ZHRjIiwicm9sZSI6ImFub24iLCJpYXQiOjE2ODI5NjU4NDEsImV4cCI6MTk5ODU0MTg0MX0.LjLMP0JW5Cj83eB-1rX2QLcUCkk_9T6y8oVUS1MBNHw";

const supabase = createClient(supabaseUrl, supabaseKey);

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
        .range((page - 1) * perPage, page * perPage - 1);
  
      if (pedidosError) {
        console.error('Error al obtener los pedidos:', pedidosError);
        return res.status(500).json({ message: 'Error en el servidor' });
      }
  
      const { count: totalPedidos } = await supabase
        .from('pedido')
        .select('count(*)')
        .eq('id_cliente', idCliente)
        .single();
  
      const totalPaginas = Math.ceil(totalPedidos / perPage);
  
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