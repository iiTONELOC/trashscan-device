
function pluralize(word: string, count: number): string {
    return `${word}${count > 1 ? 's' : ''}`;
}


function formatTime(time: string): string {
    // convert the date to a time string
    const date = new Date(time);

    //   if it has been less than 5 seconds, return 'just now'
    if (Date.now() - date.getTime() < 5000) {
        return 'just now';
    }

    // if it has been less than a minute, return the seconds
    if (Date.now() - date.getTime() < 60000) {
        const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
        return `${seconds} ${pluralize('second', seconds)} ago`;
    }

    // if it has been less than an hour, return the minutes
    if (Date.now() - date.getTime() < 3600000) {
        const minutes = Math.floor((Date.now() - date.getTime()) / 60000);
        return `${minutes} ${pluralize('minute', minutes)} ago`;
    }

    // if it has been less than a day, return the hours
    if (Date.now() - date.getTime() < 86400000) {
        const hours = Math.floor((Date.now() - date.getTime()) / 3600000);
        return `${hours} ${pluralize('hour', hours)} ago`;
    }

    // if it has been less than a week, return the days
    if (Date.now() - date.getTime() < 604800000) {
        const days = Math.floor((Date.now() - date.getTime()) / 86400000);
        return `${days} ${pluralize('day', days)} ago`;
    }

    // if it has been less than a month, return the weeks
    if (Date.now() - date.getTime() < 2592000000) {
        const weeks = Math.floor((Date.now() - date.getTime()) / 604800000);
        return `${weeks} ${pluralize('week', weeks)} ago`;
    }

    // if it has been less than a year, return the months
    if (Date.now() - date.getTime() < 31536000000) {
        const months = Math.floor((Date.now() - date.getTime()) / 2592000000);
        return `${months} ${pluralize('month', months)} ago`;
    }

    // if it has been more than a year, return the years
    const years = Math.floor((Date.now() - date.getTime()) / 31536000000);
    return `${years} ${pluralize('year', years)} ago`;
}

export default formatTime;
