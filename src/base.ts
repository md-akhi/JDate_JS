/**
 * In the name of Allah, the Beneficent, the Merciful.
 * @package shdate - Date and Time Related Extensions SH{Shamsi Hijri, Solar Hijri, Iranian Hijri}
 * @author Mohammad Amanalikhani <md.akhi.ir@gmail.com> (http://md.akhi.ir)
 * @link http://git.akhi.ir/js/SHDate | https://github.com/md-akhi/SHDateTime-js#readme
 * @copyright (C) 2015 - 2023 Open Source Matters,Inc. All right reserved.
 * @license AGPL-3.0 License
 * @version Release: 2.0.20
 */

import Word from "./word.js";
import SHParser from "./parser/parse.js";
interface VarSHDate {
	[key: string]: number | undefined;
	year?: number;
	month?: number;
	date?: number;
	UTC_year?: number;
	UTC_month?: number;
	UTC_date?: number;
}
// interface ISHDate {
// 	toString(): string;
// }
/**
 * class SHDate
 */
export default class SHDate {
	/**
	 * version of SHDate
	 */
	static version: string = "2.0.20";

	/**
	 * @type {number[]} days in month without leap year
	 */ /**
	 * This static property represents the number of days in each month of a specific calendar.
	 */
	public static DAYS_IN_MONTH: number[] = [
		31, // far
		31, // ord
		31, // kho
		31, // tir
		31, // amo
		31, // sha
		30, // meh
		30, // aba
		30, // aza
		30, // dey
		30, // bah
		29 // esf
	];

	/**
	 * @type {number[]} days in month with leap year
	 */
	static DAYS_IN_MONTH_LEAP: number[] = [
		31, // far
		31, // ord
		31, // kho
		31, // tir
		31, // amo
		31, // sha
		30, // meh
		30, // aba
		30, // aza
		30, // dey
		30, // bah
		30 // esf
	];

	/**
	 * first day of month
	 * @type {number[]} days of year
	 */
	static DAY_OF_YEAR: number[] = [
		0, // far
		31, // ord
		62, // kho
		93, // tir
		124, // amo
		155, // sha
		186, // meh
		216, // aba
		246, // aza
		276, // dey
		306, // bah
		336 // esf
	];

	/**
	 * @type {number[]} days in year without leap year
	 */
	static DAYS_IN_YEAR: number = 365;

	/**
	 * @type {number[]} days in year with leap year
	 */
	static DAYS_IN_YEAR_LEAP: number = 366;

	/**
	 * @type {number[]} weeks in year without leap week
	 */
	static WEEKS_IN_YEAR: number = 52;

	/**
	 * @type {number[]} weeks in year with leap week
	 */
	static WEEKS_IN_YEAR_LEAP: number = 53;

	/**
	 * @type {Date} Date
	 */
	#date: Date;

	/**
	 * @type {object} year, month, date, UTC_year, UTC_month, UTC_date
	 */
	#sh: VarSHDate = {};

