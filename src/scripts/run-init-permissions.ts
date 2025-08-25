import mongoose from 'mongoose';
import { inicializarSistemaPermissoes } from './init-permissions';

const connectToDatabase = async () => {
  try {
    await mongoose.connect('mongodb://admin:seminario123@localhost:27017/seminario_ubm?authSource=admin');
    console.log('Conectado ao MongoDB');
  } catch (error) {
    console.error('Erro ao conectar ao MongoDB:', error);
    process.exit(1);
  }
};

const main = async () => {
  try {
    await connectToDatabase();
    await inicializarSistemaPermissoes();
    console.log('Inicialização concluída com sucesso!');
    process.exit(0);
  } catch (error) {
    console.error('Erro durante a inicialização:', error);
    process.exit(1);
  }
};

main();
