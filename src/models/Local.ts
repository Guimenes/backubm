import mongoose, { Document, Schema } from 'mongoose';

export interface ILocal extends Document {
  cod: string;
  nome: string;
  capacidade: number;
  tipoLocal: 'Sala de Aula' | 'Biblioteca' | 'Laboratório' | 'Auditório' | 'Anfiteatro' | 'Pátio' | 'Quadra' | 'Espaço';
  descricao?: string;
  createdAt: Date;
  updatedAt: Date;
}

const LocalSchema: Schema = new Schema({
  cod: {
    type: String,
    required: [true, 'Código do local é obrigatório'],
    unique: true,
    trim: true,
    uppercase: true
  },
  nome: {
    type: String,
    required: [true, 'Nome do local é obrigatório'],
    trim: true
  },
  capacidade: {
    type: Number,
    required: function(this: ILocal) {
      // Capacidade não é obrigatória para tipo "Espaço"
      return this.tipoLocal !== 'Espaço';
    },
    min: [1, 'Capacidade deve ser maior que 0'],
    validate: {
      validator: function(this: ILocal, value: number) {
        // Se for espaço e não tiver capacidade definida, é válido
        if (this.tipoLocal === 'Espaço' && (value === null || value === undefined)) {
          return true;
        }
        // Caso contrário, deve ser um número válido
        return value && value > 0;
      },
      message: 'Capacidade deve ser um número maior que 0'
    }
  },
  tipoLocal: {
    type: String,
    required: [true, 'Tipo do local é obrigatório'],
    enum: {
      values: ['Sala de Aula', 'Biblioteca', 'Laboratório', 'Auditório', 'Anfiteatro', 'Pátio', 'Quadra', 'Espaço'],
      message: 'Tipo de local deve ser: Sala de Aula, Biblioteca, Laboratório, Auditório, Anfiteatro, Pátio, Quadra ou Espaço'
    }
  },
  descricao: {
    type: String,
    trim: true,
    maxlength: [500, 'Descrição não pode ter mais de 500 caracteres']
  }
}, {
  timestamps: true,
  collection: 'locais'
});

// Índices
LocalSchema.index({ cod: 1 });
LocalSchema.index({ tipoLocal: 1 });
LocalSchema.index({ capacidade: 1 });

export default mongoose.model<ILocal>('Local', LocalSchema);
