class ProjectRepository {
    constructor(dao) {
        this.dao = dao
    }

    createTable() {
        const sql = `CREATE TABLE IF NOT EXISTS resources (
            account_id TEXT,
            service_id TEXT,
            actual_resource_id TEXT,
            region TEXT,
            sku TEXT,
            resource_id TEXT PRIMARY KEY,
            master_account_id TEXT,
            service_name TEXT,
            provider_id TEXT,
            connector_id TEXT,
            tags TEXT,
            created_at INTEGER,
            name TEXT,
            type TEXT,
            properties TEXT,
            app_id TEXT,
            category TEXT,
            account_name TEXT
        )`;
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

    upsert(resource) {
        return this.dao.run(
            `INSERT INTO resources (account_id, service_id, actual_resource_id, region, sku, resource_id,
                master_account_id, service_name, provider_id, connector_id, tags, created_at, name, type,
                properties, app_id, category, account_name
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(resource_id) DO UPDATE SET account_id = excluded.account_id, service_id = excluded.service_id, actual_resource_id = excluded.actual_resource_id,
            region = excluded.region, sku = excluded.sku, master_account_id = excluded.master_account_id, service_name = excluded.service_name, provider_id = excluded.provider_id,
            connector_id = excluded.connector_id, tags = excluded.tags, created_at = excluded.created_at, name = excluded.name, type = excluded.type,
            properties = excluded.properties, app_id = excluded.app_id, category = excluded.category, account_name = excluded.account_name`, 
            [resource.account_id, resource.service_id, resource.actual_resource_id, resource.region, resource.sku, resource.resource_id, resource.master_account_id, resource.service_name,
                resource.provider_id, resource.connector_id, resource.tags, resource.created_at, resource.name, resource.type, resource.properties, resource.app_id, resource.category, resource.account_name
            ])
    }


    batchUpsert(resources) {
        var tempFn = (resourceList) => {
            let placeholders = resourceList.map(() => '(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)').join(',');
            let values = [];
            resourceList.forEach((resource) => {
                let temp = [resource.account_id, resource.service_id, resource.actual_resource_id, resource.region, resource.sku, resource.resource_id, resource.master_account_id, resource.service_name,
                    resource.provider_id, resource.connector_id, resource.tags, resource.created_at, resource.name, resource.type, resource.properties, resource.app_id, resource.category, resource.account_name
                ];
                values.push(temp);
            });

            let flatArtist = [];
            values.forEach((arr) => { 
                arr.forEach((item) => { flatArtist.push(item) }) 
            });

            let query = `INSERT INTO resources (account_id, service_id, actual_resource_id, region, sku, resource_id,
                master_account_id, service_name, provider_id, connector_id, tags, created_at, name, type,
                properties, app_id, category, account_name) VALUES ${placeholders} ON CONFLICT(resource_id) DO UPDATE SET account_id = excluded.account_id, service_id = excluded.service_id, actual_resource_id = excluded.actual_resource_id,
                region = excluded.region, sku = excluded.sku, master_account_id = excluded.master_account_id, service_name = excluded.service_name, provider_id = excluded.provider_id,
                connector_id = excluded.connector_id, tags = excluded.tags, created_at = excluded.created_at, name = excluded.name, type = excluded.type,
                properties = excluded.properties, app_id = excluded.app_id, category = excluded.category, account_name = excluded.account_name`;

            return this.dao.run(query, flatArtist);
            // return this.dao.run(
            //     `INSERT INTO resources (account_id, service_id, actual_resource_id, region, sku, resource_id,
            //     master_account_id, service_name, provider_id, connector_id, tags, created_at, name, type,
            //     properties, app_id, category, account_name)
            // VALUES ${placeholders}
            // ON CONFLICT(resource_id) DO UPDATE SET account_id = excluded.account_id, service_id = excluded.service_id, actual_resource_id = excluded.actual_resource_id,
            // region = excluded.region, sku = excluded.sku, master_account_id = excluded.master_account_id, service_name = excluded.service_name, provider_id = excluded.provider_id,
            // connector_id = excluded.connector_id, tags = excluded.tags, created_at = excluded.created_at, name = excluded.name, type = excluded.type,
            // properties = excluded.properties, app_id = excluded.app_id, category = excluded.category, account_name = excluded.account_name`,
            //     values
            // );
        }

        let promises = [];
        while (resources.length > 0) {
            promises.push(tempFn(resources.splice(0, 50)));
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

    begin() {
        this.dao.beginTransaction();
    }

    commit() {
        this.dao.commit();
    }
}

module.exports = ProjectRepository;