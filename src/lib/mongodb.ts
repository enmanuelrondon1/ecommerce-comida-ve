// src/lib/mongodb.ts
import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI as string;

if (!MONGODB_URI) {
  throw new Error(
    "Falta la variable de entorno MONGODB_URI en tu archivo .env.local"
  );
}

/**
 * En desarrollo, Next.js hace hot-reload de módulos, lo que puede crear
 * múltiples conexiones a MongoDB si no cacheamos la conexión globalmente.
 * Este patrón evita ese problema guardando la promesa de conexión en
 * el objeto global de Node.
 */
interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  // eslint-disable-next-line no-var
  var mongooseCache: MongooseCache | undefined;
}

let cached = global.mongooseCache;

if (!cached) {
  cached = global.mongooseCache = { conn: null, promise: null };
}

async function connectDB(): Promise<typeof mongoose> {
  // Si ya existe una conexión activa, la reutilizamos
  if (cached!.conn) {
    return cached!.conn;
  }

  // Si no hay una promesa de conexión en curso, creamos una
  if (!cached!.promise) {
    const opts = {
      bufferCommands: false, // no encolar comandos si no hay conexión
    };

    cached!.promise = mongoose
      .connect(MONGODB_URI, opts)
      .then((mongooseInstance) => {
        console.log("✅ MongoDB conectado correctamente");
        return mongooseInstance;
      })
      .catch((error) => {
        console.error("❌ Error al conectar a MongoDB:", error.message);
        cached!.promise = null; // reseteamos para poder reintentar
        throw error;
      });
  }

  try {
    cached!.conn = await cached!.promise;
  } catch (error) {
    cached!.promise = null;
    throw error;
  }

  return cached!.conn;
}

export default connectDB;