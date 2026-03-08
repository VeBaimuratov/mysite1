# Docker — Полное руководство простым языком

## Содержание

1. [Что такое Docker?](#1-что-такое-docker)
2. [Как это работает — аналогия](#2-как-это-работает--аналогия)
3. [Ключевые понятия](#3-ключевые-понятия)
4. [Установка Docker](#4-установка-docker)
5. [Dockerfile — рецепт контейнера](#5-dockerfile--рецепт-контейнера)
6. [Основные команды Docker](#6-основные-команды-docker)
7. [Docker Compose — несколько контейнеров вместе](#7-docker-compose--несколько-контейнеров-вместе)
8. [Сети (Networks)](#8-сети-networks)
9. [Тома (Volumes) — постоянное хранилище](#9-тома-volumes--постоянное-хранилище)
10. [Переменные окружения](#10-переменные-окружения)
11. [Docker Hub — библиотека образов](#11-docker-hub--библиотека-образов)
12. [Практический пример — веб-сайт в Docker](#12-практический-пример--веб-сайт-в-docker)
13. [Полезные советы и best practices](#13-полезные-советы-и-best-practices)

---

## 1. Что такое Docker?

**Docker** — это программа для упаковки приложений в «контейнеры».

Контейнер — это изолированная коробка, внутри которой лежит:
- само приложение (например, ваш сайт)
- все библиотеки и зависимости, которые ему нужны
- настройки и конфигурация
- нужная версия Node.js / Python / PHP и т.д.

**Проблема без Docker:**
> «У меня работает, а у тебя нет» — классическая фраза разработчиков. У одного Windows, у другого Mac, у третьего Linux. У всех разные версии библиотек. Код ведёт себя по-разному.

**Решение с Docker:**
> Контейнер одинаково запускается на любой машине — Windows, Mac, Linux, сервер в облаке. Один раз настроил — везде работает.

---

## 2. Как это работает — аналогия

Представь **контейнер как грузовой контейнер на корабле**:

```
Без Docker:                    С Docker:
--------------------           --------------------
Переезд мебели:                Переезд мебели:
- Диван разбирается            - Всё упаковано
- Что-то теряется              - Запечатано в ящик
- На новом месте               - Ящик ставится куда
  не хватает деталей             угодно и открывается
                                 точно так же
```

**Разница между Docker и виртуальной машиной (VM):**

```
Виртуальная машина:            Docker контейнер:
┌─────────────────┐            ┌─────────────────┐
│   Приложение    │            │   Приложение    │
│   Библиотеки    │            │   Библиотеки    │
│   ОС (Ubuntu)   │            └────────┬────────┘
│   Гипервизор    │                     │
│   Железо        │            ┌────────┴────────┐
└─────────────────┘            │  Docker Engine  │
Размер: 2-10 ГБ                │  ОС хоста       │
Запуск: 1-2 минуты             └─────────────────┘
                               Размер: 50-500 МБ
                               Запуск: секунды
```

Контейнеры используют ядро операционной системы хоста — поэтому они легче и быстрее виртуальных машин.

---

## 3. Ключевые понятия

### Image (Образ)
Это **шаблон** (заготовка) из которого создаётся контейнер. Как ISO-файл для установки Windows. Образ неизменяемый — он только читается.

### Container (Контейнер)
**Запущенный экземпляр** образа. Из одного образа можно создать 100 одинаковых контейнеров. Контейнер живой — он работает, выполняет задачи.

### Dockerfile
**Текстовый файл с инструкциями** по сборке образа. Как рецепт блюда — шаг за шагом описываешь, что делать.

### Docker Hub
**Облачное хранилище** образов (как GitHub, только для Docker-образов). Там хранятся готовые образы: nginx, node, mysql, ubuntu и тысячи других.

### Docker Compose
Инструмент для запуска **нескольких контейнеров одновременно**. Например: сайт + база данных + Redis — всё запускается одной командой.

### Volume (Том)
**Постоянное хранилище** данных. Когда контейнер удаляется, данные из тома остаются. Нужен для баз данных, файлов пользователей.

### Network (Сеть)
**Виртуальная сеть** для контейнеров. Контейнеры в одной сети могут общаться между собой по имени.

---

## 4. Установка Docker

### Windows / Mac
Скачать и установить **Docker Desktop**: https://www.docker.com/products/docker-desktop

### Ubuntu / Debian
```bash
# Обновить пакеты
sudo apt update

# Установить зависимости
sudo apt install -y apt-transport-https ca-certificates curl gnupg lsb-release

# Добавить официальный ключ Docker
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

# Добавить репозиторий Docker
echo "deb [arch=amd64 signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Установить Docker
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# Проверить установку
docker --version
docker compose version
```

### Проверка что всё работает
```bash
docker run hello-world
# Должно появиться: "Hello from Docker!"
```

---

## 5. Dockerfile — рецепт контейнера

Dockerfile — это файл без расширения с именем `Dockerfile`. Он описывает, как построить образ.

### Все доступные теги (инструкции) Dockerfile

| Тег | Что делает |
|-----|-----------|
| `FROM` | Базовый образ (с чего начинаем) |
| `WORKDIR` | Рабочая директория внутри контейнера |
| `COPY` | Копировать файлы с хоста в контейнер |
| `ADD` | Как COPY, но умеет распаковывать архивы и скачивать URL |
| `RUN` | Выполнить команду при сборке образа |
| `CMD` | Команда по умолчанию при запуске контейнера |
| `ENTRYPOINT` | Точка входа (основная команда, неизменяемая) |
| `ENV` | Установить переменную окружения |
| `ARG` | Аргумент только для сборки (не попадает в контейнер) |
| `EXPOSE` | Объявить порт (документация, не открывает порт) |
| `VOLUME` | Объявить точку монтирования тома |
| `USER` | Сменить пользователя |
| `LABEL` | Добавить метаданные к образу |
| `HEALTHCHECK` | Команда для проверки здоровья контейнера |
| `SHELL` | Изменить оболочку для команд RUN |
| `ONBUILD` | Команда для дочерних образов |
| `STOPSIGNAL` | Сигнал для остановки контейнера |

### Пример Dockerfile для Node.js приложения

```dockerfile
# ШАГ 1: Берём базовый образ Node.js версии 20 (Alpine — лёгкий Linux)
FROM node:20-alpine

# ШАГ 2: Метаданные образа
LABEL maintainer="vener@example.com"
LABEL version="1.0"
LABEL description="Мой сайт в Docker"

# ШАГ 3: Устанавливаем рабочую директорию внутри контейнера
# Все следующие команды будут выполняться в /app
WORKDIR /app

# ШАГ 4: Копируем файлы зависимостей ПЕРВЫМИ (оптимизация кэша)
COPY package*.json ./

# ШАГ 5: Устанавливаем зависимости
RUN npm install --production

# ШАГ 6: Копируем весь остальной код
COPY . .

# ШАГ 7: Переменная окружения
ENV NODE_ENV=production
ENV PORT=3000

# ШАГ 8: Объявляем порт (документация)
EXPOSE 3000

# ШАГ 9: Сменить пользователя (безопасность — не запускать от root)
USER node

# ШАГ 10: Команда запуска приложения
CMD ["node", "server.js"]
```

### Пример Dockerfile для статического сайта (HTML/CSS/JS)

```dockerfile
# Берём официальный образ nginx
FROM nginx:alpine

# Копируем наш сайт в папку nginx
COPY . /usr/share/nginx/html

# Копируем кастомный конфиг nginx (если есть)
# COPY nginx.conf /etc/nginx/conf.d/default.conf

# Открываем порт 80
EXPOSE 80

# nginx запускается автоматически — CMD не нужен
```

### Пример Dockerfile для Python

```dockerfile
FROM python:3.11-slim

WORKDIR /app

# Копируем зависимости
COPY requirements.txt .

# Устанавливаем зависимости
RUN pip install --no-cache-dir -r requirements.txt

# Копируем код
COPY . .

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

EXPOSE 8000

CMD ["python", "app.py"]
```

### .dockerignore — что НЕ копировать в образ

Создай файл `.dockerignore` рядом с `Dockerfile`:

```
# Зависимости (установятся через npm install)
node_modules/

# Git
.git/
.gitignore

# Логи
*.log
logs/

# Переменные окружения (секреты!)
.env
.env.local
.env.production

# Временные файлы
.DS_Store
*.tmp

# Документация и тесты (не нужны в продакшне)
README.md
tests/
*.spec.js
```

---

## 6. Основные команды Docker

### Сборка образов

```bash
# Собрать образ из Dockerfile в текущей директории
docker build -t my-app .

# Собрать с указанием версии (тега)
docker build -t my-app:1.0 .
docker build -t my-app:latest .

# Собрать из другой директории
docker build -t my-app -f /path/to/Dockerfile .

# Собрать без кэша (чистая сборка)
docker build --no-cache -t my-app .

# Собрать с аргументами
docker build --build-arg NODE_ENV=production -t my-app .
```

### Работа с образами

```bash
# Посмотреть все локальные образы
docker images
docker image ls

# Удалить образ
docker rmi my-app
docker rmi my-app:1.0

# Удалить все неиспользуемые образы
docker image prune

# Удалить ВСЕ образы (осторожно!)
docker image prune -a

# Скачать образ с Docker Hub
docker pull nginx
docker pull node:20-alpine
docker pull ubuntu:22.04

# Загрузить образ на Docker Hub
docker push username/my-app:1.0

# Информация об образе
docker inspect my-app

# История слоёв образа
docker history my-app
```

### Запуск контейнеров

```bash
# Простой запуск
docker run nginx

# Запуск в фоне (detached mode) — контейнер работает в фоне
docker run -d nginx

# Запуск с именем контейнера
docker run -d --name my-nginx nginx

# Запуск с проброском порта (порт хоста:порт контейнера)
docker run -d -p 8080:80 nginx
# Теперь сайт доступен на http://localhost:8080

# Запуск с несколькими портами
docker run -d -p 8080:80 -p 8443:443 nginx

# Запуск с переменными окружения
docker run -d -e NODE_ENV=production -e PORT=3000 my-app

# Запуск с томом (папка хоста:папка контейнера)
docker run -d -v /home/user/data:/app/data my-app

# Запуск с автоудалением после остановки
docker run --rm my-app

# Запуск в интерактивном режиме (войти в контейнер)
docker run -it ubuntu bash
docker run -it node:20-alpine sh

# Запуск с ограничением ресурсов
docker run -d --memory="256m" --cpus="0.5" my-app

# Запуск с политикой перезапуска
docker run -d --restart=always nginx          # всегда перезапускать
docker run -d --restart=on-failure nginx      # только при ошибке
docker run -d --restart=unless-stopped nginx  # пока сам не остановишь
```

### Управление контейнерами

```bash
# Посмотреть запущенные контейнеры
docker ps

# Посмотреть ВСЕ контейнеры (включая остановленные)
docker ps -a

# Остановить контейнер
docker stop my-nginx

# Запустить остановленный контейнер
docker start my-nginx

# Перезапустить контейнер
docker restart my-nginx

# Принудительно убить контейнер
docker kill my-nginx

# Удалить контейнер (сначала нужно остановить)
docker rm my-nginx

# Остановить и удалить одной командой
docker stop my-nginx && docker rm my-nginx

# Удалить все остановленные контейнеры
docker container prune

# Зайти в работающий контейнер
docker exec -it my-nginx bash
docker exec -it my-nginx sh      # если bash нет (Alpine)

# Выполнить команду в контейнере
docker exec my-nginx ls /app
docker exec my-nginx cat /etc/nginx/nginx.conf
```

### Логи и мониторинг

```bash
# Посмотреть логи контейнера
docker logs my-nginx

# Смотреть логи в реальном времени
docker logs -f my-nginx

# Последние 100 строк логов
docker logs --tail 100 my-nginx

# Логи с временными метками
docker logs -t my-nginx

# Статистика ресурсов в реальном времени
docker stats

# Статистика конкретного контейнера
docker stats my-nginx

# Подробная информация о контейнере
docker inspect my-nginx

# Изменения в файловой системе контейнера
docker diff my-nginx
```

### Очистка

```bash
# Удалить всё неиспользуемое (образы, контейнеры, сети, тома)
docker system prune

# Удалить ВСЁ включая тома (осторожно — удалит данные!)
docker system prune -a --volumes

# Информация о занятом месте
docker system df
```

---

## 7. Docker Compose — несколько контейнеров вместе

Docker Compose позволяет описать несколько контейнеров в одном файле `docker-compose.yml` и управлять ими вместе.

### Структура файла docker-compose.yml

```yaml
version: '3.8'   # версия формата Compose

services:         # список контейнеров
  web:            # имя сервиса (можно любое)
    ...
  db:
    ...
  redis:
    ...

volumes:          # тома
  ...

networks:         # сети
  ...
```

### Все ключи docker-compose.yml

```yaml
version: '3.8'

services:
  my-service:
    # --- ОБРАЗ ---
    image: nginx:alpine              # готовый образ из Docker Hub
    build: .                         # собрать из Dockerfile в текущей папке
    build:
      context: ./app                 # папка с Dockerfile
      dockerfile: Dockerfile.prod    # имя Dockerfile
      args:                          # аргументы сборки
        NODE_ENV: production

    # --- ИМЕНА ---
    container_name: my-nginx         # имя контейнера

    # --- ПОРТЫ ---
    ports:
      - "8080:80"                    # хост:контейнер
      - "127.0.0.1:8080:80"         # только localhost

    # --- ТОМА ---
    volumes:
      - ./html:/usr/share/nginx/html  # папка хоста : папка контейнера
      - my-data:/app/data             # именованный том
      - /etc/nginx/nginx.conf:/etc/nginx/nginx.conf:ro  # :ro = только чтение

    # --- ПЕРЕМЕННЫЕ ОКРУЖЕНИЯ ---
    environment:
      NODE_ENV: production
      DB_HOST: db
      DB_PORT: 5432
    env_file:
      - .env                         # загрузить из файла

    # --- ЗАВИСИМОСТИ ---
    depends_on:
      - db                           # запустить db до этого сервиса
      - redis

    # --- СЕТИ ---
    networks:
      - frontend
      - backend

    # --- ПЕРЕЗАПУСК ---
    restart: unless-stopped          # always | on-failure | unless-stopped | no

    # --- РЕСУРСЫ ---
    deploy:
      resources:
        limits:
          cpus: '0.5'
          memory: 512M

    # --- HEALTHCHECK ---
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

    # --- КОМАНДА ---
    command: ["node", "server.js"]   # переопределить CMD из Dockerfile
    entrypoint: ["/bin/sh", "-c"]    # переопределить ENTRYPOINT

    # --- ЛОГИРОВАНИЕ ---
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"

    # --- ПРОФИЛИ ---
    profiles:
      - dev                          # запускать только в dev режиме

volumes:
  my-data:                           # именованный том
    driver: local
  db-data:

networks:
  frontend:
    driver: bridge
  backend:
    driver: bridge
    internal: true                   # нет доступа в интернет
```

### Практический пример: сайт + база данных + Redis

```yaml
version: '3.8'

services:

  # --- Веб-приложение ---
  web:
    build: .
    container_name: my-web-app
    ports:
      - "3000:3000"
    environment:
      NODE_ENV: production
      DB_HOST: db
      DB_NAME: mydb
      DB_USER: user
      DB_PASS: secret
      REDIS_HOST: redis
    depends_on:
      db:
        condition: service_healthy   # ждать пока db не станет healthy
      redis:
        condition: service_started
    volumes:
      - uploads:/app/uploads
    networks:
      - app-network
    restart: unless-stopped

  # --- База данных PostgreSQL ---
  db:
    image: postgres:15-alpine
    container_name: my-postgres
    environment:
      POSTGRES_DB: mydb
      POSTGRES_USER: user
      POSTGRES_PASSWORD: secret
    volumes:
      - db-data:/var/lib/postgresql/data  # данные сохранятся при перезапуске
      - ./init.sql:/docker-entrypoint-initdb.d/init.sql  # начальные данные
    networks:
      - app-network
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U user -d mydb"]
      interval: 10s
      timeout: 5s
      retries: 5
    restart: unless-stopped

  # --- Redis (кэш) ---
  redis:
    image: redis:7-alpine
    container_name: my-redis
    volumes:
      - redis-data:/data
    networks:
      - app-network
    restart: unless-stopped

  # --- Nginx (обратный прокси) ---
  nginx:
    image: nginx:alpine
    container_name: my-nginx
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/conf.d/default.conf:ro
      - ./ssl:/etc/nginx/ssl:ro
    depends_on:
      - web
    networks:
      - app-network
    restart: unless-stopped

volumes:
  db-data:
  redis-data:
  uploads:

networks:
  app-network:
    driver: bridge
```

### Команды Docker Compose

```bash
# Запустить все сервисы (в фоне)
docker compose up -d

# Запустить и пересобрать образы
docker compose up -d --build

# Запустить только конкретный сервис
docker compose up -d web

# Остановить все сервисы
docker compose down

# Остановить и удалить тома (осторожно — удалит данные!)
docker compose down -v

# Посмотреть статус сервисов
docker compose ps

# Логи всех сервисов
docker compose logs

# Логи конкретного сервиса в реальном времени
docker compose logs -f web

# Перезапустить сервис
docker compose restart web

# Зайти в контейнер сервиса
docker compose exec web bash
docker compose exec db psql -U user -d mydb

# Запустить одноразовую команду в сервисе
docker compose run --rm web npm run migrate

# Посмотреть конфигурацию (итоговый compose файл)
docker compose config

# Масштабировать сервис (несколько копий)
docker compose up -d --scale web=3

# Пересобрать образы без запуска
docker compose build

# Пул (скачать) все образы
docker compose pull
```

---

## 8. Сети (Networks)

Контейнеры в одной сети могут общаться между собой по **имени сервиса** как по доменному имени.

```yaml
# В docker-compose.yml — web может обращаться к db как к "db"
services:
  web:
    environment:
      DB_HOST: db    # не IP-адрес, а имя сервиса!
```

### Типы сетей

```bash
# Bridge (по умолчанию) — контейнеры изолированы от хоста
docker network create --driver bridge my-network

# Host — контейнер использует сеть хоста напрямую
docker run --network host nginx

# None — полная изоляция без сети
docker run --network none my-app
```

### Команды для сетей

```bash
# Посмотреть все сети
docker network ls

# Создать сеть
docker network create my-network

# Подключить контейнер к сети
docker network connect my-network my-container

# Отключить контейнер от сети
docker network disconnect my-network my-container

# Информация о сети
docker network inspect my-network

# Удалить сеть
docker network rm my-network

# Удалить неиспользуемые сети
docker network prune
```

---

## 9. Тома (Volumes) — постоянное хранилище

Когда контейнер удаляется — все данные внутри него удаляются тоже. **Тома** решают эту проблему.

### Виды монтирования

```bash
# 1. Именованный том (управляется Docker)
docker run -v my-data:/app/data my-app
# Данные хранятся в /var/lib/docker/volumes/my-data/

# 2. Bind mount (папка с хоста)
docker run -v /home/user/data:/app/data my-app
# Или с абсолютным путём в Windows:
docker run -v C:\Users\Vener\data:/app/data my-app

# 3. tmpfs mount (только в памяти, не сохраняется)
docker run --tmpfs /app/cache my-app
```

### Команды для томов

```bash
# Посмотреть все тома
docker volume ls

# Создать том
docker volume create my-data

# Информация о томе
docker volume inspect my-data

# Удалить том
docker volume rm my-data

# Удалить неиспользуемые тома
docker volume prune
```

---

## 10. Переменные окружения

Переменные окружения — это способ передавать настройки в контейнер без изменения кода.

### Файл .env

```bash
# .env файл (НЕ добавляй в Git!)
NODE_ENV=production
DB_HOST=db
DB_NAME=mydb
DB_USER=admin
DB_PASS=super-secret-password
JWT_SECRET=my-jwt-secret
API_KEY=abc123
PORT=3000
```

### Использование в docker-compose.yml

```yaml
services:
  web:
    env_file:
      - .env                 # загрузить все переменные из .env

    environment:
      NODE_ENV: ${NODE_ENV}  # взять значение из .env
      PORT: ${PORT:-3000}    # взять из .env или использовать 3000 по умолчанию
```

### Разные .env для разных окружений

```bash
# Запустить с .env.development
docker compose --env-file .env.development up -d

# Запустить с .env.production
docker compose --env-file .env.production up -d
```

---

## 11. Docker Hub — библиотека образов

Docker Hub — это облачный реестр (registry) образов. Как GitHub, но для Docker.

### Популярные готовые образы

| Образ | Описание |
|-------|---------|
| `nginx:alpine` | Веб-сервер Nginx |
| `node:20-alpine` | Node.js |
| `python:3.11-slim` | Python |
| `postgres:15-alpine` | PostgreSQL |
| `mysql:8` | MySQL |
| `redis:7-alpine` | Redis |
| `mongo:6` | MongoDB |
| `ubuntu:22.04` | Ubuntu Linux |
| `alpine:3.18` | Alpine Linux (5 МБ!) |

### Публикация своего образа

```bash
# 1. Войти в Docker Hub
docker login

# 2. Пометить образ своим username
docker tag my-app username/my-app:1.0
docker tag my-app username/my-app:latest

# 3. Загрузить на Docker Hub
docker push username/my-app:1.0
docker push username/my-app:latest

# 4. Теперь любой может скачать
docker pull username/my-app:1.0
```

---

## 12. Практический пример — веб-сайт в Docker

Упакуем наш сайт (Mysite1.html) в Docker.

### Структура проекта

```
project/
├── Dockerfile
├── docker-compose.yml
├── .dockerignore
├── nginx.conf
├── Mysite1.html
├── Mysite1.css
└── Mysite1.js
```

### Dockerfile

```dockerfile
FROM nginx:alpine

# Копируем файлы сайта
COPY Mysite1.html /usr/share/nginx/html/index.html
COPY Mysite1.css  /usr/share/nginx/html/Mysite1.css
COPY Mysite1.js   /usr/share/nginx/html/Mysite1.js

# Кастомный конфиг (опционально)
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
```

### nginx.conf

```nginx
server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    # Сжатие
    gzip on;
    gzip_types text/css application/javascript;

    # Кэширование статики
    location ~* \.(css|js|jpg|png|gif|ico)$ {
        expires 30d;
        add_header Cache-Control "public";
    }

    # Все пути ведут на index.html (для SPA)
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

### docker-compose.yml

```yaml
version: '3.8'

services:
  web:
    build: .
    container_name: mysite
    ports:
      - "8080:80"
    restart: unless-stopped
```

### Запуск

```bash
# Собрать и запустить
docker compose up -d --build

# Сайт доступен на http://localhost:8080

# Посмотреть логи
docker compose logs -f web

# Остановить
docker compose down
```

---

## 13. Полезные советы и best practices

### Оптимизация размера образа

```dockerfile
# Используй лёгкие базовые образы
FROM node:20-alpine    # 180 МБ, а не node:20 (1 ГБ)
FROM python:3.11-slim  # 130 МБ, а не python:3.11 (900 МБ)

# Объединяй RUN команды (меньше слоёв = меньше размер)
# Плохо:
RUN apt update
RUN apt install curl
RUN apt install git

# Хорошо:
RUN apt update && apt install -y curl git && rm -rf /var/lib/apt/lists/*

# Копируй package.json ПЕРЕД кодом (кэш зависимостей)
COPY package*.json ./
RUN npm install
COPY . .    # этот слой пересобирается только при изменении кода
```

### Многоступенчатая сборка (Multi-stage build)

Собираем в одном контейнере, запускаем в другом — итоговый образ маленький.

```dockerfile
# СТАДИЯ 1: Сборка (большой образ)
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build      # собираем production bundle

# СТАДИЯ 2: Запуск (маленький образ)
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
```

### Безопасность

```dockerfile
# Не запускай от root!
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

# Не копируй .env в образ
# Используй docker secrets или переменные окружения при запуске
```

```bash
# Сканировать образ на уязвимости
docker scout cves my-app

# Запускать без лишних прав
docker run --security-opt no-new-privileges my-app
```

### Полезные однострочники

```bash
# Остановить ВСЕ запущенные контейнеры
docker stop $(docker ps -q)

# Удалить ВСЕ остановленные контейнеры
docker rm $(docker ps -aq)

# Удалить ВСЕ образы
docker rmi $(docker images -q)

# Скопировать файл из контейнера на хост
docker cp my-container:/app/logs/error.log ./error.log

# Скопировать файл с хоста в контейнер
docker cp ./config.json my-container:/app/config.json

# Посмотреть IP-адрес контейнера
docker inspect -f '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' my-container

# Войти в контейнер как root (даже если USER задан)
docker exec -u root -it my-container bash
```

---

## Краткая шпаргалка

```
СБОРКА:
  docker build -t имя .             — собрать образ
  docker build --no-cache -t имя .  — без кэша

ЗАПУСК:
  docker run -d -p 8080:80 --name контейнер образ  — запустить
  docker run -it образ bash                         — интерактивно

УПРАВЛЕНИЕ:
  docker ps           — запущенные контейнеры
  docker ps -a        — все контейнеры
  docker stop имя     — остановить
  docker rm имя       — удалить
  docker logs -f имя  — логи

COMPOSE:
  docker compose up -d        — запустить всё
  docker compose down         — остановить всё
  docker compose logs -f      — логи
  docker compose exec web sh  — войти в контейнер

ОЧИСТКА:
  docker system prune -a  — удалить всё неиспользуемое
```

---

*Docker — это стандарт индустрии. Если ты умеешь пользоваться Docker — твой код запустится на любом сервере, у любого коллеги, в любом облаке (AWS, Google Cloud, Azure) без изменений.*
