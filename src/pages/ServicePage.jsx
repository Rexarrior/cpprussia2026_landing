import { createSignal, onMount } from 'solid-js';
import { useParams } from '@solidjs/router';
import hljs from 'highlight.js';
import 'highlight.js/styles/github-dark.css';

const serviceData = {
  'auth-service': {
    title: 'auth_service',
    port: 8001,
    name: 'Auth Service',
    description: 'Аутентификация и авторизация пользователей',
    content: `# Auth Service

Сервис аутентификации и регистрации пользователей.

## Функциональность

- **Регистрация** — создание нового пользователя с login, password, name, email, phone
- **Авторизация** — вход по login/password, возврат token и данных пользователя

## API

| Метод | Endpoint | Описание |
|-------|----------|----------|
| POST | /v1/user/registration | Регистрация нового пользователя |
| POST | /v1/user/authorization | Авторизация пользователя |
| GET  | /v1/auth/public-key | Получить публичный ключ для верификации JWT |

## Примеры запросов/ответов

### POST /v1/user/registration

**Request:**
\`\`\`yaml
{
  "login": "ivanov",
  "password": "securePassword123",
  "name": "Иван Иванов",
  "email": "ivanov@example.com",
  "phone": "+79001234567"
}
\`\`\`

**Response (200):**
\`\`\`yaml
{
  "token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
  "login": "ivanov",
  "name": "Иван Иванов"
}
\`\`\`

### POST /v1/user/authorization

**Request:**
\`\`\`yaml
{
  "login": "ivanov",
  "password": "securePassword123"
}
\`\`\`

**Response (200):**
\`\`\`yaml
{
  "token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
  "login": "ivanov",
  "name": "Иван Иванов"
}
\`\`\`

**Response (401):**
\`\`\`yaml
{
  "error": "Invalid credentials",
  "code": "AUTH_FAILED"
}
\`\`\`

### GET /v1/auth/public-key

**Response (200):**
\`\`\`yaml
{
  "public_key": "-----BEGIN PUBLIC KEY-----\\nMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA...",
  "algorithm": "RS256",
  "kid": "auth-service-key-1"
}
\`\`\`

## Схема данных

- **V1Login** — уникальный login пользователя (string, min 3)
- **V1CurrentUser** — данные пользователя без токена (login, name)
- **V1AuthorizedUser** — авторизованный пользователь с JWT токеном (login, name, token)
- **V1UserAuthorizationResponse** — ответ с данными пользователя и токеном
- **V1PublicKeyResponse** — публичный RSA ключ для верификации JWT (public_key в PEM, algorithm, опциональный kid)

## Безопасность

- Пароли передаются по HTTPS и хешируются на бэкенде (bcrypt/argon2)
- Токен является JWT (JSON Web Token), подписанным алгоритмом RS256 (асимметричная подпись)
- Auth-сервис владеет приватным ключом и подписывает им токены
- Остальные сервисы получают публичный ключ через \`GET /v1/auth/public-key\` и верифицируют JWT **локально**, без обращения к auth-сервису на каждый запрос
- Публичный ключ рекомендуется кешировать на стороне клиента (например, 1 час); при ошибке верификации — перечитать (ротация ключей)

## HTTP Status Codes

| Код | Описание |
|-----|----------|
| 200 | Успешный запрос |
| 400 | Ошибка валидации |
| 401 | Неверные учётные данные |
| 409 | Пользователь уже существует |
| 500 | Внутренняя ошибка сервера |

## Потенциальные проблемы (out of scope)

- Нет logout
- Нет refresh token
- Нет rate limiting`
  },
  'status-service': {
    title: 'status_service',
    port: 8006,
    name: 'Status Service',
    description: 'Сервис пользовательских статусов',
    content: `# Status Service

Сервис пользовательских статусов.

## Функциональность

- **Обновление статуса** — установка статуса с типом и сообщением
- **Получение статуса** — получение статуса по login пользователя

## API

| Метод | Endpoint | Описание |
|-------|----------|----------|
| POST | /v1/user/status/update | Обновить свой статус |
| POST | /v1/user/status/by-login | Получить статус пользователя |

## Примеры запросов/ответов

### POST /v1/user/status/update

**Request:**
\`\`\`yaml
{
  "current_user": {
    "token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
    "login": "ivanov",
    "name": "Иван Иванов"
  },
  "status": {
    "status_type": "online",
    "status_message": "Working from home",
    "visibility": "public"
  }
}
\`\`\`

**Response (200):**
\`\`\`yaml
{
  "success": true,
  "updated_at": "2026-05-17T10:30:00Z",
  "expires_at": null
}
\`\`\`

### POST /v1/user/status/by-login

**Request:**
\`\`\`yaml
{
  "current_user": {
    "token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
    "login": "ivanov",
    "name": "Иван Иванов"
  },
  "login": "petrov"
}
\`\`\`

**Response (200):**
\`\`\`yaml
{
  "status": {
    "status_type": "busy",
    "status_message": "На встрече",
    "visibility": "public"
  }
}
\`\`\`

**Response (404):**
\`\`\`yaml
{
  "error": "User not found",
  "code": "USER_NOT_FOUND"
}
\`\`\`

## Схема данных

### V1StatusType
Тип статуса пользователя:
- \`online\` — пользователь онлайн
- \`away\` — пользователь отсутствует
- \`busy\` — пользователь занят
- \`offline\` — пользователь офлайн

### V1Visibility
Видимость статуса:
- \`public\` — статус виден всем
- \`private\` — статус виден только владельцу

### V1UserStatus
\`\`\`json
{
  "status_type": "online",
  "status_message": "Working from home",
  "visibility": "public"
}
\`\`\`

### V1UserStatusUpdateRequest
- \`current_user\` — информация о текущем пользователе
- \`status\` — объект V1UserStatus

### V1UserStatusUpdateResponse
- \`success\` — успешность операции
- \`updated_at\` — время обновления статуса
- \`expires_at\` — время истечения статуса (опционально)

### V1UserStatusByLoginRequest
- \`current_user\` — информация о текущем пользователе
- \`login\` — login пользователя, чей статус запрашивается

### V1UserStatusByLoginResponse
- \`status\` — объект V1UserStatus

## HTTP Status Codes

| Код | Описание |
|-----|----------|
| 200 | Успешный запрос |
| 400 | Bad request — некорректный запрос |
| 401 | Unauthorized — пользователь не аутентифицирован |
| 403 | Forbidden — нет доступа к запрашиваемому ресурсу |
| 404 | Not found — пользователь не найден |
| 500 | Internal server error — внутренняя ошибка сервера |

## Потенциальные проблемы

- Нет TTL или automatic cleanup
- Нет списка всех статусов`
  },
  'messaging-service': {
    title: 'messaging_service',
    port: 8002,
    name: 'Messaging Service',
    description: 'Сервис работы с каналами и сообщениями',
    content: `# Messaging Service

Сервис работы с каналами и сообщениями.

## Функциональность

- **Отправка сообщений** — создание нового сообщения в канале
- **Получение сообщений** — получение списка сообщений по timestamp-диапазону

## API

| Метод | Endpoint | Описание |
|-------|----------|----------|
| POST | /v1/channel/message/new | Отправить новое сообщение |
| POST | /v1/channel/message/by-timestamp | Получить сообщения за период |

## Примеры запросов/ответов

### POST /v1/channel/message/new

**Request:**
\`\`\`yaml
{
  "current_user": {
    "token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
    "login": "ivanov",
    "name": "Иван Иванов"
  },
  "channel_id": 1,
  "message": "Привет! Как дела?"
}
\`\`\`

**Response (200):**
\`\`\`yaml
{
  "id": 42,
  "timestamp": "2026-05-17T10:30:00Z",
  "message": "Привет! Как дела?",
  "current_user": {
    "token": "",
    "login": "ivanov",
    "name": "Иван Иванов"
  }
}
\`\`\`

### POST /v1/channel/message/by-timestamp

**Request:**
\`\`\`yaml
{
  "current_user": {
    "token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
    "login": "ivanov",
    "name": "Иван Иванов"
  },
  "channel_id": 1,
  "from_timestamp": "2026-05-17T09:00:00Z",
  "to_timestamp": "2026-05-17T11:00:00Z",
  "limit": 50
}
\`\`\`

**Response (200):**
\`\`\`yaml
{
  "messages": [
    {
      "id": 40,
      "timestamp": "2026-05-17T09:15:00Z",
      "message": "Доброе утро!",
      "current_user": {
        "token": "",
        "login": "petrov",
        "name": "Пётр Петров"
      }
    },
    {
      "id": 41,
      "timestamp": "2026-05-17T10:30:00Z",
      "message": "Привет! Как дела?",
      "current_user": {
        "token": "",
        "login": "ivanov",
        "name": "Иван Иванов"
      }
    }
  ],
  "next_cursor": "eyJpZCI6NDAsInRzIjoiMjAyNi0wNS0xN1QwOToxNTowMFoifQ==",
  "has_more": false
}
\`\`\`

## Схема данных

- **V1ChannelId** — ID канала (int64, предопределённые каналы)
- **V1MessageId** — уникальный ID сообщения в канале (int64)
- **V1CurrentUser** — информация о текущем пользователе (token, login, name)
- **V1ChannelMessage** — структура сообщения (id, timestamp, message, current_user)
- **V1Error** — структура ошибки (error, code)

### Пагинация

\`V1ChannelMessageByTimestampResponse\` содержит:
- \`messages\` — массив сообщений
- \`next_cursor\` — курсор для следующей страницы (null если нет больше результатов)
- \`has_more\` — флаг наличия дополнительных сообщений

### Формат timestamp

Все поля timestamp используют формат ISO8601 (\`format: date-time\`).

### HTTP Status Codes

| Код | Описание |
|-----|----------|
| 200 | Успешный ответ |
| 400 | Bad Request |
| 401 | Unauthorized |
| 404 | Channel Not Found |
| 500 | Internal Server Error |

## Потенциальные проблемы

- Нет возможности создать канал (описание says "all IDs already exist")
- Нет редактирования/удаления сообщений`
  },
  'reactions-service': {
    title: 'reactions_service',
    port: 8005,
    name: 'Reactions Service',
    description: 'Сервис реакций (лайков/дизлайков) на сообщения',
    content: `# Reactions Service

Сервис реакций (лайков/дизлайков) на сообщения.

## Функциональность

- **Toggle реакции** — добавление/удаление анимации на сообщение

## API

| Метод | Endpoint | Описание |
|-------|----------|----------|
| POST | /v1/like/trigger | Добавить/убрать реакцию |
| GET | /v1/like/{channel_id}/{message_id} | Получить все реакции на сообщение |

## Примеры запросов/ответов

### POST /v1/like/trigger

**Request:**
\`\`\`yaml
{
  "current_user": {
    "token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
    "login": "ivanov",
    "name": "Иван Иванов"
  },
  "idempotency_token": "unique-token-12345678",
  "channel_id": 1,
  "message_id": 42,
  "animation": "heart"
}
\`\`\`

**Response (200):**
\`\`\`yaml
{
  "action": "added",
  "current_user_reaction": "heart"
}
\`\`\`

Повторный запрос с тем же idempotency_token:
\`\`\`yaml
{
  "action": "added",
  "current_user_reaction": "heart"
}
\`\`\`

### GET /v1/like/{channel_id}/{message_id}

**Request:** \`GET /v1/like/1/42\`

**Response (200):**
\`\`\`yaml
{
  "reactions": [
    {
      "user": {
        "login": "ivanov",
        "name": "Иван Иванов"
      },
      "animation": "heart"
    },
    {
      "user": {
        "login": "petrov",
        "name": "Пётр Петров"
      },
      "animation": "like"
    }
  ]
}
\`\`\`

## Схема данных

### Enums

**V1Animation** — тип анимации:
- \`like\` — лайк
- \`dislike\` — дизлайк
- \`heart\` — сердце
- \`fire\` — огонь
- \`okay\` — окей
- \`LOL\` — смех
- \`smile\` — улыбка

### Request/Response

**V1LikeTriggerRequest** — запрос на toggle реакции:
- \`current_user\` — информация о пользователе
- \`idempotency_token\` — токен для идемпотентности (16-256 символов)
- \`channel_id\` — ID канала
- \`message_id\` — ID сообщения
- \`animation\` — тип анимации

**V1LikeTriggerResponse** — ответ после toggle:
- \`action\` — результат: \`added\` | \`removed\`
- \`current_user_reaction\` — текущая анимация пользователя на этом сообщении (null если нет)

**V1GetReactionsResponse** — список реакций:
- \`reactions\` — массив записей с \`user\` и \`animation\`

## Idempotency Token

Механизм toggle с idempotency_token:

1. Если токен используется впервые — выполняется toggle (добавление или удаление в зависимости от текущего состояния)
2. Если токен уже использовался для того же user+channel+message+animation:
   - Возвращается текущее состояние **без изменений**
   - Это позволяет безопасно повторять запросы

## HTTP Status Codes

| Код | Описание |
|-----|----------|
| 200 | Успех |
| 400 | Некорректный запрос |
| 401 | Неавторизован |
| 404 | Сообщение не найдено |
| 409 | Конфликт (idempotency token conflict) |

## Потенциальные проблемы

- [x] Добавлен response с состоянием после toggle
- [x] Объяснён механизм idempotency_token
- [x] Заменён "shit" на "fire"
- [x] Добавлен endpoint для получения реакций`
  },
  'notifications-service': {
    title: 'notifications_service',
    port: 8003,
    name: 'Notifications Service',
    description: 'Сервис уведомлений о сообщениях в рамках каналов',
    content: `# Notifications Service

Сервис уведомлений о сообщениях в рамках каналов.

## Функциональность

- **Создание уведомления** — оповещение другого пользователя о сообщении в рамках канала
- **Получение списка уведомлений** — получение уведомлений пользователя в рамках конкретного канала (список сообщений и статус прочтения)
- **Отметка уведомления как прочитанного** — пометить конкретное уведомление как прочитанное

## API

| Метод | Endpoint | Описание |
|-------|----------|----------|
| POST | /v1/channel/notification/new | Создать уведомление в канале |
| POST | /v1/channel/notification/list | Получить список уведомлений в канале |
| POST | /v1/channel/notification/read | Отметить уведомление как прочитанное |

## Примеры запросов/ответов

### POST /v1/channel/notification/new

**Request:**
\`\`\`yaml
{
  "current_user": {
    "token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
    "login": "ivanov",
    "name": "Иван Иванов"
  },
  "channel_id": 1,
  "message_id": 42,
  "other_user_login": "petrov"
}
\`\`\`

**Response (200):**
\`\`\`yaml
{
  "notification_id": "550e8400-e29b-41d4-a716-446655440000"
}
\`\`\`

### POST /v1/channel/notification/list

**Request:**
\`\`\`yaml
{
  "current_user": {
    "token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
    "login": "petrov",
    "name": "Пётр Петров"
  },
  "channel_id": 1
}
\`\`\`

**Response (200):**
\`\`\`yaml
{
  "notifications": [
    {
      "message_id": 42,
      "read": false
    },
    {
      "message_id": 38,
      "read": true
    }
  ]
}
\`\`\`

### POST /v1/channel/notification/read

**Request:**
\`\`\`yaml
{
  "current_user": {
    "token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
    "login": "petrov",
    "name": "Пётр Петров"
  },
  "channel_id": 1,
  "message_id": 42
}
\`\`\`

**Response (200):**
\`\`\`yaml
{
  "ok": true
}
\`\`\`

## Схема данных

### V1ChannelNotificationNewRequest

| Поле | Тип | Обязательное | Описание |
|------|-----|--------------|----------|
| current_user | object | Да | Текущий пользователь (token, login, name) |
| channel_id | integer | Да | ID канала |
| message_id | integer | Да | ID сообщения |
| other_user_login | string | Да | Логин пользователя для уведомления |

### V1ChannelNotificationNewResponse

| Поле | Тип | Обязательное | Описание |
|------|-----|--------------|----------|
| notification_id | UUID | Да | Уникальный ID созданного уведомления |

### V1ChannelNotificationListRequest

| Поле | Тип | Обязательное | Описание |
|------|-----|--------------|----------|
| current_user | object | Да | Текущий пользователь (token, login, name) |
| channel_id | integer | Да | ID канала |

### V1ChannelNotificationListResponse

| Поле | Тип | Обязательное | Описание |
|------|-----|--------------|----------|
| notifications | array | Да | Массив уведомлений (message_id + read) |

### V1ChannelNotificationReadRequest

| Поле | Тип | Обязательное | Описание |
|------|-----|--------------|----------|
| current_user | object | Да | Текущий пользователь (token, login, name) |
| channel_id | integer | Да | ID канала |
| message_id | integer | Да | ID сообщения для отметки как прочитанного |

### V1ChannelNotificationReadResponse

| Поле | Тип | Обязательное | Описание |
|------|-----|--------------|----------|
| ok | boolean | Да | true если уведомление найдено и отмечено прочитанным |

### V1CurrentUser

| Поле | Тип | Обязательное | Описание |
|------|-----|--------------|----------|
| token | string | Нет | Токен авторизации (128 символов, пусто если не авторизован) |
| login | string | Да | Логин пользователя |
| name | string | Да | Читаемое имя пользователя |

## Коды ошибок

| Код | Описание |
|-----|----------|
| 400 | Неверные параметры запроса |
| 401 | Пользователь не аутентифицирован |
| 403 | Нет прав на выполнение операции |
| 404 | Ресурс не найден |
| 500 | Внутренняя ошибка сервера |

## Примечания

- Уведомления являются уведомлениями в рамках канала (channel-scoped)
- Для каждого уведомления хранится статус прочтения (read/unread)
- Отметка как прочитанного выполняется оптимистично на фронтенде (UI обновляется немедленно)`
  },
  'files-service': {
    title: 'files_service',
    port: 8004,
    name: 'Files Service',
    description: 'Сервис передачи файлов',
    content: `# Files Service

Сервис передачи файлов с возможностью обмена между пользователями.

## Функциональность

- **Загрузка файла** — сохранение файла с получением URI
- **Получение файла** — загрузка по URI (доступно любому авторизованному пользователю)
- **Список файлов** — получение списка метаданных загруженных файлов, опционально с фильтром по владельцу

## API

| Метод | Endpoint | Описание |
|-------|----------|----------|
| POST | /v1/file/new | Загрузить новый файл |
| POST | /v1/file/by-uri | Получить файл по URI |
| POST | /v1/file/list | Получить список метаданных файлов |

## Примеры запросов/ответов

### POST /v1/file/new

**Request:**
\`\`\`yaml
{
  "current_user": {
    "token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
    "login": "ivanov",
    "name": "Иван Иванов"
  },
  "login": "ivanov",
  "filename": "document.pdf",
  "content": "JVBERi0xLjQK...",
  "mime_type": "application/pdf",
  "size": 102456
}
\`\`\`

**Response (200):**
\`\`\`yaml
{
  "current_user": {
    "token": "",
    "login": "ivanov",
    "name": "Иван Иванов"
  },
  "uri": "s3://files-bucket/abc123-def456",
  "file": {
    "login": "ivanov",
    "filename": "document.pdf",
    "content": "JVBERi0xLjQK...",
    "mime_type": "application/pdf",
    "size": 102456
  }
}
\`\`\`

### POST /v1/file/by-uri

**Request:**
\`\`\`yaml
{
  "current_user": {
    "token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
    "login": "petrov",
    "name": "Пётр Петров"
  },
  "uri": "s3://files-bucket/abc123-def456"
}
\`\`\`

**Response (200):**
\`\`\`yaml
{
  "login": "ivanov",
  "filename": "document.pdf",
  "content": "JVBERi0xLjQK...",
  "mime_type": "application/pdf",
  "size": 102456
}
\`\`\`

### POST /v1/file/list

**Request:**
\`\`\`yaml
{
  "current_user": {
    "token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
    "login": "ivanov",
    "name": "Иван Иванов"
  },
  "login": "ivanov"
}
\`\`\`

**Response (200):**
\`\`\`yaml
{
  "files": [
    {
      "uri": "s3://files-bucket/abc123-def456",
      "login": "ivanov",
      "filename": "document.pdf",
      "mime_type": "application/pdf",
      "size": 102456
    }
  ]
}
\`\`\`

## Схема данных

### V1File

| Поле | Тип | Описание |
|------|-----|----------|
| login | string | Идентификатор владельца файла |
| filename | string | Имя файла |
| content | string (base64) | Содержимое файла в Base64 |
| mime_type | string | MIME тип файла (например, \`application/pdf\`) |
| size | integer | Размер файла в байтах |

### V1FileNewRequest

Поля совпадают с \`V1File\`; \`mime_type\` и \`size\` — опциональные.

### V1FileNewResponse

| Поле | Тип | Описание |
|------|-----|----------|
| current_user | V1CurrentUser | Информация о текущем пользователе |
| uri | string | URI для доступа к файлу (формат: \`s3://bucket/path\`) |
| file | V1File | Полная информация о загруженном файле |

### V1FileByUriRequest

| Поле | Тип | Описание |
|------|-----|----------|
| current_user | V1CurrentUser | Текущий пользователь (для проверки авторизации) |
| uri | string | URI файла (\`s3://bucket/path\`) |

### V1FileByUriResponse

Ответ имеет плоскую структуру (поля совпадают с \`V1File\`, без обёртки в \`file\`).

| Поле | Тип | Описание |
|------|-----|----------|
| login | string | Логин владельца файла |
| filename | string | Имя файла |
| content | string (base64) | Содержимое файла в Base64 |
| mime_type | string (опц.) | MIME тип файла |
| size | integer (опц.) | Размер файла в байтах |

### V1FileMetadata

Метаданные файла без содержимого (используется в списках).

| Поле | Тип | Описание |
|------|-----|----------|
| uri | string | URI файла |
| login | string | Логин владельца |
| filename | string | Имя файла |
| mime_type | string (опц.) | MIME тип |
| size | integer (опц.) | Размер в байтах |

### V1FileListRequest

| Поле | Тип | Описание |
|------|-----|----------|
| current_user | V1CurrentUser | Текущий пользователь |
| login | string (опц.) | Фильтр по владельцу. Если не указан — возвращаются файлы всех пользователей. |

### V1FileListResponse

| Поле | Тип | Описание |
|------|-----|----------|
| files | V1FileMetadata[] | Массив метаданных файлов |

## Авторизация

Любой авторизованный пользователь может:
- скачать любой файл по его URI (\`POST /v1/file/by-uri\`);
- получить список всех файлов (\`POST /v1/file/list\`).

Это сделано намеренно для демонстрации обмена файлами в воркшопе.

## HTTP Status Codes

| Код | Описание |
|-----|----------|
| 200 | Успешный запрос |
| 400 | Bad request |
| 401 | Unauthorized |
| 404 | File not found |

## URI Format

URI имеет формат \`s3://bucket/path\`, где:
- \`bucket\` — имя хранилища
- \`path\` — путь к файлу

Пример: \`s3://files-bucket/abc123-def456\``
  }
};

