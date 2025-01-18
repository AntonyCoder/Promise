import GameSavingLoader from "../app";
import read from "../reader";
import json from "../parser";
import GameSaving from "../GameSaving";

jest.mock('../parser.js');
jest.mock('../reader.js');

describe('GameSavingLoader', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    })

    test('Корректно создается GameSaving', (done) => {
        const mockBuffer = new ArrayBuffer(16);
        const mockJson = '{"id":9,"created":1546300800,"userInfo":{"id":1,"name":"Hitman","level":10,"points":2000}}';

        read.mockResolvedValue(mockBuffer);
        json.mockResolvedValue(mockJson);

        GameSavingLoader.load().then((result) => {
            expect(result).toBeInstanceOf(GameSaving)
            expect(result).toEqual(
                new GameSaving(9, 1546300800, {
                    id: 1,
                    name: 'Hitman',
                    level: 10,
                    points: 2000,
                })
            );

            expect(read).toHaveBeenCalledTimes(1);
            expect(json).toHaveBeenCalledWith(mockBuffer);

            done();
        })
            .catch((err) => done(err));
    })

    test('обработка ошибок read', (done) => {
        const mockError = new Error('Ошибка');
        read.mockRejectedValue(mockError);

        GameSavingLoader.load().then(() => {
            done(new Error('Ожидалась ошибка но не произошла'))
        }).catch((error) => {
            expect(error).toBe(mockError)
            done()
        })
    })

    test('должен обрабатывать ошибки из json', (done) => {
        const mockBuffer = new ArrayBuffer(16);
        const mockError = new Error('Ошибка парсинга');

        read.mockResolvedValue(mockBuffer);
        json.mockRejectedValue(mockError);

        GameSavingLoader.load()
            .then(() => {
                done(new Error('Ожидалась ошибка, но её не произошло'));
            })
            .catch((error) => {
                expect(error).toBe(mockError);
                done();
            });
    });
})
