import { DefaultNamingStrategy } from 'typeorm';
import { snakeCase } from 'typeorm/util/StringUtils';

export class CustomNamingStrategy extends DefaultNamingStrategy {
  tableName(targetName: string, userSpecifiedName: string | undefined): string {
    return userSpecifiedName || snakeCase(String(targetName));
  }

  columnName(
    propertyName: string,
    customName: string | undefined,
    embeddedPrefixes: string[],
  ): string {
    return snakeCase(
      embeddedPrefixes.concat(customName || propertyName).map(String).join('_'),
    );
  }

  indexName(tableOrName: string, columnNames: string[]): string {
    return `idx_${snakeCase(String(tableOrName))}_${columnNames
      .map((name) => snakeCase(String(name)))
      .join('_')}`;
  }

  uniqueConstraintName(tableOrName: string, columnNames: string[]): string {
    return `uq_${snakeCase(String(tableOrName))}_${columnNames
      .map((name) => snakeCase(String(name)))
      .join('_')}`;
  }

  relationConstraintName(
    tableOrName: string,
    columnNames: string[],
    where?: string,
  ): string {
    return `rel_${snakeCase(String(tableOrName))}_${columnNames
      .map((name) => snakeCase(String(name)))
      .join('_')}`;
  }
}
