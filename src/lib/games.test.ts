import { describe, it, expect, beforeEach } from 'vitest';
import { createTestDatabase } from '../../db/test-helpers';
import { categories, publishers, games } from '../../db/schema';
import type { Database } from './db';
import {
    getAllGames,
    getAllGameIds,
    getGameById,
} from './games';

async function seedGames(db: Database, count: number): Promise<void> {
    const [category] = await db
        .insert(categories)
        .values({ name: 'Strategy', description: 'cat' })
        .returning({ id: categories.id });
    const [publisher] = await db
        .insert(publishers)
        .values({ name: 'Pub One', description: 'pub' })
        .returning({ id: publishers.id });

    // Insert titles in reverse-alphabetical order to prove ordering is applied.
    for (let i = count; i >= 1; i--) {
        await db.insert(games).values({
            title: `Game ${String(i).padStart(2, '0')}`,
            description: `Description ${i}`,
            starRating: 4.2,
            categoryId: category.id,
            publisherId: publisher.id,
        });
    }
}

async function seedFilterFixtures(db: Database): Promise<{
    strategyId: number;
    puzzleId: number;
    firstPublisherId: number;
    secondPublisherId: number;
}> {
    const [{ id: strategyId }, { id: puzzleId }] = await db
        .insert(categories)
        .values([
            { name: 'Strategy', description: 'strategy' },
            { name: 'Puzzle', description: 'puzzle' },
        ])
        .returning({ id: categories.id });
    const [{ id: firstPublisherId }, { id: secondPublisherId }] = await db
        .insert(publishers)
        .values([
            { name: 'Pub One', description: 'first' },
            { name: 'Pub Two', description: 'second' },
        ])
        .returning({ id: publishers.id });

    await db.insert(games).values([
        { title: 'Alpha', description: 'alpha', starRating: 4, categoryId: strategyId, publisherId: firstPublisherId },
        { title: 'Beta', description: 'beta', starRating: 4, categoryId: puzzleId, publisherId: firstPublisherId },
        { title: 'Gamma', description: 'gamma', starRating: 4, categoryId: strategyId, publisherId: secondPublisherId },
    ]);

    return { strategyId, puzzleId, firstPublisherId, secondPublisherId };
}

describe('games data-access helpers', () => {
    let db: Database;

    beforeEach(async () => {
        db = await createTestDatabase();
    });

    it('returns all games ordered by title', async () => {
        await seedGames(db, 3);
        const all = await getAllGames(db);
        expect(all.map((g) => g.title)).toEqual(['Game 01', 'Game 02', 'Game 03']);
        expect(all[0].category).toEqual({ id: expect.any(Number), name: 'Strategy' });
        expect(all[0].publisher).toEqual({ id: expect.any(Number), name: 'Pub One' });
    });

    it('returns all game ids ordered by title', async () => {
        await seedGames(db, 3);
        const ids = await getAllGameIds(db);
        const all = await getAllGames(db);
        expect(ids).toEqual(all.map((g) => g.id));
    });

    it('fetches a single game by id', async () => {
        await seedGames(db, 2);
        const ids = await getAllGameIds(db);
        const game = await getGameById(db, ids[0]);
        expect(game?.title).toBe('Game 01');
    });

    it('returns null for a non-existent game', async () => {
        await seedGames(db, 2);
        expect(await getGameById(db, 99999)).toBeNull();
    });

    it('filters games by any selected category', async () => {
        const { strategyId, puzzleId } = await seedFilterFixtures(db);

        const filtered = await getAllGames(db, { categoryIds: [strategyId, puzzleId] });

        expect(filtered.map((game) => game.title)).toEqual(['Alpha', 'Beta', 'Gamma']);
    });

    it('filters games by publisher', async () => {
        const { firstPublisherId } = await seedFilterFixtures(db);

        const filtered = await getAllGames(db, { publisherId: firstPublisherId });

        expect(filtered.map((game) => game.title)).toEqual(['Alpha', 'Beta']);
    });

    it('combines category and publisher filters', async () => {
        const { strategyId, firstPublisherId } = await seedFilterFixtures(db);

        const filtered = await getAllGames(db, { categoryIds: [strategyId], publisherId: firstPublisherId });

        expect(filtered.map((game) => game.title)).toEqual(['Alpha']);
    });

    it('returns an empty list when filters match no games', async () => {
        const { puzzleId, secondPublisherId } = await seedFilterFixtures(db);

        const filtered = await getAllGames(db, { categoryIds: [puzzleId], publisherId: secondPublisherId });

        expect(filtered).toEqual([]);
    });
});
