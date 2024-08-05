import * as API from "./api.js";
import * as DOM from "./dom.js";
import * as Theme from "./theme.js";
import { detectPosition } from "./geolocation.js";

let globalTimeZoneOffset = 0;

async function getData(city = "cairo") {
  const weatherData = await API.fetchWeatherData("current", city);
  const sunTimes = await API.fetchSunTimes();
  const forecastJSON = await API.fetchWeatherData("forecast", city);
  const timeZoneOffset = await API.fetchTimeZoneOffset(
    weatherData.location.lat,
    weatherData.location.lon
  );

  globalTimeZoneOffset = timeZoneOffset.rawOffset + timeZoneOffset.dstOffset;
  if (weatherData) {
    DOM.updateCityAndTime(weatherData);
    DOM.updateWeatherInfo(weatherData, sunTimes);
    DOM.updateHourlyForecast(forecastJSON);

    const daysInfo = await API.fetchDailyForecast(city);
    DOM.updateDailyForecast(daysInfo);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  getData();
  Theme.setTheme();
  initAutocomplete();
  setupEventListeners();
  Loading();
});

function setupEventListeners() {
  const searchCity = document.querySelector(".search-bar input");
  searchCity.addEventListener("keyup", handleSearchInput);
  searchCity.addEventListener("blur", handleSearchInput);

  document.querySelector(".current-location").addEventListener("click", () => {
    detectPosition(getData);
  });

  document.querySelector(".theme-toggle").addEventListener("click", () => {
    Theme.toggleTheme();
    const activeTheme = document.documentElement.className;
    localStorage.setItem("theme", activeTheme);
  });
}

function handleSearchInput(event) {
  if (event.type === "keyup" && event.keyCode !== 13) return;
  const city = event.target.value.toLowerCase();
  getData(city);
}

let autocomplete = 0;
function initAutocomplete() {
  autocomplete = new google.maps.places.Autocomplete(
    document.getElementById("autocomplete"),
    {
      types: ["establishment"],
      fields: ["place_id", "geometry", "name"],
    }
  );
}

let cardsEle = document.querySelectorAll(".card img");

cardsEle.forEach((card) => {
  card.addEventListener("DOMContentLoaded", () => {
    document.body.style.cssText += "background-color: white;";
  });
});

setInterval(() => DOM.updateClock(globalTimeZoneOffset), 1000);

let infoEle = document.querySelector(".weather");

let dailyEle = document.querySelector(".daily-forecast");

let tempSunEle = document.querySelector(".first-column");

let stateEle = document.querySelector(".state");

const mediaQuery1130 = window.matchMedia("(max-width: 1130px)");

const mediaQuery420 = window.matchMedia("(max-width: 420px)");

function handleMediaQueryChange(event) {
  if (event.matches) {
    document.querySelector(".city-time-date").prepend(tempSunEle);
    document.querySelector(".city-time-date").append(stateEle);
    document.querySelector("main").append(dailyEle);
    document.querySelector("main").append(infoEle);
  } else {
    document.querySelector(".weather").prepend(stateEle);
    document.querySelector(".weather").prepend(tempSunEle);
  }
}
document.querySelector(".current-location").addEventListener("click", () => {
  detectPosition();
});

handleMediaQueryChange(mediaQuery1130, tempSunEle);
mediaQuery1130.addEventListener("change", handleMediaQueryChange);

let changeSearchbarIndex = (event) => {
  if (event.matches) {
    document
      .querySelector("header")
      .append(document.querySelector(".search-bar"));
  }
};

changeSearchbarIndex(mediaQuery420);
mediaQuery420.addEventListener("change", changeSearchbarIndex);

function Loading() {
  document.querySelectorAll(".card").forEach((card) => {
    Array.from(card.children).forEach((child) => {
      child.style.opacity = "0";
    });
    const loader = document.createElement("div");
    loader.textContent = "Loading...";
    loader.className = "loader";
    card.style.position = "relative";
    loader.style.cssText +=
      "position:absolute; left:50%; top:50%; translate: -50% -50%;";
    card.appendChild(loader);
  });

  window.addEventListener("load", () => {
    document.querySelectorAll(".card").forEach((card) => {
      const loader = card.querySelector(".loader");
      if (loader) {
        card.removeChild(loader);
      }
      Array.from(card.children).forEach((child) => {
        child.style.opacity = "";
      });
    });
  });
}
