const express = require('express');
const Blockchain = require('./blockchain/blockchain');

const app = express();
const blockchain = new Blockchain();

app.use(express.json());

app.get('/api/blocks', async (req, res) => {
    try {
        await res.json(blockchain.chain);
    } catch ({ message }) {
        res.status(500).json({
            errorMessage: 'Unable to retrieve blockchain information.'
        });
    }
});

app.post('/api/mine', async (req, res) => {
    try {
        const { data } = req.body;
        await blockchain.addBlock({ data });
        res.status(201).redirect('/api/blocks');
    } catch ({ message }) {
        res.status(500).json({
            errorMessage:
                "The server wasn't able to add the new block to the blockchain."
        });
    }
});

const PORT = 3000 || process.env.PORT;

app.listen(PORT, () =>
    console.log(`*** Server is listening on port ${PORT} ***`)
);
