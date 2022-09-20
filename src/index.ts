import axios from 'axios';
import { existsSync, readFileSync, writeFileSync } from 'fs';
import { buildQuery, formatRoom, parseRooms, RequestOptions } from './ikot';
import { MatrixConnection } from './matrix';

export interface Config {
    homeserver: string;
    access_token: string;
    room_id: string;
    city: 'Gent' | 'Antwerpen' | 'Brussel' | 'Leuven';
    max_price: number;
    min_area: number;
}

function sleep(ms: number) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}

function loadSentRoomIds(): number[] {
    if (!existsSync('sent.csv')) {
        writeFileSync('sent.csv', '');
    }
    const ids = readFileSync('sent.csv', {
        encoding: 'utf-8'
    });

    return ids
        .split('\n')
        .filter((x) => x.trim().length !== 0)
        .map((x) => Number(x));
}

function writeSentRoomIds(ids: number[]) {
    writeFileSync('sent.csv', ids.map((x) => x.toString()).join('\n'));
}

(async () => {
    const config: Config = JSON.parse(
        readFileSync('config.json', { encoding: 'utf-8' })
    );

    const requestOptions: RequestOptions = {
        city: config.city,
        city_id: 5,
        type: 'city',
        price_max: config.max_price,
        surface_min: config.min_area,
        room_type: 3,
        more_people: 1,
        kitchen: 1,
        domilicie: 0,
        date: '2021-09-20',
        sorttype: 'modified',
        sortdirection: 'desc'
    };

    let sentRoomIds = loadSentRoomIds();

    const matrix = new MatrixConnection(config);
    await matrix.start();

    const queryOptions = buildQuery(requestOptions);

    while (true) {
        const response = await axios.request(queryOptions);
        const rooms = parseRooms(response.data.html);
        for (const room of rooms) {
            if (sentRoomIds.includes(room.id)) {
                continue;
            }

            await matrix.sendImage(room.image);
            await sleep(1000);
            await matrix.sendMessage(formatRoom(room));
            await sleep(1000);
            console.log('Notifying room ' + room.id);

            sentRoomIds.push(room.id);
        }

        writeSentRoomIds(sentRoomIds);

        await sleep(30 * 1000);
    }
})();
