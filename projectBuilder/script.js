const { exec } = require('child_process')
const path = require('path')
const fs = require('fs')
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3')
const mime = require('mime-types')

const requiredEnvVars = ['AWS_REGION', 'AWS_ACCESS_KEY_ID', 'AWS_SECRET_ACCESS_KEY','AWS_S3_BUCKET']
const missingEnvVars = requiredEnvVars.filter((envVar) => !process.env[envVar])

if (missingEnvVars.length > 0) {
    console.error(`[ERROR] Missing ENV Variables: ${missingEnvVars.join(', ')}`)
    process.exit(1)
}

const s3Client = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
})
function generateProjectSlug() {
    const timestamp = Date.now().toString(36);
    const randomString = Math.random().toString(36).substring(2, 8);
    return `${randomString}-${timestamp}`;
}

const projectSlug = generateProjectSlug()

async function init() {
    console.log('[INFO] Starting script execution...')
    try {
        const outDirPath = path.join(__dirname, 'output')
        console.log(`[INFO] Output directory path: ${outDirPath}`)

        console.log('[INFO] Running npm install and build...')
        const p = exec(`cd ${outDirPath} && npm install && npm run build`)

        p.stdout.on('data', function (data) {
            console.log(`[STDOUT] ${data.toString()}`)
        })

        p.stderr.on('data', function (data) {
            console.error(`[STDERR] ${data.toString()}`)
        })

        p.on('error', function (error) {
            console.error(`[ERROR] Process error: ${error.message}`)
        })

        p.on('close', async function (code) {
            console.log(`[INFO] Build process exited with code: ${code}`)
            if (code !== 0) {
                console.error('[ERROR] Build process failed.')
                return
            }

            console.log('[INFO] Build complete. Preparing to upload files...')
            const distFolderPath = path.join(__dirname, 'output', 'dist')
            console.log(`[INFO] Dist folder path: ${distFolderPath}`)

            const distFolderContents = fs.readdirSync(distFolderPath, { recursive: true })
            console.log(`[INFO] Files in dist folder: ${distFolderContents}`)

            for (const file of distFolderContents) {
                const filePath = path.join(distFolderPath, file)
                if (fs.lstatSync(filePath).isDirectory()) {
                    console.log(`[INFO] Skipping directory: ${filePath}`)
                    continue
                }

                console.log(`[INFO] Uploading file: ${filePath}`)

                console.log(`[INFO] Generated Slug: ${projectSlug}`)
                const command = new PutObjectCommand({
                    Bucket: process.env.AWS_S3_BUCKET,
                    Key: `outputs/${projectSlug}/${file}`,
                    Body: fs.createReadStream(filePath),
                    ContentType: mime.lookup(filePath) || 'application/octet-stream'
                })

                try {
                    await s3Client.send(command)
                    console.log(`[INFO] Successfully uploaded: ${filePath}`)
                } catch (uploadError) {
                    console.error(`[ERROR] Failed to upload ${filePath}: ${uploadError.message}`)
                }
            }
            console.log('[INFO] All files uploaded successfully. Script execution complete.')
        })
    } catch (error) {
        console.error(`[ERROR] Unexpected error: ${error.message}`)
    }
}

init()