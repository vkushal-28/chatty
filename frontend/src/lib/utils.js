export function formatMessageTime(date) {
  return new Date(date).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

export function formatMessageDate(date) {
  return new Date(date).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function compareDate(date1, date2) {
  const d1 = formatMessageDate(date1);
  const d2 = formatMessageDate(date2);
  // console.log(d1 < d2);
  if (d1 !== d2) {
    return formatDateForChat(d1);
  }
}

export function formatDateForChat(date) {
  const today = new Date();
  const inputDate = new Date(date);
  const diffTime = today - inputDate;
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  // Check if the date is today
  if (diffDays === 0) {
    return "Today";
  }

  // Check if the date is yesterday
  if (diffDays === 1) {
    return "Yesterday";
  }

  // Check if the date is within the last week (7 days)
  if (diffDays < 7) {
    const weekday = inputDate.toLocaleString("en-US", { weekday: "long" });
    return weekday;
  }

  // If more than a week ago, show the full date in the format 'Monday, 7 Feb, 2025'
  const options = {
    weekday: "short",
    day: "numeric",
    month: "short",
    // year: "numeric",
  };
  return inputDate.toLocaleDateString("en-US", options);
}
