export function dayyyyMMdd(date) {
  const day = date === "" ? new Date() : new Date(date);
  const yyyy = day.getFullYear();
  const mm = String(day.getMonth() + 1).padStart(2, "0");
  const dd = String(day.getDate()).padStart(2, "0");
  const formattedDate = `${yyyy}-${mm}-${dd}`;
  return formattedDate;
}

export function formatTime(timeString) {
  return timeString.replace(/:\d{2}\s/, " ");
}


