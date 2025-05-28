import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateCanNullRefreshTokenFieldToUserTable1748405367999 implements MigrationInterface {
    name = 'UpdateCanNullRefreshTokenFieldToUserTable1748405367999'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`user\` CHANGE \`refreshToken\` \`refreshToken\` varchar(255) NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`user\` CHANGE \`refreshToken\` \`refreshToken\` varchar(255) NOT NULL`);
    }

}
