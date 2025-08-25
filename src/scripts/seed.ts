import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { connectDB } from '../config/database';
import Curso from '../models/Curso';
import Local from '../models/Local';
import Evento from '../models/Evento';

// Carrega .env
dotenv.config();

const randomItem = <T,>(arr: T[]): T => {
  if (!arr || arr.length === 0) {
    throw new Error('randomItem: array vazio');
  }
  const idx = Math.floor(Math.random() * arr.length);
  return arr[idx] as T;
};
const randomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
const pad = (n: number, size = 3) => String(n).padStart(size, '0');

async function clearCollections() {
  await Promise.all([
    Evento.deleteMany({}),
    Curso.deleteMany({}),
    Local.deleteMany({})
  ]);
}

async function seedCursos(qtd = 20) {
  const nomes = [
    'Engenharia Civil', 'Administração', 'Direito', 'Psicologia', 'Ciência da Computação', 'Sistemas de Informação',
    'Enfermagem', 'Medicina', 'Odontologia', 'Arquitetura e Urbanismo', 'Educação Física', 'Biomedicina',
    'Engenharia de Produção', 'Engenharia Elétrica', 'Farmácia', 'Fisioterapia', 'Nutrição', 'Pedagogia',
    'Publicidade e Propaganda', 'Contabilidade', 'Letras', 'Química', 'História', 'Geografia'
  ];

  const cursos = Array.from({ length: qtd }).map((_, i) => ({
    cod: `CUR${pad(i + 1, 3)}`,
    nome: nomes[i % nomes.length]
  }));

  const res = await Curso.insertMany(cursos, { ordered: false });
  return res;
}

async function seedLocais(qtd = 100) {
  const tipoLocalValues = ['Sala de Aula', 'Biblioteca', 'Laboratório', 'Auditório', 'Anfiteatro', 'Pátio', 'Quadra'] as const;

  const locais = Array.from({ length: qtd }).map((_, i) => {
    const tipo = randomItem([...tipoLocalValues]);
    const baseNome = {
      'Sala de Aula': `Sala de Aula ${100 + i}`,
      'Biblioteca': `Biblioteca Setor ${1 + (i % 3)}`,
      'Laboratório': `Laboratório ${1 + (i % 20)}`,
      'Auditório': `Auditório ${1 + (i % 5)}`,
      'Anfiteatro': `Anfiteatro ${1 + (i % 3)}`,
      'Pátio': `Pátio ${1 + (i % 2)}`,
      'Quadra': `Quadra ${1 + (i % 4)}`
    }[tipo];

    return {
      cod: `LOC${pad(i + 1, 4)}`,
      nome: baseNome,
      capacidade: randomInt(20, 300),
      tipoLocal: tipo,
      descricao: `Espaço ${tipo.toLowerCase()} para atividades do seminário.`
    };
  });

  const res = await Local.insertMany(locais, { ordered: false });
  return res;
}

function randomDateWithinDays(start: Date, daysRange: number) {
  const date = new Date(start);
  date.setDate(start.getDate() + randomInt(0, daysRange));
  return date;
}

function setTime(date: Date, hour: number, minute: number) {
  const d = new Date(date);
  d.setHours(hour, minute, 0, 0);
  return d;
}

