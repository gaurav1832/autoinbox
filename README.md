# ReachInbix-Assignment
## Automatic Email Parsing and Analysis Tool

This project provides a robust solution for managing emails via Google and Microsoft Outlook APIs, integrated within a Node.js application. It handles authentication, email retrieval, automatic labeling, and sending replies based on analyzed content.

## Overview

The service is designed to fetch emails, categorize them based on their content using AI-based analysis, and respond accordingly. This functionality is split across several modules to ensure modularity and maintainability of the code.

## Key Components

- **Google and Outlook Authentication**: Uses OAuth2 protocols to authenticate users and fetch tokens necessary for API requests.
- **Email Fetching and Sending**: Implements functionality to retrieve emails from user accounts, analyze their content, and send appropriate responses.
- **Email Analysis**: Leverages an AI service (simulated by `emailAnalysis.js`) to interpret the content of emails and determine the nature of the response required.
- **Job Scheduling**: Utilizes BullMQ for managing background tasks such as sending emails or processing incoming emails at regular intervals.

## Technologies Used

- **Node.js**: The core backend platform, chosen for its efficiency and the vast availability of libraries.
- **Express.js**: Web framework for Node.js used to structure the service and handle API requests.
- **Google APIs Client Library for JavaScript (googleapis)**: Official library for interacting with Google services, used for email operations in Gmail.
- **Microsoft Graph Client Library**: Utilized for accessing Microsoft Outlook resources.
- **BullMQ**: A robust queue system for handling asynchronous background tasks, based on Redis.
- **TypeScript**: Used for writing the server code to leverage strong typing and reduce potential runtime errors.
- **dotenv**: A module to load environment variables from a `.env` file into `process.env`, managing configuration separately from code.
- **node-fetch/axios**: Used for making HTTP requests to external services, especially where native integration is not available or practical.


## Installation

1. Clone the repository:
    ``` 
    git clone https://github.com/gaurav1832/ReachInbix-Assignment.git 
    ```
2. Navigate to the project directory: 
    ``` 
    example:  cd ReachInbix-Assignment
    ```

3. Install dependencies:
    ```
    npm install
    ```
4. Set up environment variables:
- Create an env file `.env` and fill in the necessary API keys and OAuth credentials (GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, OUTLOOK_CLIENT_ID,OUTLOOK_CLIENT_SECRET, etc.)

5. To start the server, run:
    ```
    npm start
    ```
This will start the application on the port specified in your `.env` file and begin listening for incoming email tasks.

## Implementation Choices

- **Node-fetch vs Axios**: Node-fetch was initially used due to its lightweight nature and similarity to the native fetch API in browsers. It was later replaced with Axios in some parts of the project for better error handling and wider community support.
- **Modular Design**: Each major functionality, like sending emails or analyzing content, is encapsulated in separate files and functions. This makes the code easier to maintain and test.
- **Job Queue**: BullMQ is used for managing jobs due to its robust handling of job failures, retries, and backoff strategies.
- **Error Handling**: Detailed error handling and logging are implemented to ensure that operational issues can be diagnosed and resolved quickly.

## Contributing

Contributions are welcome by submitting pull requests to the project.

Thank you







