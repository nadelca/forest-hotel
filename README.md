# LES 31°12′ — лендинг лесного отеля

Статический лендинг без сборки и зависимостей.

## Структура

- `index.html` — разметка страницы
- `styles.css` — стили, темы зима/лето, адаптив
- `script.js` — переключатель темы, таймер, модальное окно, анимации появления
- `assets/fonts/` — локальные шрифты Clash Display, Inter, Unbounded
- `.jpg` / `.jpeg` — фотографии

## Деплой на Netlify

1. Загрузите файлы в публичный GitHub-репозиторий.
2. В Netlify: **Add new site → Import an existing project → GitHub**.
3. Выберите репозиторий `forest-hotel`.
4. Build command — оставьте пустым, Publish directory — `.`.
5. Нажмите **Deploy site**.

Сайт полностью статический, поэтому специальная сборка не требуется.
