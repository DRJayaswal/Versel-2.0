const {exec} = require('child_process');
const path = require('path');
const fs = require('fs');
async function init() {

    console.log("Script Initialized...\n");
    
    const projectDirectory = path.join(__dirname, 'output');
    const buildProject = exec(`
        // Change to project directory
        cd ${projectDirectory}
        &&
        // Install dependencies
        npm install
        &&
        // Build project
        npm run build`);

    buildProject.stdout.on('data', (data) => {
        console.log(`Project Data\n${data}`);
    });
    buildProject.stderr.on('error', (data) => {
        console.log(`Project Error\n${data}`);
    });
    buildProject.on('close', (code) => {
        console.log(`Project Build.\n Exit Code: ${code}`);
    });



    
    console.log("Script Terminated...");
}

async function getDist() {
    const distDirectory = path.join(__dirname, 'output', 'dist');
    const dist = fs.readdirSync(distDirectory,
        {
            recursive: true,
        }
    );

    for(const file of dist) {
        const filePath = path.join(distDirectory, file);
        if (fs.lstatSync(filePath).isFile()) {
            console.log(file);
        }
    }
}
getDist();
// init();
