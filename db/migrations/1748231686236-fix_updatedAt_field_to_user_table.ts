import { MigrationInterface, QueryRunner } from "typeorm";

export class FixUpdatedAtFieldToUserTable1748231686236 implements MigrationInterface {
    name = 'FixUpdatedAtFieldToUserTable1748231686236'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`user\` CHANGE \`updatedAt\` \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`user\` CHANGE \`updatedAt\` \`updatedAt\` datetime(0) NOT NULL`);
    }

}
