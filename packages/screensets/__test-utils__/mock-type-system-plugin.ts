import type {
  JSONSchema,
  TypeSystemPlugin,
  ValidationResult,
} from '../src/mfe/plugins/types';

// @cpt-dod:cpt-frontx-dod-screenset-registry-handler-injection:p1

type RegisteredEntity = {
  id?: string;
  type?: string;
};

// @cpt-begin:cpt-frontx-dod-screenset-registry-handler-injection:p1:inst-mock-type-system-plugin
function getEntityIdentifier(entity: unknown): string | undefined {
  if (typeof entity !== 'object' || entity === null) {
    return undefined;
  }

  const candidate = entity as RegisteredEntity;
  return candidate.type ?? candidate.id;
}

export function createMockTypeSystemPlugin(): TypeSystemPlugin {
  const schemas = new Map<string, JSONSchema>();
  const registeredEntities = new Map<string, unknown>();

  return {
    name: 'MockPlugin',
    version: '1.0.0',
    registerSchema: (schema: JSONSchema) => {
      if (!schema.$id) {
        return;
      }

      const typeId = schema.$id.replace('gts://', '');
      schemas.set(typeId, schema);
    },
    getSchema: (typeId: string) => schemas.get(typeId),
    register: (entity: unknown) => {
      const identifier = getEntityIdentifier(entity);
      if (identifier) {
        registeredEntities.set(identifier, entity);
      }
    },
    validateInstance: (instanceId: string): ValidationResult => {
      if (registeredEntities.has(instanceId)) {
        return { valid: true, errors: [] };
      }

      return {
        valid: false,
        errors: [
          {
            path: '',
            message: `Instance not registered: ${instanceId}`,
            keyword: 'not-registered',
          },
        ],
      };
    },
    isTypeOf: (typeId: string, baseTypeId: string) =>
      typeId === baseTypeId || typeId.startsWith(baseTypeId),
  };
}
// @cpt-end:cpt-frontx-dod-screenset-registry-handler-injection:p1:inst-mock-type-system-plugin
