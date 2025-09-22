import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { connectDB } from '../config/database';
import Evento from '../models/Evento';

dotenv.config();

async function run() {
  try {
    await connectDB();

    console.log('Iniciando migração de campos curso/cursos em trabalhos...');

    // 1) Preencher campo legado `curso` a partir do primeiro item de `cursos` quando `curso` estiver ausente
    const res1 = await Evento.updateMany(
      {
        $and: [
          { $or: [{ curso: { $exists: false } }, { curso: null }] },
          { cursos: { $exists: true, $type: 'array' } },
          { $expr: { $gt: [{ $size: { $ifNull: ['$cursos', []] } }, 0] } }
        ]
      },
      [
        {
          $set: {
            curso: { $arrayElemAt: ['$cursos', 0] }
          }
        }
      ] as any
    );
  const modified1: number = (res1 as any).modifiedCount ?? 0;
  console.log(`Atualizados (cursos -> curso): ${modified1}`);

    // 2) Preencher `cursos` a partir de `curso` quando `cursos` estiver vazio/ausente e `curso` existir
    const eventosSemCursos = await Evento.find({
      $or: [
        { cursos: { $exists: false } },
        { cursos: { $size: 0 } }
      ],
      curso: { $exists: true, $ne: null }
    }).select('_id curso');

    let count2 = 0;
    for (const ev of eventosSemCursos) {
      await Evento.updateOne({ _id: ev._id }, { $set: { cursos: [ev.get('curso')] } });
      count2++;
    }
    console.log(`Atualizados (curso -> cursos): ${count2}`);

    // 3) Relatório rápido
    const total = await Evento.countDocuments();
    const comCurso = await Evento.countDocuments({ curso: { $exists: true, $ne: null } });
    const comCursos = await Evento.countDocuments({ cursos: { $exists: true, $type: 'array', $ne: [] } });
    console.log(`Total trabalhos: ${total} | com curso: ${comCurso} | com cursos[]: ${comCursos}`);

  } catch (err) {
    console.error('Erro na migração:', err);
  } finally {
    await mongoose.connection.close();
    console.log('Conexão encerrada.');
    process.exit(0);
  }
}

run();
