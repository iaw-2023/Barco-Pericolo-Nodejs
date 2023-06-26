const express = require('express');
const cors = require('cors');
const app = express();

const CryptoJS = require('crypto-js');

app.use(cors());
app.use(express.json());

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://bltnpoukibscmpjgvdtc.supabase.co';
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJsdG5wb3VraWJzY21wamd2ZHRjIiwicm9sZSI6ImFub24iLCJpYXQiOjE2ODI5NjU4NDEsImV4cCI6MTk5ODU0MTg0MX0.LjLMP0JW5Cj83eB-1rX2QLcUCkk_9T6y8oVUS1MBNHw";

const supabase = createClient(supabaseUrl, supabaseKey);

/**
   * @OA\Get(
   *     path="/clientes",
   *     summary="Obtener todos los clientes con paginación",
   *     tags={"Clientes"},
   *     @OA\Parameter(
   *         name="page",
   *         in="query",
   *         description="Página solicitada",
   *         required=false,
   *         @OA\Schema(
   *             type="integer",
   *             default=1
   *         )
   *     ),
   *     @OA\Response(
   *         response=200,
   *         description="Lista de clientes paginada"
   *     )
   * )
*/
exports.obtenerClientes = async (req, res) => {
    try {
      const perPage = 10;
      const page = parseInt(req.query.page) || 1;
  
      const { data: clientes, error } = await supabase
        .from('cliente')
        .select('*')
        .order('id', { ascending: true });
  
      if (error) {
        console.error('Error al obtener los clientes:', error);
        return res.status(500).json({ message: 'Error en el servidor' });
      }
  
      const totalClientes = clientes.length;
      const totalPaginas = Math.ceil(totalClientes / perPage);
  
      const startIndex = (page - 1) * perPage;
      const endIndex = startIndex + perPage;
      const clientesPaginados = clientes.slice(startIndex, endIndex);
  
      res.json({
        data: clientesPaginados,
        totalPaginas: totalPaginas,
      });
    } catch (error) {
      console.error('Error al obtener los clientes:', error);
      res.status(500).json({ message: 'Error en el servidor' });
    }
  };

