class ProjectRepository {
    constructor(dao) {
        this.dao = dao
    }

    begin() {
        this.dao.beginTransaction();
    }

    commit() {
        this.dao.commit();
    }

    
    createTable() {
        const sql = `CREATE TABLE IF NOT EXISTS resources (resource_id TEXT PRIMARY KEY, json_obj TEXT)`;
        return this.dao.run(sql);
    }

    insert(obj) {
        return this.dao.run(
            `INSERT INTO resources (resource_id, json_obj) 
                VALUES (?, ?)`,
                [ obj.resource_id, obj.json_obj])
    }

    update(obj) {
        return this.dao.run(
                `UPDATE resources SET account_id = ?, service_id = ? WHERE resource_id = ?`, [obj.account_id, obj.service_id, obj.resource_id]
        )
    }

    upsert(obj) {
        return this.dao.run(
            `INSERT INTO resources (resource_id, json_obj)
            VALUES (?, ?)
            ON CONFLICT(resource_id) DO UPDATE SET json_obj = excluded.json_obj`, [obj.resource_id, obj.json_obj])
    }


    batchUpsert(resources = []) {
        

        var tempFn = (resourceList) => {
            let placeholders = resourceList.map(() => '(?, ?)').join(',');
            let values = [];
            resourceList.forEach((resource) => {
                let temp = [resource.resource_id, resource.json_obj];
                values.push(temp);
            });
            let flatArtist = [];
            values.forEach((arr) => { 
                arr.forEach((item) => { flatArtist.push(item) }) 
            });
            
            let query = `INSERT INTO resources (resource_id, json_obj) VALUES ${placeholders} ON CONFLICT(resource_id) DO UPDATE SET json_obj = excluded.json_obj`;
            return this.dao.run(query, flatArtist);
        }

        let promises = [];
        while (resources.length > 0) {
            promises.push(tempFn(resources.splice(0, 490)));
        }
        return Promise.all(promises);


    }

    getAll() {
        return this.dao.all(`SELECT * FROM resources`);
    }

    close() {
        return this.dao.close();
    }

    drop() {
        return this.dao.run(`DELETE FROM resources`);
    }

    deleteRecords(resource_id) {
        return this.dao.run(`DELETE FROM resources WHERE resource_id  = ?`, resource_id);
    }
}

module.exports = ProjectRepository;