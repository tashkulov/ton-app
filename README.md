# TON Swap - DEX на STON.fi Testnet

Простое web-приложение для свапа токенов на STON.fi testnet с подключением TON-кошелька.

## 🌟 Особенности

- ✅ Подключение TON-кошелька через TON Connect
- ✅ Отображение адреса кошелька и баланса TON (testnet)
- ✅ Свап между 4 токенами testnet (TON, jUSDT, jUSDC, STON)
- ✅ Настройка slippage (0.5%-5%)
- ✅ Расчет курса и предполагаемой суммы
- ✅ Детальная информация о свапе (exchange rate, минимальный выход)
- ✅ Состояния: загрузка, успех (с ссылкой на explorer), ошибка
- ✅ Транзакции через STON.fi SDK
- ✅ Современный UI/UX с темной темой
- ✅ Redux Toolkit для управления состоянием
- ✅ TypeScript + React 19
- ✅ ESLint + Prettier

📋 **Полный список функций:** см. [FEATURES.md](./FEATURES.md)

## 🚀 Быстрый старт

### Предварительные требования

- Node.js 18+ и npm
- Testnet TON кошелек (например, Tonkeeper)

### Установка

1. Клонируйте репозиторий:

```bash
git clone https://github.com/tashkulov/ton-app.git
cd ton-app
```

Если проект уже создан локально и нужно просто привязать удалённый репозиторий:

```bash
git init
git remote add origin https://github.com/tashkulov/ton-app.git
git branch -M main
git add .
git commit -m "init"
git push -u origin main
```

2. Установите зависимости:

```bash
npm install
```

3. Скопируйте `.env.example` в `.env` и настройте переменные окружения:

```bash
cp .env.example .env
```

4. Запустите приложение в режиме разработки:

```bash
npm run dev
```

