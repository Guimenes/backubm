import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { connectDB } from '../config/database';
import Evento from '../models/Evento';

dotenv.config();

async function main() {
  try {
    await connectDB();
    console.log('📦 MongoDB conectado');

    const { deletedCount } = await Evento.deleteMany({});
    console.log(`🧹 Eventos removidos: ${deletedCount}`);
  } catch (err) {
    console.error('Erro ao limpar eventos:', err);
    process.exitCode = 1;
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Conexão MongoDB fechada.');
  }
}

main();