	#config: any = {
		time_zone: "Asia/Tehran",
		word_language: Word.LANGUAGE,
		first_day_of_week: Word.FIRST_DAY_OF_WEEK,
		time_difference_server: 0 // miliseconds
	};

	/**
	 * Creates a JavaScript Date instance that represents a single moment in time in a platform-independent format.Date objects contain a Number that represents milliseconds since 11 Day 1348 UTC.
	 * @param {object} mix-dateObject Date object
	 * @param {string} mix-datastring Timestamp string
	 * @param {number} mix-value Time value or timestamp number
	 * @param {number} mix-year Year
	 * @param {number} month beginning with 0 for Farvardin to 11 for Esfand.
	 * @param {number} date the day of the month. The default is 1.
	 * @param {number} hour between 0 and 23 representing the hour of the day. Defaults to 0.
	 * @param {number} minute the minute segment of a time. The default is 0 minutes past the hour.
	 * @param {number} second the second segment of a time. The default is 0 seconds past the minute.
	 * @param {number} millisecond the millisecond segment of a time. The default is 0 milliseconds past the second.
	 * @returns {string} a Date object whose toString() method returns the literal string Invalid Date.
	 */
	constructor(mix: any = false, ...args: number[] | undefined[]) {
		if (!new.target || !this) {
			// if you run me without new
			throw new Error("You must use new to create a instance of this class");
			//return new SHDate().toString();
		}
		this.#date = new Date();
		if (typeof mix == "number")
			if (mix.toString().length == 4 && (mix >= 1200 || mix < 1700)) {
				const [
					month = 0,
					date = 1,
					hours = 0,
					minute = 0,
					second = 0,
					millisecond = 0
				] = args;
				// year
				this.setFullYear(mix, month, date);
				this.setHours(hours, minute, second, millisecond);
			}
			// value
			else this.setTime(mix);
		else if (typeof mix == "string") {
			const [time = this.getTime()] = args;
			// dateString
			this.setTime(SHDate.parse(mix, time));
		} else if (mix instanceof SHDate || mix instanceof Date)
			// dateObject
			this.setTime(mix.getTime());
		else if (typeof mix == "boolean") this.setTime(this.#date.getTime());
		return this;
	}

	/** //todo  change name to synceDate
	 * update date
	 * @returns {null}
	 */
	#updateDate(): void {
		const [UTC_year, UTC_month, UTC_date] = this.#GregorianToSolar(
			this.#date.getUTCFullYear(),
			this.#date.getUTCMonth(),
			this.#date.getUTCDate()
		);
		this.#sh.UTC_year = UTC_year;
		this.#sh.UTC_month = UTC_month;
		this.#sh.UTC_date = UTC_date;

		const [year, month, date] = this.#GregorianToSolar(
			this.#date.getFullYear(),
			this.#date.getMonth(),
			this.#date.getDate()
		);
		this.#sh.year = year;
		this.#sh.month = month;
		this.#sh.date = date;
		return;
	}

	/** //todo  change name to synceTime
	 * update time
	 * @returns {null}
	 */
	#updateTime(): void {
		this.#date.setTime(
			this.#date.getTime() + this.#config.time_difference_server
		);
		return;
	}

	/**
	 *  Convert gregorian date to solar hijri date
	 * @param {number} gyear - gregorian year
	 * @param {number} gmonth - gregorian month
	 * @param {number} gdate - gregorian date
	 * @param {boolean} julian - julian date
	 * @returns {array} - solar hijri date
	 */
	#GregorianToSolar(
		gyear: number,
		gmonth: number,
		gdate: number,
		julian: boolean = false
	): number[] {
		// 0622/03/22 = 0001/01/01
		var gdoy: number, doy: number, year: number;
		gdoy =
			(gyear - 1) * 365 +
			([0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334][gmonth] +
				gdate) -
			226745; //226745 = 621*365+80
		if (this.#GIsLeapYear(gyear) && gmonth > 1) gdoy++;
		year = Math.trunc(gdoy / 365) + 1;
		doy =
			(gdoy % 365) +
			this.#GIsLeapYear(gyear, true) -
			this.#isLeapYear(year, true);
		return this.#dateOfDayOfYear(year, doy - 1);
	}

	/**
	 * Convert solar hijri date to gregorian date
	 * @param {number} year - solar hijri year
	 * @param {number} month - solar hijri month
	 * @param {number} date - solar hijri date
	 * @param {boolean} julian - julian date
	 * @returns {array} - gregorian date
	 */
	#SolarToGregorian(
		year: number,
		month: number,
		date: number,
		julian: boolean = false
	): number[] {
		// 0001/01/01 = 0622/03/22
		var doy: number, gdoy: number, gyear: number;
		doy =
			(year - 1) * 365 + this.#dayOfYear(month, date) + 226746 /*621*365+80*/;
		gyear = Math.trunc(doy / 365) + 1;
		gdoy =
			(doy % 365) +
			this.#isLeapYear(year, true) -
			this.#GIsLeapYear(gyear, true);
		return this.#GdateOfDayOfYear(gyear, gdoy);
	}

	#GdateOfDayOfYear(gyear: number, gdoy: number): number[] {
		var gdiy: number = this.#GDaysInYear(gyear),
			gleap: number,
			data = { gmonth: 0, gdate: 0 };
		if (gdoy < 1)
			do {
				--gyear;
				gdiy = this.#GDaysInYear(gyear);
				gdoy += gdiy;
			} while (gdoy < 1);
		else if (gdoy > gdiy)
			do {
				++gyear;
				gdiy = this.#GDaysInYear(gyear);
				gdoy -= gdiy;
			} while (gdoy > gdiy);
		gleap = this.#GIsLeapYear(gyear) ? 29 : 28;
		[0, 31, gleap, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31].forEach(
			(gdim: number, gmoy: number) => {
				if (gdoy <= gdim) return;
				gdoy -= gdim;
				data.gmonth = gmoy;
				data.gdate = Math.trunc(gdoy);
			}
		);
		return [gyear, data.gmonth, data.gdate];
	}

	#GDaysInYear(year: number): number {
		return this.#GIsLeapYear(year) ? 366 : 365;
	}

	/**
	 * Get gregorian leap year
	 * @param {number} gyear - gregorian year
	 * @param {boolean} all - all leap year
	 * @returns {boolean} - leap year
	 */
	#GIsLeapYear(gyear: number, all: boolean = false): number {
		/**
		 * 150 = Correcting the difference of leap with the gregorian date
		 */
		if (all)
			return (
				Math.ceil(
					Math.trunc(--gyear / 4) -
						Math.trunc(gyear / 100) +
						Math.trunc(gyear / 400)
				) - 150
			);
		return gyear % 4 == 0 && !(gyear % 100 == 0 && gyear % 400 != 0) ? 1 : 0;
	}

	/**
	 * Get leap year
	 * @param {number} year - solar hijri year
	 * @param {boolean} all - all leap year (default: false)
	 * @returns {boolean} - leap year
	 */
	#isLeapYear(year: number, all: boolean = false): number {
		/**
		 * years * 0.2422 = years * 365.2422 - years * 365
		 * 0.2422 = 365.2422
		 * 274 = Correcting the difference of leap with the solar date
		 */
		const years = year + 1127;
		if (all) return Math.trunc(Math.ceil(years * 0.2422)) - 274;
		return Math.trunc((years + 1) * 0.2422) - Math.trunc(years * 0.2422);
	}

	/**
	 * Get leap year
	 * @returns {boolean} - leap year
	 */
	public isLeapYear(): boolean {
		return this.#isLeapYear(this.getFullYear()) === 1;
	}

	/**
	 * Get day of week (dow)
	 * @param {number} year - solar hijri year
	 * @param {number} month - solar hijri month
	 * @param {number} date - solar hijri date
	 * @returns {number} - day of week - 0 = Saturday, ... , 6 = Friday
	 */
	#dayOfWeek(
		year: number,
		month: number,
		date: number,
		FDOW: number = this.#config.first_day_of_week
	): number {
		//return (8 + this.#date.getDay() - FDOW) % 7; // (7+(gdow+1)-FDOW)%7
		// 5 => first day of week is Tuesday
		return (
			(5 +
				year +
				this.#isLeapYear(year, true) +
				this.#dayOfYear(month, date) -
				FDOW) %
			7
		);
	}

	/**
	 * Get day of week (dow)
	 * @returns {number} - day of week - 0 = Saturday, ... , 6 = Friday
	 */
	getDayOfWeek(): number {
		return this.#dayOfWeek(
			this.getFullYear(),
			this.getMonth(),
			this.getDate(),
			this.#config.first_day_of_week
		);
	}

	/**
	 * Get UTC day of week (dow)
	 * @returns {number} - day of week - 0 = Saturday, ... , 6 = Friday
	 */
	getUTCDayOfWeek(): number {
		return this.#dayOfWeek(
			this.getUTCFullYear(),
			this.getUTCMonth(),
			this.getUTCDate(),
			this.#config.first_day_of_week
		);
	}

	/**
	 * Get day of year (doy)
	 * @param {number} month - solar hijri month
	 * @param {number} date - solar hijri date
	 * @returns {number} - day of year
	 */
	#dayOfYear(month: number, date: number): number {
		return SHDate.DAY_OF_YEAR[month] + date - 1;
		/*  var doy: number;
		 month++;
		 if (month < 7) doy = (month - 1) * 31;
		 else doy = (month - 7) * 30 + 186;
		 return (doy + date - 1) % (this.#daysInYear(year) - 1);*/
	}

	/**
	 * Get day of year (doy)
	 * @returns {number} - day of year
	 */
	getDayOfYear(): number {
		return this.#dayOfYear(this.getMonth(), this.getDate());
	}

	/**
	 * Get UTC day of year (doy)
	 * @returns {number} - day of year
	 */
	getUTCDayOfYear(): number {
		return this.#dayOfYear(this.getUTCMonth(), this.getUTCDate());
	}

	/**
	 * Get week of year (woy)
	 * @param {number} year - solar hijri year
	 * @param {number} month - solar hijri month
	 * @param {number} date - solar hijri date
	 * @returns {number} - week of year
	 */
	#weekOfYear(
		year: number,
		month: number,
		date: number,
		FDOW: number = this.#config.first_day_of_week
	): number[] {
		let iw: number, //iso_week
			iy: number; //iso_year
		const doy: number = this.#dayOfYear(month, date) + 1, // 1 through 366
			far1weekday: number = this.#dayOfWeek(year, 0, 1, FDOW) + 1; // 1 through 7 - first dow of farvardin

		/* Find if Y M D falls in YearNumber --Y, WeekNumber 52 or 53 */
		if (doy <= 8 - far1weekday && far1weekday > 4) {
			iy = --year;
			iw =
				far1weekday == 5 || (far1weekday == 6 && this.#isLeapYear(iy))
					? 53
					: 52;
			return [iw, iy];
		}

		/* Find if Y M D falls in YearNumber ++Y, WeekNumber 1 */
		const esf29weekday: number =
			this.#dayOfWeek(year, 11, this.#daysInMonth(year, 11), FDOW) + 1; // 1 through 7 - last dow of esfand
		if (doy > this.#daysInYear(year) - esf29weekday && esf29weekday < 4) {
			iy = ++year;
			iw = 1;
			return [iw, iy];
		}

		/* Find if Y M D falls in YearNumber Y, WeekNumber 1 through 52|53 */
		iy = year;
		//(doy+(7-(this.#dayOfWeek(year,month,date,FDOW)+1))+(far1weekday-1))/7
		iw = (5 + doy + far1weekday - this.#dayOfWeek(year, month, date, FDOW)) / 7;
		if (far1weekday > 4) iw--;
		return [iw, iy];
	}

	/**
	 * Get week of year (woy)
	 * @returns {number} - week of year
	 */
	getWeekOfYear(): number[] {
		return this.#weekOfYear(
			this.getFullYear(),
			this.getMonth(),
			this.getDate(),
			this.#config.first_day_of_week
		);
	}

	/**
	 * Get UTC week of year (woy)
	 * @returns {number} - week of year
	 */
	getUTCWeekOfYear(): number[] {
		return this.#weekOfYear(
			this.getUTCFullYear(),
			this.getUTCMonth(),
			this.getUTCDate(),
			this.#config.first_day_of_week
		);
	}

	/**
	 * Get weeks in year (wiy)
	 * @param {number} year - solar hijri year
	 * @returns {number} - weeks in year
	 */
	#weeksInYear(year: number): number {
		const far1dow: number = this.#dayOfWeek(year, 0, 1) + 1;
		if (far1dow == 4 || (far1dow == 3 && this.#isLeapYear(year))) return 53; // SHDate.WEEKS_IN_YEAR_LEAP;
		return 52; // SHDate.WEEKS_IN_YEAR;
	}

	/**
	 * Get weeks in year (wiy)
	 * @returns {number} - weeks in year
	 */
	getWeeksInYear(): number {
		return this.#weeksInYear(this.getFullYear());
	}

	/**
	 * Get UTC weeks in year (wiy)
	 * @returns {number} - weeks in year
	 */
	getUTCWeeksInYear(): number {
		return this.#weeksInYear(this.getUTCFullYear());
	}

	/**
	 * Get week of day (wod)
	 * @param year  - solar hijri year
	 * @param week - solar hijri week
	 * @param date - solar hijri date
	 * @returns {number} - week of day
	 */
	#weekOfDay(year: number, week: number, date: number = 0): number[] {
		const doy = (week - 1) * 7 + date + 1 - this.#dayOfWeek(year, 0, 4) + 2;
		return this.#dateOfDayOfYear(year, doy);
	}

	/**
	 * Set week of day (wod)
	 * @param year  - solar hijri year
	 * @param week - solar hijri week
	 * @param date - solar hijri date
	 * @returns {number} - week of day
	 */
	setWeek(year: number, week: number, date: number = 0): number {
		const [years, months, days] = this.#weekOfDay(year, week, date);
		return this.setFullYear(years, months, days);
	}

	/**
	 * Get date of days of year (dodoy)
	 * @param year - solar hijri year
	 * @param doy  - solar hijri day of year (range: 0 - 365)
	 * @returns {array} - days of day
	 */
	#dateOfDayOfYear(year: number, doy: number): number[] {
		var diy, month, date;
		doy++;
		diy = this.#daysInYear(year);
		if (doy < 1)
			do {
				year--;
				doy += this.#daysInYear(year);
			} while (doy < 1);
		else if (doy > diy)
			do {
				doy -= diy;
				year++;
				diy = this.#daysInYear(year);
			} while (doy > diy);
		if (doy < 187) {
			month = Math.trunc((doy - 1) / 31);
			date = doy % 31 || 31;
		} else {
			doy -= 186;
			month = Math.trunc((doy - 1) / 30) + 6;
			date = doy % 30 || 30;
		}
		return [year, month, date];
	}

	/**
	 * Set date of days of year (dodoy)
	 * @param year - solar hijri year
	 * @param doy  - solar hijri day of year (range: 0 - 365)
	 * @returns {array} - days of day
	 */
	setdateOfDayOfYear(year: number, doy: number): number {
		const [years, months, days] = this.#dateOfDayOfYear(year, doy);
		return this.setFullYear(years, months, days);
	}

	/**
	 * Set UTC date of days of year (dodoy)
	 * @param year - solar hijri year
	 * @param doy  - solar hijri day of year (range: 0 - 365)
	 * @returns {array} - days of day
	 */
	setUTCdateOfDayOfYear(year: number, doy: number): number {
		const [years, months, days] = this.#dateOfDayOfYear(year, doy);
		return this.setUTCFullYear(years, months, days);
	}

	/**
	 * Get days in month (dim)
	 * @param {number} year - solar hijri year
	 * @param {number} month - solar hijri month
	 * @returns {number} - days in month
	 */
	#daysInMonth(year: number, month: number): number {
		if (month < 11) return SHDate.DAYS_IN_MONTH[month];
		return this.#isLeapYear(year) ? 30 : 29; // SHDate.DAYS_IN_MONTH_LEAP[month] : SHDate.DAYS_IN_MONTH[month];
	}

	/**
	 * Get days in month (dim)
	 * @returns {number} - days in month
	 */
	getDaysInMonth(): number {
		return this.#daysInMonth(this.getFullYear(), this.getMonth());
	}

	/**
	 * Get UTC days in month (dim)
	 * @returns {number} - days in month
	 */
	getUTCDaysInMonth(): number {
		return this.#daysInMonth(this.getUTCFullYear(), this.getUTCMonth());
	}

	/**
	 * Get days in year (diy)
	 * @param {number} year - solar hijri year
	 * @returns {number} - days in year
	 */
	#daysInYear(year: number): number {
		return this.#isLeapYear(year) ? 366 : 365; // SHDate.DAYS_IN_YEAR_LEAP : SHDate.DAYS_IN_YEAR;
	}

	/**
	 * Get days in year (diy)
	 * @returns {number} - days in year
	 */
	getDaysInYear(): number {
		return this.#daysInYear(this.getFullYear());
	}

	/**
	 * Get UTC days in year (diy)
	 * @returns {number} - days in year
	 */
	getUTCDaysInYear(): number {
		return this.#daysInYear(this.getUTCFullYear());
	}

	/**
	 * time correction
	 *
	 * @param  {number} hours
	 * @param  {number} minute
	 * @param  {number} second
	 * @param  {number} millisecond
	 * @param  {number} day of year
	 * @return array
	 */
	timeCorrection(
		hours: number,
		minute: number = 0,
		second: number = 0,
		millisecond: number = 0
	) {
		/**
		 * 86400000 = 24*60*60*1000 - date to millisecond
		 * 3600000 = 60*60*1000 - hours to millisecond
		 * 60000 = 60*1000 - minute to millisecond
		 * 1000 = 1000 - second to millisecond
		 */
		let time: number, doy: number;
		time = hours * 3600000 + minute * 60000 + second * 1000 + millisecond;
		millisecond = time % 1000;
		second = Math.trunc(time / 1000) % 60;
		minute = Math.trunc(time / 60000) % 60;
		hours = Math.trunc(time / 3600000) % 24;
		doy = Math.trunc(time / 86400000);
		return [hours, minute, second, millisecond, doy];
	}

	/**
	 * date correction
	 *
	 * @param  {number} year
	 * @param  {number} month
	 * @param  {number} day
	 * @return array
	 */
	dateCorrection(year: number, month: number = 0, day: number = 1) {
		month++;
		if (month < 1)
			do {
				year--;
				month += 12;
			} while (month < 1);
		else if (month > 12)
			do {
				year++;
				month -= 12;
			} while (month > 12);
		month--;
		const doy = this.#dayOfYear(month, day);
		return this.#dateOfDayOfYear(year, doy);
	}

	/**
	 * week correction
	 *
	 * @param  {number} year
	 * @param  {number} week
	 * @param  {number} day
	 * @return array
	 */
	weekCorrection(year: number, week: number, day: number = 1) {
		const [y4, month, date] = this.#weekOfDay(year, week, day);
		const [iw, iy] = this.#weekOfYear(y4, month, date);
		const dow = this.#dayOfWeek(y4, month, date);
		return [iy, iw, dow];
	}

	/**
	 * Validate a date
	 * @param {number} year Year of the date
	 * @param {number} month Month of the date
	 * @param {number} date Date of the date
	 * @returns {boolean} TRUE if valid; otherwise FALSE
	 */
	public checkDate(year: number, month: number, date: number): boolean {
		return !(
			year < 1 ||
			year > 1700 /* 3,500,000 */ ||
			month < 0 ||
			month > 11 ||
			date < 1 ||
			date > this.#daysInMonth(year, month)
		);
	}

	/**
	 * Validate a time
	 * @param {number} hours Hour of the time
	 * @param {number} minutes Minutes of the time
	 * @param {number} seconds Seconds of the time
	 * @param {number} milliseconds Milliseconds of the time
	 * @returns {boolean} TRUE if valid; otherwise FALSE
	 */
	static checkTime(
		hours: number,
		minutes: number,
		seconds: number,
		milliseconds: number,
		H12: boolean = false
	): boolean {
		return !(
			hours < 0 ||
			(H12 ? hours > 11 : hours > 23) ||
			minutes < 0 ||
			minutes > 59 ||
			seconds < 0 ||
			seconds > 59 ||
			milliseconds < 0 ||
			milliseconds > 999
		);
	}

	/**
	 * Validate a time H24
	 * @param {number} hours Hour of the time
	 * @param {number} minutes Minutes of the time
	 * @param {number} seconds Seconds of the time
	 * @returns {boolean} TRUE if valid; otherwise FALSE
	 */
	public checkTime(
		hours: number,
		minutes: number,
		seconds: number,
		milliseconds: number
	): boolean {
		return SHDate.checkTime(hours, minutes, seconds, milliseconds, false);
	}

	/**
	 * Validate a time H12
	 * @param {number} hours Hour of the time
	 * @param {number} minutes Minutes of the time
	 * @param {number} seconds Seconds of the time
	 * @returns {boolean} TRUE if valid; otherwise FALSE
	 */
	public checkTime12(
		hours: number,
		minutes: number,
		seconds: number,
		milliseconds: number
	): boolean {
		return SHDate.checkTime(hours, minutes, seconds, milliseconds, true);
	}

	/**
	 * Validate a week
	 * @param year  Year of the weeks
	 * @param week  Week of the weeks
	 * @param day  Day of the weeks
	 * @returns {boolean} TRUE if valid; otherwise FALSE
	 */
	public checkWeek(year: number, week: number, day: number): boolean {
		return !(
			year < 1 ||
			year > 10000 /* 3,500,000 */ ||
			week < 1 ||
			week > this.#weeksInYear(year) ||
			day < 0 ||
			day > 7
		);
	}

	/**
	 * Get date/time information
	 * @param   {number}  timestamp  The optional timestamp parameter is an integer Unix timestamp that defaults to the current local time if a timestamp is not given. In other words,it defaults to the value of jtime().
	 * @return  object  an associative object of information related to the timestamp.
	 */
	#getDates(timestamp: any = this.getTime(), isUTC: boolean = false) {
		let date: SHDate;
		if (typeof timestamp === "undefined") date = new SHDate();
		else if (timestamp instanceof SHDate) date = timestamp; // Not provided
		else date = new SHDate(timestamp);
		// Javascript Date() // UNIX timestamp (auto-convert to int)
		return {
			milliseconds: isUTC ? date.getUTCMilliseconds() : date.getMilliseconds(),
			seconds: isUTC ? date.getUTCSeconds() : date.getSeconds(),
			minutes: isUTC ? date.getUTCMinutes() : date.getMinutes(),
			hours: isUTC ? date.getUTCHours() : date.getHours(),
			date: isUTC ? date.getUTCDate() : date.getDate(),
			day: isUTC ? date.getUTCDay() : date.getDay(),
			month: isUTC ? date.getUTCMonth() : date.getMonth(),
			year: isUTC ? date.getUTCFullYear() : date.getFullYear(),
			doy: this.#dayOfYear(
				isUTC ? date.getUTCMonth() : date.getMonth(),
				isUTC ? date.getUTCDate() : date.getDate()
			),
			woy: this.#weekOfYear(
				isUTC ? date.getUTCFullYear() : date.getFullYear(),
				isUTC ? date.getUTCMonth() : date.getMonth(),
				isUTC ? date.getUTCDate() : date.getDate()
			),
			timestamp: date.getTime()
		};
	}
	getDates() {
		return this.#getDates(this.getTime(), false);
	}
	getUTCDates() {
		return this.#getDates(this.getTime(), true);
	}

	/**
	 * Get private data of solar hijri date
	 * @param {string} format - format of data
	 * @returns {array}
	 */
	public format(format: string, isUTC: boolean = false): any[] {
		const year: number = isUTC ? this.getUTCFullYear() : this.getFullYear(),
			month: number = isUTC ? this.getUTCMonth() : this.getMonth(),
			date: number = isUTC ? this.getUTCDate() : this.getDate(),
			hours: number = isUTC ? this.getUTCHours() : this.getHours(),
			minute: number = isUTC ? this.getUTCMinutes() : this.getMinutes(),
			second: number = isUTC ? this.getUTCSeconds() : this.getSeconds(),
			millisecond: number = isUTC
				? this.getUTCMilliseconds()
				: this.getMilliseconds(),
			weekday: number = isUTC ? this.getUTCDay() : this.getDay();
		var str: any[] = [];
		format.split(/\s*(?:=|$)\s*/).forEach((f) => {
			switch (f) {
				case "YY":
					str.push(`${year}`.padStart(4, "0"));
					break;
				case "yy":
					str.push(year);
					break;
				case "MM":
					str.push(`${month}`.padStart(2, "0"));
					break;
				case "mm":
					str.push(month);
					break;
				case "DD":
					str.push(`${date}`.padStart(2, "0"));
					break;
				case "dd":
					str.push(date);
					break;
				case "HH":
					str.push(`${hours}`.padStart(2, "0"));
					break;
				case "hh":
					str.push(hours);
					break;
				case "II":
					str.push(`${minute}`.padStart(2, "0"));
					break;
				case "ii":
					str.push(minute);
					break;
				case "SS":
					str.push(`${second}`.padStart(2, "0"));
					break;
				case "ss":
					str.push(second);
					break;
				case "MS":
					str.push(`${millisecond}`.padStart(3, "0"));
					break;
				case "ms":
					str.push(millisecond);
					break;
				case "Diy": // days In Year
					str.push(this.#daysInYear(year).toString().padStart(3, "0"));
					break;
				case "diy":
					str.push(this.#daysInYear(year));
					break;
				case "Doy": //day Of Year
					str.push(this.#dayOfYear(month, date).toString().padStart(3, "0"));
					break;
				case "doy":
					str.push(this.#dayOfYear(month, date));
					break;
				case "Dim": // days In Month
					str.push(this.#daysInMonth(year, month).toString().padStart(2, "0"));
					break;
				case "dim":
					str.push(this.#daysInMonth(year, month));
					break;
				case "Dow": // day Of Week
					str.push(`${weekday}`.padStart(2, "0"));
					break;
				case "dow":
					str.push(weekday);
					break;
				case "Wiy": //weeks In Year
					str.push(this.#weeksInYear(year).toString().padStart(2, "0"));
					break;
				case "wiy":
					str.push(this.#weeksInYear(year));
					break;
				case "Woy": //week Of Year
					const [iso_week, iso_year] = this.#weekOfYear(year, month, date);
					str.push([
						`${iso_week}`.padStart(2, "0"),
						`${iso_year}`.padStart(4, "0")
					]);
					break;
				case "woy": //week Of Year
					str.push(this.#weekOfYear(year, month, date));
					break;
				case "dsn": //day short names
					str.push(
						Word.getDayShortNames(
							weekday,
							this.#config.word_language,
							this.#config.first_day_of_week
						)
					);
					break;
				case "dfn": //day full names
					str.push(
						Word.getDayFullNames(
							weekday,
							this.#config.word_language,
							this.#config.first_day_of_week
						)
					);
					break;
				case "efn": //meridien full names
					str.push(
						Word.getMeridienFullNames(hours, this.#config.word_language)
					);
					break;
				case "esn": //meridien short names
					str.push(
						Word.getMeridienShortNames(hours, this.#config.word_language)
					);
					break;
				case "mfn": //month full names
					str.push(Word.getMonthFullNames(month, this.#config.word_language));
					break;
				case "msn": //month short names
					str.push(Word.getMonthShortNames(month, this.#config.word_language));
					break;
				case "asn": //animals full names
					str.push(Word.getAnimalsFullNames(year, this.#config.word_language));
					break;
				case "csn": //constellations full names
					str.push(
						Word.getConstellationsFullNames(month, this.#config.word_language)
					);
					break;
				case "ssn": //season full names
					str.push(Word.getSeasonFullNames(month, this.#config.word_language));
					break;
				case "osn": //solstice full names
					str.push(
						Word.getSolsticeFullNames(month, date, this.#config.word_language)
					);
					break;
				case "sun": //suffix names
					str.push(Word.getSuffixNames(date, this.#config.word_language));
					break;
				case "LPS":
				case "lps":
					str.push(this.#isLeapYear(year, true));
					break;
				default:
					str.push(f);
					break;
			}
		});
		return str;
	}

	/**
	 * Return current Unix timestamp
	 * @returns {number} - current Unix timestamp
	 */
	public static now(): number {
		return Date.now();
	}

	/**
	 * Returns the number of milliseconds between midnight, 11 Dey 1348 Universal Coordinated Time (UTC) (or GMT) and the specified date.
	 * @param {number} year — The full year designation is required for cross-century date accuracy. If year is between 0 and 99 is used, then year is assumed to be 1900 + year.
	 * @param {number} month — The month as a number between 0 and 11 (Farvardin to Esfand).
	 * @param {number} date — The date as a number between 1 and 31.
	 * @param {number} hours — Must be supplied if minutes is supplied. A number from 0 to 23 (midnight to 11pm) that specifies the hour.
	 * @param {number} minutes — Must be supplied if seconds is supplied. A number from 0 to 59 that specifies the minutes.
	 * @param {number} seconds — Must be supplied if milliseconds is supplied. A number from 0 to 59 that specifies the seconds.
	 * @param {number} milliseconds — A number from 0 to 999 that specifies the milliseconds.
	 * @returns {number} The number of milliseconds between midnight, 11 Dey 1348 UTC and the supplied date.
	 */
	public static UTC(...args: number[]): number {
		var date = new Date(new SHDate(args).getTime());
		return Date.UTC(
			date.getUTCFullYear(),
			date.getUTCMonth(),
			date.getUTCDate(),
			date.getUTCHours(),
			date.getUTCMinutes(),
			date.getUTCSeconds(),
			date.getUTCMilliseconds()
		);
	}

	#setFullYear(
		year: number,
		month: number | false = false,
		date: number | false = false,
		isUTC: boolean = false
	): number {
		month = this.#isFalse(month, isUTC ? this.getUTCMonth() : this.getMonth());
		date = this.#isFalse(date, isUTC ? this.getUTCDate() : this.getDate());
		const [gyear, gmonth, gdate] = this.#SolarToGregorian(year, month, date);
		if (typeof date == "number")
			isUTC
				? this.#date.setUTCFullYear(gyear, gmonth, gdate)
				: this.#date.setFullYear(gyear, gmonth, gdate);
		else if (typeof month == "number")
			isUTC
				? this.#date.setUTCFullYear(gyear, gmonth)
				: this.#date.setFullYear(gyear, gmonth);
		else this.#date.setFullYear(gyear);
		this.#updateDate();
		return this.getTime();
	}
	/**
	 * Sets the year of the Date object using local time.
	 * @param {number} year — A numeric value for the year.
	 * @param {number} month — A zero-based numeric value for the month (0 for Farvardin, 11 for Esfand). Must be *specified if numDate is specified.
	 * @param {number} date — A numeric value equal for the day of the month.
	 * @return {object} SHDate
	 */

	setFullYear(
		year: number,
		month: number | false = false,
		date: number | false = false
	): number {
		return this.#setFullYear(year, month, date, false);
	}

	/**
	 * Sets the year value in the Date object using Universal Coordinated Time (UTC).
	 * @param {number} year — A numeric value equal to the year.
	 * @param {number} month — A numeric value equal to the month. The value for Farvardin is 0, and other month values follow * consecutively. Must be supplied if numDate is supplied.
	 * @param {number} date — A numeric value equal to the day of the month.
	 * @return {object} SHDate
	 */
	setUTCFullYear(
		year: number,
		month: number | false = false,
		date: number | false = false
	): number {
		return this.#setFullYear(year, month, date, true);
	}

	#setMonth(
		month: number,
		date: number | false = false,
		isUTC: boolean = false
	): number {
		date = this.#isFalse(date, isUTC ? this.getUTCDate() : this.getDate());
		const [gyear, gmonth, gdate] = this.#SolarToGregorian(
			this.getFullYear(),
			month,
			date
		);
		if (typeof date == "number")
			isUTC
				? this.#date.setUTCMonth(gmonth, gdate)
				: this.#date.setMonth(gmonth, gdate);
		else isUTC ? this.#date.setUTCMonth(gmonth) : this.#date.setMonth(gmonth);
		this.#updateDate();
		return this.getTime();
	}
	/**
	 * Sets the month value in the Date object using local time.
	 * @param {number} month — A numeric value equal to the month. The value for Farvardin is 0, and other month values follow * consecutively.
	 * @param {number} date — A numeric value representing the day of the month. If this value is not supplied, the value from a * call to the getDate method is used.
	 * @return {object} SHDate
	 */
	setMonth(month: number, date: number | false = false): number {
		return this.#setMonth(month, date, false);
	}

	/**
	 * Sets the month value in the Date object using Universal Coordinated Time (UTC).
	 * @param {number} month — A numeric value equal to the month. The value for Farvardin is 0, and other month values follow * consecutively.
	 * @param {number} date — A numeric value representing the day of the month. If it is not supplied, the value from a call to  the getUTCDate method is used.
	 * @return {object} SHDate
	 */
	setUTCMonth(month: number, date: number | false = false): number {
		return this.#setMonth(month, date, true);
	}

	#setDate(date: number, isUTC: boolean = false): number {
		const [gyear, gmonth, gdate] = this.#SolarToGregorian(
			this.getFullYear(),
			this.getMonth(),
			date
		);
		isUTC ? this.#date.setUTCDate(gdate) : this.#date.setDate(gdate);
		this.#updateDate();
		return this.getTime();
	}
	/**
	 * Sets the numeric day-of-the-month value of the Date object using local time.
	 * @param {number} date — A numeric value equal to the day of the month.
	 * @returns {object} SHDate
	 */
	setDate(date: number): number {
		return this.#setDate(date, false);
	}

	/**
	 * 	Sets the numeric day of the month in the Date object using Universal Coordinated Time (UTC).
	 * @param {number} date — A numeric value equal to the day of the month.
	 * @returns {object} SHDate
	 */
	setUTCDate(date: number): number {
		return this.#setDate(date, true);
	}

	/**
	 * 	Sets the hour value in the Date object using local time.
	 *
	 * @param {number} hours — A numeric value equal to the hours value.
	 * @param {number} minutes — A numeric value equal to the minutes value.
	 * @param {number} seconds — A numeric value equal to the seconds value.
	 * @param {number} milliseconds — A numeric value equal to the milliseconds value.
	 * @returns {object} SHDate
	 */
	#setHours(
		hours: number,
		minutes: number | false = false,
		seconds: number | false = false,
		milliseconds: number | false = false,
		isUTC: boolean = false
	): number {
		milliseconds = this.#isFalse(
			milliseconds,
			isUTC ? this.getUTCMilliseconds() : this.getMilliseconds()
		);
		seconds = this.#isFalse(
			seconds,
			isUTC ? this.getUTCSeconds() : this.getSeconds()
		);
		minutes = this.#isFalse(
			minutes,
			isUTC ? this.getUTCMinutes() : this.getMinutes()
		);
		if (typeof milliseconds == "number")
			isUTC
				? this.#date.setUTCHours(hours, minutes, seconds, milliseconds)
				: this.#date.setHours(hours, minutes, seconds, milliseconds);
		else if (typeof seconds == "number")
			isUTC
				? this.#date.setUTCHours(hours, minutes, seconds)
				: this.#date.setHours(hours, minutes, seconds);
		else if (typeof minutes == "number")
			isUTC
				? this.#date.setUTCHours(hours, minutes)
				: this.#date.setHours(hours, minutes);
		else isUTC ? this.#date.setUTCHours(hours) : this.#date.setHours(hours);
		this.#updateTime();
		return this.getTime();
	}
	public setHours(
		hours: number,
		minutes: number | false = false,
		seconds: number | false = false,
		milliseconds: number | false = false
	): number {
		return this.#setHours(hours, minutes, seconds, milliseconds, false);
	}

	/**
	 * 	Sets the hours value in the Date object using Universal Coordinated Time (UTC).
	 *
	 * @param {number} hours — A numeric value equal to the hours value.
	 * @param {number} minutes — A numeric value equal to the minutes value.
	 * @param {number} seconds — A numeric value equal to the seconds value.
	 * @param {number} milliseconds — A numeric value equal to the milliseconds value.
	 * @returns {object} SHDate
	 */
	public setUTCHours(
		hours: number,
		minutes: number | false = false,
		seconds: number | false = false,
		milliseconds: number | false = false
	): number {
		return this.#setHours(hours, minutes, seconds, milliseconds, true);
	}

	/**
	 * 	Sets the minutes value in the Date object using local time.
	 *
	 * @param {number} minutes — A numeric value equal to the minutes value.
	 * @param {number} seconds — A numeric value equal to the seconds value.
	 * @param {number} milliseconds — A numeric value equal to the milliseconds value.
	 * @returns {object} SHDate
	 */
	#setMinutes(
		minutes: number,
		seconds: number | false = false,
		milliseconds: number | false = false,
		isUTC: boolean = false
	): number {
		milliseconds = this.#isFalse(
			milliseconds,
			isUTC ? this.getUTCMilliseconds() : this.getMilliseconds()
		);
		seconds = this.#isFalse(
			seconds,
			isUTC ? this.getUTCSeconds() : this.getSeconds()
		);
		if (typeof milliseconds == "number")
			isUTC
				? this.#date.setUTCMinutes(minutes, seconds, milliseconds)
				: this.#date.setMinutes(minutes, seconds, milliseconds);
		else if (typeof seconds == "number")
			isUTC
				? this.#date.setUTCMinutes(minutes, seconds)
				: this.#date.setMinutes(minutes, seconds);
		else
			isUTC
				? this.#date.setUTCMinutes(minutes)
				: this.#date.setMinutes(minutes);
		this.#updateTime();
		return this.getTime();
	}
	public setMinutes(
		minutes: number,
		seconds: number | false = false,
		milliseconds: number | false = false
	): number {
		return this.#setMinutes(minutes, seconds, milliseconds, false);
	}

	/**
	 * 	Sets the minutes value in the Date object using Universal Coordinated Time (UTC).
	 *
	 * @param {number} minutes — A numeric value equal to the minutes value.
	 * @param {number} seconds — A numeric value equal to the seconds value.
	 * @param {number} milliseconds — A numeric value equal to the milliseconds value.
	 * @returns {object} SHDate
	 */
	public setUTCMinutes(
		minutes: number,
		seconds: number | false = false,
		milliseconds: number | false = false
	): number {
		return this.#setMinutes(minutes, seconds, milliseconds, true);
	}

	/**
	 * Sets the seconds value in the Date object using local time.
	 *
	 * @param {number} seconds — A numeric value equal to the seconds value.
	 * @param {number} milliseconds — A numeric value equal to the milliseconds value.
	 * @returns {object} SHDate
	 */
	#setSeconds(
		seconds: number,
		milliseconds: number | false = false,
		isUTC: boolean = false
	): number {
		milliseconds = this.#isFalse(
			milliseconds,
			isUTC ? this.getUTCMilliseconds() : this.getMilliseconds()
		);
		if (typeof milliseconds == "number")
			isUTC
				? this.#date.setUTCSeconds(seconds, milliseconds)
				: this.#date.setSeconds(seconds, milliseconds);
		else
			isUTC
				? this.#date.setUTCSeconds(seconds)
				: this.#date.setSeconds(seconds);
		this.#updateTime();
		return this.getTime();
	}
	public setSeconds(
		seconds: number,
		milliseconds: number | false = false
	): number {
		return this.#setSeconds(seconds, milliseconds, false);
	}

	/**
	 * 	Sets the seconds value in the Date object using Universal Coordinated Time (UTC).
	 * @param {number} seconds — A numeric value equal to the seconds value.
	 * @param {number} milliseconds — A numeric value equal to the milliseconds value.
	 * @returns {object} SHDate
	 */
	public setUTCSeconds(
		seconds: number,
		milliseconds: number | false = false
	): number {
		return this.#setSeconds(seconds, milliseconds, true);
	}

	/**
	 * 	Sets the milliseconds value in the Date object using local time.
	 * @param {number} milliseconds — A number between 0 and 999, representing the milliseconds.
	 * @returns {object} SHDate
	 */
	#setMilliseconds(milliseconds: number, isUTC: boolean = false): number {
		isUTC
			? this.#date.setUTCMilliseconds(milliseconds)
			: this.#date.setMilliseconds(milliseconds);
		this.#updateTime();
		return this.getTime();
	}
	public setMilliseconds(milliseconds: number): number {
		return this.#setMilliseconds(milliseconds, false);
	}

	/**
	 * 	Sets the milliseconds value in the Date object using Universal Coordinated Time (UTC).
	 * @param {number} milliseconds — A number between 0 and 999, representing the milliseconds.
	 * @returns {object} The number of milliseconds between 11 Dey 1348 00:00:00 UTC and the updated date.
	 */
	public setUTCMilliseconds(milliseconds: number): number {
		return this.#setMilliseconds(milliseconds, true);
	}

	/**
	 * Gets the year, using local time.
	 * @returns {number} The year.
	 */
	public getFullYear(): number {
		return this.#sh.year as number;
	}

	/**
	 * Gets the year using Universal Coordinated Time (UTC).
	 * @returns {number} The year.
	 *
	 */
	public getUTCFullYear(): number {
		return this.#sh.UTC_year as number;
	}

	/**
	 * Gets the month, using local time.
	 * @returns {number} The month (0-11)
	 */
	public getMonth(): number {
		return this.#sh.month as number;
	}

	/**
	 * Gets the month of a Date object using Universal Coordinated Time (UTC).
	 * @returns {number} The month (0-11) in the Date object using Universal Coordinated Time (UTC).
	 */
	public getUTCMonth(): number {
		return this.#sh.UTC_month as number;
	}

	/**
	 * Gets the day-of-the-month, using local time.
	 * @returns {number} The day-of-the-month, using local time.
	 */
	public getDate(): number {
		return this.#sh.date as number;
	}

	/**
	 * Gets the day-of-the-month, using Universal Coordinated Time (UTC).
	 * @returns {number} The day-of-the-month, using Universal Coordinated Time (UTC).
	 */
	public getUTCDate(): number {
		return this.#sh.UTC_date as number;
	}

	/**
	 * Gets the hours in a date, using local time.
	 * @returns {number} The hours (from 0 to 23)
	 */
	public getHours(): number {
		return this.#date.getHours();
	}

	/**
	 * Gets the hours value in a Date object using Universal Coordinated Time (UTC).
	 * @returns {number} The hours (from 0 to 23)
	 */
	public getUTCHours(): number {
		return this.#date.getUTCHours();
	}

	/**
	 * Gets the minutes of a Date object, using local time.
	 * @returns {number} The minutes value in the Date object.
	 */
	public getMinutes(): number {
		return this.#date.getMinutes();
	}

	/**
	 * Gets the minutes of a Date object using Universal Coordinated Time (UTC).
	 * @returns {number} The minutes of the Date object using Universal Coordinated Time (UTC).
	 */
	public getUTCMinutes(): number {
		return this.#date.getUTCMinutes();
	}

	/**
	 * Gets the seconds of a Date object, using local time.
	 * @returns {number} The seconds of the Date object.
	 */
	public getSeconds(): number {
		return this.#date.getSeconds();
	}

	/**
	 * Gets the seconds of a Date object using Universal Coordinated Time (UTC).
	 * @returns {number} The seconds value in a Date object using Universal Coordinated Time (UTC).
	 */
	public getUTCSeconds(): number {
		return this.#date.getUTCSeconds();
	}

	/**
	 * Gets the milliseconds of a Date, using local time.
	 * @returns {number} The return value ranges from 0 to 999.
	 */
	public getMilliseconds(): number {
		return this.#date.getMilliseconds();
	}

	/**
	 * Gets the milliseconds of a Date object using Universal Coordinated Time (UTC).
	 * @returns {number} The return value ranges from 0 to 999.
	 */
	public getUTCMilliseconds(): number {
		return this.#date.getUTCMilliseconds();
	}

	/**
	 * Gets the day-of-the-week in a Date object, using local time.
	 * @returns {number} 0 for satarday , 1 for Sunday, and so on.
	 */
	public getDay(): number {
		return this.#dayOfWeek(this.getFullYear(), this.getMonth(), this.getDate());
		//return this.#GDOWToDOW(this.#date.getDay());
	}

	/**
	 * Gets the day-of-the-week in a Date object, using Universal Coordinated Time (UTC).
	 * @returns {number} 0 for satarday , 1 for Sunday, and so on.
	 */
	public getUTCDay(): number {
		return this.#dayOfWeek(
			this.getUTCFullYear(),
			this.getUTCMonth(),
			this.getUTCDate()
		);
	}

	/**
	 * Gets the difference in minutes between the time on the local computer and Universal Coordinated Time (UTC).
	 * @returns {number} The difference in minutes.
	 */
	public getTimezoneOffset(): number {
		return this.#date.getTimezoneOffset();
	}

	/**
	 * Sets the date and time value in the Date object.
	 * @param {number} time — A numeric value representing the number of elapsed milliseconds since midnight, 11 Dey 1348 GMT.
	 * @returns {object} The Date object.
	 */
	public setTime(time: number): number {
		//if (isUTC) return this.#date.setUTCTime(time);
		this.#date.setTime(time + this.#config.time_difference_server);
		this.#updateDate();
		return this.getTime();
	}

	/**
	 * Gets the time value in milliseconds.
	 * @returns {number}
	 */
	public getTime(): number {
		//if (isUTC) return this.#date.getUTCTime();
		return this.#date.getTime();
	}

	/**
	 * Gets the UTC time value in milliseconds.
	 * @returns {number}
	 */
	public getUTCTime(): number {
		//if (isUTC) return this.#date.getUTCTime();
		return this.#date.getTime() + this.getTimezoneOffset() * 60000;
	}

	/**
	 * Returns the stored time value in milliseconds since midnight, 11 Dey 1348 UTC.
	 * @returns {number}
	 */
	public valueOf(): number {
		return this.#date.valueOf();
	}

	/**
	 * Returns a string representation of a function.
	 * @returns {string} A string representation of a function.
	 */
	public toString(): string {
		//const [day_short_name, date, month_short_name, year] = this.format("dsn=DD=msn=YY");
		return `${this.toDateString()} ${this.toTimeString()}`;
	}

	/**
	 *
	 * @returns {string} A string representation of a function.
	 */
	public toUTCString(): string {
		//const [day_short_name, date, month_short_name, year] = this.format("dsn=DD=msn=YY", true);
		return `${this.toUTCDateString()} ${this.toUTCTimeString()}`;
	}

	/**
	 *
	 * @returns {string} A string representation of a function.
	 */
	public toDateString(): string {
		const [day_short_name, date, month_short_name, year] =
			this.format("dsn=DD=msn=YY");
		return `${day_short_name} ${date} ${month_short_name} ${year}`;
	}

	/**
	 *
	 * @returns {string} A string representation of a function.
	 */
	public toUTCDateString(): string {
		const [day_short_name, date, month_short_name, year] = this.format(
			"dsn=DD=msn=YY",
			true
		);
		return `${day_short_name}, ${date} ${month_short_name} ${year}`;
	}

	/**
	 * Returns a time as a string value.
	 * @returns {string} A string representation of a function.
	 */
	public toTimeString(): string {
		return this.#date.toTimeString();
	}

	/**
	 *
	 * @returns {string} A string representation of a function.
	 */
	public toUTCTimeString(): string {
		const [hours, minute, second] = this.format("HH=II=SS", true);
		return `${hours}:${minute}:${second} GMT`;
	}

	/**
	 *
	 * @returns {string} A string representation of a function.
	 */
	public toISOString(): string {
		const [dates, times] = this.#date.toJSON().split(/\s*(?:T|$)\s*/);
		const [year, month, date] = this.format("YY=MM=DD");
		return `${year}-${month}-${date}T${times}`;
	}

	/**
	 *
	 * @returns {string} A string representation of a function.
	 */
	public toJSON(): string {
		return this.toISOString();
	}

	/**
	 * Parses a string containing a date, and returns the number of milliseconds between that date and midnight, 11 Dey 1348.
	 * @param {string} str — A date string
	 * @returns {number} The number of milliseconds between that date and midnight, 11 Dey 1348.
	 * https://gitcode.net/openthos/gecko-dev/-/blob/GECKO120_2012041106_RELBRANCH/js/src/jsdate.cpp#L911
	 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/parse
	 * https://tc39.es/ecma262/multipage/numbers-and-dates.html#sec-date-time-string-format
	 * https://maggiepint.com/2017/04/11/fixing-javascript-date-web-compatibility-and-reality/
	 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/parse
	 * https://www.w3schools.com/js/js_date_formats.asp
	 */
	public static parse(str: string, time: number = Date.now()): number {
		//throw new Error("Not Implemented parse / Invalid Date"); // TODO: implement
		let date: SHDate = new SHDate(time),
			defaultDate = date.getDates(),
			now: number = 0,
			year: number = 0,
			month: number = 0,
			day: number = 1,
			hours: number = 0,
			minutes: number = 0,
			seconds: number = 0,
			milliseconds: number = 0,
			doy: number,
			week: number,
			tz: string = "",
			tztime: number = 0;
		//tzoffset: number = date.getTimezoneOffset() * -1 * 60000,
		const dataObj: any = new SHParser(str);
		Object.entries(dataObj).forEach(([key, value]: any) => {
			switch (key) {
				case "YEAR":
					year = Math.trunc(value);
					break;
				case "MONTH":
					month = Math.trunc(value) - 1;
					break;
				case "DAY":
					day = Math.trunc(value);
					break;
				case "HOURS":
					hours = Math.trunc(value);
					break;
				case "MINUTES":
					minutes = Math.trunc(value);
					break;
				case "SECONDS":
					seconds = Math.trunc(value);
					break;
				case "FRACTION":
					milliseconds = Math.trunc(value);
					break;
				case "TZ":
					tz = value;
					break;
				case "TZ_TIME":
					tztime = date.getTimezoneOffset() * -1 * 60000 - value;
					break;
				case "TIMESTAMP":
					date.setTime(Math.trunc(value));
					break;
				case "DAY_OF_YEAR":
					doy = Math.trunc(value);
					date.setdateOfDayOfYear(year, doy);
					year = date.getFullYear();
					month = date.getMonth();
					day = date.getDate();
					break;
				case "WEEK_OF_YEAR":
					week = Math.trunc(value);
					date.setWeek(
						year,
						week,
						dataObj.DAY_OF_WEEK ? Math.trunc(dataObj.DAY_OF_WEEK) - 1 : 0
					);
					year = date.getFullYear();
					month = date.getMonth();
					day = date.getDate();
					break;
				case "NOW":
					now = SHDate.now();
					date.setTime(now);
					break;
				case "TODAY_MIDNIGHT":
					[hours, minutes, seconds, milliseconds] = date.restTime(0, 0, 0, 0);
					break;
				case "NOON":
					[hours, minutes, seconds, milliseconds] = date.restTime(12);
					break;
				case "YESTERDAY":
					day = date.getDate() - 1;
					[hours, minutes, seconds, milliseconds] = date.restTime(0, 0, 0, 0);
					break;
				case "TOMORROW":
					day = date.getDate() + 1;
					[hours, minutes, seconds, milliseconds] = date.restTime(0, 0, 0, 0);
					break;
			}
		});
		year = year ? year : defaultDate.year;
		// console.log(year, month, day, hours, minutes, seconds, milliseconds);
		date.#setHours(hours, minutes, seconds, milliseconds);
		date.#setFullYear(year, month, day);
		date.setTime(date.getTime() + tztime);
		//console.log(JSON.stringify(SHParser, null, 2));
		// console.log(dataObj, str, `\n`, date.toString(), date.getTime());
		return date.getTime();
	}

	/**
	 * converts a Date object to a primitive value.
	 * @param {*} hint
	 * @returns
	 */
	public [Symbol.toPrimitive](hint: string | number): string | number {
		if (hint === "number") {
			return this.getTime() - this.#config.time_difference_server;
		} else if (hint === "string" || hint === "default") {
			return `SHDate ${this.toString()}`;
		}
		return this.toString();
	}

	/**
	 * Converts a time to a string by using the current or specified locale.
	 * @param {string | string[]} locales A locale string or array of locale strings that contain one or more language or locale tags. If you include more than one locale string, list them in descending order of priority so that the first entry is the preferred locale. If you omit this parameter, the default locale of the JavaScript runtime is used.
	 * @param {Intl.DateTimeFormatOptions} options An object that contains one or more properties that specify comparison options.
	 * @returns
	 */
	public toLocaleTimeString(
		locales?: string | string[],
		options?: Intl.DateTimeFormatOptions
	) {
		return this.#date.toLocaleTimeString(locales, options);
	}

	public toLocaleDateString(
		locales?: string | string[],
		options?: Intl.DateTimeFormatOptions
	) {
		return this.#date.toLocaleDateString(locales, options);
	}

	public toLocaleString(
		locales?: string | string[],
		options?: Intl.DateTimeFormatOptions
	) {
		return this.#date.toLocaleString(locales, options);
	}

	/**
	 * Set The time difference with the server - miliseconds
	 */
	setTimeServerDiff(time: number): void {
		this.#config.time_difference_server = time;
		this.#date.setTime(this.#date.getTime() - time);
	}
	/**
	 * Get The time difference with the server - miliseconds
	 */
	getTimeServerDiff(): number {
		return this.#config.time_difference_server;
	}

	/**
	 * Set Timezone identifier
	 */
	setTimeZone(time_zone: string): void {
		this.#config.time_zone = time_zone;
	}
	/**
	 * Get Timezone identifier
	 */
	getTimeZone(): string {
		return this.#config.time_zone;
	}

	/**
	 * Set Language words Software
	 * @param language Language words (en_US, fa_IR, ...)
	 * @returns void
	 */
	setLanguage(language: string): void {
		if (Word.check(language)) this.#config.word_language = language;
		else throw new Error("setLanguage: " + language + " not found");
	}
	/**
	 * Get Language words Software
	 * @returns Language words (en_US, fa_IR, ...)
	 */
	getLanguage(): string {
		return this.#config.word_language;
	}

	/**
	 * Start first day of the week (1: Saturday, ..., 7: Friday)
	 * @param FDOW first day of week (default: 1)
	 * @returns void
	 */
	setFirstDayOfWeek(FDOW: number = 1): void {
		if (FDOW >= 1 && FDOW <= 7) this.#config.first_day_of_week = FDOW - 1;
		else
			throw new Error(
				"setFirstDayOfWeek: " + FDOW + " less than 0 or more than 6"
			);
		return;
	}
	/**
	 * get first day of the week
	 * @returns number (0 = Saturday ,..., 6 = Friday)
	 */
	getFirstDayOfWeek(): number {
		return this.#config.first_day_of_week;
	}

	/**
	 * resets the time of the SHDate instance.
	 * @param {number} hours - The hours value (default: 0)
	 * @param {number} minutes - The minutes value (default: 0)
	 * @param {number} seconds - The seconds value (default: 0)
	 * @param {number} milliseconds - The milliseconds value (default: 0)
	 * @returns {boolean} Returns true after resetting the time
	 */
	#restTime(
		hours: number = 0,
		minutes: number = 0,
		seconds: number = 0,
		milliseconds: number = 0,
		isUTC: boolean = false
	): number[] {
		isUTC
			? this.setUTCHours(hours, minutes, seconds, milliseconds)
			: this.setHours(hours, minutes, seconds, milliseconds);
		return [hours, minutes, seconds, milliseconds];
	}
	public restTime(
		hours: number = 0,
		minutes: number = 0,
		seconds: number = 0,
		milliseconds: number = 0
	): number[] {
		return this.#restTime(hours, minutes, seconds, milliseconds, false);
	}
	public restUTCTime(
		hours: number = 0,
		minutes: number = 0,
		seconds: number = 0,
		milliseconds: number = 0
	): number[] {
		return this.#restTime(hours, minutes, seconds, milliseconds, true);
	}

	/**
	 * sets the configuration options for the SHDate instance.
	 * @param {...any[]} args - The configuration options to set
	 * @returns {void}
	 */
	public setConfig(...args: any[]): void {
		const config = { ...this.#config, ...args };
		this.setFirstDayOfWeek(config.first_day_of_week);
		this.setLanguage(config.word_language);
		this.setTimeZone(config.time_zone);
		this.setTimeServerDiff(config.time_difference_server);
	}

	#isFalse(data: number | false, defaultData: any): number {
		if (typeof data == "boolean") return defaultData;
		else return data;
	}

	/**
	 * creates a copy of the current date.
	 * @returns {SHDate} A copy of the current date
	 */
	public clone(): SHDate {
		return new SHDate(this);
	}

	/**
	 * an instance of the current date.
	 * @returns {SHDate} An instance of the current date
	 */
	public instance(): SHDate {
		return this;
	}
	/**
	 * the version of the SHDate class.
	 * @returns {string} The version of the SHDate class
	 */
	public static getVersion(): string {
		return SHDate.version;
	}
}
