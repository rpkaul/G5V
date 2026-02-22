import Vue from "vue";
import Vuetify from "vuetify/lib";

Vue.use(Vuetify);

export default new Vuetify({
  theme: {
    dark: true, // Default to dark mode for the gaming feel
    themes: {
      light: {
        primary: "#00f2ff",
        secondary: "#7000ff",
        accent: "#ff0055",
        error: "#ff4444",
        background: "#f0f2f5",
        surface: "#ffffff"
      },
      dark: {
        primary: "#00f2ff",     // Electric Cyan
        secondary: "#7000ff",   // Neon Purple
        accent: "#ff0055",      // Cyber Pink
        background: "#0a0a0c",  // Deep Space Black
        surface: "#16161a",     // Card Grey
        error: "#ff4444"
      }
    }
  }
});
