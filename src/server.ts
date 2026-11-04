import app from "./app";
import { envVars } from "./config/env";
import { seedSuperAdmin } from "./utils/seed.data";


// Start the server

const bootstrap = async () => {
    try {
        
        await seedSuperAdmin()

        app.listen(envVars.PORT, () => {
            console.log(`Server is running on http://localhost:${envVars.PORT}`);
        });

    } catch (error) {
        console.log(error);
    }
}

bootstrap()