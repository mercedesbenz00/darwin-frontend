import _Vue from 'vue'

declare class VueAnalytics {
  static install(Vue: typeof _Vue, options: any): void;
  analyticsMiddleware: any;
  onAnalyticsReady: any;
  event: any;
  ecommerce: any;
  set: any;
  page: any;
  query: any;
  screenview: any;
  time: any;
  require: any;
  exception: any;
  social: any;
  disable: any;
  enable: any;
}
export default VueAnalytics

declare module 'vue-analytics' {
  export const event: any
  export const analyticsMiddleware: any
}

declare module 'vue/types/options' {
  interface ComponentOptions {
    ga?: VueAnalytics;
  }
}

declare module 'vue/types/vue' {
  interface Vue {
    $ga: VueAnalytics;
  }
}
