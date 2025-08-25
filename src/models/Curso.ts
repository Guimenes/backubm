import mongoose, { Document, Schema } from 'mongoose';

export interface ICurso extends Document {
  cod: string;
  nome: string;
  createdAt: Date;
  updatedAt: Date;
}

const CursoSchema: Schema = new Schema({
  cod: {
    type: String,
    required: [true, 'Código do curso é obrigatório'],
    unique: true,
    trim: true,
    uppercase: true
  },
  nome: {
    type: String,
    required: [true, 'Nome do curso é obrigatório'],
    trim: true,
    minlength: [2, 'Nome deve ter pelo menos 2 caracteres'],
    maxlength: [100, 'Nome não pode exceder 100 caracteres']
  }
}, {
  timestamps: true,
  collection: 'cursos'
});

// Índices
CursoSchema.index({ cod: 1 });
CursoSchema.index({ nome: 1 });

export default mongoose.model<ICurso>('Curso', CursoSchema);
