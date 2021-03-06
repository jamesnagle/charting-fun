const moment = require('moment');

class DateRange {
    constructor(predefined = null) {
        if (!predefined) {
            return this;
        }
        if (this.isPredefined(predefined)) {
            this.predefined(predefined);
        } else {
            throw "Argument passed to DateRange constructor is invalid."
        }
    }
    custom(from, to) {
        if (!this._isDateFormat(from)) {
            throw "First argument passed to DateRange.custom() is invalid";
        }
        if (!this._isDateFormat(to)) {
            throw "Second argument passed to DateRange.custom() is invalid";
        }
        this.to = to;
        this.from = from;
    }
    last7Days() {
        this.to = this.yesterday();
        this.from = moment().subtract(7, 'days').format('YYYY-MM-DD');
    }
    last14Days() {
        this.to = this.yesterday();
        this.from = moment().subtract(14, 'days').format('YYYY-MM-DD');
    }
    last30Days() {
        this.to = this.yesterday();
        this.from = moment().subtract(30, 'days').format('YYYY-MM-DD');
    }
    last60Days() {
        this.to = this.yesterday();
        this.from = moment().subtract(60, 'days').format('YYYY-MM-DD');
    }
    last90Days() {
        this.to = this.yesterday();
        this.from = moment().subtract(90, 'days').format('YYYY-MM-DD');
    }
    last6Months() {
        this.to = this.yesterday();
        this.from = moment().subtract(6, 'months').format('YYYY-MM-DD');
    }
    lastYear() {
        this.to = this.yesterday();
        this.from = moment().subtract(1, 'years').format('YYYY-MM-DD');
    }
    last2Years() {
        this.to = this.yesterday();
        this.from = moment().subtract(2, 'years').format('YYYY-MM-DD');
    }
    last5Years() {
        this.to = this.yesterday();
        this.from = moment().subtract(5, 'years').format('YYYY-MM-DD');
    }
    last10Years() {
        this.to = this.yesterday();
        this.from = moment().subtract(10, 'years').format('YYYY-MM-DD');
    }
    yesterday() {
        return moment().subtract(1, 'days').format('YYYY-MM-DD');
    }
    today() {
        return moment().format('YYYY-MM-DD');
    }
    predefined(str) {
        switch (str) {
            case 'LAST_7_DAYS':
                this.last7Days();
                break;

            case 'LAST_14_DAYS':
                this.last14Days();
                break;

            case 'LAST_30_DAYS':
                this.last30Days();
                break;

            case 'LAST_60_DAYS':
                this.last60Days();
                break;

            case 'LAST_90_DAYS':
                this.last90Days();
                break;

            case 'LAST_6_MONTHS':
                this.last6Months();
                break;

            case 'LAST_YEAR':
                this.lastYear();
                break;

            case 'LAST_2_YEARS':
                this.last2Years();
                break;

            case 'LAST_5_YEARS':
                this.last5Years();
                break;

            case 'LAST_10_YEARS':
                this.last10Years();
                break;
        }
        return this;
    }
    get() {
        return {
            from: this.from,
            to: this.to
        }
    }
    isPredefined(str) {
        return (str === 'LAST_7_DAYS'
            || str === 'LAST_14_DAYS' 
            || str === 'LAST_30_DAYS' 
            || str === 'LAST_60_DAYS' 
            || str === 'LAST_90_DAYS' 
            || str === 'LAST_6_MONTHS' 
            || str === 'LAST_YEAR' 
            || str === 'LAST_2_YEARS' 
            || str === 'LAST_5_YEARS' 
            || str === 'LAST_10_YEARS') ? true : false;
    }
    _isDateFormat(str) {
        const regEx = /^\d{4}-\d{2}-\d{2}$/;
        if (str.match(regEx)) {
            return true;
        }
        return false
    }
}

module.exports = DateRange;