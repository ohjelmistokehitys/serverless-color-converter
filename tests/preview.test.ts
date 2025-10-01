import app from '../src/index';
import { describe, it, expect } from 'vitest';

describe("color preview", () => {

    it('should respond with 200 OK and a HTML page', async () => {
        const response = await app.request('/preview?hex=%23FF0000');

        expect(response.status).toBe(200);
        expect((await response.text()).toLowerCase()).toContain('html');
    });

    it('should display a background color when given a HEX code', async () => {
        const response = await app.request('/preview?hex=%23FF69B4');

        expect((await response.text()).toLowerCase()).toContain('background');
    });

    it('should display a background color when given a RGB color', async () => {
        const response = await app.request('/preview?r=255&g=105&b=180');

        expect((await response.text()).toLowerCase()).toContain('background');
    });
});
