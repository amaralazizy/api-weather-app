const daysOfWeek = [
  { short: "Mon", long: "Monday" },
  { short: "Tue", long: "Tuesday" },
  { short: "Wed", long: "Wednesday" },
  { short: "Thu", long: "Thursday" },
  { short: "Fri", long: "Friday" },
  { short: "Sat", long: "Saturday" },
  { short: "Sun", long: "Sunday" },
];

const monthsOfYear = [
  { short: "Jan", long: "January" },
  { short: "Feb", long: "February" },
  { short: "Mar", long: "March" },
  { short: "Apr", long: "April" },
  { short: "May", long: "May" },
  { short: "Jun", long: "June" },
  { short: "Jul", long: "July" },
  { short: "Aug", long: "August" },
  { short: "Sep", long: "September" },
  { short: "Oct", long: "October" },
  { short: "Nov", long: "November" },
  { short: "Dec", long: "December" },
];

let autocomplete;
function initAutocomplete() {
  autocomplete = new google.maps.places.Autocomplete(
    document.getElementById("autocomplete"),
    {
      types: ["establishment"],
      fields: ["place_id", "geometry", "name"],
    }
  );
}

// autocomplete.addEventListener("place_changed", onPlaceChanged);

function detectPosition() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(sendPosition, showError);
  } else {
    console.log("Geolocation is not supported by this browser.");
  }

  function sendPosition(position) {
    let latitude = position.coords.latitude;
    let longitude = position.coords.longitude;
    let city = `${latitude},${longitude}`;
    getData(city);
  }

  function showError(error) {
    switch (error.code) {
      case error.PERMISSION_DENIED:
        console.log("User denied the request for Geolocation.");
        break;
      case error.POSITION_UNAVAILABLE:
        console.log("Location information is unavailable.");
        break;
      case error.TIMEOUT:
        console.log("The request to get user location timed out.");
        break;
      case error.UNKNOWN_ERROR:
        console.log("An unknown error occurred.");
        break;
    }
  }
}

async function fetchSunTimes() {
  const apiUrl =
    "https://api.sunrisesunset.io/json?lat=30.111946&lng=31.270961000000003";

  try {
    const response = await fetch(apiUrl);
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("There was a problem with the fetch operation:", error);
  }
}

// TODO:Utils
function dayyyyMMdd(date) {
  const day = date === "" ? new Date() : new Date(date);
  const yyyy = day.getFullYear();
  const mm = String(day.getMonth() + 1).padStart(2, "0");
  const dd = String(day.getDate()).padStart(2, "0");
  const formattedDate = `${yyyy}-${mm}-${dd}`;
  return formattedDate;
}

