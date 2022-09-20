import { AxiosRequestConfig } from 'axios';
import BeautifulDom from 'beautiful-dom';

export interface RequestOptions {
    city: 'Gent' | 'Antwerpen' | 'Brussel' | 'Leuven';
    city_id: 5;
    type: 'city';
    price_max: number;
    surface_min: number;
    room_type: 3;
    more_people: 1;
    kitchen: 1;
    domilicie: 0;
    date: '2021-09-20';
    sorttype: 'modified';
    sortdirection: 'desc' | 'asc';
}

export function buildQuery(options: RequestOptions): AxiosRequestConfig<any> {
    const queryProperties: [string, string, any][] = [
        ['query', 'string', options.city],
        ['query', 'city_id', options.city_id],
        ['query', 'type', options.type],
        ['query', 'price_max', options.price_max],
        ['query', 'surface_min', options.surface_min],
        ['query', 'room_type', options.room_type],
        ['query', 'more_people', options.more_people],
        ['query', 'kitchen', options.kitchen],
        ['query', 'domilicie', options.domilicie],
        ['query', 'date', options.date],
        ['sort', 'sorttype', options.sorttype],
        ['sort', 'sortdirection', options.sortdirection]
    ];

    let bodyContent = queryProperties
        .map((prop) => {
            let propType, propName, propValue;
            [propType, propName, propValue] = prop;

            const key = propType + '[' + propName + ']';
            return (
                encodeURIComponent(key) +
                '=' +
                encodeURIComponent(propValue) +
                '&'
            );
        })
        .join('');

    return {
        url: 'https://ikot.be/city/query',
        method: 'POST',
        data: bodyContent
    };
}

export interface Room {
    id: number;
    url: string;
    street: string;
    distance: number;
    date: Date;
    modified: Date;
    price: number;
    type: string;
    available: Date;
    priceex: number;
    pricegwe: number;
    surface: number;
    image: string;
}

export function parseRooms(document: string): Room[] {
    const dom = new BeautifulDom(document);

    const roomDoms = dom.getElementsByClassName('room');

    let rooms: Room[] = [];

    for (const roomDom of roomDoms) {
        rooms.push({
            id: Number(roomDom.getAttribute('data-room-id')),
            url: roomDom.getAttribute('data-url')!,
            street: roomDom.getAttribute('data-street')!,
            distance: Number(roomDom.getAttribute('data-distance')),
            date: new Date(Number(roomDom.getAttribute('data-date')) * 1000),
            modified: new Date(
                Number(roomDom.getAttribute('data-modified')) * 1000
            ),
            price: Number(roomDom.getAttribute('data-price')),
            type: roomDom.getAttribute('data-type')!,
            available: new Date(
                Number(roomDom.getAttribute('data-available')) * 1000
            ),
            priceex: Number(roomDom.getAttribute('data-priceex')),
            pricegwe: Number(roomDom.getAttribute('data-pricegwe')),
            surface: Number(roomDom.getAttribute('data-surface')),
            image:
                'https://ikot.be' +
                roomDom
                    .getElementsByClassName('result-img')[0]
                    .innerHTML.replace(
                        `<div class="result-img"  style="background-image: url(`,
                        ''
                    )
                    .replace(`)"></div>`, '')
                    .trim()
        });
    }

    return rooms;
}

export function formatRoom(room: Room): string {
    return `📌 ${room.street}
📏 ${room.surface} m²
💵 ${room.price} €
⚡ ${room.pricegwe} €
📅 ${room.date.toLocaleDateString()}
✅ ${room.available.toLocaleDateString()}
🔗 https://ikot.be${room.url}`;
}
