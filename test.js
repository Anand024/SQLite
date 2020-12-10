function generateResources() {

    let resources = [];

    let temp = {
        "account_id": "279497102658",
        "service_id": "AmazonEC2",
        "actual_resource_id": "",
        "region": "",
        "sku": "",
        "resource_id": "AmazonEC2",
        "master_account_id": "829775318923",
        "service_name": "Amazon Elastic Compute Cloud",
        "provider_id": "aws",
        "connector_id": "a92a-connector-id",
        "tags": [],
        "created_at": 1598918400000,
        "name": "Tax",
        "type": "Tax",
        "properties": {
          "instance-type": "",
          "availability-zone": "",
          "usage-amount": 1,
          "actual_resource_id": ""
        },
        "app_id": "",
        "category": "tax",
        "account_name": "AWS DSO TSI-QA CC39799"
    };

    for (let i= 0; i < 100000; i++) {
        temp.resource_id = "AmazonEC2" + i;
        resources.push(Object.assign({}, temp));
    }
    setTimeout(() => {
        console.log(JSON.stringify(resources));
    }, 500);
    
}

generateResources();