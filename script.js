const apiKey = 'f39517cf14dab1a8df156c0370063687';

const translations = {
    ua: {
        humidity: 'Вологість',
        wind: 'Вітер',
        loading: 'Завантаження...',
        error: 'Помилка',
        refresh: 'Оновити'
    },
    en: {
        humidity: 'Humidity',
        wind: 'Wind',
        loading: 'Loading...',
        error: 'Error',
        refresh: 'Refresh'
    },
    ru: {
        humidity: 'Влажность',
        wind: 'Ветер',
        loading: 'Загрузка...',
        error: 'Ошибка',
        refresh: 'Обновить'
    }
};

let currentLang = 'ua'; // тільки одне оголошення

// Функція для іконки погоди
function getWeatherIcon(condition) {
    const iconMap = {
        'clear': 'fa-sun', 'sun': 'fa-sun', 'ясно': 'fa-sun', 'солнечно': 'fa-sun',
        'cloud': 'fa-cloud', 'clouds': 'fa-cloud', 'хмарно': 'fa-cloud', 'облачно': 'fa-cloud',
        'rain': 'fa-cloud-rain', 'drizzle': 'fa-cloud-rain', 'дощ': 'fa-cloud-rain', 'дождь': 'fa-cloud-rain',
        'thunderstorm': 'fa-cloud-bolt', 'гроза': 'fa-cloud-bolt',
        'snow': 'fa-snowflake', 'сніг': 'fa-snowflake', 'снег': 'fa-snowflake',
        'mist': 'fa-smog', 'fog': 'fa-smog', 'туман': 'fa-smog'
    };
    const lower = condition.toLowerCase();
    for (let key in iconMap) {
        if (lower.includes(key)) return iconMap[key];
    }
    return 'fa-cloud-sun';
}

// Функція оновлення тексту кнопки
function updateUILanguage() {
    const refreshBtn = document.getElementById('refreshBtn');
    if (refreshBtn) {
        refreshBtn.textContent = translations[currentLang].refresh;
    }
}

// Функція зміни мови
function changeLanguage(lang) {
    currentLang = lang;
    // Оновлюємо активний клас на кнопках
    document.querySelectorAll('.lang-btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById(`lang-${lang}`).classList.add('active');
    // Оновлюємо текст кнопки
    updateUILanguage();
    // Оновлюємо погоду для поточного міста
    const city = document.getElementById('cityName').textContent;
    if (city && !city.includes(translations[currentLang].error) && !city.includes(translations[currentLang].loading)) {
        getRealWeather(city);
    }
}

// Основна функція отримання погоди
async function getRealWeather(city) {
    const cityEl = document.getElementById('cityName');
    const tempEl = document.getElementById('temp');
    const feelsLikeEl = document.getElementById('feelsLike');
    const condEl = document.getElementById('condition');
    const humEl = document.getElementById('humidity');
    const windEl = document.getElementById('wind');
    const iconEl = document.getElementById('weatherIcon');

    cityEl.textContent = city;
    tempEl.textContent = '...';
    feelsLikeEl.textContent = '';
    condEl.textContent = translations[currentLang].loading;
    humEl.innerHTML = '';
    windEl.innerHTML = '';
    iconEl.className = 'fas fa-spinner fa-pulse';

    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric&lang=${currentLang}`;

    try {
        const res = await fetch(url);
        if (!res.ok) throw new Error(translations[currentLang].error);
        const data = await res.json();

        cityEl.textContent = data.name;
        tempEl.textContent = `${Math.round(data.main.temp)} °C`;
        feelsLikeEl.textContent = `(відчувається як ${Math.round(data.main.feels_like)} °C)`;
        condEl.textContent = data.weather[0].description;
        humEl.innerHTML = `${translations[currentLang].humidity}: ${data.main.humidity} %`;
        windEl.innerHTML = `${translations[currentLang].wind}: ${data.wind.speed} км/ч`;
        iconEl.className = `fas ${getWeatherIcon(data.weather[0].description)}`;

    } catch (error) {
        console.error('Помилка API:', error);
        cityEl.textContent = translations[currentLang].error;
        condEl.textContent = error.message;
        tempEl.textContent = '';
        feelsLikeEl.textContent = '';
        humEl.innerHTML = '';
        windEl.innerHTML = '';
         iconEl.className = 'fas fa-exclamation-triangle';
    }
}
// Події після завантаження DOM
document.addEventListener('DOMContentLoaded', () => {
    // Додаємо обробники для міст
    document.querySelectorAll('#cities li').forEach(li => {
        li.addEventListener('click', () => getRealWeather(li.dataset.city));
    });

    // Додаємо обробники для кнопок мов
    document.getElementById('lang-ua').addEventListener('click', () => changeLanguage('ua'));
    document.getElementById('lang-en').addEventListener('click', () => changeLanguage('en'));
    document.getElementById('lang-ru').addEventListener('click', () => changeLanguage('ru'));

    // Завантажуємо перше місто
    const firstCity = document.querySelector('#cities li');
    if (firstCity) getRealWeather(firstCity.dataset.city);

    // Встановлюємо текст кнопки при старті
    updateUILanguage();
});

// Кнопка оновлення
const refreshBtn = document.getElementById('refreshBtn');
if (refreshBtn) {
    refreshBtn.addEventListener('click', () => {
        const city = document.getElementById('cityName').textContent;
        // Перевіряємо, чи це не повідомлення про помилку
        if (city && !city.includes(translations[currentLang].error) && !city.includes(translations[currentLang].loading)) {
            getRealWeather(city);
        } else {
            // Якщо помилка, пробуємо перше місто
            const firstCity = document.querySelector('#cities li');
            if (firstCity) getRealWeather(firstCity.dataset.city);
        }
    });
}