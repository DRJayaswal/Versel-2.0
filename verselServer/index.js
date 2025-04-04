const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
dotenv.config();

const { generateSlug } = require('random-word-slugs');
const { ECSClient, RunTaskCommand } = require('@aws-sdk/client-ecs');

const ecsClient = new ECSClient({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
});

const app = express();
app.use(express.json());
app.use(cors({
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type']
  }));

const PORT = 9000;

app.listen(PORT, () => {
    console.log(`[INFO] Versel Server started on port: ${PORT}`);
});

app.post('/project', async (req, res) => {
    console.log('[INFO] Received request to create project.');
    const { gitUrl, slug } = req.body;
    const projectSlug = slug ? slug : generateSlug();

    if (!gitUrl) {
        console.error('[ERROR] Missing gitUrl in request body.');
        return res.status(400).json({ error: 'gitUrl is required' });
    }

    console.log(`[INFO] gitUrl: ${gitUrl}`);
    console.log(`[INFO] Generated project slug: ${projectSlug}`);

    const command = new RunTaskCommand({
        cluster: process.env.AWS_ECS_CLUSTER,
        taskDefinition: process.env.AWS_ECS_TASK_DEFINITION,
        launchType: process.env.AWS_ECS_LAUNCH_TYPE,
        count: 1,
        networkConfiguration: {
            awsvpcConfiguration: {
                subnets: process.env.AWS_SUBNET.split('*'),
                securityGroups: process.env.AWS_SECURITY_GROUP.split(','),
                assignPublicIp: 'ENABLED'
            }
        },
        overrides: {
            containerOverrides: [
                {
                    name: process.env.AWS_ECS_CONTAINER_NAME,
                    environment: [
                        { name: 'GIT_REPOSITORY_URL', value: gitUrl },
                        { name: 'AWS_REGION', value: process.env.AWS_REGION },
                        { name: 'AWS_ACCESS_KEY_ID', value: process.env.AWS_ACCESS_KEY_ID },
                        { name: 'AWS_SECRET_ACCESS_KEY', value: process.env.AWS_SECRET_ACCESS_KEY },
                        { name: 'AWS_S3_BUCKET', value: process.env.AWS_S3_BUCKET },
                        { name: 'PROJECT_SLUG', value: projectSlug },
                        { name: 'VERSEL_PORT', value: process.env.VERSEL_PORT },
                        { name: 'PROXY_PORT', value: process.env.PROXY_PORT },
                        { name: 'CORE_PATH', value: process.env.CORE_PATH }
                    ]
                }
            ]
        }
    });

    try {
        console.log('[INFO] Sending RunTaskCommand to ECS...');
        await ecsClient.send(command);
        console.log('[INFO] Task successfully queued in ECS.');
        return res.json({
            status: 'Queued',
            data: {
                projectUrl: `http://${projectSlug}.localhost:8000`
            }
        });
    } catch (error) {
        console.error(`[ERROR] Failed to queue task in ECS: ${error.message}`);
        return res.status(500).json({ error: 'Failed to queue task' });
    }
});