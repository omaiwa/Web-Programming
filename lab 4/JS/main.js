const requestLocationModal = document.getElementById("requestLocationModal");
const inputCityModal = document.getElementById("inputCityModal");
const cityError = document.getElementById("cityError");
const addCityButton = document.querySelector("#header button");
const cityList = document.getElementById("cityList");

let cities = []

// display forecast
function renderWeather(city, dailyData) {
    city.title.textContent = city.name;
    city.weatherContainer.innerHTML = "";

    for (let i = 0; i < dailyData.time.length; i++) {
        const dayDiv = document.createElement("div");
        dayDiv.classList.add("weather-entry");
        dayDiv.textContent = `${dailyData.time[i]}: ${dailyData.temperature_2m_max[i]}°C / ${dailyData.temperature_2m_min[i]}°C, ${weatherCodeToText(dailyData.weathercode[i])}`;
        city.weatherContainer.appendChild(dayDiv)
    }
}

// codes to text
function weatherCodeToText(code) {
    const mapping = {
        0: "Ясно",
        1: "Преимущественно ясно",
        2: "Переменная облачность",
        3: "Облачно",
        45: "Туман",
        48: "Морозный туман",
        51: "Малый дождь",
        53: "Умеренный дождь",
        55: "Сильный дождь",
        56: "Ледяной дождь",
        57: "Сильный ледяной дождь",
        61: "Дождь",
        63: "Умеренный дождь",
        65: "Сильный дождь",
        66: "Ледяной дождь",
        67: "Сильный ледяной дождь",
        71: "Снег",
        73: "Умеренный снег",
        75: "Сильный снег",
        77: "Снежные хлопья",
        80: "Ливневый дождь",
        81: "Умеренный ливень",
        82: "Сильный ливень",
        85: "Легкий снегопад",
        86: "Сильный снегопад",
        95: "Гроза",
        96: "Гроза с градом",
        99: "Сильная гроза с градом"
    };
    return mapping[code] || "Неизвестно";
}

// create city card
function createCityCard(name) {
    const card = document.createElement("div");
    card.classList.add("city-card");

    const title = document.createElement("h2");
    title.textContent = name;

    const weatherContainer = document.createElement("div");
    weatherContainer.classList.add("weather-container");

    card.appendChild(title);
    card.appendChild(weatherContainer);
    cityList.appendChild(card);

    return { card, title, weatherContainer };
}

//store city data
function saveCities() {
    const stored = cities.map(c => ({
        name: c.name,
        lat: c.lat,
        lon: c.lon
    }));
    localStorage.setItem("weatherCities", JSON.stringify(stored));
}

function loadCities() {
    const stored = JSON.parse(localStorage.getItem("weatherCities")) || [];

    stored.slice(0, 3).forEach(city => {
        addCity(city, false);
    });
}

// location perms
function showRequestLocationModal() {
    requestLocationModal.classList.remove("hidden");
}

// manual city selection
function showInputCityModal() {
    inputCityModal.classList.remove("hidden");
    cityError.classList.add("hidden");
}

function closeModals() {
    requestLocationModal.classList.add("hidden");
    inputCityModal.classList.add("hidden");
}

// request current geo
function requestLocation() {
    showRequestLocationModal();
    document.getElementById("shareWeather").addEventListener("click", () => {
        closeModals();
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    const city = { name: "Текущее местоположение", lat: pos.coords.latitude, lon: pos.coords.longitude };
                    const card = createCityCard(city.name);
                    city.card = card.card;
                    city.title = card.title;
                    city.weatherContainer = card.weatherContainer;
                    cities.push(city);
                    fetchWeather(city);
                }
            );
        } else {
            showInputCityModal();
        }
    });

    document.getElementById("declineShareWeather").addEventListener("click", () => {
        closeModals();
        showInputCityModal();
    });
}

//добавть город
function addCity(city) {
    if (cities.length >= 3) return;
    const cardObj = createCityCard(city.name);
    city.card = cardObj.card;
    city.title = cardObj.title;
    city.weatherContainer = cardObj.weatherContainer;
    cities.push(city);
    fetchWeather(city);
    saveCities();
}

// получитть произвоаольный город
async function fetchManualCity() {
    const cityInput = document.getElementById("cityName").value.trim();
    if (!cityInput) return;

    try {
        const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cityInput)}`;
        const geoRes = await fetch(geoUrl);
        const geoData = await geoRes.json();

        if (!geoData.results || geoData.results.length === 0) {
            cityError.classList.remove("hidden");
            return;
        }

        const { latitude, longitude, name } = geoData.results[0];
        const city = {
            name,
            lat: latitude,
            lon: longitude
        };

        addCity(city);
        closeModals();
    } catch (err) {
        cityError.classList.remove("hidden");
    }
}

// fetch weather by specified geo
async function fetchWeather(city) {
    try {
        city.weatherContainer.textContent = "Загрузка погоды...";
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${city.lat}&longitude=${city.lon}&daily=temperature_2m_max,temperature_2m_min,weathercode&timezone=auto`;
        const response = await fetch(url);
        if (!response.ok) throw new Error("Не удалось получить данные");
        const data = await response.json();
        renderWeather(city, data.daily);
    } catch (err) {
        city.weatherContainer.textContent = `Ошибка fetchWeather: ${err.message}`;
    }
}

//listeners
document.querySelectorAll("#inputCityModal #addCity")[0]?.addEventListener("click", fetchManualCity);
document.querySelectorAll("#inputCityModal #declineShareWeather")[0]?.addEventListener("click", closeModals);
addCityButton.addEventListener("click", showInputCityModal);

//init
loadCities();
requestLocation();