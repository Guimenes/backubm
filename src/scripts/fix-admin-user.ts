import mongoose from 'mongoose';
import Usuario from '../models/Usuario';
import Perfil from '../models/Perfil';
import Permissao from '../models/Permissao';
import bcrypt from 'bcryptjs';

const connectToDatabase = async () => {
  try {
    await mongoose.connect('mongodb://admin:seminario123@localhost:27018/seminario_ubm?authSource=admin');
    console.log('Conectado ao MongoDB');
  } catch (error) {
    console.error('Erro ao conectar ao MongoDB:', error);
    process.exit(1);
  }
};

const atualizarUsuarioAdmin = async () => {
  try {
    console.log('Verificando usuário administrador...');
    
    // Buscar o perfil de administrador
    const perfilAdmin = await Perfil.findOne({ nome: 'Administrador' });
    if (!perfilAdmin) {
      console.error('Perfil de Administrador não encontrado');
      return;
    }
    
    // Buscar usuário admin existente
    let usuario = await Usuario.findOne({ email: 'admin@ubm.br' });
    
    if (!usuario) {
      console.log('Usuário admin não encontrado, criando novo...');
      // Criar novo usuário admin
      usuario = new Usuario({
        nome: 'Administrador',
        email: 'admin@ubm.br',
        senha: '123456', // Será hasheada automaticamente pelo pre-save hook
        perfil: perfilAdmin._id,
        ativo: true
      });
      await usuario.save();
      console.log('Usuário administrador criado com sucesso!');
    } else {
      console.log('Usuário admin encontrado, atualizando...');
      
      // Atualizar perfil e senha
      usuario.perfil = perfilAdmin._id;
      usuario.senha = '123456'; // Isso irá triggerar o hash da senha
      usuario.ativo = true;
      
      await usuario.save();
      console.log('Usuário administrador atualizado com sucesso!');
    }
    
    // Verificar o usuário final
    const usuarioFinal = await Usuario.findOne({ email: 'admin@ubm.br' })
      .populate('perfil');
    
    console.log('=== Dados do usuário administrador ===');
    console.log('Nome:', usuarioFinal?.nome);
    console.log('Email:', usuarioFinal?.email);
    console.log('Ativo:', usuarioFinal?.ativo);
    console.log('Perfil:', (usuarioFinal?.perfil as any)?.nome);
    console.log('Senha pode ser testada com: 123456');
    
  } catch (error) {
    console.error('Erro ao atualizar usuário administrador:', error);
  }
};

const main = async () => {
  try {
    await connectToDatabase();
    await atualizarUsuarioAdmin();
    console.log('Atualização concluída!');
    process.exit(0);
  } catch (error) {
    console.error('Erro durante a execução:', error);
    process.exit(1);
  }
};

main();
