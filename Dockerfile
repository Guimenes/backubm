# Usar a imagem oficial do Node.js LTS
FROM node:18-alpine

# Definir diretório de trabalho
WORKDIR /app

# Copiar package.json e package-lock.json
COPY package*.json ./

# Instalar dependências
RUN npm ci --only=production && chown -R node:node /app

# Copiar código fonte
COPY . .

# Compilar TypeScript
RUN npm run build

# Expor a porta
EXPOSE 5000

# Definir usuário não-root para segurança
USER node

# Comando para iniciar a aplicação
CMD ["npm", "run", "start:prod"]
