function formatTime(time: string): string {
    // convert the date to a time string
    const date = new Date(time);

    // if it has been less than a minute, return 'just now'
    if (Date.now() - date.getTime() < 60000) {
        return 'just now';
    }

    // if it has been less than an hour, return the minutes
    if (Date.now() - date.getTime() < 3600000) {
        const minutes = Math.floor((Date.now() - date.getTime()) / 60000);
        return `${minutes} ${minutes > 1 ? 'minutes' : 'minute'} ago`;
    }

    // if it has been less than a day, return the hours
    if (Date.now() - date.getTime() < 86400000) {
        const hours = Math.floor((Date.now() - date.getTime()) / 3600000);
        return `${hours} ${hours > 1 ? 'hours' : 'hour'} ago`;
    }

    // if it has been less than a week, return the days
    if (Date.now() - date.getTime() < 604800000) {
        const days = Math.floor((Date.now() - date.getTime()) / 86400000);
        return `${days} ${days > 1 ? 'days' : 'day'} ago`;
    }

    // if it has been less than a month, return the weeks
    if (Date.now() - date.getTime() < 2592000000) {
        const weeks = Math.floor((Date.now() - date.getTime()) / 604800000);
        return `${weeks} ${weeks > 1 ? 'weeks' : 'week'} ago`;
    }

    // if it has been less than a year, return the months
    if (Date.now() - date.getTime() < 31536000000) {
        const months = Math.floor((Date.now() - date.getTime()) / 2592000000);
        return `${months} ${months > 1 ? 'months' : 'month'} ago`;
    }

    // if it has been more than a year, return the years
    const years = Math.floor((Date.now() - date.getTime()) / 31536000000);
    return `${years} ${years > 1 ? 'years' : 'year'} ago`;
}

export default formatTime;
