#!/bin/bash

# Script para gerenciar a aplicação Seminário UBM com Docker

echo "🚀 Seminário UBM - Docker Manager"
echo "=================================="

case "$1" in
  "up")
    echo "📦 Iniciando todos os serviços..."
    docker-compose up -d
    echo "✅ Serviços iniciados!"
    echo "🌐 Frontend: http://localhost:3000"
    echo "🔌 Backend: http://localhost:5000"
    echo "🗄️  MongoDB: localhost:27017"
    ;;
  
  "down")
    echo "⏹️  Parando todos os serviços..."
    docker-compose down
    echo "✅ Serviços parados!"
    ;;
  
  "restart")
    echo "🔄 Reiniciando todos os serviços..."
    docker-compose down
    docker-compose up -d
    echo "✅ Serviços reiniciados!"
    ;;
  
  "logs")
    if [ -z "$2" ]; then
      echo "📋 Mostrando logs de todos os serviços..."
      docker-compose logs -f
    else
      echo "📋 Mostrando logs do serviço: $2"
      docker-compose logs -f "$2"
    fi
    ;;
  
  "build")
    echo "🔨 Rebuilding todos os serviços..."
    docker-compose build --no-cache
    echo "✅ Build concluído!"
    ;;
  
  "clean")
    echo "🧹 Limpando containers, imagens e volumes..."
    docker-compose down -v --remove-orphans
    docker system prune -f
    docker volume prune -f
    echo "✅ Limpeza concluída!"
    ;;
  
  "status")
    echo "📊 Status dos serviços:"
    docker-compose ps
    ;;
  
  "shell")
    if [ -z "$2" ]; then
      echo "❌ Especifique o serviço: backend, frontend ou mongodb"
      exit 1
    fi
    echo "🐚 Abrindo shell no serviço: $2"
    docker-compose exec "$2" sh
    ;;
  
  "mongo")
    echo "🗄️  Conectando ao MongoDB..."
    docker-compose exec mongodb mongosh -u admin -p seminario123 --authenticationDatabase admin seminario_ubm
    ;;
  
  *)
    echo "📚 Uso: $0 {up|down|restart|logs|build|clean|status|shell|mongo}"
    echo ""
    echo "Comandos disponíveis:"
    echo "  up        - Inicia todos os serviços"
    echo "  down      - Para todos os serviços"
    echo "  restart   - Reinicia todos os serviços"
    echo "  logs      - Mostra logs (use 'logs backend' para serviço específico)"
    echo "  build     - Reconstrói todas as imagens"
    echo "  clean     - Remove containers, imagens e volumes"
    echo "  status    - Mostra status dos serviços"
    echo "  shell     - Abre shell em um serviço (ex: shell backend)"
    echo "  mongo     - Conecta ao MongoDB CLI"
    echo ""
    echo "Exemplos:"
    echo "  $0 up                 # Inicia a aplicação"
    echo "  $0 logs backend       # Mostra logs do backend"
    echo "  $0 shell backend      # Abre shell no container do backend"
    exit 1
    ;;
esac
