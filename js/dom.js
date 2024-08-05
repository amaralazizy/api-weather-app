import { daysOfWeek, monthsOfYear } from "./constants.js";
import * as Utils from "./utils.js";

export function updateCityAndTime(weatherData) {
  const cityEle = document.querySelector(".city-time-date .city");
  cityEle.innerHTML = weatherData.location.name;
  const date = new Date(weatherData.location.localtime.split(" ")[0]);
  const dayOfTheWeek = date.getDay();
  const monthOfTheYear = date.getMonth();
  const dayOftheMonth = date.getDate();
  const dateEle = document.querySelector(".city-time-date .time-date .date");
  dateEle.innerHTML = `${daysOfWeek[dayOfTheWeek].long}, ${dayOftheMonth} ${monthsOfYear[monthOfTheYear].short}`;
}

export function updateWeatherInfo(weatherData, sunTimes) {
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
  sunriseEle.innerHTML = Utils.formatTime(sunrise);
  const sunset = sunTimes.results.sunset;
  const sunsetEle = document.querySelector(
    ".weather .first-column .sunrise-sunset .sunset .sunset-time span:last-child"
  );
  sunsetEle.innerHTML = Utils.formatTime(sunset);
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
}

export function updateHourlyForecast(forecastJSON) {
  const dailyHours = [];
  let hoursCounter = 12;
  for (let i = 0; i < 5; i++) {
    hoursCounter = hoursCounter === 24 ? 0 : hoursCounter;
    dailyHours[i] = {
      time: forecastJSON.forecast.forecastday[0].hour[hoursCounter].time,
      conditionIcon:
        forecastJSON.forecast.forecastday[0].hour[hoursCounter].condition.icon,
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
}

export async function updateDailyForecast(daysInfo) {
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

export function updateClock(globalTimeZoneOffset) {
  const now = new Date();
  const utcNow = new Date(
    now.getTime() +
      now.getTimezoneOffset() * 60000 +
      globalTimeZoneOffset * 1000
  );
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
  if (clockElement) {
    secondsElement.innerHTML = `${seconds}`;
    clockElement.innerHTML = `${timeString}`;
    clockElement.append(secondsElement);
  }
}
