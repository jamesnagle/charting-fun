const fs = require('fs');
const csv = require('fast-csv');
const spigot = require('stream-spigot');
const { BasicIterator } = require('./iterator');

class File {
    constructor(fileInterface) {
        this.file = fileInterface;
    }
    read(filePath) {
        this.file.read(filePath);
    }
}
class CSV extends File {
    constructor(fileInterface) {
        super(fileInterface);
        this._rows = [];
    }
    async read(filePath) {
        let chunks = await this.file.read(filePath);
        const csvDataIterator = await this._csvPromise(chunks);
        chunks = null;
        return csvDataIterator;
    }
    _csvPromise(chunks) {
        return new Promise((res, rej) => {
            spigot.array(chunks)
                .pipe(csv({headers: true}))
                .on('data', (rows) => {
                    this._rows.push(rows);
                })
                .on('end', () => {
                    const iterator = new BasicIterator(this._rows);
                    this._rows = null;
                    res(iterator);
                });
        });
    }
}

const localFileInterface = {
    _chunks: [],
    read: function (filePath) {
        return new Promise((res, rej) => {
            const fileStream = fs.createReadStream(filePath);

            fileStream.on('error', (err) => {
                rej(err);
            });

            fileStream.on('data', (chunk) => {
                this._chunks.push(chunk);
            });
            
            fileStream.on('close', () => {
                res(this._chunks);
            });
        });
    }
}

module.exports = {
    File,
    CSV,
    localFileInterface
}