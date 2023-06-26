const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://bltnpoukibscmpjgvdtc.supabase.co';
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJsdG5wb3VraWJzY21wamd2ZHRjIiwicm9sZSI6ImFub24iLCJpYXQiOjE2ODI5NjU4NDEsImV4cCI6MTk5ODU0MTg0MX0.LjLMP0JW5Cj83eB-1rX2QLcUCkk_9T6y8oVUS1MBNHw";

const supabase = createClient(supabaseUrl, supabaseKey);

/**
   * @OA\Get(
   *     path="/productos",
   *     summary="Obtener todos los productos disponibles",
   *     tags={"Productos"},
   *     @OA\Response(
   *         response=200,
   *         description="Lista de productos"
   *     )
   * )
*/
exports.getProductos = async (req, res) => {
    try {
        const { data: productos, error } = await supabase
          .from('producto')
          .select('*')
          .match({ disponible: true }); // Filtra los productos disponibles si la columna "disponible" existe
        
        if (error) {
          // Manejo de error si ocurre algún problema con la consulta a la base de datos
          return res.status(500).json({ message: 'Error al obtener los productos' });
        }
    
        return res.json(productos);
      } catch (error) {
        // Manejo de error si ocurre una excepción en el servidor
        console.error('Error en el servidor:', error);
        return res.status(500).json({ message: 'Error en el servidor' });
      }
  };

/**
   * @OA\Get(
   *     path="/productos/{idCategoria}",
   *     summary="Obtener productos por categoría",
   *     tags={"Productos"},
   *     @OA\Parameter(
   *         name="idCategoria",
   *         in="path",
   *         description="ID de la categoría",
   *         required=true,
   *         @OA\Schema(
   *             type="integer"
   *         )
   *     ),
   *     @OA\Parameter(
   *         name="page",
   *         in="query",
   *         description="Número de página",
   *         required=false,
   *         @OA\Schema(
   *             type="integer",
   *             default=1
   *         )
   *     ),
   *     @OA\Response(
   *         response=200,
   *         description="Lista de productos de la categoría"
   *     )
   * )
*/
exports.getProductosCategoria = async (req, res) => {
  try {
      const { idCategoria } = req.params;
      const page = req.query.page || 1;
      const perPage = 10;
  
      const { data: productos, error } = await supabase
        .from('producto')
        .select('*')
        .match({ id_categoria: idCategoria, disponible: true })
        .range((page - 1) * perPage, page * perPage - 1);
  
      if (error) {
        // Manejo de error si ocurre algún problema con la consulta a la base de datos
        return res.status(500).json({ message: 'Error al obtener los productos por categoría' });
      }
  
      const totalProductos = await supabase
        .from('producto')
        .select('count(*)', { count: 'exact' })
        .match({ id_categoria: idCategoria, disponible: true })
        .single();
  
      const totalPaginas = Math.ceil(totalProductos.count / perPage);
  
      return res.json({
        productosPorCategoria: productos,
        totalPaginas: totalPaginas,
      });
    } catch (error) {
      // Manejo de error si ocurre una excepción en el servidor
      console.error('Error en el servidor:', error);
      return res.status(500).json({ message: 'Error en el servidor' });
    }
}