5. Откройте [http://localhost:5173](http://localhost:5173) в браузере

## 📝 Переменные окружения

Создайте файл `.env` в корне проекта со следующими переменными:

```env
# STON.fi Configuration
VITE_NETWORK=testnet

# TON Connect Manifest URL (замените на свой URL при деплое)
VITE_MANIFEST_URL=https://raw.githubusercontent.com/ton-community/ton-connect/main/manifest.json

# API Endpoints
VITE_TONAPI_ENDPOINT=https://testnet.tonapi.io
```

### Описание переменных:

- `VITE_NETWORK` - Сеть TON (testnet/mainnet)
- `VITE_MANIFEST_URL` - URL манифеста для TON Connect
- `VITE_TONAPI_ENDPOINT` - Endpoint для TON API

## 🏗️ Структура проекта

```
ton-app/
├── src/
│   ├── components/          # React компоненты
│   │   ├── WalletButton.tsx # Кнопка подключения кошелька
│   │   ├── SwapForm.tsx     # Форма свапа
│   │   └── TokenSelector.tsx # Селектор токенов
│   ├── store/               # Redux store
│   │   ├── slices/
│   │   │   ├── walletSlice.ts # Состояние кошелька
│   │   │   └── swapSlice.ts   # Состояние свапа
│   │   ├── index.ts         # Конфигурация store
│   │   └── hooks.ts         # Typed hooks
│   ├── services/            # Сервисы
│   │   └── stonfi.ts        # Интеграция с STON.fi SDK
│   ├── constants/           # Константы
│   │   └── tokens.ts        # Список токенов testnet
│   ├── config/              # Конфигурация
│   │   └── tonconnect.ts    # Настройки TON Connect
│   ├── utils/               # Утилиты
│   │   └── format.ts        # Форматирование данных
│   ├── App.tsx              # Главный компонент
│   ├── App.css              # Стили приложения
│   ├── main.tsx             # Entry point
│   └── index.css            # Глобальные стили
├── .env.example             # Пример env файла
├── .prettierrc              # Конфигурация Prettier
├── eslint.config.js         # Конфигурация ESLint
├── package.json
└── README.md
```

## 🎮 Использование

### 1. Подключение кошелька

#### Вариант А: Расширение браузера (рекомендуется для разработки)

1. Установите [расширение Tonkeeper для Chrome](https://chrome.google.com/webstore/detail/tonkeeper)
2. В настройках расширения включите **Testnet Mode**
3. На странице приложения нажмите "Connect Wallet"
4. Выберите подключение через расширение

#### Вариант Б: Мобильное приложение (через QR-код)

1. Установите приложение Tonkeeper на телефон
2. В настройках приложения включите **Testnet Mode** (Settings → Developer → Testnet Mode)
3. Получите testnet TON через бот [@testgiver_ton_bot](https://t.me/testgiver_ton_bot)
4. На странице приложения нажмите "Connect Wallet"
5. Отсканируйте QR-код через Tonkeeper

**❗️ Важно:** Убедитесь, что кошелек переключен в режим testnet!

📖 **Подробная инструкция:** см. [WALLET_SETUP.md](./WALLET_SETUP.md)

### 2. Выполнение свапа

1. Выберите токен "From" (из какого токена меняете)
2. Выберите токен "To" (в какой токен меняете)
3. Введите сумму для обмена
4. При необходимости измените slippage (допустимое отклонение цены)
5. Нажмите кнопку "Swap"
6. Подтвердите транзакцию в кошельке
7. Дождитесь подтверждения транзакции

### 3. Просмотр транзакции

После успешного свапа:

- Появится сообщение "✅ Swap transaction sent!"
- Нажмите "View in Explorer" — откроется СРАЗУ страница конкретной транзакции `.../transaction/<id>`.
- Если индексирование TonAPI задержалось (редко 3–10 сек), временно может открыться страница кошелька. Подождите пару секунд и попробуйте снова.

## 🪙 Поддерживаемые токены (Testnet)

- **TON** - Нативный токен TON
- **jUSDT** - Testnet jUSDT
- **jUSDC** - Testnet jUSDC
- **STON** - Токен STON.fi

## 🛠️ Доступные команды

```bash
# Запуск в режиме разработки
npm run dev

# Сборка для продакшена
npm run build

# Предпросмотр продакшен сборки
npm run preview

# Проверка кода с ESLint
npm run lint

# Исправление ошибок ESLint
npm run lint:fix

# Форматирование кода с Prettier
npm run format

# Проверка форматирования
npm run format:check
```

## 🚢 Деплой

Приложение — статическое. Деплойте содержимое папки `dist/` на любой хостинг (Vercel, Netlify, GitHub Pages, Cloudflare Pages и т.д.).

1. Соберите проект:

```bash
npm run build
```

2. Задеплойте `dist/`.

3. Укажите публичный URL манифеста TON Connect в `.env` при необходимости:

```env
VITE_MANIFEST_URL=https://<your-domain>/tonconnect-manifest.json
```

- Ссылка на деплой (добавьте вашу): <YOUR_TESTNET_DEPLOY_URL>

## 🏛️ Архитектура

### Redux Store

Приложение использует Redux Toolkit для управления состоянием:

- **walletSlice** - управление состоянием кошелька (адрес, баланс, статус подключения)
- **swapSlice** - управление состоянием свапа (выбранные токены, суммы, статус транзакции)

### Интеграции

- **TON Connect** - для безопасного подключения TON кошельков
- **STON.fi SDK** - для выполнения свапов на DEX
- **TonAPI** - для получения информации о балансе

## 🔒 Безопасность

- Приложение не хранит приватные ключи
- Все транзакции подписываются в вашем кошельке
- Используется testnet - реальные средства не задействованы

## 🧪 Тестирование

### Получение testnet TON

1. Установите Tonkeeper или другой кошелек с поддержкой testnet
2. Переключитесь на testnet в настройках кошелька
3. Получите testnet TON через бот [@testgiver_ton_bot](https://t.me/testgiver_ton_bot)

## 📚 Технологический стек

- **Frontend Framework**: React 19
- **State Management**: Redux Toolkit
- **Blockchain**: TON (The Open Network)
- **DEX**: STON.fi
- **Wallet Connection**: TON Connect
- **Language**: TypeScript
- **Build Tool**: Vite
- **Code Quality**: ESLint + Prettier
- **Styling**: CSS (Custom)

## 🐛 Известные проблемы

- Эстимация свапа использует упрощенную логику (для демо)
- Требуется доработка полной интеграции с STON.fi SDK для продакшена

## 🔧 Troubleshooting

Если возникли проблемы, см. [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)

Частые проблемы:

- ❌ "Buffer is not defined" - уже исправлено, перезапустите dev сервер
- ❌ Кошелек не подключается - используйте расширение браузера
- ❌ Swap не работает - проверьте testnet режим и баланс

## 📖 Полезные ссылки

- [TON Documentation](https://docs.ton.org/)
- [STON.fi Documentation](https://docs.ston.fi/)
- [TON Connect](https://github.com/ton-connect)
- [Testnet Explorer](https://testnet.tonviewer.com/)

## 📄 Лицензия

MIT

## 👨‍💻 Разработка

Для разработки рекомендуется использовать:

- VS Code с расширениями ESLint и Prettier
- Node.js 18+
- Git

Форматирование кода происходит автоматически при сохранении файлов (если настроен VS Code).

---

**⚠️ ВНИМАНИЕ: Это тестовая версия для testnet. Не используйте в production без дополнительной проверки и аудита!**
