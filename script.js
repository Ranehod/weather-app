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
    if (city && !city.includes(translations[currentLang].error) && !city.includes(translations[currentLang].loading)) {
        getRealWeather(city);
    }
}

async function getRealWeather(city) {
    const cityEl = document.getElementById('cityName');
    const tempEl = document.getElementById('temp');
    const feelsLikeEl = document.getElementById('feelsLike');
    const condEl = document.getElementById('condition');
    const humEl = document.getElementById('humidity');
    const windEl = document.getElementById('wind');
    const iconEl = document.getElementById('weatherIcon');
    const sunriseEl = document.getElementById('sunrise');
    const sunsetEl = document.getElementById('sunset');

    cityEl.textContent = city;
    tempEl.textContent = '...';
    feelsLikeEl.textContent = '';
    condEl.textContent = translations[currentLang].loading;
    humEl.innerHTML = '';
    windEl.innerHTML = '';
    iconEl.className = 'fas fa-spinner fa-pulse';
    if (sunriseEl) sunriseEl.textContent = '--:--';
    if (sunsetEl) sunsetEl.textContent = '--:--';

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

        if (sunriseEl && sunsetEl && data.sys) {
            const timezoneOffset = data.timezone;
            const sunriseDate = new Date((data.sys.sunrise + timezoneOffset) * 1000);
            const sunsetDate = new Date((data.sys.sunset + timezoneOffset) * 1000);
            sunriseEl.textContent = sunriseDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            sunsetEl.textContent = sunsetDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        }

    } catch (error) {
        console.error('Помилка API:', error);
        cityEl.textContent = translations[currentLang].error;
        condEl.textContent = error.message;
        tempEl.textContent = '';
        feelsLikeEl.textContent = '';
        humEl.innerHTML = '';
        windEl.innerHTML = '';
        iconEl.className = 'fas fa-exclamation-triangle';
        if (sunriseEl) sunriseEl.textContent = '--:--';
        if (sunsetEl) sunsetEl.textContent = '--:--';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('#cities li').forEach(li => {
        li.addEventListener('click', () => getRealWeather(li.dataset.city));
    });

    document.getElementById('lang-ua').addEventListener('click', () => changeLanguage('ua'));
    document.getElementById('lang-en').addEventListener('click', () => changeLanguage('en'));
    document.getElementById('lang-ru').addEventListener('click', () => changeLanguage('ru'));

    const searchBtn = document.getElementById('searchBtn');
    const cityInput = document.getElementById('cityInput');
    if (searchBtn && cityInput) {
     searchBtn.addEventListener('click', () => {
            const city = cityInput.value.trim();
            if (city) {
                getRealWeather(city);
                cityInput.value = '';
            } else {
                alert('Введіть назву міста');
            }
        });
        cityInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                searchBtn.click();
            }
        });
    }

    const firstCity = document.querySelector('#cities li');
    if (firstCity) getRealWeather(firstCity.dataset.city);

    updateUILanguage();
});


const refreshBtn = document.getElementById('refreshBtn');
if (refreshBtn) {
    refreshBtn.addEventListener('click', () => {
        const city = document.getElementById('cityName').textContent;
        if (city && !city.includes(translations[currentLang].error) && !city.includes(translations[currentLang].loading)) {
            getRealWeather(city);
        } else {
            const firstCity = document.querySelector('#cities li');
            if (firstCity) getRealWeather(firstCity.dataset.city);
        }
    });
}