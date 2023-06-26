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
   *     path="/categorias/{idCategoria}",
   *     summary="Obtener detalles de una categoría",
   *     tags={"Categorias"},
   *     @OA\Parameter(
   *         name="idCategoria",
   *         in="path",
   *         description="ID de la categoría",
   *         required=true,
   *         @OA\Schema(
   *             type="integer"
   *         )
   *     ),
   *     @OA\Response(
   *         response=200,
   *         description="Detalles de la categoría"
   *     )
   * )
*/
exports.show = async (req, res) => {
    try {
      const { idCategoria } = req.params;
  
      const { data, error } = await supabase
        .from('categoria')
        .select('*')
        .eq('id', idCategoria)
        .single();
  
      if (error) {
        console.error('Error al obtener los detalles de la categoría:', error);
        return res.status(500).json({ message: 'Categoría no encontrada' });
      }
  
      if (!data) {
        return res.status(404).json({ message: 'Categoría no encontrada' });
      }
  
      return res.json(data);
    } catch (error) {
      console.error('Error al obtener los detalles de la categoría:', error);
      return res.status(500).json({ message: 'Categoría no encontrada' });
    }
  };

/**
   * @OA\Get(
   *     path="/categorias",
   *     summary="Obtener todas las categorías",
   *     tags={"Categorias"},
   *     @OA\Response(
   *         response=200,
   *         description="Lista de categorías"
   *     )
   * )
*/
exports.getCategorias = async ( req, res) => {
  try {
    const categorias = await supabase.from('categoria').select('*');
    return res.json(categorias.data);
  } catch (error) {
    console.error('Error al obtener las categorías:', error);
    return res.status(500).json({ message: 'Error en el servidor' });
  }
};