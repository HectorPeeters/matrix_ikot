import { MatrixClient, SimpleFsStorageProvider } from 'matrix-bot-sdk';
import { Config } from '.';

export class MatrixConnection {
    private client: MatrixClient;
    private roomId: string;

    constructor(config: Config) {
        const storage = new SimpleFsStorageProvider('bot.json');
        this.client = new MatrixClient(
            config.homeserver,
            config.access_token,
            storage
        );
        this.roomId = config.room_id;
    }

    async start() {
        await this.client.start();
        console.log('Matrix client started');
    }

    async sendImage(url: string) {
        const mxc = await this.client.uploadContentFromUrl(url);
        this.client.sendMessage(this.roomId, {
            msgtype: 'm.image',
            body: 'image',
            url: mxc
        });
    }

    async sendMessage(message: string) {
        this.client.sendMessage(this.roomId, {
            msgtype: 'm.text',
            body: message
        });
    }
}
