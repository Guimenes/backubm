import mongoose, { Document, Schema } from 'mongoose';

export interface IPerfil extends Document {
  nome: string;
  descricao?: string;
  permissoes: mongoose.Types.ObjectId[];
  ativo: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const PerfilSchema: Schema = new Schema({
  nome: {
    type: String,
    required: [true, 'Nome do perfil é obrigatório'],
    trim: true,
    maxlength: [100, 'Nome não pode exceder 100 caracteres'],
    unique: true
  },
  descricao: {
    type: String,
    trim: true,
    maxlength: [255, 'Descrição não pode exceder 255 caracteres']
  },
  permissoes: [{
    type: Schema.Types.ObjectId,
    ref: 'Permissao'
  }],
  ativo: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  collection: 'perfis'
});

// Índices
PerfilSchema.index({ nome: 1 });
PerfilSchema.index({ ativo: 1 });

export default mongoose.model<IPerfil>('Perfil', PerfilSchema);
