const apiKey = 'f39517cf14dab1a8df156c0370063687';

const translations = {
    ua: { humidity: 'Вологість', wind: 'Вітер', loading: 'Завантаження...', error: 'Помилка' },
    en: { humidity: 'Humidity', wind: 'Wind', loading: 'Loading...', error: 'Error' },
    ru: { humidity: 'Влажность', wind: 'Ветер', loading: 'Загрузка...', error: 'Ошибка' }
};

let currentLang = 'ua';

    function getWeatherIcon(condition) {
    const iconMap = {
        'clear': 'fa-sun',
        'sun': 'fa-sun',
        'cloud': 'fa-cloud',
        'clouds': 'fa-cloud',
        'rain': 'fa-cloud-rain',
        'drizzle': 'fa-cloud-rain',
        'thunderstorm': 'fa-cloud-bolt',
        'snow': 'fa-snowflake',
        'mist': 'fa-smog',
        'fog': 'fa-smog',
        'haze': 'fa-smog',
        'ясно': 'fa-sun',
        'сонячно': 'fa-sun',
        'хмарно': 'fa-cloud',
        'дощ': 'fa-cloud-rain',
        'злива': 'fa-cloud-rain',
        'гроза': 'fa-cloud-bolt',
        'сніг': 'fa-snowflake',
        'туман': 'fa-smog',
        'імла': 'fa-smog',
        'ясно': 'fa-sun',
        'солнечно': 'fa-sun',
        'облачно': 'fa-cloud',
        'дождь': 'fa-cloud-rain',
        'ливень': 'fa-cloud-rain',
        'гроза': 'fa-cloud-bolt',
        'снег': 'fa-snowflake',
        'туман': 'fa-smog',
        'мгла': 'fa-smog',
    };
    const lower = condition.toLowerCase();
    for (let key in iconMap) {
        if (lower.includes(key)) {
            return iconMap[key];
        }
    }
    return 'fa-cloud-sun';
}

function changeLanguage(lang) {
    currentLang = lang;
    document.querySelectorAll('.lang-btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById(`lang-${lang}`).classList.add('active');
    
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

        const iconName = getWeatherIcon(data.weather[0].description);
     iconEl.className = `fas ${iconName}`;

        window.scrollTo({ top: 0, behavior: 'smooth' });

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
        li.addEventListener('click', () => getRealWeather(li.textContent));
    });

    document.getElementById('lang-ua').addEventListener('click', () => changeLanguage('ua'));
    document.getElementById('lang-en').addEventListener('click', () => changeLanguage('en'));
    document.getElementById('lang-ru').addEventListener('click', () => changeLanguage('ru'));

    const firstCity = document.querySelector('#cities li');
    if (firstCity) getRealWeather(firstCity.textContent);
});

const refreshBtn = document.getElementById('refreshBtn'); 
if (refreshBtn) {
    refreshBtn.addEventListener('click', () => {
        const city = document.getElementById('cityName').textContent;
        if (city && !city.includes('Помилка') && !city.includes('Loading')) {
            getRealWeather(city);
        } else {
            const firstCity = document.querySelector('#cities li');
            if (firstCity) getRealWeather(firstCity.textContent);
        }
    });
}