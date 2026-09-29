#!/usr/bin/env -S node
import type { Contract as End } from '../../snapshots/12a727640fe8d7b0f6925b91cd6d6c9e049858a5a150e681bfd953567a81b239/contract';
import endContract from '../../snapshots/12a727640fe8d7b0f6925b91cd6d6c9e049858a5a150e681bfd953567a81b239/contract.json' with { type: 'json' };
import type { Contract as Start } from '../../snapshots/cbe0780b7d56e02df2b364564fd8c48e9cea4477d67a0a8c0e444373f05b945f/contract';
import startContract from '../../snapshots/cbe0780b7d56e02df2b364564fd8c48e9cea4477d67a0a8c0e444373f05b945f/contract.json' with { type: 'json' };
import { Migration, MigrationCLI } from '@prisma/orm-postgres/migration';

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [];
  }
}

MigrationCLI.run(import.meta.url, M);
