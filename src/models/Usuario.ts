import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUsuario extends Document {
  nome: string;
  email: string;
  senha: string;
  perfil: mongoose.Types.ObjectId;
  curso?: string;
  ativo: boolean;
  ultimoLogin?: Date;
  tokenExpiracao?: Date;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(password: string): Promise<boolean>;
  isTokenValid(): boolean;
}

const UsuarioSchema: Schema = new Schema({
  nome: {
    type: String,
    required: [true, 'Nome é obrigatório'],
    trim: true,
    minlength: [2, 'Nome deve ter pelo menos 2 caracteres'],
    maxlength: [100, 'Nome não pode exceder 100 caracteres']
  },
  email: {
    type: String,
    required: [true, 'Email é obrigatório'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      'Por favor, forneça um email válido'
    ]
  },
  senha: {
    type: String,
    required: [true, 'Senha é obrigatória'],
    minlength: [6, 'Senha deve ter pelo menos 6 caracteres'],
    select: false // Por padrão, não retorna a senha nas consultas
  },
  perfil: {
    type: Schema.Types.ObjectId,
    ref: 'Perfil',
    required: [true, 'Perfil é obrigatório']
  },
  curso: {
    type: String,
    trim: true
  },
  ativo: {
    type: Boolean,
    default: true
  },
  ultimoLogin: {
    type: Date
  },
  tokenExpiracao: {
    type: Date
  }
}, {
  timestamps: true,
  collection: 'usuarios'
});

// Índices
UsuarioSchema.index({ email: 1 });
UsuarioSchema.index({ perfil: 1 });
UsuarioSchema.index({ ativo: 1 });
UsuarioSchema.index({ tokenExpiracao: 1 });

// Hash da senha antes de salvar
UsuarioSchema.pre('save', async function(next) {
  // Se a senha não foi modificada, continue
  if (!this.isModified('senha')) return next();
  
  try {
    // Hash da senha
    const salt = await bcrypt.genSalt(12);
    this.senha = await bcrypt.hash(this.senha, salt);
    next();
  } catch (error: any) {
    next(error);
  }
});

// Método para comparar senhas
UsuarioSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  return await bcrypt.compare(candidatePassword, this.senha);
};

// Método para verificar se o token ainda é válido
UsuarioSchema.methods.isTokenValid = function(): boolean {
  if (!this.tokenExpiracao) return false;
  return new Date() < this.tokenExpiracao;
};

export default mongoose.model<IUsuario>('Usuario', UsuarioSchema);
