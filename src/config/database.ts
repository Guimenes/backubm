import mongoose from "mongoose";

export const connectDB = async (): Promise<void> => {
  try {
    const mongoURI =
      process.env.MONGODB_URI ||
      "mongodb://admin:seminario123@localhost:27018/seminario_ubm?authSource=admin";

    console.log("🔗 Tentando conectar no MongoDB:", mongoURI);
    const conn = await mongoose.connect(mongoURI);

    console.log(`📦 MongoDB conectado: ${conn.connection.host}`);

    // Event listeners para conexão
    mongoose.connection.on("error", (err) => {
      console.error("❌ Erro na conexão MongoDB:", err);
    });

    mongoose.connection.on("disconnected", () => {
      console.warn("⚠️ MongoDB desconectado");
    });

    // Fechar conexão quando o processo terminar
    process.on("SIGINT", async () => {
      await mongoose.connection.close();
      console.log("🔌 Conexão MongoDB fechada devido ao término da aplicação");
      process.exit(0);
    });
  } catch (error) {
    console.error("❌ Erro ao conectar MongoDB:", error);
    process.exit(1);
  }
};
