const Blockchain = require('./blockchain');
const Block = require('./block');
const cryptoHash = require('./crypto-hash');

describe('Blockchain', () => {
    let blockchain, newChain, originalChain;

    beforeEach(() => {
        blockchain = new Blockchain();
        newChain = new Blockchain();

        originalChain = blockchain.chain;
    });

    it('Should contains a `chain` Array instance.', () => {
        expect(blockchain.chain instanceof Array).toBe(true);
    });

    it('Should starts with the genesis block.', () => {
        expect(blockchain.chain[0]).toEqual(Block.genesis());
    });

    it('Adds a new block to the chain.', () => {
        const newData = 'foo bar';
        blockchain.addBlock({ data: newData });
        expect(blockchain.chain[blockchain.chain.length - 1].data).toEqual(
            newData
        );
    });

    describe('isValidChain()', () => {
        describe('When the chain does not start with the genesis block.', () => {
            it('Returns false', () => {
                blockchain.chain[0] = { data: 'fake-genesis' };

                expect(Blockchain.isValidChain(blockchain.chain)).toBe(false);
            });
        });

        describe('When the chain starts with the genesis block and has multiple blocks.', () => {
            beforeEach(() => {
                blockchain.addBlock({ data: 'Bears' });
                blockchain.addBlock({ data: 'Beets' });
                blockchain.addBlock({ data: 'Battlestar Galactica' });
            });

            describe('And a lastHash reference has changed.', () => {
                it('Returns false', () => {
                    blockchain.chain[2].lastHash = 'broken-lastHash';

                    expect(Blockchain.isValidChain(blockchain.chain)).toBe(
                        false
                    );
                });
            });

            describe('The chain contains a block with an invalid field.', () => {
                it('Returns false', () => {
                    blockchain.chain[2].data = 'some-bad-and-evil-data';

                    expect(Blockchain.isValidChain(blockchain.chain)).toBe(
                        false
                    );
                });
            });

            describe('And the chain contains a block with a jumped difficulty.', () => {
                it('Returns false', () => {
                    const lastBlock =
                        blockchain.chain[blockchain.chain.length - 1];

                    const lastHash = lastBlock.hash;

                    const timestamp = Date.now();
                    const nounce = 0;
                    const data = [];
                    const difficulty = lastBlock.difficulty - 3;
                    const hash = cryptoHash(
                        timestamp,
                        lastHash,
                        difficulty,
                        nounce,
                        data
                    );

                    const badBlock = new Block({
                        timestamp,
                        lastHash,
                        hash,
                        difficulty,
                        nounce,
                        data
                    });

                    blockchain.chain.push(badBlock);

                    expect(Blockchain.isValidChain(blockchain.chain)).toBe(
                        false
                    );
                });
            });

            describe('The chain does not contain any invalid blocks', () => {
                it('Returns True', () => {
                    expect(Blockchain.isValidChain(blockchain.chain)).toBe(
                        true
                    );
                });
            });
        });
    });

    describe('replaceChain()', () => {
        let errorMock, logMock;

        beforeEach(() => {
            errorMock = jest.fn();
            logMock = jest.fn();

            global.console.error = errorMock;
            global.console.log = logMock;
        });

        describe('When the new chain is not longer', () => {
            beforeEach(() => {
                blockchain.replaceChain(newChain.chain);
            });

            it('Does not replace the chain', () => {
                newChain.chain[0] = { new: 'chain' };
                expect(blockchain.chain).toEqual(originalChain);
            });

            it('Logs an error.', () => {
                expect(errorMock).toHaveBeenCalled();
            });
        });

        describe('When the new chain is longer', () => {
            beforeEach(() => {
                newChain.addBlock({ data: 'Bears' });
                newChain.addBlock({ data: 'Beets' });
                newChain.addBlock({ data: 'Battlestar Galactica' });
            });

            describe('And the chain is invalid', () => {
                beforeEach(() => {
                    newChain.chain[2].hash = 'some-fake-hash';

                    blockchain.replaceChain(newChain.chain);
                });
                it('Does not replace the chain', () => {
                    expect(blockchain.chain).toEqual(originalChain);
                });

                it('Logs an error.', () => {
                    expect(errorMock).toHaveBeenCalled();
                });
            });

            describe('And the chain is valid', () => {
                beforeEach(() => {
                    blockchain.replaceChain(newChain.chain);
                });

                it('Replaces the chain', () => {
                    expect(blockchain.chain).toEqual(newChain.chain);
                });

                it('Logs about the chain replacement.', () => {
                    expect(logMock).toHaveBeenCalled();
                });
            });
        });
    });
});
