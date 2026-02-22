<template>
  <v-footer padless class="transparent mt-auto pb-4 pt-12">
    <v-container>
      <v-card class="glass-card px-8 py-6" flat>
        <v-layout wrap align-center>
          <!-- Brand & Info -->
          <v-flex xs12 sm4 class="text-center text-sm-left mb-4 mb-sm-0">
            <div class="primary--text font-weight-black headline mb-1 font-orbitron title-glow">
              {{ brandingName }}
            </div>
            <div class="caption grey--text text--lighten-1 letter-spacing-1">
              {{ $t("Footer.powered") }}
            </div>
          </v-flex>

          <!-- Copyright -->
          <v-flex xs12 sm8 class="text-center text-sm-right mt-4 mt-sm-0">
            <div class="caption grey--text letter-spacing-1">
              &copy; {{ new Date().getFullYear() }} — <span class="primary--text font-weight-black">{{ $t("Footer.company") }}</span>
            </div>
          </v-flex>
        </v-layout>
      </v-card>
    </v-container>
  </v-footer>
</template>

<script>
export default {
  name: "Footer",
  data() {
    return {
      languages: [
        { Language: "English", Code: "en" },
        { Language: "Français", Code: "fr" },
        { Language: "日本語", Code: "jp" }
      ]
    };
  },
  computed: {
    brandingName() {
      return this.$t("Navbar.BrandingName") !== "Navbar.BrandingName" 
        ? this.$t("Navbar.BrandingName") 
        : "G5V";
    }
  },
  methods: {
    handleLanguage(command) {
      this.ChangeLanguage(command);
    },
    darkMode() {
      this.$vuetify.theme.dark = !this.$vuetify.theme.dark;
      localStorage.setItem("theme", this.$vuetify.theme.dark.toString());
    }
  },
  mounted() {
    const language = localStorage.getItem("language");
    const theme = localStorage.getItem("theme");
    if (language) this.$i18n.locale = language;
    if (theme) {
      this.$vuetify.theme.dark = theme === "true";
    }
  }
};
</script>

<style scoped>
.font-orbitron {
  font-family: "Orbitron", sans-serif !important;
}

.title-glow {
  text-shadow: 0 0 10px rgba(0, 242, 255, 0.4);
}

.letter-spacing-1 {
  letter-spacing: 1px !important;
}

.nav-btn {
  color: rgba(255, 255, 255, 0.6) !important;
  transition: all 0.3s ease;
}

.nav-btn:hover {
  color: var(--neon-cyan) !important;
  transform: translateY(-2px);
}
</style>
