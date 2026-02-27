<template>
  <v-app>
    <!-- Dynamic Top Navbar -->
    <Navbar
      :user="user"
      :nav-links="navLinks"
      @toggle-drawer="drawer = !drawer"
    />

    <!-- Mobile Drawer -->
    <v-navigation-drawer v-model="drawer" fixed temporary class="glass-sidebar">
      <div class="pa-6 d-flex flex-column fill-height">
        <v-list nav class="flex-grow-1">
          <template v-for="(group, gIdx) in navLinks">
            <v-list-group
              v-if="group.items && group.items.length > 0"
              :key="'group-' + gIdx"
              :prepend-icon="group.icon"
              active-class="primary--text"
              class="mb-1"
            >
              <template v-slot:activator>
                <v-list-item-title class="text-uppercase font-weight-bold">{{
                  group.title
                }}</v-list-item-title>
              </template>

              <v-list-item
                v-for="(item, iIdx) in group.items"
                :key="'item-' + gIdx + '-' + iIdx"
                :to="item.to"
                exact
                class="pl-8 mb-1"
              >
                <v-list-item-icon
                  ><v-icon x-small color="primary">{{
                    item.icon
                  }}</v-icon></v-list-item-icon
                >
                <v-list-item-title class="text-uppercase">{{
                  item.title
                }}</v-list-item-title>
              </v-list-item>
            </v-list-group>

            <v-list-item
              v-else
              :key="'link-' + gIdx"
              :to="group.to"
              exact
              class="mb-2"
            >
              <v-list-item-icon
                ><v-icon color="primary">{{
                  group.icon
                }}</v-icon></v-list-item-icon
              >
              <v-list-item-title class="text-uppercase font-weight-bold">{{
                group.title
              }}</v-list-item-title>
            </v-list-item>
          </template>
        </v-list>
      </div>
    </v-navigation-drawer>

    <v-main class="flex-grow-1">
      <v-container fluid class="pa-8">
        <router-view :key="$route.path" />
      </v-container>
    </v-main>
    <Footer />
  </v-app>
</template>

<script>
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
export default {
  name: "App",
  data() {
    return {
      drawer: false,
      user: {
        admin: false,
        steam_id: "",
        id: -1,
        super_admin: false,
        name: "",
        small_image: "",
        medium_image: "",
        large_image: ""
      }
    };
  },
  components: {
    Navbar,
    Footer
  },
  computed: {
    navLinks() {
      const groups = [
        {
          title: this.$t("Navbar.Matches"),
          icon: "mdi-sword-cross",
          items: [
            {
              title: this.$t("Navbar.AllMatches"),
              to: "/matches",
              icon: "mdi-format-list-bulleted"
            }
          ]
        },
        {
          title: this.$t("Navbar.Teams"),
          icon: "mdi-account-group",
          items: [
            {
              title: this.$t("Navbar.AllTeams"),
              to: "/teams",
              icon: "mdi-format-list-bulleted"
            },
            {
              title: this.$t("Navbar.PlayerLeader"),
              to: "/leaderboard",
              icon: "mdi-chart-bar"
            }
          ]
        },
        {
          title: this.$t("Navbar.Seasons"),
          icon: "mdi-trophy",
          items: [
            {
              title: this.$t("Navbar.AllSeasons"),
              to: "/seasons",
              icon: "mdi-calendar-check"
            }
          ]
        }
      ];

      if (this.user.id != null && this.user.id != -1) {
        // Matches group
        groups[0].items.push({
          title: this.$t("Navbar.MyMatches"),
          to: "/mymatches",
          icon: "mdi-history"
        });
        // Teams group
        groups[1].items.push({
          title: this.$t("Navbar.MyTeams"),
          to: "/myteams",
          icon: "mdi-account-star"
        });
        // Seasons group
        groups[2].items.push({
          title: this.$t("Navbar.MySeasons"),
          to: "/myseasons",
          icon: "mdi-trophy-variant"
        });
        // Add Servers
        groups.push({
          title: this.$t("Navbar.MyServers"),
          to: "/myservers",
          icon: "mdi-server",
          items: []
        });
      }
      return groups;
    },
    brandingName() {
      return this.$t("Navbar.BrandingName") !== "Navbar.BrandingName"
        ? this.$t("Navbar.BrandingName")
        : "G5V";
    }
  },
  watch: {
    brandingName: {
      immediate: true,
      handler(newTitle) {
        document.title = newTitle;
      }
    }
  },
  async mounted() {
    this.user = await this.IsLoggedIn();
  }
};
</script>
<style lang="scss">
@import url("https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&family=Orbitron:wght@400;700&display=swap");

:root {
  --neon-cyan: #00f2ff;
  --neon-purple: #7000ff;
  --cyber-pink: #ff0055;
  --glass-bg: rgba(22, 22, 26, 0.7);
  --glass-border: rgba(255, 255, 255, 0.1);
}

.v-application {
  font-family: "Inter", sans-serif !important;
  background-color: #070709 !important;

  .font-orbitron {
    font-family: "Orbitron", sans-serif !important;
  }
  
  .headline,
  .title {
    text-transform: uppercase;
    letter-spacing: 2px !important;
  }
}

