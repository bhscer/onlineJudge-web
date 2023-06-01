import request from '../request';
import md5 from 'js-md5';

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace user {
  export interface UserInfo {
    username: string;
    nickname: string;
    emailMd5: string;
    token: string;
    permission: string;
    userDBId: string;
    loginType: number;
    customBg: boolean;
    bgUrl: string;
    customColorFlag: boolean;
    customColor: string;
  }

  const base = (key: string) => {
    return `user/${key}`;
  };

  export function auth(via: any) {
    console.log('via is ', via);
    return request<UserInfo>({
      method: 'post',
      url: base('auth'),
      data: {
        type: via,
      },
    });
  }

  export interface LoginForm {
    username: string;
    pwd: string;
  }
  export function login(data: LoginForm) {
    data.pwd = md5(data.pwd);
    return request.post<UserInfo>(base('login'), data);
  }
  export function logout() {
    return request.post(base('logout'));
  }

  export interface RegisterForm {
    username: string;
    nickname: string;
    email: string;
    pwd: string;
  }
  export function register(data: RegisterForm) {
    data.pwd = md5(data.pwd);
    return request.post<UserInfo>(base('register'), data);
  }

  export interface CommonUserInfo {
    username: string;
    nickname: string;
    emailMd5: string;
  }
  export function info(id: string) {
    return request.post<CommonUserInfo>(base('info/' + id));
  }
}
