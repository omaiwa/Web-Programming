const cityTitle = document.getElementById("city1");
const weatherContainer = document.getElementById("weatherContainer1");
const requestLocationModal = document.getElementById("requestLocationModal");
const inputCityModal = document.getElementById("inputCityModal");
const cityError = document.getElementById("cityError");
const addCityButton = document.querySelector("#header button");

// loading screen
function showLoading() {
    weatherContainer.textContent = "Загрузка погоды...";
}

// error
function showError(message) {
    weatherContainer.textContent = `Ошибка: ${message}`;
}

// display forecast
function renderWeather(cityName, dailyData) {
    cityTitle.textContent = cityName;
    weatherContainer.innerHTML = "";
    for (let i = 0; i < dailyData.time.length; i++) {
        const dayDiv = document.createElement("div");
        dayDiv.classList.add("weather-entry");
        dayDiv.textContent = `${dailyData.time[i]}: ${dailyData.temperature_2m_max[i]}°C / ${dailyData.temperature_2m_min[i]}°C, ${weatherCodeToText(dailyData.weathercode[i])}`;
        weatherContainer.appendChild(dayDiv);
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

// fetch weather by specified geo
async function fetchWeather(lat, lon, cityName = "Текущее местоположение") {
    showLoading();
    try {
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=temperature_2m_max,temperature_2m_min,weathercode&timezone=auto`;
        const response = await fetch(url);
        if (!response.ok) throw new Error("Не удалось получить данные");
        const data = await response.json();
        renderWeather(cityName, data.daily);
    } catch (err) {
        showError(err.message);
    }
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
                    const { latitude, longitude } = pos.coords;
                    fetchWeather(latitude, longitude);
                },
                () => {
                    showInputCityModal();
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

async function fetchManualCity() {
    const cityInput = document.getElementById("playerName").value.trim();
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
        fetchWeather(latitude, longitude, name);
        closeModals();
    } catch (err) {
        cityError.classList.remove("hidden");
    }
}

//listeners
document.querySelectorAll("#inputCityModal #shareWeather")[0]?.addEventListener("click", fetchManualCity);
document.querySelectorAll("#inputCityModal #declineShareWeather")[0]?.addEventListener("click", closeModals);

addCityButton.addEventListener("click", showInputCityModal);

//init
requestLocation();