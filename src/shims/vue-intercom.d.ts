import _Vue from 'vue'

/* eslint-disable camelcase */
export declare interface IntercomOptions {
  app_id: string
  custom_launcher_selector?: string
  alignment?: 'left' | 'right'
  vertical_padding?: number
  horizontal_padding?: number
  hide_default_launcher?: boolean
  session_duration?: number
  action_color?: string
  background_color?: string
}

export declare interface IntercomBootOptions {
  custom_launcher_selector?: string
  alignment?: 'left' | 'right'
  hide_default_launcher?: boolean
}
/* eslint-enable camelcase */

declare class VueIntercom {
  static install(Vue: typeof _Vue, options: IntercomOptions): void;

  ready: boolean;
  isBooted: boolean;
  visible: boolean;
  unreadCount: number;

  once(state: string, callback: () => void): void;
  boot(options: IntercomBootOptions): void;
  shutdown(): void;
  update(options: any): void;
  show(): void;
  hide(): void;
  showMessages(): void;
  showNewMessage(content?: string): void;
  trackEvent(name: string, metadata?: any): void;
  getVisitorId(): string;
}
export default VueIntercom

declare module '@mathieustan/vue-intercom'

declare module 'vue/types/options' {
  interface ComponentOptions {
    intercom?: VueIntercom;
  }
}

export declare module 'vue/types/vue' {
  interface Vue {
    $intercom?: VueIntercom;
  }
}
