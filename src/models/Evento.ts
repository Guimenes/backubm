import mongoose, { Document, Schema } from 'mongoose';

export interface IEvento extends Document {
  cod?: string; // Código será gerado automaticamente
  data: Date;
  hora: Date;
  duracao?: number; // Duração em minutos
  tema: string;
  autores: string[]; // Array de autores
  palestrante?: string; // Apenas para Palestra Principal
  orientador?: string; // Para outros tipos de evento
  sala: string;
  tipoEvento: 'Palestra Principal' | 'Apresentação de Trabalhos' | 'Oficina' | 'Banner';
  curso?: mongoose.Types.ObjectId; // ID do curso associado (opcional - se não informado, evento é "geral")
  resumo?: string;
  createdAt: Date;
  updatedAt: Date;
}

const EventoSchema: Schema = new Schema({
  cod: {
    type: String,
    unique: true,
    trim: true,
    uppercase: true
    // Removido required: true para permitir geração automática
  },
  data: {
    type: Date,
    required: [true, 'Data do evento é obrigatória']
  },
  hora: {
    type: Date,
    required: [true, 'Hora do evento é obrigatória']
  },
  duracao: {
    type: Number,
    default: 60,
    min: [15, 'Duração mínima é de 15 minutos'],
    max: [480, 'Duração máxima é de 8 horas (480 minutos)']
  },
  tema: {
    type: String,
    required: [true, 'Tema do evento é obrigatório'],
    trim: true,
    minlength: [5, 'Tema deve ter pelo menos 5 caracteres'],
    maxlength: [200, 'Tema não pode exceder 200 caracteres']
  },
  autores: [{
    type: String,
    required: [true, 'Pelo menos um autor é obrigatório'],
    trim: true
  }],
  palestrante: {
    type: String,
    trim: true
    // Obrigatório apenas para Palestra Principal
  },
  orientador: {
    type: String,
    trim: true
    // Obrigatório para outros tipos de evento
  },
  sala: {
    type: String,
    required: [true, 'Sala é obrigatória'],
    trim: true
  },
  tipoEvento: {
    type: String,
    required: [true, 'Tipo de evento é obrigatório'],
    enum: {
      values: ['Palestra Principal', 'Apresentação de Trabalhos', 'Oficina', 'Banner'],
      message: 'Tipo de evento deve ser: Palestra Principal, Apresentação de Trabalhos, Oficina ou Banner'
    }
  },
  curso: {
    type: Schema.Types.ObjectId,
    ref: 'Curso',
    required: false
    // Se não informado, evento é considerado "geral"
  },
  resumo: {
    type: String,
    trim: true,
    maxlength: [1000, 'Resumo não pode exceder 1000 caracteres']
  }
}, {
  timestamps: true,
  collection: 'trabalhos'
});

// Índices
EventoSchema.index({ cod: 1 });
EventoSchema.index({ data: 1 });
EventoSchema.index({ tipoEvento: 1 });
EventoSchema.index({ curso: 1 });
EventoSchema.index({ tema: 'text', autores: 'text', palestrante: 'text', orientador: 'text' });

export default mongoose.model<IEvento>('Evento', EventoSchema);
