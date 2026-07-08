import { createReducer, on } from '@ngrx/store';
import * as AuthActions from './auth.actions';

export interface AuthState {
  user: any | null;
  token: string | null;
  error: string | null;
  loading: boolean;
}

export const initialAuthState: AuthState = {
  user: localStorage.getItem('shopee_user')
    ? JSON.parse(localStorage.getItem('shopee_user')!)
    : null,
  token: localStorage.getItem('shopee_token'),
  error: null,
  loading: false,
};

export const authReducer = createReducer(
  initialAuthState,
  on(AuthActions.login, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),
  on(AuthActions.loginSuccess, (state, { user, token }) => ({
    ...state,
    user,
    token,
    loading: false,
    error: null,
  })),
  on(AuthActions.loginFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),
  on(AuthActions.logout, () => ({
    user: null,
    token: null,
    error: null,
    loading: false,
  })),
);
