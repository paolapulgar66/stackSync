const crypto = require('crypto');
const { ApolloServer, gql } = require('apollo-server');
const mongoose = require('mongoose');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/stacksyncdb';

// DECISI�N DE DISE�O: Conexi�n as�ncrona a la base de datos no relacional MongoDB
mongoose.connect(MONGO_URI)
  .then(() => console.log('? Conectado exitosamente a MongoDB (StackSync Real)'))
  .catch(err => console.error('? Error de conexi�n en MongoDB:', err));

// CONFIGURACI�N DE MONGOOSE: Definici�n del Schema real en la base de datos
const ElementoSchema = new mongoose.Schema({
  nombre: String,
  descripcion: String,
  estado: String
});
const ElementoModel = mongoose.model('Elemento', ElementoSchema);

// SCHEMA GRAPHQL: Definici�n de tipos, queries y mutations para la API externa
const typeDefs = gql`
  type Elemento {
    id: ID!
    nombre: String!
    descripcion: String!
    estado: String!
  }

  type Query {
    obtenerElementos: [Elemento]
  }

  type Mutation {
    crearElemento(nombre: String!, descripcion: String!, estado: String!): Elemento
  }
`;

// RESOLVERS: L�gica de negocio interactuando directamente con los m�todos de Mongoose
const resolvers = {
  Query: {
    obtenerElementos: async () => {
      // DECISI�N DE DISE�O: Buscamos todos los documentos almacenados de forma as�ncrona
      return await ElementoModel.find();
    },
  },
  Mutation: {
    crearElemento: async (_, { nombre, descripcion, estado }) => {
      // DECISI�N DE DISE�O: Instanciamos y guardamos un nuevo registro persistente
      const nuevoElemento = new ElementoModel({ nombre, descripcion, estado });
      return await nuevoElemento.save();
    }
  }
};

const server = new ApolloServer({ 
  typeDefs, 
  resolvers, 
  introspection: true 
});

// Escuchamos en el puerto 5000 y añadimos host 0.0.0.0 para entornos Docker
server.listen({ port: 5000, host: '0.0.0.0' }).then(({ url }) => {
  console.log(`🚀 Servidor StackSync corriendo en ${url}`);
}).catch((err) => {
  console.error("❌ Error al iniciar el servidor:", err);
});