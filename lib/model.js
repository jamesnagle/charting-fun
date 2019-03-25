class Model {
    constructor(securitesModelInterface, persistanceInstance) {
        this.model = securitesModelInterface;
        this.db = persistanceInstance;
    }
    setSchema(schemaInterface) {
        this.model.setSchema(schemaInterface); 
        this.db.setSchema(schemaInterface);
    }
    init(tableName, modelData) {
        const modelInterfaceInstance = this.model.init(tableName, modelData);
        return Object.assign( Object.create( Object.getPrototypeOf(this)), this);
    }
}

const securitesModelInterface = {
    setSchema: function (schemaInterface) {
        this.schema = schemaInterface;
    },
    init: function(tableName, modelData) {
        this.data = modelData;
        this.tableName = tableName;
        return Object.assign( Object.create( Object.getPrototypeOf(this)), this);
    }
}

const securitiesSchemaInterface = {
    Date: 'TEXT',
    Open: 'INTEGER',
    High: 'INTEGER',
    Low: 'INTEGER',
    Close: 'INTEGER',
    AdjClose: 'INTEGER',
    Volume: 'INTEGER'
}

module.exports = {
    Model,
    securitesModelInterface,
    securitiesSchemaInterface
}