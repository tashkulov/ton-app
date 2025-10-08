# 🚀 Быстрый старт TON Swap

## Запуск приложения (3 шага)

### 1️⃣ Установка зависимостей

```bash
npm install
```

### 2️⃣ Запуск dev-сервера

```bash
npm run dev
```

Приложение откроется на `http://localhost:5173`

### 3️⃣ Подключение кошелька

**Самый простой способ (для компьютера):**

1. Установите расширение Tonkeeper:
   - Chrome: https://chrome.google.com/webstore/detail/tonkeeper
2. В расширении:
   - Settings → Developer → Enable **Testnet Mode**
3. Получите testnet TON:
   - Telegram бот: @testgiver_ton_bot
   - Отправьте `/start` и ваш адрес
4. На сайте:
   - Нажмите "Connect Wallet"
   - Выберите Tonkeeper extension

**Готово!** ✅

---

## 📱 Для мобильного (QR-код)

Если QR-код не работает, это нормально для localhost!

**Два варианта:**

1. **Используйте расширение браузера** (см. выше) - проще всего
2. **Используйте ngrok** для публичного URL - см. [WALLET_SETUP.md](./WALLET_SETUP.md)

---

## 💡 Полезные команды

```bash
# Запуск
npm run dev

# Проверка кода
npm run lint

# Исправление ошибок
npm run lint:fix

# Форматирование
npm run format

# Сборка
npm run build

# Предпросмотр сборки
npm run preview
```

---

## ❓ Проблемы?

### Кошелек не подключается

→ Проверьте, что включен **Testnet Mode** в настройках кошелька

### Нет баланса

→ Получите testnet TON через @testgiver_ton_bot

### QR-код не работает

→ Используйте расширение браузера вместо мобильного приложения

### Другие проблемы

→ См. подробную инструкцию: [WALLET_SETUP.md](./WALLET_SETUP.md)

---

## 📖 Документация

- **README.md** - Полная документация проекта
- **WALLET_SETUP.md** - Подробная настройка кошелька
- **QUICKSTART.md** - Этот файл (быстрый старт)
