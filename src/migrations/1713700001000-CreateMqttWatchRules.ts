import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

export class CreateMqttWatchRules1713700001000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const hasTable = await queryRunner.hasTable('mqtt_watch_rules');
    if (!hasTable) {
      await queryRunner.createTable(
        new Table({
          name: 'mqtt_watch_rules',
          columns: [
            { name: 'id', type: 'serial', isPrimary: true },
            { name: 'topic', type: 'varchar', length: '255', isNullable: false },
            { name: 'threshold', type: 'double precision', isNullable: false },
            { name: 'createdAt', type: 'timestamp', default: 'now()' },
          ],
        }),
        true,
      );
      await queryRunner.createIndex(
        'mqtt_watch_rules',
        new TableIndex({ name: 'IDX_MQTT_WATCH_RULES_TOPIC', columnNames: ['topic'] }),
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const hasTable = await queryRunner.hasTable('mqtt_watch_rules');
    if (hasTable) {
      await queryRunner.dropIndex('mqtt_watch_rules', 'IDX_MQTT_WATCH_RULES_TOPIC');
      await queryRunner.dropTable('mqtt_watch_rules');
    }
  }
}
