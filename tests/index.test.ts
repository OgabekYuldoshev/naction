import { describe, expect, test } from 'vitest'
import { z } from 'zod';

import naction from "../src"

describe("Action tests", () => {
    test("should test action function", async () => {
        const handler = naction.action(async () => {
            return "Ok"
        })

        const result = await handler()

        expect(result.success).toBe(true)

        if (result.success) {
            expect(result.data).toBe("Ok")
        }
    });

    test("should test with arguments action", async () => {
        const handler = naction
            .schema(z.object({
                name: z.string()
            }))
            .action(async ({ name }) => {
                return { name }
            })

        const result = await handler({ name: 'Ogabek' })

        expect(result.success).toBe(true)

        if (result.success) {
            expect(result.data).toEqual({ name: 'Ogabek' })
        }
    });
})