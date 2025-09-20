import mongoose from 'mongoose';
import Evento from '../models/Evento';

const migrateEventosParaMultiplosCursos = async () => {
  try {
    console.log('🔄 Iniciando migração de eventos para suporte a múltiplos cursos...');

    // Conectar ao banco de dados
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ubm-seminario');
    console.log('✅ Conectado ao MongoDB');

    // Buscar todos os eventos que ainda têm a propriedade 'curso' (formato antigo)
    const eventosAntigos = await Evento.find({ curso: { $exists: true }, cursos: { $exists: false } });
    
    console.log(`📊 Encontrados ${eventosAntigos.length} eventos para migrar`);

    if (eventosAntigos.length === 0) {
      console.log('✅ Não há eventos para migrar. Todos os eventos já estão no formato novo.');
      return;
    }

    let migrados = 0;
    let erros = 0;

    for (const evento of eventosAntigos) {
      try {
        const cursos = evento.get('curso') ? [evento.get('curso')] : [];
        
        // Atualizar o evento para o novo formato
        await Evento.updateOne(
          { _id: evento._id },
          {
            $set: { cursos },
            $unset: { curso: 1 }
          }
        );

        migrados++;
        console.log(`✅ Migrado evento ${evento.cod || evento._id} - Cursos: ${cursos.length}`);
      } catch (error) {
        erros++;
        console.error(`❌ Erro ao migrar evento ${evento.cod || evento._id}:`, error);
      }
    }

    console.log('\n📈 Resumo da migração:');
    console.log(`✅ Eventos migrados com sucesso: ${migrados}`);
    console.log(`❌ Erros durante a migração: ${erros}`);
    console.log(`📊 Total processado: ${eventosAntigos.length}`);

    if (erros === 0) {
      console.log('🎉 Migração concluída com sucesso! Todos os eventos agora suportam múltiplos cursos.');
    } else {
      console.log('⚠️ Migração concluída com alguns erros. Verifique os logs acima.');
    }

  } catch (error) {
    console.error('💥 Erro fatal durante a migração:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Conexão com MongoDB encerrada');
  }
};

// Executar a migração se o script for chamado diretamente
if (require.main === module) {
  migrateEventosParaMultiplosCursos()
    .then(() => {
      console.log('🏁 Script de migração finalizado');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💀 Script de migração falhou:', error);
      process.exit(1);
    });
}

export default migrateEventosParaMultiplosCursos;