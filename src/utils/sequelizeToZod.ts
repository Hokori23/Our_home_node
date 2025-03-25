import { z, ZodNumber, ZodString } from 'zod';
import { ModelAttributeColumnOptions, DataTypes } from 'sequelize';

export function sequelizeToZod(modelAttributes: { [key: string]: ModelAttributeColumnOptions }) {
  const schema: Record<string, z.ZodTypeAny> = {};

  for (const [key, options] of Object.entries(modelAttributes)) {
    let validator: z.ZodTypeAny;
    // STRING 类型
    if (options.type instanceof DataTypes.STRING) {
      validator = z.string();
      if (options.validate?.len) {
        const len = Array.isArray(options.validate.len)
          ? options.validate.len
          : (options.validate.len as unknown as { args: [number, number] }).args;
        validator = (validator as ZodString).length(len[0], len[1]);
      }
      if (options.validate?.isEmail) {
        validator = (validator as ZodString).email();
      }
    }
    // INTEGER 类型
    else if (options.type instanceof DataTypes.INTEGER) {
      validator = z.number().int();
      if (options.validate?.min) {
        const minValue =
          typeof options.validate.min === 'number'
            ? options.validate.min
            : options.validate.min.args[0];
        validator = (validator as ZodNumber).min(minValue);
      }
      if (options.validate?.max) {
        const maxValue =
          typeof options.validate.max === 'number'
            ? options.validate.max
            : options.validate.max.args[0];
        validator = (validator as ZodNumber).max(maxValue);
      }
    }
    // FLOAT 类型
    else if (options.type instanceof DataTypes.FLOAT) {
      validator = z.number();
      if (options.validate?.min) {
        const minValue =
          typeof options.validate.min === 'number'
            ? options.validate.min
            : options.validate.min.args[0];
        validator = (validator as ZodNumber).min(minValue);
      }
      if (options.validate?.max) {
        const maxValue =
          typeof options.validate.max === 'number'
            ? options.validate.max
            : options.validate.max.args[0];
        validator = (validator as ZodNumber).max(maxValue);
      }
    }
    // BOOLEAN 类型
    else if (options.type instanceof DataTypes.BOOLEAN) {
      validator = z.boolean();
    }
    // DATE 类型
    else if (options.type instanceof DataTypes.DATE) {
      validator = z.string().datetime();
    }
    // JSON 类型
    else if (options.type instanceof DataTypes.JSON) {
      validator = z.record(z.any());
    }
    // ENUM 类型
    else if (options.type instanceof DataTypes.ENUM) {
      const enumValues = (options.type as any).values as string[];
      validator = z.enum([enumValues[0], ...enumValues.slice(1)]);
    }
    // TEXT 类型
    else if (options.type instanceof DataTypes.TEXT) {
      validator = z.string();
    }
    // UUID 类型
    else if (options.type instanceof DataTypes.UUID) {
      validator = z.string().uuid();
    }
    // 其他类型
    else {
      validator = z.any();
    }

    // 处理 allowNull
    if (options.allowNull) {
      if (validator instanceof z.ZodString) {
        validator = validator.optional();
      } else if (validator instanceof z.ZodNumber) {
        validator = validator.optional();
      } else if (validator instanceof z.ZodArray) {
        validator = validator.optional();
      }
    } else if (!options.primaryKey) {
      if (validator instanceof z.ZodString) {
        validator = validator.min(1);
      } else if (validator instanceof z.ZodNumber) {
        validator = validator.min(1);
      } else if (validator instanceof z.ZodArray) {
        validator = validator.min(1);
      }
    }
    schema[key] = validator;
  }
  return z.object(schema);
}

export function validate(object: any, schema: z.ZodSchema) {
  return schema.parse(object);
}
