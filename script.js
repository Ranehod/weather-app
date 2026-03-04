const apiKey = 'f39517cf14dab1a8df156c0370063687';

const translations = {
    ua: { humidity: 'Вологість', wind: 'Вітер', loading: 'Завантаження...', error: 'Помилка' },
    en: { humidity: 'Humidity', wind: 'Wind', loading: 'Loading...', error: 'Error' },
    ru: { humidity: 'Влажность', wind: 'Ветер', loading: 'Загрузка...', error: 'Ошибка' }
};

let currentLang = 'ua';

function changeLanguage(lang) {
    currentLang = lang;
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

    cityEl.textContent = city;
    tempEl.textContent = '...';
    condEl.textContent = translations[currentLang].loading;

    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric&lang=${currentLang}`;

    try {
        const res = await fetch(url);
        if (!res.ok) throw new Error(translations[currentLang].error);
        const data = await res.json();

        cityEl.textContent = data.name;
        tempEl.textContent = `${Math.round(data.main.temp)} °C`;
        condEl.textContent = data.weather[0].description;
        humimityEl.innerHTML = `${translations[currentLang].humidity}: ${data.main.humidity} %`;
        windEl.innerHTML = `${translations[currentLang].wind}: ${data.wind.speed} км/ч`;

        window.scrollTo({ top: 0, behavior: 'smooth' });

    } catch (err) {
        cityEl.textContent = translations[currentLang].error;
        condEl.textContent = err.message;
        humEl.innerHTML = '';
        windEl.innerHTML = '';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('#cities li').forEach(li => {
        li.addEventListener('click', () => getRealWeather(li.textContent));
    });

    document.getElementById('lang-ua')?.addEventListener('click', () => changeLanguage('ua'));
    document.getElementById('lang-en')?.addEventListener('click', () => changeLanguage('en'));
    document.getElementById('lang-ru')?.addEventListener('click', () => changeLanguage('ru'));

    const firstCity = document.querySelector('#cities li');
    if (firstCity) getRealWeather(firstCity.textContent);
});

const refreshBtn = document.getElementById('refresh');
if (refreshBtn) {
    refreshBtn.addEventListener('click', () => {
        const city = document.getElementById('cityName').textContent;
        if (city && !city.includes('Помилка')) getRealWeather(city);
        else document.querySelector('#cities li')?.click();
    });
}