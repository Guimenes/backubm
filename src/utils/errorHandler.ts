import { Response } from 'express';

interface ErrorResponse {
  success: boolean;
  message: string;
  code?: string;
}

/**
 * Utilitário para tratamento seguro de erros
 * Evita vazar informações sensíveis sobre a estrutura do banco ou sistema
 */
export class ErrorHandler {
  /**
   * Retorna uma resposta de erro genérica e segura
   */
  static handleError(res: Response, statusCode: number, userMessage: string, internalError?: any): void {
    const errorResponse: ErrorResponse = {
      success: false,
      message: userMessage
    };

    // Log interno do erro completo para debugging (apenas no desenvolvimento)
    if (process.env.NODE_ENV === 'development' && internalError) {
      console.error('Erro interno:', internalError);
    }

    res.status(statusCode).json(errorResponse);
  }

  /**
   * Trata erros de validação de forma segura
   */
  static handleValidationError(res: Response, message: string = 'Dados fornecidos são inválidos'): void {
    this.handleError(res, 400, message);
  }

  /**
   * Trata erros de autorização
   */
  static handleAuthError(res: Response, message: string = 'Acesso não autorizado'): void {
    this.handleError(res, 401, message);
  }

  /**
   * Trata erros de permissão
   */
  static handleForbiddenError(res: Response, message: string = 'Operação não permitida'): void {
    this.handleError(res, 403, message);
  }

  /**
   * Trata erros de recurso não encontrado
   */
  static handleNotFoundError(res: Response, message: string = 'Recurso não encontrado'): void {
    this.handleError(res, 404, message);
  }

  /**
   * Trata conflitos (ex: duplicação de dados)
   */
  static handleConflictError(res: Response, message: string = 'Conflito com dados existentes'): void {
    this.handleError(res, 409, message);
  }

  /**
   * Trata erros internos do servidor de forma segura
   */
  static handleInternalError(res: Response, internalError?: any): void {
    const message = 'Erro interno do servidor. Tente novamente mais tarde.';
    this.handleError(res, 500, message, internalError);
  }

  /**
   * Determina se o erro é relacionado ao MongoDB e retorna uma mensagem segura
   */
  static getSecureErrorMessage(error: any): string {
    if (error.code === 11000 || error.code === 11001) {
      return 'Dados já existem no sistema';
    }
    
    if (error.name === 'ValidationError') {
      return 'Dados fornecidos são inválidos';
    }

    if (error.name === 'CastError') {
      return 'Identificador inválido';
    }

    // Para todos os outros erros, retorna uma mensagem genérica
    return 'Erro interno do servidor. Tente novamente mais tarde.';
  }
}