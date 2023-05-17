import moment, {Moment} from 'moment';

export function getDayStart(date?: Date, utcOffsetMinutes?: number) {
  if (!date) date = new Date();
  const mmnt = moment(date).utcOffset(utcOffsetMinutes || 330);
  mmnt.set({hour: 0, minute: 0, second: 0, millisecond: 0});
  return mmnt.toDate();
}

export function getDayEnd(date?: Date, utcOffsetMinutes?: number) {
  if (!date) date = new Date();
  const mmnt = moment(date).utcOffset(utcOffsetMinutes || 330);
  mmnt.set({hour: 23, minute: 59, second: 59, millisecond: 999});
  return mmnt.toDate();
}

export function toIsoFormat(date: Date): string {
  return momentToIsoFormat(moment(date));
}

export function momentToIsoFormat(date: Moment): string {
  return date.format('YYYY-MM-DDTHH:mm:ss.SSSZ');
}

export function formatTime(isostring: Date): string {
  const date = new Date(isostring);
  const date_options = {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  } as Intl.DateTimeFormatOptions;
  const time_options = {
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
    timeZone: 'Asia/Kolkata',
  } as Intl.DateTimeFormatOptions;
  const formatter = new Intl.DateTimeFormat('en-IN', {
    ...date_options,
    ...time_options,
  });
  return formatter.format(date);
}