async function seedEventos(qtd = 100) {
  const cursos = await Curso.find({});
  const locais = await Local.find({});

  if (locais.length === 0) throw new Error('Nenhum local disponível para eventos');

  const tipos = ['Palestra Principal', 'Apresentação de Trabalhos', 'Oficina'] as const;
  const temas = [
    'Inovação no Ensino', 'Tecnologias Educacionais', 'Metodologias Ativas', 'Pesquisa Aplicada',
    'Gestão Acadêmica', 'Integração Universidade-Sociedade', 'Sustentabilidade', 'Saúde e Bem-estar',
    'Direitos Humanos', 'Engenharia e Sociedade', 'Ciências da Vida', 'Educação Inclusiva',
    'Ciência de Dados', 'Inteligência Artificial', 'Robótica Educacional', 'Empreendedorismo'
  ];

  const autoresBase = ['Ana', 'Bruno', 'Carla', 'Daniel', 'Eduarda', 'Felipe', 'Gabriela', 'Henrique', 'Isabela', 'João', 'Karen', 'Lucas', 'Marina', 'Nicolas', 'Otávio', 'Paula', 'Rafaela', 'Sérgio', 'Thiago', 'Vitória'];
  const sobrenomes = ['Silva', 'Santos', 'Oliveira', 'Souza', 'Rodrigues', 'Ferreira', 'Almeida', 'Gomes', 'Lima', 'Carvalho'];

  // Definir as datas do seminário: 22, 23 e 24 de outubro de 2024
  const diasSeminario = [
    new Date(2024, 9, 22), // 22 de outubro (mês 9 = outubro, pois é base 0)
    new Date(2024, 9, 23), // 23 de outubro
    new Date(2024, 9, 24)  // 24 de outubro
  ];

  // Horários padrão do seminário noturno (19:00 às 22:00)
  const horariosDisponiveis = [
    { hora: 19, minuto: 0 },  // 19:00
    { hora: 19, minuto: 20 }, // 19:20
    { hora: 19, minuto: 40 }, // 19:40
    { hora: 20, minuto: 0 },  // 20:00
    { hora: 20, minuto: 20 }, // 20:20
    { hora: 20, minuto: 40 }, // 20:40
    { hora: 21, minuto: 0 },  // 21:00
    { hora: 21, minuto: 20 }, // 21:20
    { hora: 21, minuto: 40 }, // 21:40
    { hora: 22, minuto: 0 }   // 22:00
  ];

  const eventos = Array.from({ length: qtd }).map((_, i) => {
    const tipo = randomItem([...tipos]);
    const tema = `${randomItem(temas)} ${i + 1}`;
    const qtAutores = randomInt(1, 4);
    const autores = Array.from({ length: qtAutores }).map(() => `${randomItem(autoresBase)} ${randomItem(sobrenomes)}`);
    const local = randomItem(locais);

    // Distribuir eventos entre os 3 dias do seminário
    const diaEscolhido = diasSeminario[i % 3] as Date; // Força o tipo Date pois sabemos que existe
    const horarioEscolhido = randomItem(horariosDisponiveis);

    const hasCurso = Math.random() > 0.3; // 70% associados a curso
    const curso = hasCurso ? randomItem(cursos)._id : undefined;

    const evento = {
      cod: `EVT${pad(i + 1, 5)}`,
      data: setTime(diaEscolhido, 0, 0),
      hora: setTime(diaEscolhido, horarioEscolhido.hora, horarioEscolhido.minuto),
      tema,
      autores,
      palestrante: tipo === 'Palestra Principal' ? `${randomItem(autoresBase)} ${randomItem(sobrenomes)}` : undefined,
      orientador: tipo !== 'Palestra Principal' ? `${randomItem(autoresBase)} ${randomItem(sobrenomes)}` : undefined,
      sala: local.nome,
      tipoEvento: tipo,
      curso,
      resumo: `Resumo do evento sobre ${tema.toLowerCase()}.`
    };

    return evento;
  });

  const res = await Evento.insertMany(eventos, { ordered: false });
  return res;
}

async function main() {
  try {
    await connectDB();
    console.log('Limpando coleções...');
    await clearCollections();

    console.log('Inserindo cursos...');
    const cursos = await seedCursos(20);
    console.log(`Cursos inseridos: ${cursos.length}`);

    console.log('Inserindo locais...');
    const locais = await seedLocais(100);
    console.log(`Locais inseridos: ${locais.length}`);

    console.log('Inserindo eventos...');
    const eventos = await seedEventos(100);
    console.log(`Eventos inseridos: ${eventos.length}`);
  } catch (err) {
    console.error('Erro durante o seed:', err);
    process.exitCode = 1;
  } finally {
    await mongoose.connection.close();
    console.log('Conexão MongoDB fechada.');
  }
}

main();
