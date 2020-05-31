import "material-design-icons-iconfont/dist/material-design-icons.css"
import Vue from "vue"
import Vuetify from "vuetify/lib"
import colors from "vuetify/lib/util/colors"

Vue.use(Vuetify)

// theme: {
//   themes: {
//     light: {
//       primary: colors.teal.lighten3,
//       secondary: colors.grey.darken2,
//       accent: colors.purple,
//       error: colors.red,
//     },
//   },
// },

export default new Vuetify({
  icons: {
    iconfont: "md",
  },
  theme: {
    themes: {
      light: {
        primary: colors.teal.lighten3,
        secondary: colors.amber.accent1,  // 見積開始・終了などに利用
        deactive: colors.grey.base,
//        deactive: colors.teal.lighten3,
        accent: colors.teal.darken2, // チェックボックスや有効なボタンなど
        error: colors.red.accent3,
      },
    },
  },
})