async function fetchData(objName, city = "cairo", historyDate = "") {
  formattedHistoryDate = dayyyyMMdd(historyDate);
  const apiKey = "e16ec41a89a54903bd901218240408";
  const apiUrl = `https://api.weatherapi.com/v1/${objName}.json?key=${apiKey}&q=${city}&dt=${formattedHistoryDate}`;
  try {
    const response = await fetch(apiUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("There was a problem with the fetch operation:", error);
  }
}

async function getData(city = "cairo") {
  const weatherData = await fetchData("current", city);
  const sunTimes = await fetchSunTimes();
  const forecastJSON = await fetchData("forecast", city);

  if (weatherData) {
    // TODO Make a function city and time

    const cityEle = document.querySelector(".city-time-date .city");
    cityEle.innerHTML = weatherData.location.name;
    const date = new Date(weatherData.location.localtime.split(" ")[0]);
    const dayOfTheWeek = date.getDay();
    const monthOfTheYear = date.getMonth();
    const dayOftheMonth = date.getDate();
    const dateEle = document.querySelector(".city-time-date .time-date .date");
    dateEle.innerHTML = `${daysOfWeek[dayOfTheWeek].long}, ${dayOftheMonth} ${monthsOfYear[monthOfTheYear].short}`;

    // TODO Make a function weather info

    const temperature = weatherData.current.temp_c;
    const feelsTemperature = weatherData.current.feelslike_c;
    const tempEle = document.querySelector(
      ".weather .first-column .temprature .real"
    );
    tempEle.innerHTML = `${parseInt(temperature)}&deg;C`;
    const tempFeelsEle = document.querySelector(
      ".weather .first-column .temprature .feels-like .temp_itself"
    );
    tempFeelsEle.innerHTML = `${parseInt(feelsTemperature)}&deg;C`;
    const sunrise = sunTimes.results.sunrise;
    const sunriseEle = document.querySelector(
      ".weather .first-column .sunrise-sunset .sunrise .sunrise-time span:last-child"
    );
    sunriseEle.innerHTML = sunrise.replace(/:\d{2}\s/, " ");
    const sunset = sunTimes.results.sunset;
    const sunsetEle = document.querySelector(
      ".weather .first-column .sunrise-sunset .sunset .sunset-time span:last-child"
    );
    sunsetEle.innerHTML = sunset.replace(/:\d{2}\s/, " ");
    const condition = weatherData.current.condition.text;
    const conditionEle = document.querySelector(".state .condition");
    conditionEle.innerHTML = condition;

    const conditionImage = weatherData.current.condition.icon;
    const conditionImageEle = document.querySelector(".state img");
    conditionImageEle.setAttribute("src", conditionImage);

    const humidity = weatherData.current.humidity;
    const humidityEle = document.querySelector(".humidity .number");
    humidityEle.innerHTML = `${humidity}%`;

    const windSpeed = weatherData.current.wind_kph;
    const windSpeedEle = document.querySelector(".wind-speed .number");
    windSpeedEle.innerHTML = `${windSpeed} km/h`;

    const pressure = weatherData.current.pressure_mb;
    const pressureEle = document.querySelector(".pressure .number");
    pressureEle.innerHTML = `${pressure} hPa`;

    const uv = weatherData.current.uv;
    const uvEle = document.querySelector(".uv .number");
    uvEle.innerHTML = uv;

    // TODO Make a function hourly forecast

    const dailyHours = [];
    let hoursCounter = 12;
    for (let i = 0; i < 5; i++) {
      hoursCounter = hoursCounter === 24 ? 0 : hoursCounter;
      dailyHours[i] = {
        time: forecastJSON.forecast.forecastday[0].hour[hoursCounter].time,
        conditionIcon:
          forecastJSON.forecast.forecastday[0].hour[hoursCounter].condition
            .icon,
        temperature:
          forecastJSON.forecast.forecastday[0].hour[hoursCounter].temp_c,
        windDirDeg:
          forecastJSON.forecast.forecastday[0].hour[hoursCounter].wind_degree,
        windSpeed:
          forecastJSON.forecast.forecastday[0].hour[hoursCounter].wind_kph,
      };
      hoursCounter += 3;
    }

    const dailyHoursEle = document.querySelectorAll(
      ".hourly-forecast .hours .hour"
    );

    for (let i = 0; i < 5; i++) {
      const timeEle = dailyHoursEle[i].querySelector(".time");
      timeEle.innerHTML = dailyHours[i].time.split(" ")[1];
      const conditionIconEle = dailyHoursEle[i].querySelector("img");
      conditionIconEle.setAttribute(
        "src",
        `https:${dailyHours[i].conditionIcon}`
      );
      const temperatureEle = dailyHoursEle[i].querySelector(".temp");
      temperatureEle.innerHTML = `${parseInt(dailyHours[i].temperature)}&deg;C`;
      const windDirDeg = dailyHoursEle[i].querySelector("svg");
      windDirDeg.style.cssText += `transform: rotate(${dailyHours[i].windDirDeg}deg)`;
      const windSpeed = dailyHoursEle[i].querySelector(".wind-speed");
      windSpeed.innerHTML = `${dailyHours[i].windSpeed} km/h`;
    }

    // TODO Make a function 5 days forecast
    const days = [];
    const daysInfo = [];
    const today = new Date();
    today.setDate(today.getDate() - 1);
    for (let i = 0; i < 5; i++) {
      today.setDate(today.getDate() - 1);
      days[i] = await fetchData("history", city, today);
      daysInfo[i] = {
        conditionIcon: days[i].forecast.forecastday[0].day.condition.icon,
        temperature: days[i].forecast.forecastday[0].day.avgtemp_c,
        date: days[i].forecast.forecastday[0].date,
      };
    }
    const daysInfoEle = document.querySelectorAll(".daily-forecast .day");
    for (let i = 0; i < 5; i++) {
      const conditionIconEle = daysInfoEle[i].querySelector("img");
      conditionIconEle.setAttribute(
        "src",
        `https:${daysInfo[i].conditionIcon}`
      );

      const temperatureEle = daysInfoEle[i].querySelector(".temp");
      temperatureEle.innerHTML = `${parseInt(daysInfo[i].temperature)}&deg;C`;

      const dateEle = daysInfoEle[i].querySelector(".date");
      const formattedDate = `${
        daysOfWeek[new Date(daysInfo[i].date).getDay()].long
      }, ${new Date(daysInfo[i].date).getDate() + 1} ${
        monthsOfYear[new Date(daysInfo[i].date).getMonth()].short
      }`;
      dateEle.innerHTML = formattedDate;
    }
  }
}

getData();

const searchCity = document.querySelector(".search-bar input");
let city = "";
searchCity.addEventListener("keyup", function (event) {
  event.preventDefault();
  if (event.keyCode === 13) {
    city = searchCity.value.toLowerCase();
    getData(city);
  }
});

function updateClock() {
  const now = new Date();
  const utcNow = new Date(now.getTime() + now.getTimezoneOffset() * 60000);
  const hours = utcNow.getHours().toString().padStart(2, "0");
  const minutes = utcNow.getMinutes().toString().padStart(2, "0");
  const seconds = utcNow.getSeconds().toString().padStart(2, "0");
  const timeString = `${hours}:${minutes}`;

  const clockElement = document.querySelector(
    ".city-time-date .time-date .time"
  );
  const secondsElement = document.querySelector(
    ".city-time-date .time-date .time .seconds"
  );
  // secondsElement.style.cssText =
  //   "font-size:1.25rem; position:absolute; bottom:0; margin-left:5px;";
  if (clockElement) {
    secondsElement.innerHTML = `${seconds}`;
    clockElement.innerHTML = `${timeString}`;
    clockElement.append(secondsElement);
  }
}

let cardsEle = document.querySelectorAll(".card img");

cardsEle.forEach((card) => {
  card.addEventListener("DOMContentLoaded", () => {
    document.body.style.cssText += "background-color: white;";
    // card.forEach((data) => {
    //   data.style.cssText += "opacity: 0";
    //   let loadingEle = document.createElement("div");
    // });
    // loadingEle.style.cssText += "height: 50px; width: 50px; background-color: orange;";
    // card.append(loadingEle);
  });
});

setInterval(updateClock, 1000);
updateClock();

let infoEle = document.querySelector(".weather");

let dailyEle = document.querySelector(".daily-forecast");

let tempSunEle = document.querySelector(".first-column");

let stateEle = document.querySelector(".state");

const mediaQuery1130 = window.matchMedia("(max-width: 1130px)");

const mediaQuery420 = window.matchMedia("(max-width: 420px)");

// Function to handle media query changes
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

changeSearchbarIndex = (event) => {
  if (event.matches) {
    document
      .querySelector("header")
      .append(document.querySelector(".search-bar"));
  }
};
changeSearchbarIndex(mediaQuery420);
mediaQuery420.addEventListener("change", changeSearchbarIndex);

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
  // console.log("All cards loaded and displayed");
});

//

const toggleTheme = () => {
  document.documentElement.className =
    /^dark/i.test(document.documentElement.className)
      ? (document.documentElement.className = "light")
      : (document.documentElement.className = "dark");
  updateThemeIcon();
};

const updateThemeIcon = () => {
  const sunIcon = document.querySelector(".theme-icon.sun");
  const moonIcon = document.querySelector(".theme-icon.moon");
  
  sunIcon.classList.toggle("active");
  moonIcon.classList.toggle("active");
};

const setTheme = () => {
  const sunIcon = document.querySelector(".theme-icon.sun");
  const moonIcon = document.querySelector(".theme-icon.moon");
  const preferredTheme = localStorage.getItem("theme");
  document.documentElement.className = preferredTheme;
  if (preferredTheme === "light") sunIcon.classList.add("active");
  else moonIcon.classList.add("active");
};

document.querySelector(".theme-toggle").addEventListener("click", () => {
  toggleTheme();
  const activeTheme = document.documentElement.className;
  localStorage.setItem("theme", activeTheme);
});

// Call setTheme when the page loads
document.addEventListener("DOMContentLoaded", setTheme);
