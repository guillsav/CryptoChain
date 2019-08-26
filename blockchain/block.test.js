const hexToBinary = require('hex-to-binary');
const Block = require('./block');
const cryptoHash = require('./crypto-hash');
const { GENESIS_DATA, MINE_RATE } = require('./config');

describe('Block', () => {
    const timestamp = 2000;
    const lastHash = 'foo-hash';
    const hash = 'bar-hash';
    const data = ['blockchain', 'data'];
    const nounce = 1;
    const difficulty = 1;
    const block = new Block({
        timestamp,
        lastHash,
        hash,
        data,
        nounce,
        difficulty
    });

    it('Has a timestamp property.', () => {
        expect(block.timestamp).toEqual(timestamp);
    });

    it('Has a lastHash property.', () => {
        expect(block.lastHash).toEqual(lastHash);
    });

    it('Has a hash property.', () => {
        expect(block.hash).toEqual(hash);
    });

    it('Has a data property.', () => {
        expect(block.data).toEqual(data);
    });

    it('Has a data property.', () => {
        expect(block.nounce).toEqual(nounce);
    });

    it('Has a data property.', () => {
        expect(block.difficulty).toEqual(difficulty);
    });

    describe('genesis()', () => {
        const genesisBlock = Block.genesis();

        it('Returns a block instance.', () => {
            expect(genesisBlock instanceof Block).toBe(true);
        });

        it('Returns the genesis data.', () => {
            expect(genesisBlock).toEqual(GENESIS_DATA);
        });
    });

    describe('mineBlock()', () => {
        const lastBlock = Block.genesis();
        const data = 'mined data';
        const minedBlock = Block.mineBlock({ lastBlock, data });

        it('Returns a block instance.', () => {
            expect(minedBlock instanceof Block).toBe(true);
        });

        it('Sets the `lastHash` to be `hash` of the lastBlock.', () => {
            expect(minedBlock.lastHash).toEqual(lastBlock.hash);
        });

        it('sets the data field property to the mined block.', () => {
            expect(minedBlock.data).toEqual(data);
        });

        it('Sets a timestamp property to the mined block.', () => {
            expect(minedBlock.timestamp).not.toEqual(undefined);
        });

        it('Creates a SHA-256 `hash` based on the proper inputs.', () => {
            expect(minedBlock.hash).toEqual(
                cryptoHash(
                    minedBlock.timestamp,
                    lastBlock.hash,
                    minedBlock.nounce,
                    minedBlock.difficulty,
                    data
                )
            );
        });

        it('Sets a `hash` that matches the difficulty criteria.', () => {
            expect(
                hexToBinary(minedBlock.hash).substring(0, minedBlock.difficulty)
            ).toEqual('0'.repeat(minedBlock.difficulty));
        });

        it('Adjusts the difficulty', () => {
            const possibleResult = [
                lastBlock.difficulty + 1,
                lastBlock.difficulty - 1
            ];
            expect(possibleResult.includes(minedBlock.difficulty)).toBe(true);
        });
    });

    describe('adjustDifficulty()', () => {
        it('Raises the difficulty for a quickly mined block.', () => {
            expect(
                Block.adjustDifficulty({
                    originalBlock: block,
                    timestamp: block.timestamp + MINE_RATE - 100
                })
            ).toEqual(block.difficulty + 1);
        });

        it('Lowers the difficulty for a slowly mined block.', () => {
            expect(
                Block.adjustDifficulty({
                    originalBlock: block,
                    timestamp: block.timestamp + MINE_RATE + 100
                })
            ).toEqual(block.difficulty - 1);
        });

        it('Has a lower limit of 1', () => {
            block.difficulty = -1;

            expect(Block.adjustDifficulty({ originalBlock: block })).toEqual(1);
        });
    });
});
