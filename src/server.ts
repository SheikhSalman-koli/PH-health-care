import app from "./app";
import { envVars } from "./config/env";


// Start the server

const bootstrap = () => {
    try {
        app.listen(envVars.PORT, () => {
            console.log(`Server is running on http://localhost:${envVars.PORT}`);
        });

    } catch (error) {
        console.log(error);
    }
}

bootstrap()