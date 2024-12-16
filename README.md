# ChatMe - Real-Time Chat

ChatMe is a real-time chat application built with React, TypeScript, and Node.js, leveraging a serverless architecture on AWS for scalability and performance.

## Live Version
You can try the live version of the app here: [ChatMe](https://chatme.guilhermedev.com)

## Technologies Used

### Frontend
- **React**: The frontend is built using React, providing a dynamic and responsive user interface.
- **CloudFront**: The app is served via a CloudFront distribution, ensuring fast and reliable delivery across different regions.

### Backend
- **API Gateway (REST & WebSocket)**: Both REST and WebSocket API Gateways are used to handle communication with the frontend. WebSockets are used for real-time messaging.
- **AWS Lambda**: Lambda functions are used to process requests, execute backend logic, and interact with other AWS services.
- **DynamoDB**: A single-table design is used for efficient storage and retrieval of data.
- **S3**: Amazon S3 is used for storage, handling file uploads such as profile pictures.
- **SQS**: Amazon Simple Queue Service (SQS) is used for processing tasks asynchronously.
- **Cognito**: AWS Cognito is used for handling user authentication and managing user sessions.


### Infrastructure
- **AWS CDK**: All infrastructure is defined and managed using AWS Cloud Development Kit (CDK), ensuring scalable and maintainable resources.
- **GitHub Actions**: GitHub Actions is used to automate the CI/CD pipeline, deploying automatically to different environments.
