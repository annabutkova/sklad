#!/bin/bash
# deploy.sh

# Проверяем наличие директории data
if [ ! -d "data" ]; then
  echo "Error: data directory not found"
  exit 1
fi

# Копируем данные в публичную директорию
echo "Copying data to public directory..."
mkdir -p public/data
cp -r data/* public/data/

# Собираем проект
echo "Building project..."
npm run build

# Запуск (для локального тестирования)
if [ "$1" == "start" ]; then
  echo "Starting application..."
  npm run start
fi

echo "Build completed!"