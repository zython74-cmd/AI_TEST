// app.js

const State = {
    lat: 37.5665,
    lon: 126.9780, // Default to Seoul
    locationName: "현위치 파악 중...",
    weatherData: null,
    airQualityData: null,
};

// Weather codes from MET Norway to labels and icons
const weatherMap = {
    clearsky_day: { label: "맑음", file: "clearsky_day.svg" },
    clearsky_night: { label: "맑음 (밤)", file: "clearsky_night.svg" },
    clearsky_polartwilight: { label: "맑음", file: "clearsky_polartwilight.svg" },
    fair_day: { label: "화창함", file: "fair_day.svg" },
    fair_night: { label: "화창함 (밤)", file: "fair_night.svg" },
    fair_polartwilight: { label: "화창함", file: "fair_polartwilight.svg" },
    partlycloudy_day: { label: "구름 조금", file: "partlycloudy_day.svg" },
    partlycloudy_night: { label: "구름 조금 (밤)", file: "partlycloudy_night.svg" },
    partlycloudy_polartwilight: { label: "구름 조금", file: "partlycloudy_polartwilight.svg" },
    cloudy: { label: "흐림", file: "cloudy.svg" },
    rainshowers_day: { label: "소나기", file: "rainshowers_day.svg" },
    rainshowers_night: { label: "소나기 (밤)", file: "rainshowers_night.svg" },
    rainshowers_polartwilight: { label: "소나기", file: "rainshowers_polartwilight.svg" },
    rainshowersandthunder_day: { label: "소나기와 천둥", file: "rainshowersandthunder_day.svg" },
    rainshowersandthunder_night: { label: "소나기와 천둥 (밤)", file: "rainshowersandthunder_night.svg" },
    rainshowersandthunder_polartwilight: { label: "소나기와 천둥", file: "rainshowersandthunder_polartwilight.svg" },
    sleetshowers_day: { label: "진눈깨비", file: "sleetshowers_day.svg" },
    sleetshowers_night: { label: "진눈깨비 (밤)", file: "sleetshowers_night.svg" },
    sleetshowers_polartwilight: { label: "진눈깨비", file: "sleetshowers_polartwilight.svg" },
    snowshowers_day: { label: "눈 소나기", file: "snowshowers_day.svg" },
    snowshowers_night: { label: "눈 소나기 (밤)", file: "snowshowers_night.svg" },
    snowshowers_polartwilight: { label: "눈 소나기", file: "snowshowers_polartwilight.svg" },
    rain: { label: "비", file: "rain.svg" },
    heavyrain: { label: "폭우", file: "heavyrain.svg" },
    heavyrainandthunder: { label: "강한 천둥번개구름", file: "heavyrainandthunder.svg" },
    sleet: { label: "진눈깨비", file: "sleet.svg" },
    snow: { label: "눈", file: "snow.svg" },
    snowandthunder: { label: "눈과 천둥", file: "snowandthunder.svg" },
    fog: { label: "안개", file: "fog.svg" },
    default: { label: "날씨 바이브", file: "cloudy.svg" }
};

const ICON_BASE_URL = "https://raw.githubusercontent.com/metno/weathericons/main/weather/svg/";

document.addEventListener("DOMContentLoaded", () => {
    // 1. Set current date formatted
    const now = new Date();
    const dateOptions = { month: 'long', day: 'numeric', weekday: 'long' };
    document.getElementById("current-date").textContent = now.toLocaleDateString("ko-KR", dateOptions);

    // 2. Fetch Geolocation
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                State.lat = position.coords.latitude;
                State.lon = position.coords.longitude;
                await fetchLocationName();
                fetchAllData();
            },
            async (err) => {
                console.warn("Geolocation denied/failed. Fallback to Seoul.", err);
                State.locationName = "서울특별시 (Seoul)";
                fetchAllData();
            },
            { timeout: 10000 }
        );
    } else {
        console.warn("Geolocation not supported. Fallback to Seoul.");
        State.locationName = "서울특별시 (Seoul)";
        fetchAllData();
    }
});

