#!/usr/bin/env -S node
import type { Contract as End } from '../../snapshots/cbe0780b7d56e02df2b364564fd8c48e9cea4477d67a0a8c0e444373f05b945f/contract';
import endContract from '../../snapshots/cbe0780b7d56e02df2b364564fd8c48e9cea4477d67a0a8c0e444373f05b945f/contract.json' with { type: 'json' };
import type { Contract as Start } from '../../snapshots/e9c3c40153c5a7ff73cf722dd961d65ba88729527f600369eb3fd10b1b552108/contract';
import startContract from '../../snapshots/e9c3c40153c5a7ff73cf722dd961d65ba88729527f600369eb3fd10b1b552108/contract.json' with { type: 'json' };
import { Migration, MigrationCLI, col, fn } from '@prisma/orm-postgres/migration';

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.addColumn({
        schema: 'public',
        table: 'tickets',
        column: col('created_at', 'timestamptz', {
          notNull: true,
          default: fn('now()'),
          codecRef: { codecId: 'pg/timestamptz-temporal@1' },
        }),
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