.glass-sidebar {
  background: rgba(13, 13, 17, 0.95) !important;
  border-right: 1px solid var(--glass-border) !important;
  backdrop-filter: blur(20px);
}

.sidebar-active {
  background: rgba(0, 242, 255, 0.1) !important;
  border-right: 3px solid var(--neon-cyan);

  .v-list-item__title {
    color: var(--neon-cyan) !important;
    text-shadow: 0 0 10px rgba(0, 242, 255, 0.5);
  }
}

.letter-spacing-1 {
  letter-spacing: 1px !important;
}

.title-glow {
  text-shadow: 0 0 15px rgba(0, 242, 255, 0.6);
}

.neon-btn {
  box-shadow: 0 0 20px rgba(0, 242, 255, 0.3) !important;
  &:hover {
    box-shadow: 0 0 30px rgba(0, 242, 255, 0.5) !important;
    transform: scale(1.02);
  }
}

/* Glassmorphism Classes */
.glass-card {
  background: var(--glass-bg) !important;
  backdrop-filter: blur(12px) !important;
  -webkit-backdrop-filter: blur(12px) !important;
  border: 1px solid var(--glass-border) !important;
  border-radius: 12px !important;
  box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37) !important;
}

/* Global Table Styling */
.custom-table {
  background: transparent !important;
  border: 1px solid rgba(255, 255, 255, 0.05) !important;
  border-radius: 12px !important;
  overflow: hidden;

  .v-data-table__wrapper {
    background: rgba(22, 22, 26, 0.4) !important;
    backdrop-filter: blur(8px);
  }

  thead {
    background: rgba(255, 255, 255, 0.03) !important;
  }

  th {
    color: var(--neon-cyan) !important;
    font-family: "Orbitron", sans-serif !important;
    text-transform: uppercase !important;
    font-size: 0.75rem !important;
    letter-spacing: 1px !important;
    border-bottom: 1px solid rgba(255, 255, 255, 0.08) !important;
  }

  td {
    border-bottom: 1px solid rgba(255, 255, 255, 0.05) !important;
    color: rgba(255, 255, 255, 0.8) !important;
    padding: 16px !important;
  }

  tr:hover {
    background: rgba(255, 255, 255, 0.02) !important;
  }
}

.hover-link {
  text-decoration: none;
  transition: all 0.2s ease;

  &:hover {
    filter: brightness(1.2);
    text-shadow: 0 0 8px currentColor;
  }
}

.neon-btn-small {
  box-shadow: 0 0 10px rgba(0, 242, 255, 0.2) !important;
  transition: all 0.3s ease !important;

  &:hover {
    box-shadow: 0 0 20px rgba(0, 242, 255, 0.5) !important;
    transform: translateY(-1px);
  }
}

.v-dialog > .v-card {
  background: rgba(13, 13, 17, 0.95) !important;
  backdrop-filter: blur(20px) !important;
  border: 1px solid var(--glass-border) !important;
  box-shadow: 0 0 30px rgba(0, 0, 0, 0.5) !important;

  .v-card__title {
    font-family: "Orbitron", sans-serif !important;
    color: var(--neon-cyan) !important;
    text-transform: uppercase;
    letter-spacing: 2px;
    padding: 24px !important;
  }
}

/* Global Vuetify Overrides */
.v-text-field--filled > .v-input__control > .v-input__slot {
  background: rgba(255, 255, 255, 0.05) !important;
  border: 1px solid rgba(255, 255, 255, 0.1) !important;
  &:hover {
    background: rgba(255, 255, 255, 0.08) !important;
  }
}

.v-input--is-focused > .v-input__control > .v-input__slot {
  border-color: var(--neon-cyan) !important;
  box-shadow: 0 0 10px rgba(0, 242, 255, 0.2) !important;
}

.v-select__selections {
  color: white !important;
}
.v-list {
  background: rgba(13, 13, 17, 0.95) !important;
}
.v-list-item__title {
  color: white !important;
}

/* Stepper Customization */
.v-stepper {
  background: transparent !important;
  box-shadow: none !important;
}
.v-stepper__header {
  box-shadow: none !important;
  border-bottom: 1px solid var(--glass-border);
}
.v-stepper__step--active .v-stepper__step__step {
  background-color: var(--neon-cyan) !important;
}

/* Pagination Overrides */
.v-pagination__item--active {
  background-color: var(--neon-cyan) !important;
  color: black !important;
}

.glass-navbar {
  background: rgba(13, 13, 17, 0.8) !important;
  backdrop-filter: blur(10px) !important;
  border-bottom: 1px solid var(--glass-border) !important;
}

/* Neon Scrollbar */
::-webkit-scrollbar {
  width: 8px;
}
::-webkit-scrollbar-track {
  background: #0a0a0c;
}
::-webkit-scrollbar-thumb {
  background: linear-gradient(to bottom, var(--neon-purple), var(--neon-cyan));
  border-radius: 10px;
}
::-webkit-scrollbar-thumb:hover {
  background: var(--neon-cyan);
}

.v-main {
  background-image: 
    radial-gradient(circle at 50% 50%, rgba(112, 0, 255, 0.05) 0%, transparent 50%),
    radial-gradient(circle at 0% 0%, rgba(0, 242, 255, 0.05) 0%, transparent 40%);
}
</style>
