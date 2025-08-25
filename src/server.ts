import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import { connectDB } from './config/database';

// Importar modelos para garantir que sejam registrados
import './models/Usuario';
import './models/Perfil';
import './models/Permissao';
import './models/Local';
import './models/Curso';
import './models/Evento';

// Importar rotas
import localRoutes from './routes/localRoutes';
import cursoRoutes from './routes/cursoRoutes';
import eventoRoutes from './routes/eventoRoutes';
import usuarioRoutes from './routes/usuarioRoutes';
import authRoutes from './routes/authRoutes';
import permissaoRoutes from './routes/permissaoRoutes';
import perfilRoutes from './routes/perfilRoutes';

// Carregar variáveis de ambiente
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Conectar ao banco de dados
connectDB();

// Middleware de segurança
app.use(helmet());

// CORS configurado para aceitar qualquer origem ou origens específicas
const corsOrigin = process.env.CORS_ORIGIN || '';
const allowedOrigins = corsOrigin.split(',').map(o => o.trim()).filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Se CORS_ORIGIN for '*', permite qualquer origem
    if (corsOrigin === '*') {
      return callback(null, true);
    }
    
    // Permite requests sem origin (ex: curl, mobile apps)
    if (!origin) return callback(null, true);
    
    // Verifica se a origem está na lista de permitidas
    if (allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    
    return callback(new Error(`Not allowed by CORS: ${origin}`));
  },
  credentials: true
}));

// Rate limiting (comentado temporariamente para debug)
/*
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutos
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'), // limite de requests por IP
  message: {
    error: 'Muitas tentativas. Tente novamente em 15 minutos.'
  }
});
app.use('/api/', limiter); 
*/

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Servidor funcionando corretamente',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/locais', localRoutes);
app.use('/api/cursos', cursoRoutes);
app.use('/api/eventos', eventoRoutes);
app.use('/api/usuarios', usuarioRoutes);
app.use('/api/permissoes', permissaoRoutes);
app.use('/api/perfis', perfilRoutes);

// Rota raiz
app.get('/', (req, res) => {
  res.json({
    message: 'API do Seminário UBM',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      auth: '/api/auth',
      locais: '/api/locais',
      cursos: '/api/cursos',
      eventos: '/api/eventos',
      usuarios: '/api/usuarios'
    }
  });
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Erro interno do servidor',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Rota ${req.originalUrl} não encontrada`
  });
});

// Iniciar servidor
const portNumber = parseInt(PORT.toString());
app.listen(portNumber, '0.0.0.0', () => {
  console.log(`
🚀 Servidor iniciado com sucesso!
📍 Ambiente: ${process.env.NODE_ENV || 'development'}
🔗 URL Local: http://localhost:${PORT}
🌐 URL Rede: http://192.168.29.10:${PORT}
💾 Banco: ${process.env.MONGODB_URI}
🕒 ${new Date().toLocaleString('pt-BR')}
  `);
});

export default app;
