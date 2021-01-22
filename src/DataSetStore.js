import MongoDbStore from "@frappy/js-mongo-store"
import mongodb from "mongodb"

const getBaseUpdate = fullUpdate => {
    const baseUpdate = {}
    if (fullUpdate.assignments != null) {
        baseUpdate.assignments = fullUpdate.assignments
    }
    if (fullUpdate.label != null) {
        baseUpdate.label = fullUpdate.label
    }
    if (fullUpdate.relations != null) {
        baseUpdate.relations = fullUpdate.relations
    }
    return baseUpdate
}

class DataSetStore extends MongoDbStore {
    findByAssignment(assignmentId) {
        const query = {}
        query[`assignments.${assignmentId}`] = { $exists: true }
        return this.find(query, { payload: 0 })
    }

    findByType(dataType) {
        return this.find(
            {
                type: dataType,
            },
            { payload: 0 }
        )
    }

    findByRelation(dataSetId) {
        return this.find(
            {
                relations: `${dataSetId}`, // ensure we're not dealing with an object ID
            },
            { payload: 0 }
        )
    }

    findByAssignmentAndType(assignmentId, dataType) {
        const query = {
            type: dataType,
        }
        query[`assignments.${assignmentId}`] = { $exists: true }

        return this.find(query, { payload: 0 })
    }

    findByAssignmentType(assignmentId, assignmentType) {
        const query = {}
        query[`assignments.${assignmentId}`] = assignmentType
        return this.find(query, { payload: 0 })
    }

    getAllMetaData(paging = { pageSize: 50, page: 0 }) {
        if (paging.pageSize == null) {
            paging.pageSize = 25
        }
        return new Promise((resolve, reject) => {
            this.collection
                .find()
                .project({ payload: 0 })
                .skip(paging.page * paging.pageSize)
                .limit(paging.pageSize)
                .toArray()
                .then(result => {
                    resolve(result)
                })
                .catch(err => {
                    reject(err)
                })
        })
    }

    getMeta(docId) {
        return new Promise((resolve, reject) => {
            this.collection
                .findOne({ _id: mongodb.ObjectID(docId) }, { payload: 0 })
                .then(doc => {
                    resolve(doc)
                })
                .catch(err => {
                    reject(err)
                })
        })
    }

    updateDataSet(docId, update) {
        const setUpdate = getBaseUpdate(update)
        Object.keys(update.payload || []).forEach(key => {
            setUpdate[`payload.${key}`] = update.payload[key]
        })

        return new Promise((resolve, reject) => {
            this.collection
                .updateOne(
                    { _id: mongodb.ObjectID(docId) },
                    {
                        $set: setUpdate,
                    }
                )
                .then(() => {
                    resolve()
                })
                .catch(err => {
                    reject(err)
                })
        })
    }

    updateTargetFile(docId, targetPath, mimeType) {
        return new Promise((resolve, reject) => {
            this.collection
                .updateOne(
                    { _id: mongodb.ObjectID(docId) },
                    {
                        $set: {
                            "payload.targetFile": targetPath,
                            "payload.mimeType": mimeType,
                        },
                    }
                )
                .then(() => {
                    resolve()
                })
                .catch(err => {
                    reject(err)
                })
        })
    }

    // overwrite this as well, to avoid issues
    remove(dataSetId) {
        this.delete(dataSetId)
    }

    delete(dataSetId) {
        return super.delete(dataSetId).then(() =>
            this.collection.updateMany({
                relations: dataSetId,
            }, {
                "$pull": {
                    relations: dataSetId,
                }
            })
        )
    }
}

export default DataSetStore
