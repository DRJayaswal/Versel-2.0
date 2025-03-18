const { exec } = require('child_process')
const path = require('path')
const fs = require('fs')
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3')
const mime = require('mime')

// Check for required environment variables
if (!process.env.REGION || !process.env.ACCESS_KEY_ID || !process.env.SECRET_ACCESS_KEY) {
    console.error("Missing required environment variables. Please set REGION, ACCESS_KEY_ID, and SECRET_ACCESS_KEY.")
    process.exit(1)
}

const s3Client = new S3Client({
    region: process.env.REGION,
    credentials: {
        accessKeyId: process.env.ACCESS_KEY_ID,
        secretAccessKey: process.env.SECRET_ACCESS_KEY,
    },
})

async function init() {
    console.log("Executing Script....")
    console.log("Building....")
    const outDirPath = path.join(__dirname, 'output')
    const p = exec(`cd ${outDirPath} && npm install && npm run build`)
    p.stdout.on('data', function(data) {
        console.log(data.toString());
    })
    p.stdout.on('error', function(data) {
        console.log(data.toString());
    })
    console.log("Build...!")
    p.on('close', async function() {
        console.log("Uploading....")
        const distFolder = path.join(__dirname, 'output', 'dist')
        const distContent = fs.readdirSync(distFolder, { recursive: true })
        for (const file of distContent) {
            const filePath = path.join(distFolder, file)
            if (!fs.lstatSync(filePath).isDirectory) {
                const command = new PutObjectCommand({
                    Bucket: 'versel',
                    Key: `__outputs/${Project_ID}/${filePath}`,
                    Body: fs.ReadStream(filePath),
                    ContentType: mime.lookup(filePath),
                })
                await s3Client.send(command)
            }
        }
        console.log("Uploaded...!")
    })
    console.log("Done with Scripts")
}

init()