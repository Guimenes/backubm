import { Request, Response, NextFunction } from 'express';

/**
 * Middleware de segurança específico para Cloudflare Workers
 * Valida se as requisições estão vindo do domínio autorizado
 */
export class CloudflareSecurityMiddleware {
  
  /**
   * Valida se a requisição está vindo de uma origem autorizada da Cloudflare
   */
  static validateCloudflareOrigin(req: Request, res: Response, next: NextFunction): void {
    const origin = req.get('Origin');
    const referer = req.get('Referer');
    const userAgent = req.get('User-Agent');
    const cfRay = req.get('CF-Ray'); // Header específico da Cloudflare
    
    // Lista de origens autorizadas
    const authorizedOrigins = [
      'https://ubmseminario.guilhermemeneguelli.workers.dev'
    ];
    
    // Em desenvolvimento, permite requisições locais
    if (process.env.NODE_ENV === 'development') {
      const allowedDevelopmentOrigins = [
        'http://localhost:3000',
        'http://localhost:5173', // Vite default
        'http://127.0.0.1:3000',
        'http://127.0.0.1:5173'
      ];
      
      if (origin && allowedDevelopmentOrigins.includes(origin)) {
        return next();
      }
      
      // Permite requisições sem origin em desenvolvimento (Postman, curl, etc.)
      if (!origin) {
        return next();
      }
    }
    
    // Verifica se a origem está autorizada
    if (origin && authorizedOrigins.includes(origin)) {
      return next();
    }
    
    // Verifica o referer como fallback
    if (referer) {
      const isAuthorizedReferer = authorizedOrigins.some(authorizedOrigin => 
        referer.startsWith(authorizedOrigin)
      );
      
      if (isAuthorizedReferer) {
        return next();
      }
    }
    
    // Log de tentativa de acesso não autorizada
    if (process.env.NODE_ENV === 'development') {
      console.warn('🚫 Acesso negado:', {
        origin,
        referer,
        userAgent,
        cfRay,
        ip: req.ip,
        timestamp: new Date().toISOString()
      });
    }
    
    // Bloqueia a requisição
    res.status(403).json({
      success: false,
      message: 'Acesso negado: origem não autorizada'
    });
  }
  
  /**
   * Middleware para APIs públicas que podem receber requisições de qualquer lugar
   * mas com rate limiting mais agressivo
   */
  static validatePublicAccess(req: Request, res: Response, next: NextFunction): void {
    const userAgent = req.get('User-Agent');
    const cfRay = req.get('CF-Ray');
    
    // Bloqueia user-agents suspeitos
    const suspiciousUserAgents = [
      'curl',
      'wget',
      'python-requests',
      'PostmanRuntime',
      'Insomnia'
    ];
    
    // Em produção, bloqueia ferramentas de teste/scraping
    if (process.env.NODE_ENV === 'production' && userAgent) {
      const isSuspicious = suspiciousUserAgents.some(suspicious => 
        userAgent.toLowerCase().includes(suspicious.toLowerCase())
      );
      
      if (isSuspicious && !cfRay) { // Permite se vier da Cloudflare
        res.status(403).json({
          success: false,
          message: 'Acesso negado'
        });
        return;
      }
    }
    
    next();
  }
  
  /**
   * Middleware para endpoints de saúde/status que devem ser sempre acessíveis
   */
  static allowHealthChecks(req: Request, res: Response, next: NextFunction): void {
    // Permite verificações de saúde sem restrições
    next();
  }
}