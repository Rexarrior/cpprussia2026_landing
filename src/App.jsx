import { createSignal, onMount } from 'solid-js';
import './index.css';

const Card = ({ number, title, description, link, icon }) => {
  const [isVisible, setIsVisible] = createSignal(false);

  onMount(() => {
    setTimeout(() => setIsVisible(true), number * 100);
  });

  return (
    <div
      class={`card ${isVisible() ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}`}
      style={{ 'transition-delay': `${number * 50}ms`, 'transition': 'all 0.3s ease' }}
    >
      <div class="badge">
        {icon || number}
      </div>
      <h3 class="text-xl font-medium mb-2">{title}</h3>
      <p class="text-gray-400 text-sm mb-4">{description}</p>
      {link && (
        <a href={link} class="text-accent-orange hover:underline text-sm">
          {link.includes('demo') || link === '#' ? 'Посмотреть демо' : 'Читать'} →
        </a>
      )}
    </div>
  );
};

const Header = () => (
  <header class="px-6 py-8 border-b border-gray-800">
    <div class="max-w-7xl mx-auto flex items-center justify-between">
      <a href="https://dev.go.yandex/">
        <img
          src="https://vibecode-userver.lovable.app/lovable-uploads/2862a10c-9ced-498d-9ba3-6665969d884f.png"
          alt="Yandex"
          class="h-12"
        />
      </a>

      <a href="https://github.com/userver-framework/userver" class="flex items-center gap-4">
        <img
          src="https://vibecode-userver.lovable.app/lovable-uploads/ee3eb9a4-3837-4a97-b1e3-ab3288f8fb73.png"
          alt="userver"
          class="w-16 h-16"
        />
        <div class="flex flex-col">
          <span class="text-2xl font-bold">userver</span>
          <span class="text-sm text-gray-400">C++ Async Framework</span>
        </div>
      </a>

      <a
        href="https://userver.tech/"
        class="bg-bg-dark hover:bg-[#1a1d24] text-white px-4 py-2 rounded-xl flex items-center gap-2 transition-all duration-200 border border-gray-700 hover:border-gray-600"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="w-5 h-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          stroke-width="2"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
          />
        </svg>
        Документация
      </a>
    </div>
  </header>
);

const Hero = () => {
  const [isVisible, setIsVisible] = createSignal(false);

  onMount(() => {
    setTimeout(() => setIsVisible(true), 100);
  });

  return (
    <div class={`text-center mb-16 transition-all duration-700 ${isVisible() ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
      <h1 class="text-5xl md:text-6xl font-bold mb-6 animate-float">CPP Russia 2026</h1>
      <p class="text-2xl text-accent-orange mb-4 animate-glow inline-block px-4 py-2 rounded-xl" style={{ background: 'rgba(255,136,51,0.1)' }}>
        Userver Workshop
      </p>
      <div class="max-w-2xl mx-auto space-y-4">
        <p class="text-lg text-gray-300">
          Практическое знакомство с асинхронным C++ фреймворком userver.
          Пишем реальные сервисы и разбираемся в основах.
        </p>
      </div>
    </div>
  );
};

const Section = ({ title, description, children, delay = 0 }) => {
  const [isVisible, setIsVisible] = createSignal(false);

  onMount(() => {
    setTimeout(() => setIsVisible(true), delay);
  });

  return (
    <section class={`mb-16 transition-all duration-700 ${isVisible() ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
      <h2 class="text-4xl font-bold mb-4">{title}</h2>
      {description && <p class="text-gray-400 mb-8">{description}</p>}
      {children}
    </section>
  );
};

const Grid = ({ children }) => (
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">{children}</div>
);

const Footer = () => (
  <footer class="bg-bg-card border-t border-gray-800 py-8 mt-auto">
    <div class="max-w-7xl mx-auto px-6">
      <div class="flex flex-col items-center gap-6">
        <div class="flex items-center gap-6">
          <a href="https://dev.go.yandex/">
            <img
              src="https://vibecode-userver.lovable.app/lovable-uploads/2862a10c-9ced-498d-9ba3-6665969d884f.png"
              alt="Yandex"
              class="h-8 opacity-60 hover:opacity-100 transition-opacity"
            />
          </a>
          <a href="https://github.com/userver-framework/userver">
            <img
              src="https://vibecode-userver.lovable.app/lovable-uploads/ee3eb9a4-3837-4a97-b1e3-ab3288f8fb73.png"
              alt="userver"
              class="h-8 opacity-60 hover:opacity-100 transition-opacity"
            />
          </a>
          <span class="text-gray-500 text-sm">CPP Russia 2026</span>
        </div>
        <div class="flex gap-6 text-sm">
          <a href="https://userver.tech/" class="text-accent-orange hover:underline">
            Документация
          </a>
          <a href="https://github.com/userver-framework/userver" class="text-accent-orange hover:underline">
            GitHub
          </a>
          <a href="https://t.me/userver_ru" class="text-accent-orange hover:underline">
            Telegram
          </a>
        </div>
        <p class="text-gray-500 text-sm">
          Асинхронный C++ фреймворк для создания микросервисов
        </p>
      </div>
    </div>
  </footer>
);

function App() {
  return (
    <div class="min-h-screen flex flex-col bg-bg-dark">
      <Header />

      <main class="px-6 pb-16 flex-1">
        <div class="max-w-7xl mx-auto">
          <Hero />

          <Section title="Знакомство" description="Базовые концепции и архитектура фреймворка" delay={200}>
            <Grid>
              <Card
                number={1}
                title="Введение в userver"
                description="Что такое асинхронное программирование и зачем оно нужно"
              />
              <Card
                number={2}
                title="Архитектура"
                description="Компоненты системы и их взаимодействие"
              />
              <Card
                number={3}
                title="Первое приложение"
                description="Создаём простой HTTP-сервис"
              />
            </Grid>
          </Section>

          <Section title="Задачи" description="Практические задания для закрепления материала" delay={400}>
            <Grid>
              <Card
                number={1}
                title="Pastebin-сервис"
                description="Загрузка текста и получение уникальной ссылки"
                link="#"
              />
              <Card
                number={2}
                title="URL Shortener"
                description="Генерация коротких ссылок с перенаправлением"
                link="#"
              />
              <Card
                number={3}
                title="Simple ToDo API"
                description="Управление списком задач (добавление, удаление, изменение)"
                link="#"
              />
            </Grid>
          </Section>

          <Section title="Внеклассное чтение" description="Дополнительные материалы для самостоятельного изучения" delay={600}>
            <Grid>
              <Card
                number="📚"
                title="Документация"
                description="Официальная документация userver"
                link="https://userver.tech/"
              />
              <Card
                number="🐙"
                title="GitHub"
                description="Исходный код и примеры"
                link="https://github.com/userver-framework/userver"
              />
              <Card
                number="💬"
                title="Telegram"
                description="Русскоязычное сообщество"
                link="https://t.me/userver_ru"
              />
            </Grid>
          </Section>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default App;
