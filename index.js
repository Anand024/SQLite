const Promise = require('bluebird');
const AppDAO = require('./dao');
const now = require("performance-now");
const ProjectRepository = require('./project_repository');
const resources = require('./resources_test.json')
this.projectRepo = {};
this.dao = {};

function Demo() {
    this.isDBCreated = false;
    this.resourceList = [];
    this.dao = new AppDAO('./database.sqlite1');
    this.projectRepo = new ProjectRepository(this.dao);
    this.count = 0;
    this.projectRepo.createTable().then((res) => {
        this.isDBCreated = true;
        console.log('Created Table successfully');
    }).catch((err) => {
        console.log('Fail to create Table');
        console.log(JSON.stringify(err))
    });
}
Demo.prototype = {
    buildPayload: async function (record) {
        try {
            if (this.isDBCreated) {   
                let obj = {
                    "resource_id": record.resource_id,
                    "json_obj": JSON.stringify(record)
                }
                await this.projectRepo.upsert(obj).then((res) => {
                    console.log("updated record successfully: " + JSON.stringify(record.resource_id));
                }).catch((err) => {
                    console.log('Fail to insert record: ' + JSON.stringify(record.resource_id));
                    console.log(JSON.stringify(err))
                });
            }
        } catch (err) {
            console.log('Http error', err);
            return;
        }
    },


    buildBatchPayload: async function (record) {
        try {
            if (this.isDBCreated) {
                let obj = {
                    "resource_id": record.resource_id,
                    "json_obj": JSON.stringify(record)
                }

                this.resourceList.push(obj);

                if (this.resourceList.length === 1000) {
                    await this.projectRepo.batchUpsert(this.resourceList).then((res) => {
                        ++ this.count;
                        console.log("updated record successfully: " + this.count);
                    }).catch((err) => {
                        console.log('Fail to insert record: ' + JSON.stringify(record.resource_id));
                        console.log(JSON.stringify(err));
                    });
                }
            }
        } catch (err) {
            console.log('Http error', err);
            return;
        }
    },
    retreiveData: async function () {
        console.log('calling retreive data');
    
        await this.projectRepo.getAll().then((data) => {
            for (const obj in data) {
                data[obj].properties = JSON.parse(data[obj].properties);
            }
            console.log("data: " + JSON.stringify(data));
        })
        
    },
    dropTable: async function() {
        let drop;
        // console.log("deleting table");
        drop = await this.projectRepo.drop().then((res) => {
            console.log("deleted table data successfully");
        }).catch((err) => {
            console.log('error: ' + err);
            return;
        })
    },

    begin() {
        this.projectRepo.begin();
    },

    commit() {
        this.projectRepo.commit();
    }
}
var demo = new Demo();


setTimeout(() => {
    demo.dropTable().then(() => {
        console.log("--------------------STARTED-------------------------");
        const start = now();
        demo.begin();
        var processItems = async function (x) {
            if (x < resources.length) {
                console.log("processing item: " + x);
                await demo.buildBatchPayload(resources[x]);
                console.log("processed item: " + x);
                processItems(x + 1);
            }
            if (x == resources.length) {
                demo.commit();
                console.log("--------------------ENDED--------------------------");
                const end = now();
              //  console.log(start.toFixed(3));
                console.log("Time taken in milliseconds: " + (end - start).toFixed(3));
            }
        };

        processItems(0);
    })
}, 500);