const ServicePage = () => {
  const params = useParams();

  const service = () => serviceData[params.service];

  const renderMarkdown = (text) => {
    const lines = text.split('\n');
    const result = [];
    let inTable = false;
    let tableRows = [];
    let i = 0;

    while (i < lines.length) {
      const line = lines[i];

      if (line.startsWith('|')) {
        if (!line.match(/^\|[\s-|]+\|$/)) {
          if (!inTable) {
            inTable = true;
            tableRows = [];
          }
          const cells = line.split('|').filter((_, idx) => idx > 0 && idx < line.split('|').length - 1);
          tableRows.push(cells.map(c => c.trim()));
        }
      } else {
        if (inTable) {
          const headerRow = tableRows[0];
          const dataRows = tableRows.slice(1);

          result.push('<table><thead><tr>' +
            headerRow.map(c => `<th>${c}</th>`).join('') +
            '</tr></thead><tbody>' +
            dataRows.map(row => '<tr>' + row.map(c => `<td>${c}</td>`).join('') + '</tr>').join('') +
            '</tbody></table>'
          );
          inTable = false;
          tableRows = [];
        }

        let processedLine = line
          .replace(/^# (.+)$/, '<h1>$1</h1>')
          .replace(/^## (.+)$/, '<h2>$1</h2>')
          .replace(/^### (.+)$/, '<h3>$1</h3>')
          .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
          .replace(/\*(.+?)\*/g, '<em>$1</em>')
          .replace(/`([^`]+)`/g, '<code>$1</code>')
          .replace(/\[x\]/g, '✓')
          .replace(/\[ \]/g, '☐');

        if (processedLine.trim()) {
          result.push(`<p>${processedLine}</p>`);
        } else {
          result.push('<br>');
        }
      }
      i++;
    }

    if (inTable) {
      const headerRow = tableRows[0];
      const dataRows = tableRows.slice(1);

      result.push('<table><thead><tr>' +
        headerRow.map(c => `<th>${c}</th>`).join('') +
        '</tr></thead><tbody>' +
        dataRows.map(row => '<tr>' + row.map(c => `<td>${c}</td>`).join('') + '</tr>').join('') +
        '</tbody></table>'
      );
    }

    return result.join('');
  };

  const renderContent = () => {
    const text = service()?.content || '';
    const parts = [];
    let remaining = text;

    while (remaining.length > 0) {
      const codeBlockMatch = remaining.match(/```(\w*)\n?([\s\S]*?)```/);

      if (codeBlockMatch) {
        const before = remaining.substring(0, codeBlockMatch.index);
        if (before) parts.push({ type: 'text', content: before });

        const lang = codeBlockMatch[1] || 'yaml';
        const code = codeBlockMatch[2];
        const highlighted = hljs.highlight(code, { language: lang }).value;
        parts.push({ type: 'code', lang, content: highlighted });

        remaining = remaining.substring(codeBlockMatch.index + codeBlockMatch[0].length);
      } else {
        parts.push({ type: 'text', content: remaining });
        break;
      }
    }

    return parts;
  };

  return (
    <div class="service-page">
      <a href="/" class="back-link">
        ← Назад к задачам
      </a>

      {service() ? (
        <>
          <div class="service-header">
            <h1 class="text-4xl font-bold mb-4">{service().name}</h1>
            <div class="service-meta">
              <span class="meta-tag">Порт: {service().port}</span>
              <span class="meta-tag">{service().description}</span>
            </div>
          </div>

          <div class="service-content">
            {renderContent().map(part => (
              part.type === 'code' ? (
                <div class="code-block-wrapper">
                  <span class="code-lang">{part.lang}</span>
                  <pre><code innerHTML={part.content} /></pre>
                </div>
              ) : (
                <div class="markdown-content" innerHTML={renderMarkdown(part.content)} />
              )
            ))}
          </div>
          <div class="note-block mt-8">
            <strong>Важно:</strong> Полная версия спецификации доступна в папке <code>docs/</code> в репозитории <code>cpprussia2026_backend_template</code>. Эта страница содержит краткую выдержку для ознакомления; <code>docs/</code> является конечным источником истины.
          </div>
        </>
      ) : (
        <div class="not-found">
          <h1>Сервис не найден</h1>
          <p>Запрошенный сервис не существует в документации.</p>
        </div>
      )}
    </div>
  );
};

export default ServicePage;
