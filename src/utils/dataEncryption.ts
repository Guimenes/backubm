import crypto from 'crypto';

/**
 * Utilitário para criptografia de dados sensíveis
 * Evita exposição da estrutura de dados nas respostas da API
 */
export class DataEncryption {
  private static readonly KEY = process.env.ENCRYPTION_KEY || 'your-32-char-secret-key-here!!123';

  /**
   * Criptografa dados sensíveis usando base64 simples (para demonstração)
   * Em produção, use uma biblioteca mais robusta como crypto-js
   */
  static encrypt(data: any): string {
    try {
      const jsonString = JSON.stringify(data);
      const base64 = Buffer.from(jsonString).toString('base64');
      return base64;
    } catch (error) {
      throw new Error('Erro ao criptografar dados');
    }
  }

  /**
   * Descriptografa dados
   */
  static decrypt(encryptedData: string): any {
    try {
      const jsonString = Buffer.from(encryptedData, 'base64').toString('utf8');
      return JSON.parse(jsonString);
    } catch (error) {
      throw new Error('Erro ao descriptografar dados');
    }
  }

  /**
   * Cria um hash seguro de dados sensíveis (para IDs, etc.)
   */
  static hash(data: string): string {
    return crypto
      .createHash('sha256')
      .update(data + this.KEY)
      .digest('hex')
      .substring(0, 16); // Retorna apenas os primeiros 16 caracteres
  }

  /**
   * Ofusca dados estruturais para respostas públicas
   */
  static obfuscateStructure(data: any): any {
    if (Array.isArray(data)) {
      return data.map(item => this.obfuscateStructure(item));
    }

    if (data && typeof data === 'object') {
      const obfuscated: any = {};
      
      Object.keys(data).forEach(key => {
        // Ofusca campos sensíveis
        if (key === '_id' || key === 'id') {
          obfuscated[key] = this.hash(data[key].toString());
        } else if (key === 'senha' || key === 'password') {
          // Remove completamente campos de senha
          return;
        } else if (key === 'email') {
          // Ofusca email
          const email = data[key];
          if (email && email.includes('@')) {
            const [local, domain] = email.split('@');
            obfuscated[key] = `${local.substring(0, 2)}***@${domain}`;
          }
        } else if (typeof data[key] === 'object') {
          obfuscated[key] = this.obfuscateStructure(data[key]);
        } else {
          obfuscated[key] = data[key];
        }
      });
      
      return obfuscated;
    }

    return data;
  }

  /**
   * Prepara resposta segura para endpoints GET públicos
   */
  static prepareSecureResponse(data: any, shouldEncrypt: boolean = false): any {
    if (shouldEncrypt) {
      return {
        encrypted: true,
        data: this.encrypt(data)
      };
    } else {
      return {
        encrypted: false,
        data: this.obfuscateStructure(data)
      };
    }
  }
}