/**
 * @OA\Get(
 *     path="/clientes/{idCliente}",
 *     summary="Obtener un cliente por ID",
 *     tags={"Clientes"},
 *     @OA\Parameter(
 *         name="idCliente",
 *         in="path",
 *         description="ID del cliente",
 *         required=true,
 *         @OA\Schema(
 *             type="integer"
 *         )
 *     ),
 *     @OA\Response(
 *         response=200,
 *         description="Cliente encontrado"
 *     ),
 *     @OA\Response(
 *         response=404,
 *         description="Cliente no encontrado"
 *     )
 * )
*/
exports.obtenerClientePorId = async (req, res) => {
  try {
    const idCliente = req.params.idCliente;

    const { data: cliente, error } = await supabase
      .from('cliente')
      .select('*')
      .eq('id', idCliente)
      .single();

    if (error) {
      console.error('Error al obtener el cliente:', error);
      return res.status(500).json({ message: 'Error en el servidor' });
    }

    if (!cliente) {
      return res.status(404).json({ message: 'Cliente no encontrado' });
    }

    res.json(cliente);
  } catch (error) {
    console.error('Error al obtener el cliente:', error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
};

/**
   * @OA\Get(
   *     path="/login",
   *     summary="Verifica si el usuario y contraseña son correctos",
   *     tags={"Clientes"},
   *     @OA\Parameter(
   *         name="usuario",
   *         in="query",
   *         description="Usuario del cliente",
   *         required=true,
   *         @OA\Schema(
   *             type="string"
   *         )
   *     ),
   *     @OA\Parameter(
   *         name="password",
   *         in="query",
   *         description="Contraseña del cliente",
   *         required=true,
   *         @OA\Schema(
   *             type="string"
   *         )
   *     ),
   *     @OA\Response(
   *         response=200,
   *         description="Credenciales válidas"
   *     ),
   *     @OA\Response(
   *         response=401,
   *         description="Credenciales inválidas"
   *     )
   * )
*/
exports.loginDeCliente = async (req, res) => {
  try {
    const { usuario, password } = req.query;

    const { data: cliente, error } = await supabase
      .from('cliente')
      .select('*')
      .eq('usuario', usuario)
      .single();

    if (error) {
      console.error('Error al obtener el cliente:', error);
      return res.status(500).json({ message: 'Error en el servidor' });
    }

    if (!cliente || (CryptoJS.MD5(password).toString() !== cliente.password)) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    res.json({ message: 'Credenciales válidas', clienteId: cliente.id });
  } catch (error) {
    console.error('Error al realizar el login:', error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
};

/**
   * @OA\Post(
   *     path="/crearCliente",
   *     tags={"Clientes"},
   *     summary="Crea un nuevo cliente",
   *     operationId="crearCliente",
   *     @OA\RequestBody(
   *         required=true,
   *         description="Cuerpo de la solicitud en formato JSON",
   *         @OA\MediaType(
   *             mediaType="application/json",
   *             @OA\Schema(
   *                 @OA\Property(
   *                     property="usuario",
   *                     description="Nombre de usuario del cliente",
   *                     type="string",
   *                 ),
   *                 @OA\Property(
   *                     property="password",
   *                     description="Contraseña del cliente",
   *                     type="string",
   *                 ),
   *                 @OA\Property(
   *                     property="email",
   *                     description="Email del cliente",
   *                     type="string",
   *                 ),
   *                 @OA\Property(
   *                     property="telefono",
   *                     description="Telefono del cliente",
   *                     type="string",
   *                 ),
   *                 @OA\Property(
   *                     property="direccion",
   *                     description="Direccion del cliente",
   *                     type="string",
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
   *                 description="ID del cliente creado",
   *                 type="integer",
   *             ),
   *         ),
   *     ),
   * )
*/
exports.crearCliente = async (req, res) => {
  try {
    const data = req.body;

    // Crear un nuevo cliente en la tabla "cliente"
    const { data: cliente, error } = await supabase
      .from('cliente')
      .insert([
        {
          usuario: data.usuario,
          password: CryptoJS.MD5(data.password).toString(),
          email: data.email,
          telefono: data.telefono,
          direccion: data.direccion,
        },
      ]);

    if (error) {
      console.error('Error al crear el cliente:', error.message);
      return res.status(500).json({ error: 'Error al crear el cliente' });
    }

    const { data: maxIdResult, error: maxIdError } = await supabase
          .from('cliente')
          .select('id')
          .order('id', { ascending: false })
          .limit(1);

      if (maxIdError) {
          console.error('Error al obtener el último ID:', maxIdError);
          return res.status(500).json({ message: 'Error en el servidor' });
      }

    return res.status(200).json({ id: maxIdResult[0].id });
  } catch (error) {
    console.error('Error al crear el cliente:', error.message);
    return res.status(500).json({ error: 'Error al crear el cliente' });
  }
};

/**
   * @OA\Post(
   *     path="/nuevaContrasenia",
   *     tags={"Clientes"},
   *     summary="Cambia la contraseña de un cliente",
   *     operationId="cambiarContrasenia",
   *     @OA\RequestBody(
   *         required=true,
   *         description="Cuerpo de la solicitud en formato JSON",
   *         @OA\MediaType(
   *             mediaType="application/json",
   *             @OA\Schema(
   *                 @OA\Property(
   *                     property="usuario",
   *                     description="Nombre de usuario del cliente",
   *                     type="string",
   *                 ),
   *                 @OA\Property(
   *                     property="contrasenia_actual",
   *                     description="Contraseña actual del cliente",
   *                     type="string",
   *                 ),
   *                 @OA\Property(
   *                     property="contrasenia_nueva",
   *                     description="Contraseña nueva que tendrá el cliente",
   *                     type="string",
   *                 ),
   *             ),
   *         ),
   *     ),
   *     @OA\Response(
   *         response=200,
   *         description="Contraseña actualizada correctamente"
   *     ),
   *     @OA\Response(
   *         response=401,
   *         description="Credenciales inválidas"
   *     ),
   * )
*/
exports.cambiarContrasenia = async (req, res) => {
  try {
    const { usuario, contrasenia_actual, contrasenia_nueva } = req.body;

    // Obtener el cliente por su nombre de usuario
    const { data: cliente, error } = await supabase
      .from('cliente')
      .select()
      .eq('usuario', usuario)
      .single();

    if (error) {
      console.error('Error al obtener el cliente:', error.message);
      return res.status(500).json({ error: 'Error al obtener el cliente' });
    }

    if (!cliente || CryptoJS.MD5(contrasenia_actual).toString() !== cliente.password) {
      // Cliente no encontrado o contraseña actual incorrecta
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    // Actualizar la contraseña del cliente en la tabla "cliente"
    const { data: updatedCliente, updateError } = await supabase
      .from('cliente')
      .update({ password: CryptoJS.MD5(contrasenia_nueva).toString() })
      .match({ id: cliente.id })
      .single();

    if (updateError) {
      console.error('Error al actualizar la contraseña:', updateError.message);
      return res.status(500).json({ error: 'Error al actualizar la contraseña' });
    }

    return res.status(200).json({ message: 'Contraseña actualizada correctamente' });
  } catch (error) {
    console.error('Error al cambiar la contraseña:', error.message);
    return res.status(500).json({ error: 'Error al cambiar la contraseña' });
  }
};