class BasicIterator {
    constructor(items) {
        this.index = 0;
        this.items = items;
    }
    first() {
        this.reset();
        return this.next();
    }
    next() {
        return this.items[this.index++];
    }
    hasNext() {
        return this.index <= this.items.length;
    }
    reset() {
        this.index = 0;
    }
    isLast() {
        return this.index < this.items.length;
    }
    count() {
        return this.items.length;
    }
    each(callback) {
        for (var item = this.first(); this.hasNext(); item = this.next()) {
            callback(item, this.isLast());
        }
    }
}

module.exports = BasicIterator;