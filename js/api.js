import * as Utils from "./utils.js";

import * as dotenv from "dotenv";
dotenv.config();
const env = process.env;

const WEATHER_API_KEY = env.WEATHER_API_KEY;
const GOOGLE_API_KEY = env.GOOGLE_API_KEY;
export async function fetchSunTimes() {
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

export async function fetchTimeZoneOffset(
  lat,
  lon,
  timestamp = new Date().getTime() / 1000
) {
  const apiUrl = `https://maps.googleapis.com/maps/api/timezone/json?location=${lat}%2C${lon}&timestamp=${timestamp}&key=${GOOGLE_API_KEY}`;

  try {
    const response = await fetch(apiUrl, {
      method: "GET",
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

export async function fetchWeatherData(
  objName,
  city = "cairo",
  historyDate = ""
) {
  let formattedHistoryDate = Utils.dayyyyMMdd(historyDate);
  const apiUrl = `https://api.weatherapi.com/v1/${objName}.json?key=${WEATHER_API_KEY}&q=${city}&dt=${formattedHistoryDate}`;
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

export async function fetchDailyForecast(city) {
  const days = [];
  const daysInfo = [];
  const today = new Date();
  today.setDate(today.getDate() - 1);
  for (let i = 0; i < 5; i++) {
    today.setDate(today.getDate() - 1);
    days[i] = await fetchWeatherData("history", city, today);
    daysInfo[i] = {
      conditionIcon: days[i].forecast.forecastday[0].day.condition.icon,
      temperature: days[i].forecast.forecastday[0].day.avgtemp_c,
      date: days[i].forecast.forecastday[0].date,
    };
  }
  return daysInfo;
}


