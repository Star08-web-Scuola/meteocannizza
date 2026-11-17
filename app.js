document.addEventListener("DOMContentLoaded", () => {
    const cityInput = document.getElementById("cityIn");
    const btnGo = document.getElementById("goMeteo");
    const tempEl = document.getElementById("temp");
    const whereEl = document.getElementById("where");
    const statusEl = document.getElementById("status");
    const bgEl = document.getElementById("bg");

    btnGo.addEventListener("click", () => {
        const city = cityInput.value.trim();
        if (city !== "") {
            getCoordinates(city);
        } else {
            alert("Inserisci il nome di una città!");
        }
    });

    cityInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
            btnGo.click();
        }
    });

    function getCoordinates(cityName) {
        const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cityName)}&count=1&language=it&format=json`;
        const xhrGeo = new XMLHttpRequest();

        xhrGeo.open("GET", geoUrl, true);

        xhrGeo.onload = function () {
            if (xhrGeo.status >= 200 && xhrGeo.status < 300) {
                const data = JSON.parse(xhrGeo.responseText);

                if (data.results && data.results.length > 0) {
                    const location = data.results[0];
                    const lat = location.latitude;
                    const lon = location.longitude;
                    const fullName = `${location.name}${location.admin1 ? ", " + location.admin1 : ""} (${location.country_code})`;

                    // Passa alle previsioni meteo
                    getWeather(lat, lon, fullName);
                } else {
                    whereEl.textContent = "Città non trovata";
                    tempEl.textContent = "--°C";
                    statusEl.textContent = "Controlla il nome inserito e riprova.";
                }
            } else {
                statusEl.textContent = "Errore nella ricerca della città.";
            }
        };

        xhrGeo.onerror = function () {
            statusEl.textContent = "Errore di connessione di rete.";
        };

        xhrGeo.send();
    }

    function getWeather(lat, lon, fullName) {

        const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,is_day,weather_code&timezone=auto`;
        const xhrWeather = new XMLHttpRequest();

        xhrWeather.open("GET", weatherUrl, true);

        xhrWeather.onload = function () {
            if (xhrWeather.status >= 200 && xhrWeather.status < 300) {
                const weatherData = JSON.parse(xhrWeather.responseText);
                const current = weatherData.current;

                const temperature = Math.round(current.temperature_2m);
                const weatherCode = current.weather_code;
                const isDay = current.is_day;

                tempEl.textContent = `${temperature}°C`;
                whereEl.textContent = fullName;
              statusEl.textContent = decodeWeatherCode(weatherCode);
                updateBackground(weatherCode, isDay);
            } else {
                statusEl.textContent = "Errore nel recupero dei dati meteo.";
            }
        };

        xhrWeather.onerror = function () {
            statusEl.textContent = "Errore di connessione al servizio meteo.";
        };

        xhrWeather.send();
    }

    function decodeWeatherCode(code) {
        const codes = {
            0: "Cielo sereno ☀️",
            1: "Prevalentemente sereno 🌤️",
            2: "Parzialmente nuvoloso ⛅",
            3: "Nuvoloso ☁️",
            45: "Nebbia 🌫️",
            48: "Nebbia con brina 🌫️",
            51: "Pioggerella leggera 🌦️",
            53: "Pioggerella moderata 🌦️",
            55: "Pioggerella densa 🌧️",
            61: "Pioggia debole 🌧️",
            63: "Pioggia moderata 🌧️",
            65: "Pioggia forte 🌧️",
            71: "Neve debole 🌨️",
            73: "Neve moderata 🌨️",
            75: "Neve forte ❄️",
            80: "Rovesci di pioggia leggeri 🌦️",
            81: "Rovesci di pioggia moderati 🌧️",
            82: "Rovesci di pioggia violenti ⛈️",
            95: "Temporale ⛈️",
            96: "Temporale con grandine leggera ⛈️",
            99: "Temporale con grandine forte ⛈️"
        };
        return codes[code] || "Condizioni meteo non definite";
    }

    function updateBackground(code, isDay) {
        bgEl.className = "bg";

        if (isDay === 0) {
            bgEl.classList.add("night");
        } else if (code === 0 || code === 1) {
            bgEl.classList.add("sunny");
        } else if (code >= 2 && code <= 48) {
            bgEl.classList.add("cloudy");
        } else {
            bgEl.classList.add("rainy");
        }
    }
});
