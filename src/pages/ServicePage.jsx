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

## Схема данных

\`\`\`yaml
# V1Login — уникальный login пользователя
V1Login:
  type: string
  minLength: 3

# V1CurrentUser — данные пользователя без токена
V1CurrentUser:
  type: object
  properties:
    login:
      type: string
    name:
      type: string

# V1AuthorizedUser — авторизованный пользователь с JWT токеном
V1AuthorizedUser:
  type: object
  properties:
    login:
      type: string
    name:
      type: string
    token:
      type: string

# V1UserAuthorizationResponse — ответ с данными пользователя и токеном
V1UserAuthorizationResponse:
  type: object
  properties:
    user:
      $ref: "#/V1AuthorizedUser"

# V1PublicKeyResponse — публичный RSA ключ для верификации JWT
V1PublicKeyResponse:
  type: object
  properties:
    public_key:
      type: string
      description: PEM format
    algorithm:
      type: string
      enum: [RS256]
    kid:
      type: string
      description: Optional key ID
\`\`\`

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

- **Получение статуса** — получить текущий статус пользователя
- **Обновление статуса** — установить новый статус пользователя
- **Список статусов** — получить список всех возможных статусов

## API

| Метод | Endpoint | Описание |
|-------|----------|----------|
| GET | /v1/status/{user_id} | Получить статус пользователя |
| PUT | /v1/status/{user_id} | Обновить статус пользователя |
| GET | /v1/statuses | Получить список всех статусов |

## Схема данных

\`\`\`yaml
# Status — статус пользователя
Status:
  type: object
  properties:
    user_id:
      type: string
    status:
      type: string
      enum: [online, away, busy, offline]
    message:
      type: string
      description: Опциональное сообщение статуса
    updated_at:
      type: string
      format: date-time

# StatusList — список статусов
StatusList:
  type: array
  items:
    $ref: "#/Status"

# V1StatusResponse
V1StatusResponse:
  type: object
  properties:
    status:
      $ref: "#/Status"
\`\`\`

## HTTP Status Codes

| Код | Описание |
|-----|----------|
| 200 | Успешный запрос |
| 400 | Ошибка валидации |
| 404 | Статус не найден |
| 500 | Внутренняя ошибка сервера |`
  },
  'messaging-service': {
    title: 'messaging_service',
    port: 8002,
    name: 'Messaging Service',
    description: 'Сервис работы с каналами и сообщениями',
    content: `# Messaging Service

Сервис работы с каналами и сообщениями.

## Функциональность

- **Каналы** — создание, получение списка, удаление каналов
- **Сообщения** — отправка, получение, удаление сообщений
- **Подписки** — подписка на каналы

## API

| Метод | Endpoint | Описание |
|-------|----------|----------|
| POST | /v1/channels | Создать канал |
| GET | /v1/channels | Получить список каналов |
| GET | /v1/channels/{channel_id} | Получить канал |
| DELETE | /v1/channels/{channel_id} | Удалить канал |
| POST | /v1/channels/{channel_id}/messages | Отправить сообщение |
| GET | /v1/channels/{channel_id}/messages | Получить сообщения канала |
| DELETE | /v1/messages/{message_id} | Удалить сообщение |

## Схема данных

\`\`\`yaml
# Channel — канал
Channel:
  type: object
  properties:
    id:
      type: string
    name:
      type: string
    description:
      type: string
    created_at:
      type: string
      format: date-time
    owner_id:
      type: string

# Message — сообщение
Message:
  type: object
  properties:
    id:
      type: string
    channel_id:
      type: string
    sender_id:
      type: string
    content:
      type: string
    created_at:
      type: string
      format: date-time

# V1ChannelResponse
V1ChannelResponse:
  type: object
  properties:
    channel:
      $ref: "#/Channel"

# V1MessageResponse
V1MessageResponse:
  type: object
  properties:
    message:
      $ref: "#/Message"
\`\`\`

## HTTP Status Codes

| Код | Описание |
|-----|----------|
| 200 | Успешный запрос |
| 201 | Канал/сообщение создано |
| 400 | Ошибка валидации |
| 404 | Ресурс не найден |
| 500 | Внутренняя ошибка сервера |`
  },
  'reactions-service': {
    title: 'reactions_service',
    port: 8005,
    name: 'Reactions Service',
    description: 'Сервис реакций (лайков/дизлайков) на сообщения',
    content: `# Reactions Service

Сервис реакций (лайков/дизлайков) на сообщения.

## Функциональность

- **Добавление реакции** — добавить реакцию к сообщению
- **Удаление реакции** — удалить свою реакцию
- **Получение реакций** — получить все реакции сообщения

## API

| Метод | Endpoint | Описание |
|-------|----------|----------|
| POST | /v1/messages/{message_id}/reactions | Добавить реакцию |
| DELETE | /v1/messages/{message_id}/reactions/{reaction_id} | Удалить реакцию |
| GET | /v1/messages/{message_id}/reactions | Получить реакции сообщения |

## Схема данных

\`\`\`yaml
# Reaction — реакция на сообщение
Reaction:
  type: object
  properties:
    id:
      type: string
    message_id:
      type: string
    user_id:
      type: string
    type:
      type: string
      enum: [like, dislike]
    created_at:
      type: string
      format: date-time

# ReactionCount — количество реакций по типам
ReactionCount:
  type: object
  properties:
    likes:
      type: integer
    dislikes:
      type: integer

# V1ReactionsResponse
V1ReactionsResponse:
  type: object
  properties:
    message_id:
      type: string
    reactions:
      type: array
      items:
        $ref: "#/Reaction"
    counts:
      $ref: "#/ReactionCount"
\`\`\`

## HTTP Status Codes

| Код | Описание |
|-----|----------|
| 200 | Успешный запрос |
| 201 | Реакция создана |
| 400 | Ошибка валидации |
| 404 | Реакция не найдена |
| 500 | Внутренняя ошибка сервера |`
  },
  'notifications-service': {
    title: 'notifications_service',
    port: 8003,
    name: 'Notifications Service',
    description: 'Сервис уведомлений о сообщениях в рамках каналов',
    content: `# Notifications Service

Сервис уведомлений о сообщениях в рамках каналов.

## Функциональность

- **Создание уведомления** — создать уведомление о новом сообщении
- **Получение уведомлений** — получить список уведомлений пользователя
- **Пометка прочитанным** — пометить уведомление как прочитанное

## API

| Метод | Endpoint | Описание |
|-------|----------|----------|
| POST | /v1/notifications | Создать уведомление |
| GET | /v1/notifications | Получить уведомления пользователя |
| PUT | /v1/notifications/{notification_id}/read | Пометить как прочитанное |
| DELETE | /v1/notifications/{notification_id} | Удалить уведомление |

## Схема данных

\`\`\`yaml
# Notification — уведомление
Notification:
  type: object
  properties:
    id:
      type: string
    user_id:
      type: string
    channel_id:
      type: string
    message_id:
      type: string
    type:
      type: string
      enum: [new_message, mention, reaction]
    is_read:
      type: boolean
    created_at:
      type: string
      format: date-time

# V1NotificationResponse
V1NotificationResponse:
  type: object
  properties:
    notification:
      $ref: "#/Notification"

# V1NotificationListResponse
V1NotificationListResponse:
  type: object
  properties:
    notifications:
      type: array
      items:
        $ref: "#/Notification"
    unread_count:
      type: integer
\`\`\`

## HTTP Status Codes

| Код | Описание |
|-----|----------|
| 200 | Успешный запрос |
| 201 | Уведомление создано |
| 400 | Ошибка валидации |
| 404 | Уведомление не найдено |
| 500 | Внутренняя ошибка сервера |`
  },
  'files-service': {
    title: 'files_service',
    port: 8004,
    name: 'Files Service',
    description: 'Сервис передачи файлов',
    content: `# Files Service

Сервис передачи файлов.

## Функциональность

- **Загрузка файла** — загрузить файл в систему
- **Скачивание файла** — скачать файл по ID
- **Удаление файла** — удалить файл

## API

| Метод | Endpoint | Описание |
|-------|----------|----------|
| POST | /v1/files | Загрузить файл |
| GET | /v1/files/{file_id} | Скачать файл |
| DELETE | /v1/files/{file_id} | Удалить файл |
| GET | /v1/files | Получить список файлов пользователя |

## Схема данных

\`\`\`yaml
# FileMetadata — метаданные файла
FileMetadata:
  type: object
  properties:
    id:
      type: string
    name:
      type: string
    size:
      type: integer
      description: Размер в байтах
    content_type:
      type: string
      description: MIME type
    uploader_id:
      type: string
    created_at:
      type: string
      format: date-time
    storage_path:
      type: string
      description: Путь в хранилище

# V1FileUploadResponse
V1FileUploadResponse:
  type: object
  properties:
    file:
      $ref: "#/FileMetadata"
    upload_url:
      type: string
      description: URL для загрузки (если используется presigned URL)

# V1FileResponse
V1FileResponse:
  type: object
  properties:
    file:
      $ref: "#/FileMetadata"
    download_url:
      type: string
      description: URL для скачивания
\`\`\`

## HTTP Status Codes

| Код | Описание |
|-----|----------|
| 200 | Успешный запрос |
| 201 | Файл загружен |
| 400 | Ошибка валидации |
| 404 | Файл не найден |
| 413 | Файл слишком большой |
| 500 | Внутренняя ошибка сервера |`
  }
};

