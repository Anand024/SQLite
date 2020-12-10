let resources = require('./resource.json');

function resource() {
    let k = []
    for(let r of resources) {
        k.push(r);
        
    }
    console.log(k.length);
    
}


resource();