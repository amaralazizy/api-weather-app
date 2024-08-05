import * as API from "./api.js";
import * as DOM from "./dom.js";
// import * as Utils from "./utils.js";
import * as Theme from "./theme.js";
import { detectPosition } from "./geolocation.js";
// const daysOfWeek = [
//   { short: "Mon", long: "Monday" },
//   { short: "Tue", long: "Tuesday" },
//   { short: "Wed", long: "Wednesday" },
//   { short: "Thu", long: "Thursday" },
//   { short: "Fri", long: "Friday" },
//   { short: "Sat", long: "Saturday" },
//   { short: "Sun", long: "Sunday" },
// ];

// const monthsOfYear = [
//   { short: "Jan", long: "January" },
//   { short: "Feb", long: "February" },
//   { short: "Mar", long: "March" },
//   { short: "Apr", long: "April" },
//   { short: "May", long: "May" },
//   { short: "Jun", long: "June" },
//   { short: "Jul", long: "July" },
//   { short: "Aug", long: "August" },
//   { short: "Sep", long: "September" },
//   { short: "Oct", long: "October" },
//   { short: "Nov", long: "November" },
//   { short: "Dec", long: "December" },
// ];

let globalTimeZoneOffset = 0;

// function detectPosition() {
//   if (navigator.geolocation) {
//     navigator.geolocation.getCurrentPosition(sendPosition, showError);
//   } else {
//     console.log("Geolocation is not supported by this browser.");
//   }

//   function sendPosition(position) {
//     let latitude = position.coords.latitude;
//     let longitude = position.coords.longitude;
//     let city = `${latitude},${longitude}`;
//     getData(city);
//   }

//   function showError(error) {
//     switch (error.code) {
//       case error.PERMISSION_DENIED:
//         console.log("User denied the request for Geolocation.");
//         break;
//       case error.POSITION_UNAVAILABLE:
//         console.log("Location information is unavailable.");
//         break;
//       case error.TIMEOUT:
//         console.log("The request to get user location timed out.");
//         break;
//       case error.UNKNOWN_ERROR:
//         console.log("An unknown error occurred.");
//         break;
//     }
//   }
// }

// async function fetchSunTimes() {
//   const apiUrl =
//     "https://api.sunrisesunset.io/json?lat=30.111946&lng=31.270961000000003";

//   try {
//     const response = await fetch(apiUrl);
//     if (!response.ok) {
//       throw new Error("Network response was not ok");
//     }
//     const data = await response.json();
//     return data;
//   } catch (error) {
//     console.error("There was a problem with the fetch operation:", error);
//   }
// }

// TODO:Utils
// function dayyyyMMdd(date) {
//   const day = date === "" ? new Date() : new Date(date);
//   const yyyy = day.getFullYear();
//   const mm = String(day.getMonth() + 1).padStart(2, "0");
//   const dd = String(day.getDate()).padStart(2, "0");
//   const formattedDate = `${yyyy}-${mm}-${dd}`;
//   return formattedDate;
// }

// async function fetchTimeZoneOffset(
//   lat,
//   lon,
//   timestamp = new Date().getTime() / 1000
// ) {
//   const apiKey = "AIzaSyCMR0GifIRTiL2qcJgMhq1l4xp2ydau7FI";
//   const apiUrl = `https://maps.googleapis.com/maps/api/timezone/json?location=${lat}%2C${lon}&timestamp=${timestamp}&key=${apiKey}`;

//   try {
//     const response = await fetch(apiUrl, {
//       method: "GET",
//     });
//     if (!response.ok) {
//       throw new Error("Network response was not ok");
//     }
//     const data = await response.json();
//     return data;
//   } catch (error) {
//     console.error("There was a problem with the fetch operation:", error);
//   }
// }
// async function fetchData(objName, city = "cairo", historyDate = "") {
//   formattedHistoryDate = dayyyyMMdd(historyDate);
//   const apiKey = "e16ec41a89a54903bd901218240408";
//   const apiUrl = `https://api.weatherapi.com/v1/${objName}.json?key=${apiKey}&q=${city}&dt=${formattedHistoryDate}`;
//   try {
//     const response = await fetch(apiUrl, {
//       method: "GET",
//       headers: {
//         "Content-Type": "application/json",
//       },
//     });
//     if (!response.ok) {
//       throw new Error("Network response was not ok");
//     }
//     const data = await response.json();
//     return data;
//   } catch (error) {
//     console.error("There was a problem with the fetch operation:", error);
//   }
// }

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
  API.initAutocomplete();
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