const ServicePage = () => {
  const params = useParams();
  const [content, setContent] = createSignal('');

  onMount(() => {
    const service = serviceData[params.service];
    if (service) {
      // Process markdown-like content with code blocks
      let processed = service.content;
      setContent(processed);
    }
  });

  const service = () => serviceData[params.service];

  const renderContent = () => {
    const text = service()?.content || '';
    const parts = [];
    let remaining = text;
    let codeBlockIndex = 0;

    while (remaining.length > 0) {
      const codeBlockMatch = remaining.match(/```(\w*)\n([\s\S]*?)```/);

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
                <div class="markdown-content" innerHTML={
                  part.content
                    .replace(/^# (.+)$/gm, '<h1>$1</h1>')
                    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
                    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
                    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
                    .replace(/\*(.+?)\*/g, '<em>$1</em>')
                    .replace(/`([^`]+)`/g, '<code>$1</code>')
                    .replace(/^\| (.+) \|$/gm, (match, row) => {
                      const cells = row.split(' | ');
                      return '<tr>' + cells.map(c => `<td>${c}</td>`).join('') + '</tr>';
                    })
                    .replace(/(<tr>.*<\/tr>)/gs, '<table>$1</table>')
                    .replace(/\n\n/g, '</p><p>')
                    .replace(/\n/g, '<br>')
                } />
              )
            ))}
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
