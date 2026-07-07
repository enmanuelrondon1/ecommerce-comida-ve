// scripts/test-connection.mjs
import mongoose from "mongoose";
import { config } from "dotenv";

// Carga las variables desde .env.local
config({ path: ".env.local" });

const MONGODB_URI = process.env.MONGODB_URI;

async function testConnection() {
  if (!MONGODB_URI) {
    console.error("❌ No se encontró MONGODB_URI en .env.local");
    process.exit(1);
  }

  console.log("🔄 Intentando conectar a MongoDB...");

  try {
    await mongoose.connect(MONGODB_URI);
    console.log("✅ ¡Conexión exitosa!");
    console.log(`📦 Base de datos: ${mongoose.connection.db.databaseName}`);
    console.log(`🌐 Host: ${mongoose.connection.host}`);

    await mongoose.disconnect();
    console.log("👋 Desconectado correctamente");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error al conectar:", error.message);
    process.exit(1);
  }
}

testConnection();