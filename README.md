# MongoDB Data Set Stores for NodeJS

Dataset Storage for NodeJS using MongoDB

## Usage

```javascript
import { DataSetStore } from "@frappy/js-mongo-dataset-store"
import mongodb from "mongodb"

const MONGO_URL = process.env.MONGO_URL || "mongodb://localhost:27017"
// create mongoDB connection
mongodb.MongoClient.connect(MONGO_URL, {
    useNewUrlParser: true,
}).then(client => {
    // initialise store
    const dataSetStore = new DataSetStore(client, "myDatabaseName", "dataSets")
    
    dataSetStore.findByAssignmentAndType("group1", "forecastInput").then(dataSets => { 
        // list of data sets (meta info) matching the requested assignment type
        dataSets.forEach(dataSet => {
            console.log(dataSet.label, dataSet.payload)
        })  
    })
})
```

## Methods

- `findByAssignment(assignmentId)` - returns a list of data sets (meta only) assigned to the provided reference.
- `findByType(dataType)` - returns a list of all data sets (meta only) of a specific type (e.g. `TIME_SERIES` or 
 `IMAGE`)
- `findByAssignmentType(assignmentId, assignmentType)` - returns a list of data sets (meta only) of a given type within
 a specific reference (e.g. `findByAssignmentAndType("demo1", "weather_data")` would give you all weather data sets 
 uploaded and assigned to "demo1")
- `findByAssignmentAndType(assignmentId, dataType)` - returns a list of all data sets (meta only) matching a specific 
 type (e.g. `TIME_SERIES` or `IMAGE`) that are assigned to a specific reference (`assignmentId`).
- `getAllMetaData(paging = { pageSize: 50, page: 0 })` - returns all data set (meta only) with the option to provide a
 paging parameter. By default retrieves the first 50 data sets.
- `getMeta(docId)` - retrieves just the meta information (no payload) of a specific data set.
- `updateDataSet(docId, update)` - updates information of a data set. The `docId` specifies which document to update. 
 The update itself is a JSON object that can contain root-level keys of the data structure to update (`assignments`, 
 `labels`, `relations`) and also allows to update/overwrite the `payload` keys, by providing `payload: { ... }` in the
 `update` parameter object. This method will ensure that keys *not* mentioned in the payload, *won't* be overwritten. 
- `updateTargetFile(docId, targetPath, mimeType)` - more or less an internal method to update the `payload.targetFile`
 of an uploaded image or binary, since the final path is only known after the creation of the document as it includes 
 the `_id` as the file name.
 