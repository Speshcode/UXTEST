# 🎯 Приложение для тестирования компетенций дизайнеров

Современное веб-приложение для оценки компетенций дизайнеров с использованием интерактивного тестирования. Поддерживает оценку как Hard Skills, так и Soft Skills по всем грейдам от младшего дизайнера до руководителя направления.

## ✨ Возможности

- **Полное тестирование компетенций**: 17 Hard Skills и 5 Soft Skills компетенций
- **Интеллектуальная рандомизация**: Каждый тест уникален - разный порядок вопросов и компетенций
- **Точный алгоритм оценки**: Система подсчета баллов согласно требованиям с пороговыми значениями
- **Современный UI/UX**: Красивый адаптивный интерфейс с плавными анимациями
- **Детальные результаты**: Подробная аналитика по каждой компетенции и общий рейтинг
- **Мобильная адаптивность**: Полная поддержка мобильных устройств

## 🏗️ Архитектура

### Backend (Python Flask)
- **Framework**: Flask с CORS поддержкой
- **Данные**: JSON файлы с матрицей компетенций и вопросами
- **API**: RESTful endpoints для генерации тестов и обработки результатов
- **Алгоритм**: Точный подсчет баллов по формуле: (сумма баллов / количество вопросов) для каждой компетенции

### Frontend (React)
- **Framework**: React 18 с хуками
- **Сборка**: Webpack 5 с Babel
- **Стили**: CSS3 с градиентами и анимациями
- **UX**: Многоэкранный интерфейс с прогрессом и валидацией

## 📊 Система оценки

### Hard Skills (17 компетенций)
- **Максимальный балл**: 85 (17 × 5)
- **Пороговые значения**:
  - Младший дизайнер: 17 баллов
  - Дизайнер: 34 балла
  - Ведущий дизайнер: 51 балл
  - Главный дизайнер: 68 баллов
  - Руководитель направления: 85 баллов

### Soft Skills (5 компетенций)
- **Максимальный балл**: 25 (5 × 5)
- **Пороговые значения**: пропорционально Hard Skills

### Компетенции Hard Skills
1. Сетка и композиция
2. Теория цвета
3. Типографика
4. Прототипирование
5. Пользовательский интерфейс
6. Пользовательский опыт
7. Иконография
8. Иллюстрация
9. Анимация
10. Визуальная система
11. Дизайн-система
12. Адаптивный дизайн
13. Мобильный дизайн
14. Веб-дизайн
15. Графический дизайн
16. Бренд-дизайн
17. Интерфейс и взаимодействие

### Компетенции Soft Skills
1. Презентации
2. Коммуникация
3. Менеджмент
4. Лидерство
5. Тайм-менеджмент

## 🚀 Установка и запуск

### Предварительные требования
- Python 3.8+
- Node.js 16+
- npm или yarn

### 1. Клонирование репозитория
```bash
git clone <repository-url>
cd competency-assessment-app
```

### 2. Установка зависимостей Backend
```bash
cd backend
pip install -r requirements.txt
```

### 3. Установка зависимостей Frontend
```bash
cd ../frontend
npm install
```

### 4. Запуск Backend
```bash
cd ../backend
python app.py
```
Backend будет доступен по адресу: http://localhost:5000

### 5. Запуск Frontend (в новом терминале)
```bash
cd frontend
npm start
```
Frontend будет доступен по адресу: http://localhost:3000

## 📁 Структура проекта

```
competency-assessment-app/
├── backend/
│   ├── app.py                 # Основное приложение Flask
│   ├── requirements.txt       # Python зависимости
│   ├── package.json          # Метаданные backend
│   └── data/
│       ├── matrix.json       # Матрица компетенций и настройки
│       └── questions.json    # База вопросов по всем компетенциям
├── frontend/
│   ├── src/
│   │   ├── App.jsx           # Основной React компонент
│   │   ├── App.css           # Стили приложения
│   │   └── index.jsx         # Entry point
│   ├── public/
│   │   └── index.html        # HTML шаблон
│   ├── webpack.config.js     # Конфигурация Webpack
│   └── package.json          # React зависимости
└── README.md                 # Документация
```

## 🔧 API Endpoints

### `POST /api/generate-test`
Генерирует новый тест с рандомизированными вопросами
**Body**: `{"userId": "string"}`
**Response**: Объект с ID теста и вопросами

### `POST /api/submit-test`
Обрабатывает результаты теста и возвращает оценку
**Body**: `{"testId": "string", "answers": {}}`
**Response**: Детальные результаты с баллами и грейдами

### `GET /api/matrix-info`
Возвращает информацию о матрице компетенций
**Response**: Списки компетенций, грейдов и пороговых значений

### `GET /api/health`
Проверка состояния API
**Response**: `{"status": "healthy"}`

## 🎨 Особенности дизайна

- **Цветовая схема**: Градиенты от фиолетового к синему (#667eea → #764ba2)
- **Типографика**: Inter font family для лучшей читаемости
- **Анимации**: Плавные переходы и hover эффекты
- **Адаптивность**: Полная поддержка мобильных устройств
- **Accessibility**: Контрастные цвета и понятная навигация

## 🔐 Безопасность

- Правильные ответы не передаются на frontend
- Валидация данных на backend
- CORS настроен для безопасной работы
- Временное хранение активных тестов

## 📈 Алгоритм подсчета баллов

1. **Для каждой компетенции**:
   - Задается по одному вопросу из каждого грейда (5 вопросов)
   - Правильный ответ = 5 баллов, неправильный = 0 баллов
   - Средний балл = сумма баллов / количество вопросов

2. **Итоговый расчет**:
   - Hard Skills: сумма средних баллов по всем 17 компетенциям
   - Soft Skills: сумма средних баллов по всем 5 компетенциям
   - Определение грейда по пороговым значениям

## 🚀 Развитие

### Возможные улучшения
- Добавление базы данных для хранения результатов
- Система аутентификации пользователей
- Экспорт результатов в PDF
- Аналитика и статистика
- Система рекомендаций для развития

### Добавление новых вопросов
Для добавления новых вопросов отредактируйте файл `backend/data/questions.json`:

```json
{
  "Компетенция": {
    "Грейд": [
      {
        "text": "Текст вопроса?",
        "options": ["Вариант 1", "Вариант 2", "Вариант 3", "Вариант 4"],
        "answer": "Правильный вариант"
      }
    ]
  }
}
```

## 🤝 Вклад в проект

1. Fork репозитория
2. Создайте feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit изменения (`git commit -m 'Add some AmazingFeature'`)
4. Push в branch (`git push origin feature/AmazingFeature`)
5. Создайте Pull Request

## 📝 Лицензия

Этот проект распространяется под лицензией MIT. Подробности в файле `LICENSE`.

## 📞 Поддержка

Если у вас есть вопросы или предложения, создайте Issue в репозитории или свяжитесь с командой разработки.

---

**Разработано с ❤️ для оценки дизайнерских компетенций**