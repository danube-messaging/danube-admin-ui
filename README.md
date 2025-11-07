# Danube Admin UI

This repository contains the source code for the Danube Admin UI, a modern web interface for managing and monitoring a Danube messaging cluster. The UI is built with React, TypeScript, and MUI, and it communicates with the `danube-admin-gateway` backend service.

## Running with Docker (Recommended)

This is the recommended way to run the application for testing or production use. It ensures a consistent environment and does not require installing Node.js or other dependencies on your local machine.

### Prerequisites

- [Docker](https://www.docker.com/get-started) must be installed and running on your system.

### Build and Run

1.  **Build the Docker Image:**
    Open your terminal in the project's root directory and run the following command. This will build the container image and tag it as `danube-admin-ui`.

    ```bash
    docker build -t danube-admin-ui .
    ```

2.  **Run the Container:**
    Once the build is complete, start the application with this command:

    ```bash
    docker run -p 3000:80 danube-admin-ui
    ```

The Danube Admin UI will now be accessible at **[http://localhost:3000](http://localhost:3000)**.

**Note:** The application expects the `danube-admin-gateway` service to be running and accessible. By default, it will try to connect to `http://localhost:8080`.

## Development

If you want to contribute to the development of the UI, you can set up a local development environment.

### Prerequisites

- [Node.js](https://nodejs.org/) (LTS version recommended).
- [pnpm](https://pnpm.io/installation) package manager.

### Local Setup

1.  **Install Dependencies:**
    Clone the repository and install the dependencies using `pnpm`.

    ```bash
    pnpm install
    ```

2.  **Run the Development Server:**
    Start the Vite development server.

    ```bash
    pnpm dev
    ```

The application will be available at **http://localhost:5173** and will automatically reload when you make changes to the code.