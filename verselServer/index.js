const express = require('express');
const dotenv = require('dotenv');
dotenv.config();

const { generateSlug } = require('random-word-slugs');
const {ECSClient,RunTaskCommand} = require('@aws-sdk/client-ecs')

const ecsClient = new ECSClient({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
})

const app = express();
app.use(express.json())

const PORT = 9000;

app.listen(PORT, () => {
    console.log(`Versel Server on: ${PORT}`);
});

app.post('/project', async (req, res) => {

    const { gitUrl } = req.body
    const projectSlug = generateSlug();

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
    })
    await ecsClient.send(command);
    return res.json({
        status: 'Queued',
        data:{
            projectUrl: `http://${projectSlug}.localhost:8000`
        }
    });
    
});