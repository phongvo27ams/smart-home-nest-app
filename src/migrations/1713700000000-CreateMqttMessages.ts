import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

export class CreateMqttMessages1713700000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const hasTable = await queryRunner.hasTable('mqtt_messages');
    if (!hasTable) {
      await queryRunner.createTable(
        new Table({
          name: 'mqtt_messages',
          columns: [
            {
              name: 'id',
              type: 'serial',
              isPrimary: true,
            },
            {
              name: 'topic',
              type: 'varchar',
              length: '255',
              isNullable: false,
            },
            {
              name: 'value',
              type: 'double precision',
              isNullable: false,
            },
            {
              name: 'rawPayload',
              type: 'text',
              isNullable: true,
            },
            {
              name: 'createdAt',
              type: 'timestamp',
              default: 'now()'
            },
          ],
        }),
        true,
      );

      await queryRunner.createIndex(
        'mqtt_messages',
        new TableIndex({
          name: 'IDX_MQTT_MESSAGES_TOPIC',
          columnNames: ['topic'],
        }),
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const hasTable = await queryRunner.hasTable('mqtt_messages');
    if (hasTable) {
      const index = await queryRunner.getTable('mqtt_messages');
      const topicIndex = index?.indices.find((i) => i.name === 'IDX_MQTT_MESSAGES_TOPIC');
      if (topicIndex) {
        await queryRunner.dropIndex('mqtt_messages', 'IDX_MQTT_MESSAGES_TOPIC');
      }
      await queryRunner.dropTable('mqtt_messages');
    }
  }
}
