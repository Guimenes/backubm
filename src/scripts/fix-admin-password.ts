import mongoose from 'mongoose';
import Usuario from '../models/Usuario';

const atualizarSenhaAdmin = async () => {
  try {
    // Conectar ao banco
    await mongoose.connect('mongodb://seminario_user:seminario_pass@localhost:27018/seminario_ubm?authSource=seminario_ubm');
    
    console.log('📦 Conectado ao MongoDB');
    
    // Buscar o usuário admin
    const admin = await Usuario.findOne({ email: 'admin@ubm.br' });
    
    if (!admin) {
      console.log('❌ Usuário admin não encontrado');
      return;
    }
    
    console.log('👤 Usuário encontrado:', admin.email);
    
    // Atualizar a senha (será hasheada automaticamente pelo pre-save hook)
    admin.senha = '123456';
    await admin.save();
    
    console.log('✅ Senha do administrador atualizada com sucesso!');
    console.log('📧 Email: admin@ubm.br');
    console.log('🔒 Senha: 123456');
    
  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Desconectado do MongoDB');
  }
};

atualizarSenhaAdmin();
