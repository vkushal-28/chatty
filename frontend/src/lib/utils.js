import { format, isToday, isYesterday, isThisWeek, parseISO } from "date-fns";

export const formatDateGroupLabel = (date) => {
  if (isToday(date)) return "Today";
  if (isYesterday(date)) return "Yesterday";
  if (isThisWeek(date, { weekStartsOn: 1 })) return format(date, "EEEE"); // e.g., Monday
  return format(date, "dd MMM yyyy");
};
export function formatMessageTime(date) {
  return new Date(date).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

export function groupMessagesByDate(messages) {
  const groups = {};

  messages.forEach((msg) => {
    const date = parseISO(msg.createdAt);

    let label;
    if (isToday(date)) {
      label = "Today";
    } else if (isYesterday(date)) {
      label = "Yesterday";
    } else if (isThisWeek(date)) {
      label = format(date, "EEEE"); // Monday, Tuesday, etc.
    } else {
      label = format(date, "MMMM d, yyyy"); // e.g., March 25, 2025
    }

    if (!groups[label]) {
      groups[label] = [];
    }
    groups[label].push(msg);
  });

  // Sort groups by date descending
  const sortedGroupKeys = Object.keys(groups).sort((a, b) => {
    const getDateFromLabel = (label) => {
      if (label === "Today") return new Date();
      if (label === "Yesterday") return new Date(Date.now() - 86400000);
      if (
        [
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
          "Sunday",
        ].includes(label)
      ) {
        const today = new Date();
        const targetDay = label;
        const dayIndex = [
          "Sunday",
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
        ].indexOf(targetDay);
        const daysAgo = (today.getDay() - dayIndex + 7) % 7;
        return new Date(
          today.getFullYear(),
          today.getMonth(),
          today.getDate() - daysAgo
        );
      }
      return new Date(label);
    };

    return getDateFromLabel(b).getTime() - getDateFromLabel(a).getTime();
  });

  const sortedGroups = {};
  sortedGroupKeys.forEach((key) => {
    sortedGroups[key] = groups[key];
  });

  return sortedGroups;
}
