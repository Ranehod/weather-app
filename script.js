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

let currentLang = 'ua';

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

function updateUILanguage() {
    const refreshBtn = document.getElementById('refreshBtn');
    if (refreshBtn) {
        refreshBtn.textContent = translations[currentLang].refresh;
    }
}

function changeLanguage(lang) {
    currentLang = lang;
    document.querySelectorAll('.lang-btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById(`lang-${lang}`).classList.add('active');
    updateUILanguage();

    const city = document.getElementById('cityName').textContent;
    if (city && !city.includes('Помилка') && !city.includes('Loading')) {
        getRealWeather(city);
    }
}

async function getRealWeather(city) {
    const cityEl = document.getElementById('cityName');
    const tempEl = document.getElementById('temp');
    const condEl = document.getElementById('condition');
    const humEl = document.getElementById('humidity');
    const windEl = document.getElementById('wind');
    const iconEl = document.getElementById('weatherIcon');

    cityEl.textContent = city;
    tempEl.textContent = '...';
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
        condEl.textContent = data.weather[0].description;
        humEl.innerHTML = `${translations[currentLang].humidity}: ${data.main.humidity} %`;
        windEl.innerHTML = `${translations[currentLang].wind}: ${data.wind.speed} км/ч`;
        iconEl.className = `fas ${getWeatherIcon(data.weather[0].description)}`;

    } catch (err) {
        cityEl.textContent = translations[currentLang].error;
        condEl.textContent = err.message;
        humEl.innerHTML = '';
        windEl.innerHTML = '';
        iconEl.className = 'fas fa-exclamation-triangle';
        console.error('Помилка API:', err);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('#cities li').forEach(li => {
        li.addEventListener('click', () => getRealWeather(li.dataset.city));
    });

    document.getElementById('lang-ua').addEventListener('click', () => changeLanguage('ua'));
    document.getElementById('lang-en').addEventListener('click', () => changeLanguage('en'));
    document.getElementById('lang-ru').addEventListener('click', () => changeLanguage('ru'));

    const firstCity = document.querySelector('#cities li');
    if (firstCity) getRealWeather(firstCity.textContent);

    updateUILanguage();
});

const refreshBtn = document.getElementById('refreshBtn');
if (refreshBtn) {
    refreshBtn.addEventListener('click', () => {
        const city = document.getElementById('cityName').textContent;
        if (city && !city.includes('Помилка') && !city.includes('Loading')) {
            getRealWeather(city);
        } else {
            document.querySelector('#cities li')?.click();
        }
    });
}