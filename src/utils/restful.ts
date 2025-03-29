/**
 * Restful API响应类
 */
export class Restful {
  public static success(data?: any, message: string = 'success') {
    return new Restful(CodeDictionary.SUCCESS, message, data);
  }

  public static error(code: CodeDictionary, message: string, data?: any) {
    return new Restful(code, message, data);
  }

  public code: CodeDictionary;
  public message: string;
  public data?: any;

  constructor(code: CodeDictionary, message: string, data: any = null) {
    this.code = code;
    this.message = message;
    this.data = data;
  }
}

/**
 * 业务状态码枚举
 * 成功: 0
 * 错误: 100开始递增
 */
export enum CodeDictionary {
  // 成功状态码
  SUCCESS = 0,

  // 通用错误码 (100-199)
  COMMON_ERROR = 100, // 通用错误
  PARAMS_ERROR = 101, // 参数错误
  RESOURCE_NOT_FOUND = 102, // 资源不存在
  DATABASE_ERROR = 103, // 数据库错误
  PERMISSION_DENIED = 104, // 权限不足

  // 认证相关错误码 (200-299)
  AUTH_ERROR = 200, // 认证失败
  ACCOUNT_EXISTS = 201, // 账号已存在
  ACCOUNT_NOT_FOUND = 202, // 账号不存在
  PASSWORD_ERROR = 203, // 密码错误
  TOKEN_INVALID = 204, // Token无效
  TOKEN_EXPIRED = 205, // Token过期

  // 用户相关错误码 (300-399)
  USER_DISABLED = 300, // 用户被禁用
  USER_PROFILE_INCOMPLETE = 301, // 用户资料不完整

  // 业务特定错误码 (400-499)
  OPERATION_NOT_ALLOWED = 400, // 操作不允许
  RATE_LIMIT_EXCEEDED = 401, // 请求频率过高
}
