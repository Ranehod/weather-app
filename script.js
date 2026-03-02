// ТВІЙ API КЛЮЧ (встав сюди свій! отримай на openweathermap.org)
const apiKey = 'f39517cf14dab1a8df156c0370063687'; // <-- ЗАМІНИ ЦЕ НА СПРАВЖНІЙ КЛЮЧ

async function getRealWeather(city) {
    // Отримуємо елементи з HTML
    const cityNameElement = document.getElementById('cityName');
    const tempElement = document.getElementById('temp');
    const conditionElement = document.getElementById('condition');
    const humidityElement = document.getElementById('humidity');
    const windElement = document.getElementById('wind');

    // Показуємо, що завантажується
    cityNameElement.textContent = city;
    tempElement.textContent = '...';
    conditionElement.textContent = 'Завантаження...';

    // Правильна адреса для запиту (units=metric — для Цельсія, lang=ua — для української мови)
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric&lang=ua`;

    try {
        const response = await fetch(url);

        if (!response.ok) {
            if (response.status === 404) {
                throw new Error('Місто не знайдено 😢');
            } else {
                throw new Error('Помилка при завантаженні даних');
            }
        }

        const data = await response.json();

        // Оновлюємо HTML отриманими даними
        cityNameElement.textContent = data.name;
        tempElement.textContent = `${Math.round(data.main.temp)} °C`;
        conditionElement.textContent = data.weather[0].description;
        humidityElement.textContent = `Вологість: ${data.main.humidity} %`;
        windElement.textContent = `Вітер: ${data.wind.speed} км/ч`;

    } catch (error) {
        cityNameElement.textContent = 'Помилка 😕';
        tempElement.textContent = '';
        conditionElement.textContent = error.message;
        humidityElement.textContent = '';
        windElement.textContent = '';
        console.error('Помилка API:', error);
    }
}

// Цей код запускається, коли вся HTML-сторінка завантажилась
document.addEventListener('DOMContentLoaded', function() {
    // Знаходимо всі елементи списку з id="cities"
    const cities = document.querySelectorAll('#cities li');

    cities.forEach(city => {
        city.addEventListener('click', function() {
            getRealWeather(this.textContent); // Викликаємо функцію з назвою міста
        });
    });

    // Завантажуємо погоду для першого міста в списку при старті
    const firstCity = document.querySelector('#cities li');
    if (firstCity) {
        getRealWeather(firstCity.textContent);
    }
});

// Кнопка "Оновити"
const refreshBtn = document.getElementById('refresh');
if (refreshBtn) {
    refreshBtn.addEventListener('click', function() {
        const currentCity = document.getElementById('cityName').textContent;
        // Перевіряємо, чи це не повідомлення про помилку
        if (currentCity && !currentCity.includes('Помилка')) {
            getRealWeather(currentCity);
        } else {
            const firstCity = document.querySelector('#cities li');
            if (firstCity) {
                getRealWeather(firstCity.textContent);
            }
        }
    });
}