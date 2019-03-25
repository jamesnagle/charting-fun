class Transformer {
    constructor(dataStructureInterface) {
        this.dataStructure = dataStructureInterface;
    }
    encode(data) {
        return this.dataStructure.encode(data);
    }
    decode(data) {
        return this.dataStructure.decode(data);
    }
}

const stringifyDataStructureInterface = {
    encode: function (data) {
        return JSON.stringify(data);
    },
    decode: function (data) {
        return JSON.parse(data);
    }
}

module.exports = {
    Transformer,
    stringifyDataStructureInterface
}