import mongoose, { Document, Schema } from 'mongoose';

export interface IPermissao extends Document {
  nome: string;
  codigo: string;
  modulo: string;
  descricao?: string;
  ativo: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const PermissaoSchema: Schema = new Schema({
  nome: {
    type: String,
    required: [true, 'Nome da permissão é obrigatório'],
    trim: true,
    maxlength: [100, 'Nome não pode exceder 100 caracteres']
  },
  codigo: {
    type: String,
    required: [true, 'Código da permissão é obrigatório'],
    unique: true,
    trim: true,
    uppercase: true,
    maxlength: [50, 'Código não pode exceder 50 caracteres']
  },
  modulo: {
    type: String,
    required: [true, 'Módulo é obrigatório'],
    trim: true,
    enum: {
      values: ['locais', 'eventos', 'cursos', 'usuarios', 'permissoes', 'relatorios'],
      message: 'Módulo deve ser: locais, eventos, cursos, usuarios, permissoes ou relatorios'
    }
  },
  descricao: {
    type: String,
    trim: true,
    maxlength: [255, 'Descrição não pode exceder 255 caracteres']
  },
  ativo: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  collection: 'permissoes'
});

// Índices
PermissaoSchema.index({ codigo: 1 });
PermissaoSchema.index({ modulo: 1 });
PermissaoSchema.index({ ativo: 1 });

export default mongoose.model<IPermissao>('Permissao', PermissaoSchema);
