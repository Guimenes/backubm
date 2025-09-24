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

// Importar middleware de segurança da Cloudflare
import { CloudflareSecurityMiddleware } from './middleware/cloudflareAuth';

// Carregar variáveis de ambiente
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Conectar ao banco de dados
connectDB();

// Middleware de segurança
app.use(helmet());

// Configuração segura de CORS
const corsOrigin = process.env.CORS_ORIGIN || '';
const allowedOrigins = corsOrigin.split(',').map(o => o.trim()).filter(Boolean);
const isDevelopment = process.env.NODE_ENV === 'development';

app.use(cors({
  origin: (origin, callback) => {
    // Log da origem para auditoria (apenas em desenvolvimento)
    if (isDevelopment && origin) {
      console.log(`CORS request from origin: ${origin}`);
    }
    
    // Em produção, bloqueia se não houver origem definida nas variáveis de ambiente
    if (!isDevelopment && allowedOrigins.length === 0) {
      return callback(new Error('CORS não configurado adequadamente'));
    }
    
    // Permite qualquer origem apenas em desenvolvimento se configurado com '*'
    if (isDevelopment && corsOrigin === '*') {
      return callback(null, true);
    }
    
    // Permite requests sem origin apenas em desenvolvimento (ex: curl, postman)
    if (!origin) {
      return callback(null, isDevelopment);
    }
    
    // Verifica se a origem está na lista de permitidas
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    
    // Se chegou até aqui, bloqueia a requisição
    if (isDevelopment) {
      console.warn(`CORS bloqueado para origem: ${origin}`);
    }
    return callback(new Error(`Origem não autorizada pelo CORS: ${origin}`));
  },
  credentials: true,
  optionsSuccessStatus: 200 // Para suporte a browsers legados
}));

// Rate limiting - Configuração segura para produção
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutos
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'), // limite de requests por IP
  message: {
    success: false,
    message: 'Muitas tentativas. Tente novamente em 15 minutos.'
  },
  standardHeaders: true, // Retorna rate limit info nos headers `RateLimit-*`
  legacyHeaders: false, // Desabilita headers `X-RateLimit-*`
  skip: (req) => {
    // Pula rate limiting para health checks
    return req.path === '/health';
  }
});
app.use('/api/', limiter);

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check - sem restrições de origem
app.get('/health', CloudflareSecurityMiddleware.allowHealthChecks, (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Servidor funcionando corretamente',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API Routes com validação de origem da Cloudflare
app.use('/api/auth', CloudflareSecurityMiddleware.validateCloudflareOrigin, authRoutes);
app.use('/api/locais', CloudflareSecurityMiddleware.validatePublicAccess, localRoutes);
app.use('/api/cursos', CloudflareSecurityMiddleware.validatePublicAccess, cursoRoutes);
app.use('/api/eventos', CloudflareSecurityMiddleware.validatePublicAccess, eventoRoutes);
app.use('/api/usuarios', CloudflareSecurityMiddleware.validateCloudflareOrigin, usuarioRoutes);
app.use('/api/permissoes', CloudflareSecurityMiddleware.validateCloudflareOrigin, permissaoRoutes);
app.use('/api/perfis', CloudflareSecurityMiddleware.validateCloudflareOrigin, perfilRoutes);

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
  // Log seguro apenas em desenvolvimento
  if (process.env.NODE_ENV === 'development') {
    console.error('Error details:', err);
  } else {
    // Em produção, log apenas informações essenciais
    console.error('Error occurred:', {
      timestamp: new Date().toISOString(),
      method: req.method,
      url: req.url,
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });
  }
  
  // Resposta segura
  const statusCode = err.status || 500;
  const message = statusCode < 500 ? (err.message || 'Erro na requisição') : 'Erro interno do servidor';
  
  res.status(statusCode).json({
    success: false,
    message: message,
    ...(process.env.NODE_ENV === 'development' && statusCode >= 500 && { 
      error: err.message,
      stack: err.stack 
    })
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
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  if (isDevelopment) {
    console.log(`
🚀 Servidor iniciado com sucesso!
📍 Ambiente: ${process.env.NODE_ENV || 'development'}
🔗 URL Local: http://localhost:${PORT}
🕒 ${new Date().toLocaleString('pt-BR')}
    `);
  } else {
    console.log(`Servidor iniciado na porta ${PORT} em ambiente de produção - ${new Date().toISOString()}`);
  }
});

export default app;
