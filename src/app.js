import express from 'express';
const app = express();
const PORT = process.env.PORT || 3000;
// app.listen(PORT, () => {
//   console.log(`Listening on ${PORT}...`);
// })

app.get('/', (req, res) => {
    res.status(200).send('Hello from Acquisitions!');
});

export default app;