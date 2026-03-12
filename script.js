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
let favoriteCities = JSON.parse(localStorage.getItem('favoriteCities')) || [];
let currentCityKey = '';

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

async function getForecast(city) {
    const forecastContainer = document.getElementById('forecast-container');
    if (!forecastContainer) return;

    const url = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric&lang=${currentLang}`;

    try {
        const res = await fetch(url);
        if (!res.ok) throw new Error('Помилка прогнозу');
        const data = await res.json();

        forecastContainer.innerHTML = '';

        for (let i = 0; i < data.list.length; i += 8) {
            const item = data.list[i];
            const date = new Date(item.dt * 1000);
            const dayName = date.toLocaleDateString('uk-UA', { weekday: 'short' });
            const temp = Math.round(item.main.temp);
            const description = item.weather[0].description;
            const icon = getWeatherIcon(description);

            const card = document.createElement('div');
            card.className = 'forecast-card';
            card.innerHTML = `
                <div class="forecast-day">${dayName}</div>
                <i class="fas ${icon} forecast-icon"></i>
                <div class="forecast-temp">${temp}°C</div>
                <div class="forecast-desc">${description}</div>
            `;
            forecastContainer.appendChild(card);
        }

    } catch (error) {
        console.error('Помилка прогнозу:', error);
        forecastContainer.innerHTML = '<p style="color: #999;">Не вдалося завантажити прогноз</p>';
    }
}

function saveFavorites() {
    localStorage.setItem('favoriteCities', JSON.stringify(favoriteCities));
}

function addToFavorites(cityName, cityDataKey) {
    const city = { name: cityName, dataKey: cityDataKey };
    if (!favoriteCities.some(c => c.dataKey === cityDataKey)) {
        favoriteCities.push(city);
        saveFavorites();
        updateFavoritesList();
        updateStarIcons();
    }
}

function removeFromFavorites(cityDataKey) {
    favoriteCities = favoriteCities.filter(c => c.dataKey !== cityDataKey);
    saveFavorites();
    updateFavoritesList();
    updateStarIcons();
}

function updateFavoritesList() {
    const favList = document.getElementById('favorites-list');
    if (!favList) return;
    if (favoriteCities.length === 0) {
        favList.innerHTML = '';
        return;
    }
    favList.innerHTML = favoriteCities.map(city => 
        `<li data-city="${city.dataKey}">
            ${city.name}
            <span class="remove-star" onclick="event.stopPropagation(); removeFromFavorites('${city.dataKey}')">✕</span>
        </li>`
    ).join('');
    document.querySelectorAll('#favorites-list li').forEach(li => {
        li.addEventListener('click', (e) => {
            if (e.target.classList.contains('remove-star')) return;
            const cityKey = li.dataset.city;
            const cityName = favoriteCities.find(c => c.dataKey === cityKey)?.name || cityKey;
            getRealWeather(cityName);
        });
    });
}

function updateStarIcons() {
    document.querySelectorAll('#cities li').forEach(li => {
        const star = li.querySelector('.star');
        const cityKey = li.dataset.city;
        if (star) {
            if (favoriteCities.some(c => c.dataKey === cityKey)) {
                star.textContent = '★';
                star.classList.add('active');
            } else {
                star.textContent = '☆';
                star.classList.remove('active');
            }
        }
    });
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

    currentCityKey = city;

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

            const nowUTC = Date.now() / 1000;
            const sunrise = data.sys.sunrise + data.timezone;
            const sunset = data.sys.sunset + data.timezone;
            const currentLocal = nowUTC + data.timezone;

            if (currentLocal < sunrise || currentLocal > sunset) {
                document.body.classList.add('night');
            } else {
                document.body.classList.remove('night');
            }
        }

        await getForecast(city);

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
        const star = li.querySelector('.star');
        if (star) {
            star.addEventListener('click', (e) => {
                e.stopPropagation();
                const cityKey = li.dataset.city;
                const cityName = li.textContent.replace('☆', '').replace('★', '').trim();
                if (favoriteCities.some(c => c.dataKey === cityKey)) {
                    removeFromFavorites(cityKey);
                } else {
                    addToFavorites(cityName, cityKey);
                }
            });
        }
        li.addEventListener('click', (e) => {
            if (e.target.classList.contains('star')) return;
            getRealWeather(li.dataset.city);
        });
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
    updateFavoritesList();
    updateStarIcons();
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