async function fetchLocationName() {
    try {
        const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${State.lat}&lon=${State.lon}&accept-language=ko`);
        const data = await response.json();
        
        if (data && data.address) {
            State.locationName = data.address.city || data.address.town || data.address.borough || data.address.suburb || "현위치";
        } else {
            State.locationName = "현위치";
        }
    } catch (e) {
        console.error("Failed to fetch location name", e);
        State.locationName = "현위치";
    }
}

async function fetchAllData() {
    document.getElementById("location-name").textContent = State.locationName;
    
    try {
        await Promise.all([fetchWeather(), fetchAirQuality()]);
        updateUI();
    } catch (e) {
        console.error("Error fetching data:", e);
        document.getElementById("location-name").textContent = "데이터를 불러올 수 없습니다.";
    }
}

async function fetchWeather() {
    const headers = new Headers({
        "User-Agent": "MZWeatherApp_KR/1.0"
    });
    
    const lat = State.lat.toFixed(4);
    const lon = State.lon.toFixed(4);
    
    const url = `https://api.met.no/weatherapi/locationforecast/2.0/compact?lat=${lat}&lon=${lon}`;
    
    const response = await fetch(url, { headers });
    if (!response.ok) throw new Error("MET Norway API Error");
    State.weatherData = await response.json();
}

async function fetchAirQuality() {
    const url = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${State.lat}&longitude=${State.lon}&current=pm10,pm2_5&timezone=auto`;
    const response = await fetch(url);
    if (!response.ok) throw new Error("Open Meteo API Error");
    const data = await response.json();
    State.airQualityData = data.current;
}

function updateUI() {
    if (!State.weatherData || !State.airQualityData) return;

    // --- Current Weather ---
    const timeseries = State.weatherData.properties.timeseries;
    const currentSeries = timeseries[0];
    const currentDetails = currentSeries.data.instant.details;
    
    let currentSummary = "cloudy";
    if (currentSeries.data.next_1_hours) currentSummary = currentSeries.data.next_1_hours.summary.symbol_code;
    else if (currentSeries.data.next_6_hours) currentSummary = currentSeries.data.next_6_hours.summary.symbol_code;
    
    document.getElementById("current-temp").textContent = Math.round(currentDetails.air_temperature);
    document.getElementById("wind-val").textContent = currentDetails.wind_speed;
    document.getElementById("humidity-val").textContent = Math.round(currentDetails.relative_humidity);
    
    const weatherInfo = weatherMap[currentSummary] || weatherMap.default;
    document.getElementById("current-condition").textContent = weatherInfo.label;
    
    const iconEl = document.getElementById("current-icon");
    iconEl.src = ICON_BASE_URL + weatherInfo.file;
    iconEl.style.display = "block";
    iconEl.classList.add("fade-in");
    
    // --- Air Quality ---
    const pm10 = State.airQualityData.pm10 || 0;
    const pm25 = State.airQualityData.pm2_5 || 0;
    
    document.getElementById("pm10-value").textContent = Math.round(pm10);
    document.getElementById("pm25-value").textContent = Math.round(pm25);
    
    updateAQICard("pm10-status", "pm10-card", pm10, "pm10");
    updateAQICard("pm25-status", "pm25-card", pm25, "pm25");

    // --- 24 Hour Forecast ---
    const forecastContainer = document.getElementById("forecast-container");
    forecastContainer.innerHTML = ""; // Empty loader
    
    // Slice next 24 elements for 24-hours forecast
    const next24 = timeseries.slice(1, 25);
    
    next24.forEach((period, index) => {
        const time = new Date(period.time);
        const hours = time.getHours();
        
        // Display '지금' if it's the very first, otherwise hour format
        const displayTime = index === 0 ? "1시간 후" : `${hours.toString().padStart(2, '0')}시`;
        
        const temp = Math.round(period.data.instant.details.air_temperature);
        
        let code = "cloudy";
        if (period.data.next_1_hours) code = period.data.next_1_hours.summary.symbol_code;
        else if (period.data.next_6_hours) code = period.data.next_6_hours.summary.symbol_code;
        
        const wInfo = weatherMap[code] || weatherMap.default;
        
        const item = document.createElement("div");
        item.className = "forecast-item fade-in";
        item.style.animationDelay = `${index * 0.05}s`; // Staggered animation
        item.innerHTML = `
            <span class="forecast-time">${displayTime}</span>
            <img src="${ICON_BASE_URL}${wInfo.file}" class="forecast-icon" alt="${wInfo.label}" />
            <span class="forecast-temp">${temp}°</span>
        `;
        forecastContainer.appendChild(item);
    });
}

function updateAQICard(statusId, cardId, value, type) {
    const statusEl = document.getElementById(statusId);
    
    let statusText = "좋음";
    let statusClass = "aqi-good";
    
    // Basic Korean thresholds logic
    if (type === "pm10") {
        if (value > 30) { statusText = "보통"; statusClass = "aqi-moderate"; }
        if (value > 80) { statusText = "나쁨"; statusClass = "aqi-bad"; }
        if (value > 150) { statusText = "매우나쁨"; statusClass = "aqi-vbad"; }
    } else {
        if (value > 15) { statusText = "보통"; statusClass = "aqi-moderate"; }
        if (value > 35) { statusText = "나쁨"; statusClass = "aqi-bad"; }
        if (value > 75) { statusText = "매우나쁨"; statusClass = "aqi-vbad"; }
    }
    
    statusEl.textContent = statusText;
    statusEl.className = `aqi-status ${statusClass}`;
}
