import app from "./app";


// Start the server

const bootstrap = () => {
    try {
        app.listen(process.env.PORT || 5000, () => {
            console.log(`Server is running on http://localhost:${process.env.PORT || 5000}`);
        });

    } catch (error) {
        console.log(error);
    }
}

bootstrap()