/**
 * Restful API类声明
 */
export class Restful {
  public static initWithError(e: any) {
    return new Restful(e.errno, e.message);
  }
  public code: CodeDictionary;
  public message?: string;
  public data?: any;
  public constructor(code: CodeDictionary, message: string, data: any = null) {
    this.code = code;
    this.message = message;
    this.data = data;
  }
}

export enum CodeDictionary {
  SUCCESS = 0,
}
