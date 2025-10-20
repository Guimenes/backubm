import dotenv from "dotenv";

// Carregar .env
dotenv.config();

console.log("🔍 DEBUG - Variáveis de Ambiente");
console.log("=================================");
console.log("NODE_ENV:", process.env.NODE_ENV);
console.log("PORT:", process.env.PORT);
console.log("MONGODB_URI:", process.env.MONGODB_URI);
console.log("");

// Testar conexão
import mongoose from "mongoose";

const testConnection = async () => {
  try {
    const mongoURI =
      process.env.MONGODB_URI ||
      "mongodb://admin:seminario123@localhost:27018/seminario_ubm?authSource=admin";
    console.log("🔗 Tentando conectar em:", mongoURI);

    const conn = await mongoose.connect(mongoURI);
    console.log("✅ Conexão bem-sucedida!");
    console.log("Host conectado:", conn.connection.host);
    console.log("Porta conectada:", conn.connection.port);
    console.log("Nome do banco:", conn.connection.name);

    await mongoose.connection.close();
    console.log("🔌 Conexão fechada");
    process.exit(0);
  } catch (error) {
    console.error("❌ Erro na conexão:", error);
    process.exit(1);
  }
};

testConnection();
